#!/usr/bin/env node
/**
 * Claude Code PostCompact hook.
 * Fires after context compaction completes. Logs compaction results and verifies integrity.
 * Payload: { session_id, cwd, hook_event_name, compaction_type }
 */

import * as fs from "fs";
import { findProjectMemoryDir } from "./hook-utils.js";
import { readProjectConfig } from "../config.js";
import { getDb } from "../db.js";
import { escape, queryAll } from "../kuzu-helpers.js";

interface PostCompactPayload {
  session_id: string;
  cwd: string;
  hook_event_name: string;
  compaction_type?: string;
}

async function main(): Promise<void> {
  let raw: string;
  try {
    raw = fs.readFileSync("/dev/stdin", "utf-8");
  } catch {
    process.exit(0);
  }

  let payload: PostCompactPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  try {
    const projectMemoryDir = findProjectMemoryDir(payload.cwd);
    if (!projectMemoryDir) process.exit(0);

    const config = readProjectConfig(projectMemoryDir);
    const { conn } = await getDb(projectMemoryDir);

    const now = new Date().toISOString();
    const sessionId = payload.session_id;

    // Log compaction event
    const compactId = `compact-${Date.now()}`;
    await conn.query(
      `CREATE (c:Compaction {
        id: '${escape(compactId)}',
        projectId: '${escape(config.projectId)}',
        sessionId: '${escape(sessionId)}',
        type: '${escape(payload.compaction_type || "auto")}',
        completedAt: '${escape(now)}'
      })`
    );

    // Link compaction to session for traceability
    const sessionExists = await queryAll(conn,
      `MATCH (s:Session {id: '${escape(sessionId)}'}) RETURN s.id`);
    if (sessionExists.length > 0) {
      await conn.query(
        `MATCH (s:Session {id: '${escape(sessionId)}'}), (c:Compaction {id: '${escape(compactId)}'})
         CREATE (s)-[:TRIGGERED]->(c)`
      );
    }

    // Count remaining nodes to log compaction health
    const nodeCount = await queryAll(conn,
      `MATCH (n) WHERE n.projectId = '${escape(config.projectId)}' RETURN count(n) as total`);
    const edgeCount = await queryAll(conn,
      `MATCH ()-[r]->() WHERE r.projectId = '${escape(config.projectId)}' OR NOT EXISTS(r.projectId) RETURN count(r) as total`);

    if (nodeCount.length > 0 && edgeCount.length > 0) {
      await conn.query(
        `MATCH (c:Compaction {id: '${escape(compactId)}'})
         SET c.nodeCount = ${nodeCount[0].total},
             c.edgeCount = ${edgeCount[0].total}`
      );
    }
  } catch {
    // Never block compaction
  }

  process.exit(0);
}

main();
