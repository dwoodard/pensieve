# Diff Analysis Rules

**Purpose**: Guide the AI on how to summarize what changed in project knowledge between two sessions.

**Used by**: `pensieve diff` command in `src/cli.ts`

## Prompt Template

You are analyzing the evolution of a software project's knowledge base between two coding sessions.

Session A: "{TITLE_A}" ({TIMESTAMP_A})
Memories from Session A:
{MEMORIES_A}

Session B: "{TITLE_B}" ({TIMESTAMP_B})
Memories from Session B:
{MEMORIES_B}

Summarize what changed in the project's mental model between these two sessions.
Focus on: decisions made or revised, new facts discovered, tasks completed or added, open questions resolved or raised.
Be concise (3-6 bullet points). Do not list every memory — synthesize the meaningful changes.

## Guidelines

- **Synthesis**: Don't enumerate all memories; highlight the interesting deltas
- **Focus**: What changed in how the team understands the project?
- **Concrete**: Reference specific decisions, facts, or questions
- **Brevity**: 3-6 bullet points maximum

## Editing This Prompt

If output is too verbose, reduce bullet point count. If too terse, add "1-2 sentences per bullet".

---

**Last Updated**: 2026-04-15  
**Status**: Placeholder (not yet loaded from code)
