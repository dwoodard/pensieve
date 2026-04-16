# How to Invoke the Pensieve Playbook

This guide shows how to use the Playbook for any new feature.

---

## Quick Start: The Four Commands

When starting a new feature, run these commands in order:

### 1️⃣ Phase A: Specification

```bash
gh copilot -p "Create a detailed implementation plan for [FEATURE_NAME] that covers:

- Functional requirements (what it does, what it accepts, what it returns)
- Non-functional requirements (performance, safety, limits)
- Design approach (key abstractions, data models, algorithms)
- 3-4 milestones with specific files and effort estimates
- Testing strategy (unit, integration, e2e, edge cases)
- Key risks and how to mitigate them
- Acceptance criteria / Definition of done

Format the plan as markdown with clear sections.
Output to a markdown file that can be pasted into GitHub issue."
```

**Then:**
```bash
# Save plan to GitHub issue
gh issue edit <ISSUE_NUM> --body "$(cat plan.md)"

# Mark task as active
pensieve tasks start <TASK_NUM>
```

✅ **Phase A Complete** when:
- Plan saved to issue
- 3-4 milestones identified
- Each milestone is 2-4 days of work

---

### 2️⃣ Phase B: Implementation (Per Milestone)

For each milestone (e.g., Milestone 1):

```bash
# Create feature branch
git checkout -b feat/[feature-name]

# Implement milestone
gh copilot -p "Implement Milestone [N] of the plan at [ISSUE_NUM] / [path/to/plan.md].

Focus on: [Files to create/update]
Key requirements:
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

Provide complete source code for all new files.
Include inline comments for complex logic."
```

