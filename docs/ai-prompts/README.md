# Pensieve AI System Prompts

This directory contains **system prompts and decision rules** that guide AI behavior when working with Pensieve. These are not user-facing documentation; they're instructions for the AI about how to make consistent, predictable decisions.

## Where Each Prompt Lives

- **task-promotion-rules.md** — When to convert Pensieve tasks → GitHub Issues
- **memory-extraction-rules.md** — What memories are worth promoting to the knowledge base
- **memory-kind-classifier.md** — How to classify memories (decision/fact/question/reference)
- **context-bundle-rules.md** — Which memories to surface for a given task
- **session-summary-rules.md** — How to summarize and compress session turns
- **search-ranking-rules.md** — How to rank and filter memory search results
- **walk-paths.md** — Preset exploration patterns for common queries

## How the AI Uses These

1. **At session start**: Load relevant prompts into context (injected via `.pensieve/` directory)
2. **When making decisions**: Read the corresponding `.md` file to understand the rules
3. **When in doubt**: Follow the "Default" rule (always specified)
4. **Feedback loop**: Rules should evolve as the user refines them

## Editing These Prompts

- Edit any `.md` file to tune AI behavior
- Changes take effect immediately (next session/command run)
- Comment why you're changing a rule (for future reference)
- Keep rules **specific and testable** (not vague aspirations)

---

## Files (Implementation Status)

### Wired to Code (LLM loads and uses at runtime)

- [x] **memory-extraction-rules.md** — extractFromUserMessage, extractFromTurn, reviewCandidates load this
- [x] **session-summary-rules.md** — summarizeSession loads this
- [x] **task-review-rules.md** — reviewTaskCompletion loads this

### Reference Material (AI reads for context, not loaded by code)

- [x] **task-promotion-rules.md** — Tells AI when to convert Pensieve tasks → GitHub Issues
- [x] **memory-kind-classifier.md** — Tells AI how to classify memories

### Planned (Not Yet Wired)

- [ ] **diff-analysis-rules.md** — Will wire to `pensieve diff` command
- [ ] **project-description-rules.md** — Will wire to session hook
- [ ] **context-bundle-rules.md** — Which memories to surface for a given task
- [ ] **search-ranking-rules.md** — How to rank and filter search results

---

**Last Updated**: 2026-04-15  
**Principle**: Make AI behavior predictable and auditable by codifying decisions in editable text files.
