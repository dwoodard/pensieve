# Memory Extraction Rules

**Purpose**: Guide the AI on what to extract from sessions and promote to the knowledge base.

**Principle**: A memory is only worth storing if it will be useful without rereading the full conversation.

## When to Extract (and Promote)

Extract a memory if ANY of these is true:

### 1. **Changes Project Understanding**
- The session revealed something new about how the codebase works
- Example: "Learned that Task-Memory edge gap is blocking context retrieval"
- → Extract as: `kind: decision`, title: "Context retrieval blocked by Task-Memory gap"

### 2. **Affects Future Decisions**
- The session made a choice that constrains future work
- Example: "Decided to keep Pensieve focused, use `gh` for issue creation"
- → Extract as: `kind: decision`, title: "Use gh CLI directly, don't wrap in Pensieve commands"

### 3. **Likely Needed Again**
- The session solved a problem that will come up again
- Example: "Found that Kuzu ALTER TABLE pattern is idempotent"
- → Extract as: `kind: fact`, title: "Kuzu schema migrations use ALTER TABLE with try/catch"

### 4. **Connects Multiple Sessions**
- The insight links prior work to current work
- Example: "Task linking now enables bidirectional sync with GitHub"
- → Extract as: `kind: fact`, title: "Task.githubIssueId + Task.githubPrUrl track full issue lifecycle"

### 5. **Unresolved or Blocked**
- The session identified a blocker or open question
- Example: "Unsure whether to implement Kanban view or wait for bidirectional sync"
- → Extract as: `kind: question`, title: "Should Kanban view depend on GitHub sync?"

### 6. **Points to Reusable Artifact**
- The session produced something worth revisiting
- Example: "Created task-promotion-rules.md for AI decision-making"
- → Extract as: `kind: reference`, title: "Task promotion rules live in .pensieve/task-promotion-rules.md"

## What NOT to Extract

Do NOT extract:

- **Routine back-and-forth**: "We discussed the PR linking command" (unless a decision was made)
- **Failed attempts**: "Tried to implement X but hit Y issue" (keep only the resolution)
- **Low-confidence speculation**: "Maybe we should do Z someday" (not actionable)
- **Raw implementation details**: "Changed line 42 of cli.ts" (the code is the authority)
- **Temporary workarounds**: One-off fixes that won't generalize
- **Duplicates**: Same fact already in the knowledge base (reinforce instead)

## How to Classify (Memory Kind)

When extracting, pick one of these:

### `kind: decision`
- A choice was made that shapes future work
- Include: what was decided, why, and what it rules out
- Examples:
  - "GitHub Issues are source of truth for intent, Pensieve for cognition"
  - "Lean on `gh` CLI as-is, don't build custom wrappers"

### `kind: fact`
- A reusable claim about how things work
- Include: conditions, limits, and caveats
- Examples:
  - "Kuzu schema migrations are idempotent (use ALTER TABLE with try/catch)"
  - "Task.githubIssueId stores string, not integer (matches gh CLI output)"

### `kind: question`
- An unresolved issue or uncertainty
- Include: what's unclear, what we know, what's needed to resolve it
- Examples:
  - "Should closing GitHub issue auto-mark Pensieve task done?"
  - "When does memory extraction run? (on every turn? async?)"

### `kind: reference`
- A pointer to something worth looking up later
- Include: where to find it, what it's for
- Examples:
  - "Task promotion rules: .pensieve/task-promotion-rules.md"
  - "GitHub integration architecture: memory/github_integration_architecture.md"

### `kind: task` (rare in extraction)
- A discrete piece of follow-up work
- Usually created via `pensieve tasks add`, not extracted
- Extract only if: the session revealed new work that needs tracking

## Deduplication & Merging

Before promoting a new memory:

1. **Search existing memories** for similar ideas
2. **If found (exact match)**: Don't extract again
3. **If found (related)**: Decide: reinforce, merge, or supersede?
   - **Reinforce**: This session confirms the same fact → update `reinforced_at` timestamp
   - **Merge**: This session adds nuance → update the existing memory's summary
   - **Supersede**: This session contradicts the old memory → mark old as superseded, promote new

## Default Behavior

If unsure whether to extract: **Don't extract.**

False negatives (missing a useful memory) are less costly than false positives (cluttering the knowledge base with noise).

---

**Last Updated**: 2026-04-15  
**Owner**: User preferences and session learnings
