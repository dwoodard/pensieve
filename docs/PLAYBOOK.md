# Pensieve Playbook: Feature Implementation Workflow

**Purpose:** Provide a reproducible, automated pattern for implementing large features through AI assistance using `gh copilot` and the Claude Code environment.

**Benefit:** Consistent, predictable delivery of complex features without token bloat or hallucinations.

---

## The Four Phases

### Phase A: Specification (The "What")

**Goal:** Create a source of truth for requirements before any code is written.

**Actions:**
- Use `gh copilot -p` to generate a detailed implementation plan
- Plan should cover:
  - Requirements (functional, non-functional, security)
  - Design approach with data models
  - Multi-milestone breakdown
  - Testing strategy
  - Risk assessment
- Save plan to GitHub issue or `.md` file
- Get user sign-off on approach

**Commands:**
```bash
gh copilot -p "Create a detailed implementation plan for [Feature] covering:
- Functional requirements
- Design approach with data models
- 3-4 milestones with estimated effort
- Testing strategy (unit, integration, e2e)
- Key risks and mitigations"
```

**Definition of Done:**
- ✅ Plan has explicit milestones
- ✅ Each milestone fits in 2-4 development days
- ✅ Design decisions are documented
- ✅ Testing strategy is clear
- ✅ Issue/PR is updated with full plan

---

### Phase B: Implementation (The "How")

**Goal:** Build the feature in focused, testable chunks.

**Strategy:** Implement ONE MILESTONE AT A TIME, not the whole feature.

**Per-Milestone Pattern:**
1. Create a focused copilot prompt for that milestone only
2. Copilot reads the plan file and existing code
3. Provide full source code for new files
4. Use CLI tools (Write/Edit) to apply changes if copilot can't write
5. Commit the milestone

**Commands:**
```bash
# For Milestone 1
gh copilot -p "Implement Milestone 1 of the plan in [path/to/plan.md].
Milestone 1 focus: [Specific files/functions].
Requirements: [Constraint 1], [Constraint 2].
Provide full source code for new files."

# Apply changes with Write/Edit tools
# Then commit
git add src/
git commit -m "feat: Implement Milestone 1 - [Description]"
```

**Per-Milestone Checklist:**
- [ ] Plan reviewed for this milestone
- [ ] Copilot prompt is focused (one milestone only)
- [ ] Code is written (new files complete, existing files updated)
- [ ] Changes committed locally
- [ ] Ready for Phase C (tests)

**Definition of Done:**
- ✅ All milestone files created/updated
- ✅ Code compiles/lints (npm run build)
- ✅ Committed to feature branch
- ✅ Ready for testing

---

### Phase C: Validation (The "Check")

**Goal:** Verify the implementation is correct before PR.

**Strategy:** Test each milestone as it's completed.

**Testing Actions:**
1. Run existing tests to ensure no regressions
2. Ask copilot to generate unit/integration tests for the milestone
3. Run new tests
4. Fix failures and iterate

**Commands:**
```bash
# Run existing tests
npm test

# Generate tests
gh copilot -p "Write comprehensive tests for [Milestone] covering:
- Unit tests for [Core functions]
- Integration tests for [API/CLI]
- Edge cases: [Specific scenarios]
Format as Jest/Vitest. Provide full test file contents."

# Apply tests, run them
npm test -- src/[milestone].test.ts

# Fix failures if any
git add src/
git commit -m "test: Add tests for Milestone [N]"
```

**Test Levels:**
- **Unit:** Core functions, error cases, boundary conditions
- **Integration:** API/CLI endpoints with real data
- **E2E:** Multi-user scenarios, ACL, performance benchmarks

**Definition of Done:**
- ✅ Existing tests still pass
- ✅ New tests written and passing
- ✅ No test coverage regressions
- ✅ Edge cases verified

---

### Phase D: Delivery (The "PR")

**Goal:** Create a professional PR with full context and documentation.

**Strategy:** Generate PR description using copilot, create branch if needed, push, and open PR.

**Commands:**
```bash
# Create feature branch (if not already on one)
git checkout -b feat/[feature-name]

# Generate PR description
gh copilot -p "Write a professional GitHub PR description for the changes in this branch.
Include:
- Summary (1-2 sentences)
- Motivation (why this change)
- Design Approach (how it works)
- Changes (what files, what changed)
- Testing (what's been tested)
- Related Issue (link to #2)
Format as Markdown."

# Push and create PR
git push origin feat/[feature-name]

gh pr create \
  --title "feat: [Short description]" \
  --body "$(cat pr_body.md)" \
  --link-issue [issue-number]

# Update issue with PR link
gh issue comment [issue-number] --body "PR created: [PR URL]"
```

