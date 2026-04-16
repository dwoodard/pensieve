# The Pensieve Playbook System

**What is it?** A reproducible, automated pattern for implementing large features through AI assistance.

**Why?** Consistent delivery, fewer hallucinations, better code quality, faster reviews.

**How?** Four phases: Specification → Implementation → Validation → Delivery

---

## 📚 The Three Documents

### 1. [PLAYBOOK.md](./PLAYBOOK.md) - The Philosophy
**Read this first.** Explains the 4-phase approach and why it works.

- Phase A: Specification (the "What")
- Phase B: Implementation (the "How")
- Phase C: Validation (the "Check")
- Phase D: Delivery (the "PR")

Best for: Understanding the system, sharing with team

---

### 2. [PLAYBOOK_INVOKE.md](./PLAYBOOK_INVOKE.md) - The How-To
**Use this when starting a feature.** Copy/paste the commands.

- Quick start: 4 command templates
- Real example: Task 5 walkthrough
- Troubleshooting & tips
- Checklist for new features

Best for: Actually implementing a feature, executing the playbook

---

### 3. [.pensieve/FEATURE_IMPLEMENTATION_WORKFLOW.md](../.pensieve/FEATURE_IMPLEMENTATION_WORKFLOW.md) - The Reference
**Keep this in your repo.** Step-by-step walkthrough for each phase.

- When to use the playbook
- Setup steps
- Per-phase detailed instructions
- Issue tracking during implementation
- Troubleshooting

Best for: Day-to-day work, reference during implementation

---

## 🚀 Quick Start (2-Minute Version)

**To implement a new feature using the Playbook:**

```bash
# 1. Create issue and activate task
gh issue create --title "feat: [Feature]" --body "[Description]"
pensieve tasks start <TASK_NUM>

# 2. Phase A: Generate plan
gh copilot -p "Create plan for [FEATURE] with requirements, design, 3-4 milestones, tests, risks"
# → Save to issue

# 3. Phase B: Implement per milestone
git checkout -b feat/[name]
gh copilot -p "Implement Milestone [N]...provide full source code"
# → Commit each milestone

# 4. Phase C: Test
npm test
gh copilot -p "Write tests for Milestone [N]...unit/integration tests"
# → Run and commit tests

# 5. Phase D: PR
gh copilot -p "Write PR description with summary, motivation, design, testing..."
gh pr create --title "feat: ..." --body "$(cat pr_desc.md)"
```

---

## 📋 When to Use the Playbook

### ✅ YES - Use It
- Large features (>100 lines)
- Multiple files changing
- API or CLI additions
- Complex requirements
- Affecting multiple systems

### ❌ NO - Skip It
- Simple bug fixes (<50 lines)
- Documentation updates
- Typo fixes
- Config changes

---

## 💡 Key Insights

### Why Milestones?
- **Prevents token bloat:** Asking copilot for 4 things separately = better code than asking once
- **Easier testing:** Test each milestone as you go
- **Clearer PRs:** Each commit is focused and reviewable
- **Faster iteration:** Fix issues between milestones

### Why Validation?
- **Catches bugs early:** Don't wait for PR review
- **Proves correctness:** Tests document behavior
- **Confidence:** All tests passing = ready for PR

### Why Delivery Last?
- **Professional PRs:** Description is generated from complete work
- **Linked issues:** PR connects to plan in issue
- **Context:** Reviewers see the "why" and "how"
- **Traceability:** Full chain from issue → commits → PR → review

---

## 🔄 The Workflow In Action

Here's what using the Playbook looks like:

### Day 1: Planning (1 hour)
```
$ gh copilot -p "Create plan for Modify Pensieve Walk..."
→ 10-page plan with 4 milestones
$ gh issue edit 2 --body "$(cat plan.md)"
→ Issue #2 updated with full specification
```

### Day 2-3: Implementation - Milestone 1
```
$ git checkout -b feat/generalized-walk
$ gh copilot -p "Implement Milestone 1: Core traversal..."
→ Creates src/walk-traversal.ts with BFS engine
→ Updates src/db.ts with batch helpers
$ npm run build
→ Compiles successfully
$ git commit -m "feat: Implement Milestone 1 - Core traversal engine"
→ Committed
```

