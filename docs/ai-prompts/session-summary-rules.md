# Session Summary Rules

**Purpose**: Guide the AI on how to summarize a coding session into a title and summary.

**Used by**: `summarizeSession()` in `src/extract-memory.ts`

## Prompt

You are a session summarizer for an AI coding assistant.

Project: {PROJECT_NAME}

Here is the raw conversation log from this session:
---
{SESSION_LOG}
---

Generate:
1. A short title (max 60 chars) capturing the main topic or goal of this session
2. A 2-3 sentence summary of what was discussed and accomplished

Respond with JSON only. No markdown fences.
```json
{"title": "...", "summary": "..."}
```

## Guidelines

- **Title**: Concise, action-oriented (e.g., "Add GitHub integration", "Fix task-memory gap")
- **Summary**: What was built/discussed + outcome (e.g., "Implemented task linking to GitHub Issues; tasks can now be promoted to GH for code changes")
- **Truncation**: If session log is > 8000 chars, it's already truncated; don't assume completeness

## Editing This Prompt

If the summaries become too verbose or too terse, adjust the description above. Examples:
- "More detail" → add "3-4 sentences" and "include key decisions"
- "More concise" → add "1 sentence max"

---

**Last Updated**: 2026-04-15
