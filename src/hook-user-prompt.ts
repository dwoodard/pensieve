#!/usr/bin/env node
/**
 * Claude Code UserPromptSubmit hook.
 * Fires when the user submits a message, before Claude responds.
 * Extracts high-confidence memories directly from user text.
 * Payload: { session_id, cwd, prompt, hook_event_name }
 */

import * as fs from "fs";
import * as crypto from "crypto";
import { findProjectMemoryDir } from "./hook-utils.js";
import { extractFromUserMessage, writeCandidateFile } from "./extract-memory.js";
import { promoteToDb } from "./promote-memory.js";
import { readProjectConfig } from "./config.js";
import { getDb } from "./db.js";
import { escape, queryAll } from "./kuzu-helpers.js";
import { llmComplete } from "./llm.js";

interface UserPromptPayload {
  session_id: string;
  cwd: string;
  prompt: string;
  hook_event_name: string;
}

function stripSystemTags(text: string): string {
  return text
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/g, "")
    .replace(/<ide_selection>[\s\S]*?<\/ide_selection>/g, "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main(): Promise<void> {
  let raw: string;
  try {
    raw = fs.readFileSync("/dev/stdin", "utf-8");
  } catch {
    process.exit(0);
  }

  let payload: UserPromptPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const userText = stripSystemTags(payload.prompt ?? "");
  if (!userText) process.exit(0);

  try {
    const projectMemoryDir = findProjectMemoryDir(payload.cwd);
    if (!projectMemoryDir) process.exit(0);

    const config = readProjectConfig(projectMemoryDir);
    const { conn } = await getDb(projectMemoryDir);

    // Ensure session exists — session-start hook may have already created it
    const sessionId = payload.session_id;
    const existing = await queryAll(conn,
      `MATCH (s:Session {id: '${escape(sessionId)}'}) RETURN s.title`);
    if (existing.length === 0) {
      const now = new Date().toISOString();
      await conn.query(
        `CREATE (s:Session {
          id: '${escape(sessionId)}',
          projectId: '${escape(config.projectId)}',
          startedAt: '${escape(now)}',
          title: 'Session Initialization',
          summary: '',
          embedding: []
        })`
      );
      await conn.query(
        `MATCH (p:Project {id: '${escape(config.projectId)}'}), (s:Session {id: '${escape(sessionId)}'})
         CREATE (p)-[:HAS_SESSION]->(s)`
      );
    } else {
      // Update session title if it's still the default
      const currentTitle = existing[0]?.title;
      if (currentTitle === 'Session Initialization' && config.llm?.model && config.llm.model !== "local-model") {
        try {
          // Generate a concise title from the first user message
          const titlePrompt = `Extract a short, 3-5 word title (max 50 chars) describing what the user is asking about. Only output the title, nothing else.

User message: "${userText.slice(0, 300)}"`;
          const newTitle = (await llmComplete(titlePrompt)).trim();
          if (newTitle && newTitle.length > 0 && newTitle.length <= 100) {
            await conn.query(
              `MATCH (s:Session {id: '${escape(sessionId)}'})
               SET s.title = '${escape(newTitle)}'`
            );
          }
        } catch {
          // If title generation fails, keep the default
        }
      }
    }

    if (!config.llm?.model || config.llm.model === "local-model") process.exit(0);

    const turnId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Extract high-confidence memories from user message
    const candidates = await extractFromUserMessage(userText, sessionId, turnId);
    if (candidates.length === 0) process.exit(0);

    // Write to candidates folder
    writeCandidateFile(projectMemoryDir, candidates);

    // Promote directly to DB — user's own words are high confidence
    const promoted = await promoteToDb(candidates, config.projectId, conn);

    // promoted memories are persisted to Kuzu; no additional logging needed
  } catch {
    // Never block Claude
  }

  process.exit(0);
}

main();
