# Feature Implementation Playbook

This playbook guides structured, AI-driven feature implementation using pensieve and Claude Code.

## Workflow: Plan → Implement → Test → Ship

### 1. **Plan Phase** (Specification)
- Create a detailed implementation plan with:
  - Clear requirements and acceptance criteria
  - Design approach and data models
  - Implementation milestones (2-4 day chunks)
  - Testing strategy (unit, integration, e2e)
  - Risk assessment
- Save plan to GitHub issue or `PLAN.md` file
- Get user sign-off before coding

### 2. **Implement Phase** (Focused Chunks)
- Work through ONE MILESTONE AT A TIME
- For each milestone:
  1. Read the plan for this milestone only
  2. Implement the specific files/functions
  3. Commit with focused message: `feat: Implement [Milestone] - [Description]`
  4. Verify tests pass locally

### 3. **Test Phase** (Quality Gates)
- Run `npm test` to catch regressions
- Create a test plan document for manual verification
- Verify edge cases and error handling
- Performance checklist (if applicable)

### 4. **Ship Phase** (Launch)
- Create PR with full context (plan, implementation summary, test results)
- Link to related issues
- Request review

## Using Pensieve with This Workflow

During implementation, use:
- `pensieve tasks` — Track work items and progress
- `pensieve search "topic"` — Find relevant context quickly
- `pensieve walk --start-id <task-id>` — Explore related decisions
- `pensieve recall` — Load session context for planning

## Best Practices
1. **Plan comprehensively before coding** — Reduces rework
2. **Milestone-driven implementation** — Keeps scope manageable
3. **Commit frequently** — Easier to debug, revert, review
4. **Document as you go** — Reduces context rebuilding
5. **Test incrementally** — Catch issues early

---

See `pensieve --help` for available commands.
