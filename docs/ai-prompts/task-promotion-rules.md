# Task Promotion Rules: Pensieve → GitHub Issues

**Purpose**: When the AI encounters Pensieve tasks, it uses these rules to decide which should be promoted to GitHub Issues.

**Principle**: GitHub Issues = code changes (implementation, bugfixes, refactoring). Pensieve tasks = research, audits, decisions, learning.

## Rules for Promotion → GitHub Issue

A task should become a GitHub Issue if it meets ANY of these criteria:

### 1. **Implementation Work**
- Title contains: `implement`, `add`, `create`, `build`, `develop`, `write`, `make`
- Examples:
  - "Implement pensieve decision --stats" → **GitHub Issue**
  - "Add session title/summary after initialization" → **GitHub Issue**
  - "Fix Task-Memory relationship gap" → **GitHub Issue**

### 2. **Bug Fixes or Refactoring**
- Title contains: `fix`, `refactor`, `improve`, `optimize`, `polish`, `clean`, `update`, `rename`
- Examples:
  - "Fix Task-Memory relationship gap in graph schema" → **GitHub Issue**
  - "Polish session title generation (edge cases)" → **GitHub Issue**
  - "Refactor database queries" → **GitHub Issue**

### 3. **Feature Additions**
- Title contains: `add feature`, `new command`, `support for`
- Involves writing code that changes user-facing behavior
- Examples:
  - "Add nested walk for search" → **GitHub Issue**
  - "Implement Kanban board view" → **GitHub Issue**

## Rules for Keeping in Pensieve

A task should stay in Pensieve if it meets ANY of these criteria:

### 1. **Research or Investigation**
- Title contains: `audit`, `review`, `research`, `investigate`, `evaluate`, `analyze`, `check`
- Examples:
  - "Review AI Memory Graph Architecture Tasks" → **Stay in Pensieve**
  - "Audit pending decisions" → **Stay in Pensieve**
  - "Evaluate KuzuDB API Server" → **Stay in Pensieve**

### 2. **Decision Making**
- Title suggests strategic/architectural choice
- Examples:
  - "Add decision status field" — actually CODE, check verb → **GitHub Issue**
  - "Decide on schema for decisions" → **Stay in Pensieve**

### 3. **Process/Meta Work**
- Title contains: `mark`, `identify`, `document`, `plan`
- Examples:
  - "ID Identification and Marking" → **Stay in Pensieve**

## How the AI Uses This

When processing tasks, the AI should:

1. **Read this file** (`pensieve/.pensieve/task-promotion-rules.md`)
2. **Check the task title** against the rules above
3. **Default**: If ambiguous, ask the user or keep in Pensieve (lower risk)
4. **When promoting**: Use `gh issue create --title "..." --body "..." --label "enhancement"`
5. **After creating**: Run `pensieve tasks link <taskId> <ghIssueNumber>`

## Labels to Use

When creating GitHub issues, use labels that match the category:

- `enhancement` — new features or improvements
- `bug` — bugfixes
- `refactor` — code refactoring
- `ai-internal` — Pensieve internal tooling (so humans can filter if needed)

---

**Last Updated**: 2026-04-15  
**Owner**: User preferences (edit this as the system evolves)
