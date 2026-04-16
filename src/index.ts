import * as path from "path";
import { detectProject } from "./detect-project.js";
import { getDb } from "./db.js";
import { queryAll, escape } from "./kuzu-helpers.js";
import { writeSessionLog, upsertTurnToGraph, resolveSession } from "./append-turn.js";
import { readSummary, writeSummary, buildUpdatedSummary, readSessionTurns } from "./update-summary.js";
import { extractFromTurn, writeCandidateFile, summarizeSession } from "./extract-memory.js";
import { promoteToDb } from "./promote-memory.js";
import { readProjectConfig } from "./config.js";
import { embed } from "./llm.js";
import type { Turn } from "./types.js";

export async function ingestTurn(turn: Turn): Promise<void> {
  const detected = detectProject(turn.cwd);
  if (!detected) {
    console.error("No pensieve project found at:", turn.cwd);
    return;
  }

  const { projectRoot } = detected;
  const projectMemoryDir = path.join(projectRoot, ".pensieve");
  let config;
  try {
    config = readProjectConfig(projectMemoryDir);
  } catch {
    console.error("Project not initialized. Run: pensieve init");
    return;
  }
  // 1. Resolve session and write JSONL immediately — before any DB operations.
  //    This ensures the turn is always logged even if the DB is unavailable.
  const sessionId = resolveSession(turn, projectMemoryDir, config);
  const entry = writeSessionLog(turn, projectMemoryDir, sessionId);
  const turnId = entry.turnId;

  const userText = turn.messages.find((m) => m.role === "user")?.content ?? "";

  // 2. Update rolling session summary file (no DB required)
  const existingSummary = readSummary(projectMemoryDir, sessionId);
  const updatedSummary = buildUpdatedSummary(existingSummary, turn);
  writeSummary(projectMemoryDir, sessionId, updatedSummary);

  // 3. DB operations — wrapped so a failure here never blocks the JSONL log above
  let conn: Awaited<ReturnType<typeof getDb>>["conn"] | undefined;
  try {
    ({ conn } = await getDb(projectMemoryDir));
  } catch {
    return; // DB unavailable; JSONL already written above
  }

  // Upsert Turn node now that we have a connection
  upsertTurnToGraph(conn, entry, sessionId, config.projectId);

  // Ensure session exists in DB
  const sessionRows = await queryAll(
    conn,
    `MATCH (s:Session {id: '${sessionId}'}) RETURN s`
  );
  const isNewSession = sessionRows.length === 0;

  // Derive title from first user message (strip tags, truncate)
  function deriveTitle(text: string): string {
    const clean = text
      .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length > 80 ? clean.slice(0, 79) + "…" : clean;
  }

  if (isNewSession) {
    const title = deriveTitle(userText);
    await conn.query(
      `CREATE (s:Session {
        id: '${escape(sessionId)}',
        projectId: '${escape(config.projectId)}',
        startedAt: '${new Date().toISOString()}',
        title: '${escape(title)}',
        summary: ''
      })`
    );
    await conn.query(
      `MATCH (p:Project {id: '${escape(config.projectId)}'}), (s:Session {id: '${escape(sessionId)}'})
       CREATE (p)-[:HAS_SESSION]->(s)`
    );

    // Best-effort embedding of session title
    embed(title).then((vec) => {
      const literal = `[${vec.join(", ")}]`;
      conn!.query(`MATCH (s:Session {id: '${escape(sessionId)}'}) SET s.embedding = ${literal}`).catch(() => {});
    }).catch(() => {});
  }

  await conn.query(
    `MATCH (s:Session {id: '${escape(sessionId)}'})
     SET s.summary = '${escape(updatedSummary)}'`
  );

  // 4. Extract memories from the full turn (skip if LLM not configured)
  if (!config.llm?.model || config.llm.model === "local-model") return;

  // 4a. Update session title/summary using the full session log (fire and forget)
  const fullLog = readSessionTurns(projectMemoryDir, sessionId);
  if (fullLog) {
    summarizeSession(fullLog, config.projectName).then(({ title, summary }) => {
      if (title) {
        conn.query(
          `MATCH (s:Session {id: '${escape(sessionId)}'})
           SET s.title = '${escape(title)}', s.summary = '${escape(summary)}'`
        ).catch(() => {});
      }
    }).catch(() => {});
  }

  const assistantText = turn.messages.find((m) => m.role === "assistant")?.content ?? "";
  if (!userText) return;

  try {
    const extractTurnId = `turn_${sessionId.slice(0, 8)}_${Date.now()}`;
    const candidates = await extractFromTurn(userText, assistantText, sessionId, extractTurnId);
    if (candidates.length === 0) return;

    writeCandidateFile(projectMemoryDir, candidates);
    await promoteToDb(candidates, config.projectId, conn, {
      turnId,
      embeddingModel: config.embedding?.model ?? "",
    });
  } catch {
    // Never block on extraction errors
  }
}

/**
 * Capture session summary as a Memory node for AI planning context.
 * Creates a searchable memory node from the session's title and summary,
 * enabling cross-session AI context retrieval and planning.
 */
export async function captureSessionSummary(
  conn: Awaited<ReturnType<typeof getDb>>["conn"],
  sessionId: string,
  projectId: string
): Promise<void> {
  try {
    // Query the session to get its current title and summary
    const rows = await queryAll(
      conn,
      `MATCH (s:Session {id: '${escape(sessionId)}'})
       RETURN s.title AS title, s.summary AS summary`
    );

    if (rows.length === 0) return;
    const { title, summary } = rows[0] as { title: string; summary: string };
    if (!title || !summary) return;

    // Create a memory ID for the session summary
    const memoryId = `summary_${sessionId}`;

    // Embed the session summary
    const embeddingModel = await embed(summary).catch(() => null);

    // Create the Memory node
    const createQuery = embeddingModel
      ? `CREATE (m:Memory {
           id: '${escape(memoryId)}',
           kind: 'SESSION_SUMMARY',
           title: '${escape(title)}',
           summary: '${escape(summary)}',
           recallCue: '${escape(title.slice(0, 40))}',
           projectId: '${escape(projectId)}',
           sessionId: '${escape(sessionId)}',
           createdAt: '${new Date().toISOString()}',
           status: '',
           taskOrder: 0,
           embedding: [${embeddingModel.join(", ")}]
         })`
      : `CREATE (m:Memory {
           id: '${escape(memoryId)}',
           kind: 'SESSION_SUMMARY',
           title: '${escape(title)}',
           summary: '${escape(summary)}',
           recallCue: '${escape(title.slice(0, 40))}',
           projectId: '${escape(projectId)}',
           sessionId: '${escape(sessionId)}',
           createdAt: '${new Date().toISOString()}',
           status: '',
           taskOrder: 0
         })`;

    await conn.query(createQuery).catch(() => {});

    // Link the memory to the session
    await conn
      .query(
        `MATCH (s:Session {id: '${escape(sessionId)}'}), (m:Memory {id: '${escape(memoryId)}'})
       CREATE (s)-[:HAS_MEMORY]->(m)`
      )
      .catch(() => {});
  } catch {
    // Never block on session summary capture errors
  }
}
