# Task Review Rules

**Purpose**: Guide the AI on which tasks were completed in a session.

**Used by**: `reviewTaskCompletion()` in `src/extract-memory.ts`

## Prompt

You are reviewing a coding session to identify which open tasks it completed.

Session summary:
{SUMMARY}

Open tasks (JSON):
{TASKS}

Return ONLY tasks that this session clearly completed — not "maybe" or "partially".
Be conservative. If uncertain, omit.

Respond with JSON only. No markdown fences.
```json
[{"id": "task_...", "reason": "one sentence why this session completed it"}]
```

Return `[]` if none are clearly done.

## Guidelines

- **Conservative**: Only mark a task done if the session explicitly completed it or the result is unambiguous
- **Reason**: One sentence explaining WHY the session completed this task (reference specific work done)
- **Avoid Guessing**: If a task could have been completed but you're not sure, omit it

## Examples

**GOOD** (clear completion):
- Session implemented `pensieve tasks info` → task about fetching GitHub issue details is done
- Session added `githubPrUrl` field and renamed from `prUrl` → naming/schema task is done

**BAD** (guessing):
- Session discussed task X → don't mark as done, they only discussed it
- Session could have affected task Y → don't mark unless explicit

## Editing This Prompt

If false positives appear (tasks marked done that weren't), make the conservatism instruction stronger:
- "Return ONLY tasks with near-100% certainty"
- "If there's any doubt, omit the task"

---

**Last Updated**: 2026-04-15