**PR Checklist:**
- [ ] Title follows convention (feat/fix/docs/test/refactor)
- [ ] Description includes all four sections (Summary, Motivation, Design, Testing)
- [ ] Linked to GitHub issue
- [ ] All commits follow conventional commits
- [ ] Ready for code review

**Definition of Done:**
- ✅ PR created and linked to issue
- ✅ CI/CD passes
- ✅ Code review requested
- ✅ Documentation updated
- ✅ All tests passing

---

## Multi-Milestone Example: Task 5 (Modify Pensieve Walk)

This is how the four phases apply to a real, complex feature:

### Phase A: Specification ✅ DONE
```
Milestone 0 (Planning):
- Generated plan with 4 milestones (1-4)
- Plan covers: Requirements, Design, Data Models, API Changes, Testing Strategy
- GitHub Issue #2 updated with full plan
```

### Phase B: Implementation (In Progress)
```
Milestone 1 (Core Traversal): 2-4 days
- New files: src/walk-traversal.ts, src/walk-traversal.test.ts
- Updates: src/db.ts (batch helpers), src/walk-paths.ts (integration)

Milestone 2 (CLI/API): 1-2 days
- Updates: src/cli.ts (new flags), API handler

Milestone 3 (Integration Tests): 2-3 days
- New tests: test/walk/integration/*.test.ts
- Documentation updates

Milestone 4 (Rollout): 1-2 days
- Feature flag, monitoring, gradual rollout
```

### Phase C: Validation
```
Per milestone:
1. Run npm test to ensure no regressions
2. Generate and run unit/integration tests for that milestone
3. Fix any failures
4. Commit test updates
```

### Phase D: Delivery
```
Final steps:
1. Generate professional PR description covering all 4 milestones
2. Push feature branch
3. Create PR with gh pr create
4. Link to issue #2
5. Mark issue/task as "PR pending review"
```

---

## Quick Reference: GH Commands

| Goal | Command | Notes |
|------|---------|-------|
| Get AI Advice | `gh copilot -p "Query"` | Use -p for non-interactive |
| Create Issue | `gh issue create --title "T" --body "B"` | Use heredocs for long bodies |
| Update Issue | `gh issue edit <num> --body "New Body"` | Attach plans/progress |
| Check Issue | `gh issue view <num>` | Verify state before acting |
| Create Branch | `git checkout -b feat/name` | Do before implementation |
| Commit | `git commit -m "feat: Description"` | Follow conventional commits |
| Push | `git push origin feat/name` | Push to remote |
| Create PR | `gh pr create --title "T" --body "B"` | Final step |
| Link PR | (automatic via `gh pr create`) | PR links to issue automatically |

---

## Best Practices

### ✅ DO

- **Break into milestones:** 2-4 day chunks
- **Use focused prompts:** One milestone per copilot invocation
- **Test as you go:** Don't skip Phase C
- **Document decisions:** Update issues with progress
- **Use git commit messages:** Conventional commits help with automation
- **Get sign-off early:** Plan review before implementation

### ❌ DON'T

- Don't ask copilot to implement the entire feature in one prompt
- Don't skip tests/validation phase
- Don't create PR without Phase C completion
- Don't push large refactors as part of the feature
- Don't forget to update GitHub issues with progress

---

## Automation Opportunities

These processes can be automated further:

1. **Pre-implementation checklist:** Script to verify Phase A is done
2. **Milestone tracking:** GitHub Project board auto-updated by commit messages
3. **Test automation:** Run tests on each milestone, post results to PR
4. **Code review triggers:** Auto-request review when PR ready
5. **Documentation generation:** Auto-generate CHANGELOG from commits

---

## When to Use This Playbook

✅ **Use for:**
- Large features (3+ files, 2+ days work)
- Complex requirements (API + CLI + tests)
- Multi-milestone work
- Features requiring significant refactoring

❌ **Skip for:**
- Simple bug fixes (< 100 lines)
- Small feature additions (1-2 files)
- Documentation updates
- Obvious one-liner fixes

---

**Version:** 1.0  
**Last Updated:** 2026-04-15  
**Owner:** Pensieve System Design
