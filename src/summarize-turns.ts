/**
 * Auto-summarize long TURN entries to reduce noise in search results
 * Turns longer than 300 chars get summarized to 1-2 sentences
 */

import kuzu from "kuzu";
import { escape } from "./kuzu-helpers.js";
import { llmComplete } from "./llm.js";

const SUMMARY_THRESHOLD = 300; // chars
const MAX_RETRIES = 3;

function isTooLong(userText: string, assistantText: string): boolean {
  const total = (userText ?? "").length + (assistantText ?? "").length;
  return total > SUMMARY_THRESHOLD;
}

export async function summarizeTurn(
  turnId: string,
  userText: string,
  assistantText: string
): Promise<string | null> {
  if (!isTooLong(userText, assistantText)) {
    return null; // Too short to summarize
  }

  const shortUser = userText.slice(0, 200);
  const shortAssistant = assistantText.slice(0, 200);

  const prompt = `Summarize this brief conversation in 1-2 sentences (max 100 chars):

User: "${shortUser}${userText.length > 200 ? "…" : ""}"
Assistant: "${shortAssistant}${assistantText.length > 200 ? "…" : ""}"

Output only the summary, nothing else.`;

  let lastErr: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const summary = (await llmComplete(prompt)).trim();
      if (summary && summary.length > 0 && summary.length <= 150) {
        return summary;
      }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, i)));
    }
  }

  if (lastErr) throw lastErr;
  return null;
}

export async function backfillTurnSummaries(
  conn: InstanceType<typeof kuzu.Connection>,
  limit: number = 20
): Promise<{ processed: number; summarized: number }> {
  // Find TURN nodes without summaries that are long
  const result = await conn.query(
    `MATCH (t:Turn)
     WHERE (t.summary = '' OR t.summary IS NULL)
     RETURN t.id, t.userText, t.assistantText
     LIMIT ${Math.min(limit, 100)}`
  );

  const rows = await (Array.isArray(result) ? result[0] : result).getAll();
  let summarized = 0;

  for (const row of rows) {
    const turnId = String(row.t_id);
    const userText = String(row.t_userText ?? "");
    const assistantText = String(row.t_assistantText ?? "");

    if (!isTooLong(userText, assistantText)) {
      continue;
    }

    try {
      const summary = await summarizeTurn(turnId, userText, assistantText);
      if (summary) {
        const now = new Date().toISOString();
        await conn.query(
          `MATCH (t:Turn {id: '${escape(turnId)}'})
           SET t.summary = '${escape(summary)}', t.summarizedAt = '${escape(now)}'`
        );
        summarized++;
      }
    } catch {
      // Skip on error, continue to next
    }
  }

  return { processed: rows.length, summarized };
}
