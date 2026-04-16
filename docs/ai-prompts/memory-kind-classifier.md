# Memory Kind Classifier

**Purpose**: When extracting a memory, how to pick the right `kind` value.

**Quick Reference**:
- **decision** = a choice was made; shapes future work
- **fact** = how something works; reusable claim
- **question** = unresolved; needs investigation
- **reference** = pointer to something worth finding later
- **summary** = compressed recap of a session or outcome
- **task** = discrete work that needs tracking (rare in extraction)

---

## Decision vs. Fact (most common confusion)

### Decision
**When**: The session involved choosing between options, or committing to an approach.
**Include**: What was chosen, why, and what it rules out.
**Signs**:
- "We decided to..."
- "After discussion, we agreed..."
- "The trade-off is..."

**Examples**:
- "GitHub Issues are the source of truth for intent; Pensieve is the cognitive layer"
- "Lean on `gh` CLI directly rather than building Pensieve wrappers"
- "Task.githubIssueId stores issue number as string (not integer) to match gh output"

### Fact
**When**: The session confirmed how something works or established a pattern.
**Include**: What it does, under what conditions, and any caveats.
**Signs**:
- "X works by doing..."
- "The pattern is..."
- "We learned that..."

**Examples**:
- "Kuzu schema migrations are safe via `ALTER TABLE ... DEFAULT` with try/catch"
- "The `gh issue view` command outputs JSON when passed `--json`"
- "Task nodes don't need bidirectional PR links; githubPrUrl is enough"

---

## Question vs. Reference (less common)

### Question
**When**: Something is still unclear and needs resolution.
**Include**: What's uncertain, what we know, what would resolve it.

**Examples**:
- "Should closing a GitHub issue automatically mark the Pensieve task as done?"
- "When should memory extraction happen—per-turn, or in batches?"
- "Does `gh issue view` work without auth if the repo is public?"

### Reference
**When**: This session produced or discovered something worth pointing back to.
**Include**: Where to find it, why it matters.

**Examples**:
- "AI system prompts live in `.pensieve/` as `.md` files"
- "GitHub integration architecture documented in project memory"
- "Task promotion rules can be edited to tune AI behavior"

---

## Decision Tree

```
What happened in this session?

├─ We made a choice / committed to an approach
│  └─ kind: decision
│
├─ We confirmed how something works / found a pattern
│  └─ kind: fact
│
├─ We discovered something unclear / unresolved
│  └─ kind: question
│
├─ We found something worth pointing to later
│  └─ kind: reference
│
└─ We compressed a whole session into a recap
   └─ kind: summary (auto-generated, rare in extraction)
```

---

## Borderline Cases

### "We fixed a bug and learned how X works"
→ Extract TWO memories:
- **decision**: "Choose to fix X by doing Y"
- **fact**: "X fails because Z"

### "We added a feature"
→ Decide: Is this a **decision** (we committed to building it) or just **progress**?
- If it was debated or strategic: **decision**
- If it was straightforward implementation: Don't extract (the code is the authority)

### "We investigated something but decided not to do it"
→ Extract as:
- **decision**: "Decided NOT to do X because Y"

---

**Last Updated**: 2026-04-15  
**Rule of Thumb**: If it shapes future decisions or prevents repeating work, it's worth extracting.