### Day 4-5: Implementation - Milestone 2
```
$ gh copilot -p "Implement Milestone 2: CLI/API..."
→ Updates CLI with new flags
$ git commit -m "feat: Implement Milestone 2 - CLI/API integration"
```

### Day 6: Testing
```
$ npm test
→ All existing tests pass (no regressions)
$ gh copilot -p "Write tests for Milestones 1-2..."
→ Generates comprehensive test suite
$ npm test -- src/walk-traversal.test.ts
→ All tests passing
$ git commit -m "test: Add tests for walk traversal"
```

### Day 7: PR & Review
```
$ gh copilot -p "Write PR description..."
→ Generates professional description
$ gh pr create --title "feat(walk): ..." --body "..."
→ PR created
$ gh issue comment 2 --body "✅ PR ready for review: [URL]"
→ Issue updated
```

---

## 📖 How to Reference This in Conversations

When working with Claude on a feature, you can say:

> "Implement the Pensieve Playbook for Task 5. Follow Phase A to generate a plan, then Phase B-D to implement it."

Or specifically:

> "This is a Phase B (Implementation) task. Reference the plan in [path]. Implement Milestone 1 with these files..."

Or for validation:

> "We're in Phase C (Validation). Generate tests for this milestone covering these scenarios..."

---

## 🎯 Success Metrics

The Playbook is working when:

✅ **Phase A:** Plan with 3-4 clear milestones, each 2-4 days  
✅ **Phase B:** Code compiles, tests don't regress  
✅ **Phase C:** All tests pass, no coverage gaps  
✅ **Phase D:** PR created with full description linked to issue  

---

## 📚 Example: Task 5 (Modify Pensieve Walk)

This document IS the result of using the Playbook:

1. **Phase A:** Issue #2 has complete 270-line plan with 4 milestones
2. **Phase B:** Created src/walk-traversal.ts, src/walk-traversal.test.ts
3. **Phase C:** Tests designed for all major functions
4. **Phase D:** Ready for PR creation

See [TASK_5_IMPLEMENTATION_GUIDE.md](TASK_5_IMPLEMENTATION_GUIDE.md) for the actual example.

---

## 🔗 Related Documents

- **[GH_COMMANDS_REFERENCE.md](./GH_COMMANDS_REFERENCE.md)** - Complete `gh` CLI reference
- **[TASK_5_IMPLEMENTATION_GUIDE.md](./TASK_5_IMPLEMENTATION_GUIDE.md)** - Real example of Playbook applied
- **[../CLAUDE.md](../CLAUDE.md)** - Project instructions and guidelines
- **[../.pensieve/](../.pensieve/)** - Prompts, configs, memory

---

## ❓ FAQ

**Q: Do I have to use the Playbook?**  
A: No, but you should for large features (>2 days work). Small fixes don't need it.

**Q: Can I skip a phase?**  
A: Not really. Phase A tells you what to build. Phase C catches bugs. Phase D delivers quality.

**Q: What if copilot can't write files?**  
A: Use Write/Edit tools to apply the code. The process is the same.

**Q: How long does the full Playbook take?**  
A: Depends on feature complexity. Task 5 = ~7 days. Smaller features = 2-3 days.

**Q: Can I use this for non-AI work?**  
A: Yes! The playbook is just good engineering practice. Works with any team.

**Q: How do I update the Playbook?**  
A: Found something that works better? Update the docs and file an issue to discuss.

---

## 📝 Version History

| Date | Version | Notes |
|------|---------|-------|
| 2026-04-15 | 1.0 | Initial Playbook released. Tested on Task 5. |

---

## 👋 Next Steps

1. **Read** [PLAYBOOK.md](./PLAYBOOK.md) to understand the 4 phases
2. **Bookmark** [PLAYBOOK_INVOKE.md](./PLAYBOOK_INVOKE.md) for when you start a feature
3. **Keep handy** [.pensieve/FEATURE_IMPLEMENTATION_WORKFLOW.md](../.pensieve/FEATURE_IMPLEMENTATION_WORKFLOW.md) during implementation
4. **Reference** when working with AI on complex features

---

**The Playbook is ready to use. Happy shipping!** 🚀