**Then (if copilot couldn't write directly):**
```bash
# Use Write/Edit tools to apply the code
# Then commit
git add src/
git commit -m "feat: Implement Milestone [N] - [Description]"
```

✅ **Phase B Complete (per milestone)** when:
- All files created/updated
- Code compiles (npm run build)
- Committed to feature branch

---

### 3️⃣ Phase C: Validation (Tests)

```bash
# Run existing tests to check for regressions
npm test

# Generate tests for this milestone
gh copilot -p "Write comprehensive tests for Milestone [N] covering:

Core functions to test: [list of functions]
Unit tests should cover:
- Happy path
- Error cases
- Boundary conditions
- [Specific edge case 1]
- [Specific edge case 2]

Integration tests should cover:
- [API/CLI endpoint scenarios]
- [Multi-component interactions]

Format as Jest tests. Provide complete test file."
```

**Then:**
```bash
# Apply tests and run
npm test -- src/[milestone].test.ts

# Fix failures if any, commit
git add src/
git commit -m "test: Add tests for Milestone [N]"
```

✅ **Phase C Complete** when:
- All existing tests pass
- New tests pass
- No coverage regressions

---

### 4️⃣ Phase D: Delivery (PR)

```bash
# Generate PR description
gh copilot -p "Write a professional GitHub PR description for this feature branch.

Include these sections:
## Summary
[1-2 sentence description]

## Motivation
Why this change matters

## Design Approach
How it works (reference the plan if applicable)

## Changes
List of files changed and what changed in each

## Testing
What's been tested, how to verify

## Related Issues
Link to the GitHub issue

Format as markdown."
```

**Then:**
```bash
# Create PR
gh pr create \
  --title "feat: [Short description]" \
  --body "$(cat pr_description.md)" \
  --link-issue <ISSUE_NUM>

# Comment on issue with PR link
gh issue comment <ISSUE_NUM> --body "✅ All milestones complete. PR ready for review: $(gh pr view --json url --jq .url)"
```

✅ **Phase D Complete** when:
- PR created and linked to issue
- All tests passing
- Code review requested

---

## Real Example: Task 5 (Modify Pensieve Walk)

This is how we used the playbook for a complex feature:

### Phase A
```bash
gh copilot -p "Plan for: Allow Pensieve Walk to start from any node and traverse any relation..."
# → Generates comprehensive 10-page plan with 4 milestones
# → Save to GitHub issue #2
```

### Phase B - Milestone 1
```bash
git checkout -b feat/generalized-walk
gh copilot -p "Implement Milestone 1: Core traversal...
Files: src/walk-traversal.ts, src/db.ts updates..."
# → Creates walk-traversal.ts with BFS engine
# → Updates db.ts with batch helpers
# → Commit to feature branch
```

### Phase B - Milestone 2
```bash
gh copilot -p "Implement Milestone 2: CLI/API integration...
Files: src/cli.ts, API handler..."
# → Updates CLI with new flags
# → Commit
```

### Phase C - Test All
```bash
npm test  # Ensure no regressions
gh copilot -p "Write tests for Milestones 1-2..."
# → Generate comprehensive test suite
# → Run and fix failures
# → Commit tests
```

### Phase D - Create PR
```bash
gh copilot -p "Write PR description for complete walk feature..."
# → Generate professional description
gh pr create --title "feat(walk): Implement generalized traversal" --body "..."
# → PR created and linked
```

---

## Invocation Quick Reference

### For CLI/Non-Interactive Mode
**Always use `-p` flag:**
```bash
gh copilot -p "Your prompt here"
```

### For Complex Multi-Line Prompts
Use heredocs:
```bash
gh copilot -p "$(cat <<'EOF'
Your multi-line prompt here.
It can span many lines.
Just paste it here.
EOF
)"
```

### Common Prompt Patterns

**Phase A - Planning:**
```
"Create a detailed implementation plan for [Feature] covering:
- Requirements
- Design approach
- 3-4 milestones
- Testing strategy
- Risks"
```

**Phase B - Implementation:**
```
"Implement Milestone [N] of [Feature] covering:
- Specific files to create/update
- Key requirements and constraints
- Provide complete source code for new files"
```

**Phase C - Testing:**
```
"Write comprehensive tests for Milestone [N]:
- Unit tests for [functions]
- Integration tests for [scenarios]
- Edge cases to cover"
```

**Phase D - PR:**
```
"Write a professional GitHub PR description:
## Summary
## Motivation
## Design Approach
## Testing
## Related Issues"
```

---

## Checklist for New Features

Use this checklist when starting a feature:

```
[ ] Task created in pensieve
[ ] GitHub issue created with description
[ ] Read docs/PLAYBOOK.md to understand phases
[ ] Phase A: Generate and save plan to issue
[ ] Phase B-1: Implement milestone 1
[ ] Phase C-1: Test milestone 1
[ ] Phase B-2: Implement milestone 2
[ ] Phase C-2: Test milestone 2
[ ] (repeat for milestones 3-4)
[ ] Phase D: Generate and create PR
[ ] PR linked to issue
[ ] Code review requested
[ ] Task marked as "pending review"
```

---

## Tips & Gotchas

### ✅ What Works

- **Focused prompts:** One milestone per prompt
- **Referencing plans:** "Implement Milestone N of the plan in [path]"
- **Complete code:** "Provide complete source code for new files"
- **One command at a time:** Don't ask for plan + impl + tests in one prompt

### ❌ What Doesn't Work

- **Giant prompts:** Asking for entire feature in one request (causes hallucinations)
- **Vague requirements:** "Make it better" vs. "Implement X with Y constraints"
- **Skipping validation:** No Phase C = bugs make it to PR
- **Non-interactive mode issues:** Using spaces instead of `-p` flag

### 🐛 Troubleshooting

**Copilot says "Permission denied":**
- Use Write/Edit tools to apply code manually
- Or run from directory with proper permissions

**Tests fail after applying code:**
- Read the error message carefully
- Ask copilot to fix specific function
- Run tests per-file to isolate issues

**PR looks incomplete:**
- Verify all milestones completed
- Run full test suite before PR
- Ask copilot to generate PR description based on plan

---

## Automation Ideas for Future

These could be automated:

1. **Task-to-Issue sync:** `pensieve tasks` → auto-creates/updates GitHub issue
2. **Plan validation:** Script checks plan has all required sections
3. **Milestone tracking:** Git commits update GitHub milestone progress
4. **Auto-test:** Each milestone commit triggers test run, posts results
5. **PR checklist:** Auto-verify PR has all required links/descriptions
6. **Documentation:** Auto-generate CHANGELOG from commits

---

**How to use this document:**
1. Save to `.pensieve/playbook-invoke.md` or docs/
2. Reference when starting new feature
3. Copy/paste the command templates for your feature
4. Update issue #X with progress from each phase
5. Follow checklist to ensure nothing is missed

---

**Questions?**
- Refer to docs/PLAYBOOK.md for detailed phase descriptions
- Check `.pensieve/ai-prompts/` for saved prompt templates
- Review recent PRs for examples of Phase D output
