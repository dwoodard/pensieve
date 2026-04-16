#!/usr/bin/env node
/**
 * Claude Code FileChanged hook.
 * Fires when watched files change (CLAUDE.md, .claude/rules/*).
 * Logs file changes and updates instruction metadata in graph.
 * Payload: { session_id, cwd, hook_event_name, file_path, changed_at, watchPaths }
 */

import * as fs from "fs";
import * as path from "path";
import { findProjectMemoryDir } from "./hook-utils.js";
import { readProjectConfig } from "../config.js";
import { getDb } from "../db.js";
import { escape, queryAll } from "../kuzu-helpers.js";

interface FileChangedPayload {
  session_id: string;
  cwd: string;
  hook_event_name: string;
  file_path?: string;
  changed_at?: string;
  watchPaths?: string[];
}

async function main(): Promise<void> {
  let raw: string;
  try {
    raw = fs.readFileSync("/dev/stdin", "utf-8");
  } catch {
    process.exit(0);
  }

  let payload: FileChangedPayload;
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
    const filePath = payload.file_path || "unknown";

    // Log the file change event
    const changeId = `file-change-${Date.now()}`;
    await conn.query(
      `CREATE (fc:FileChange {
        id: '${escape(changeId)}',
        projectId: '${escape(config.projectId)}',
        sessionId: '${escape(sessionId)}',
        filePath: '${escape(filePath)}',
        changedAt: '${escape(now)}',
        type: '${escape(path.basename(filePath))}'
      })`
    );

    // Link file change to session for traceability
    const sessionExists = await queryAll(conn,
      `MATCH (s:Session {id: '${escape(sessionId)}'}) RETURN s.id`);
    if (sessionExists.length > 0) {
      await conn.query(
        `MATCH (s:Session {id: '${escape(sessionId)}'}), (fc:FileChange {id: '${escape(changeId)}'})
         CREATE (s)-[:OBSERVED]->(fc)`
      );
    }
  } catch {
    // Never block file operations
  }

  process.exit(0);
}

main();
