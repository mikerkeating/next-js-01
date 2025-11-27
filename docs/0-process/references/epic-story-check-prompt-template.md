# Epic-Story Check Prompt

> **Usage:** `execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/epic-story-check-prompt-template.md for Epic 1A.2`

---

## Task

Evaluate whether the stories for the specified Epic fully deliver the epic's acceptance criteria. Create a `story-eval.md` file documenting the analysis.

## Input Documents

Read and analyze these documents:
1. **EPIC.md**: `docs/3-epics/{epic-slug}/EPIC.md` - Source of truth for acceptance criteria
2. **All Story Files**: `docs/3-epics/{epic-slug}/S*.md` - Stories to evaluate
3. **Story Template**: `docs/0-process/references/story-details-template.md` - For template adherence check
4. **Epic Template**: `docs/0-process/references/epic-details-template.md` - For understanding epic structure

## Output

Create the evaluation file at: `docs/3-epics/{epic-slug}/story-eval.md`

Use [epic-story-check-template.md](./epic-story-check-template.md) as the template structure.

## Evaluation Process

### Step 1: Extract Epic Acceptance Criteria

From EPIC.md, identify:
1. All acceptance criteria (grouped by section if applicable)
2. Story dependency graph
3. Estimated effort (total and per-story)
4. Open questions or decisions requiring approval

### Step 2: Map Criteria to Stories

For EACH acceptance criterion in the epic:
1. Identify which story (or stories) cover it
2. Locate the specific section/lines in the story
3. Assess coverage completeness (full/partial/none)

Document any:
- **Orphan criteria**: Epic requirements not covered by any story
- **Orphan stories**: Stories that don't map to any epic criterion

### Step 3: Validate Dependencies

Compare the dependency graph from EPIC.md against each story's "Depends On" and "Blocks" sections:
1. Create a comparison table
2. Flag any mismatches
3. Identify parallel execution opportunities
4. Check for circular dependencies

### Step 4: Review Effort Estimates

Compare epic-level and story-level estimates:
1. Sum story hours and compare to epic total
2. Assess each story's size appropriateness
3. Flag significant discrepancies

### Step 5: Assess Story Quality

For each story, check template adherence:
- Context section (Epic, Depends On, Blocks, Runs in Parallel With)
- User Story format (As/I want/So that)
- Acceptance Criteria (checkboxes, testable)
- Technical Requirements (Files, Dependencies, Configuration)
- Test Requirements (Manual, Automated, Integration, Commands)
- Implementation Notes (if M+ size)
- Architecture Decisions (if applicable)
- Out of Scope (if applicable)
- Dependencies (both directions)
- Verification Checklist
- Status fields

### Step 6: Check Decision Status

If the epic has "Actions or Decisions Required":
1. Verify stories implement the recommended option
2. Flag any decisions that need resolution before implementation

### Step 7: Formulate Recommendations

Based on the analysis:
1. **Required Changes**: Blocking issues that must be fixed
2. **Minor Polish**: Optional improvements
3. **Optional Enhancements**: Beyond-scope additions for consideration

### Step 8: Render Verdict

Determine overall assessment:
- **PASS**: All criteria covered, dependencies correct, estimates reasonable
- **FAIL**: Critical gaps exist (specify what must be addressed)

## Critical Evaluation Rules

### Coverage Assessment

**Fully Covered** means:
- Story explicitly addresses the criterion
- Acceptance criteria or implementation notes specify how
- No ambiguity about what will be delivered

**Partially Covered** means:
- Criterion mentioned but not fully specified
- Implementation details unclear
- May require interpretation

**Not Covered** means:
- No story mentions this criterion
- Critical gap that blocks epic completion

### Dependency Validation

Check for:
- **Correct ordering**: Prerequisites come before dependents
- **No circular dependencies**: A→B→C→A is invalid
- **Parallel opportunities identified**: Independent work flagged
- **Consistency**: EPIC graph matches story dependency sections

### Template Adherence Scoring

Score each section as percentage of stories compliant:
- 100%: All stories have this section correctly formatted
- 95%+: Minor variations, doesn't impact usability
- 80-94%: Some issues, note specific problems
- <80%: Significant issues, recommend corrections

## Reference Documents

| Document | Purpose |
|----------|---------|
| [epic-story-check-template.md](./epic-story-check-template.md) | Evaluation output template |
| [story-details-template.md](./story-details-template.md) | Story template for adherence check |
| [epic-details-template.md](./epic-details-template.md) | Epic template for context |
| [story-acceptance-criteria.md](./story-acceptance-criteria.md) | Criteria quality standards |

## Quality Checks

Before finishing, verify the evaluation:
- [ ] Every epic acceptance criterion has been mapped to a story (or flagged as gap)
- [ ] Dependency graph validated against all stories
- [ ] Effort totals compared and reconciled
- [ ] Template adherence assessed for each required section
- [ ] Open decisions addressed or flagged
- [ ] Clear PASS/FAIL verdict with justification
- [ ] Recommendations categorized (Required/Minor/Optional)
- [ ] Traceability matrix complete (recommended)

## Output Format Guidelines

### Coverage Tables

Use consistent status indicators:
```markdown
| Criterion | Story | Status |
|-----------|-------|--------|
| Criterion text | S1 | :white_check_mark: Covered |
| Criterion text | S2, S3 | :white_check_mark: Covered |
| Criterion text | - | :x: NOT COVERED |
```

### Dependency Comparison

```markdown
| Story | EPIC Dependency | Story Dependency | Match |
|-------|-----------------|------------------|-------|
| S1 | None | None | ✅ |
| S2 | S1 | S1 | ✅ |
| S3 | S2 | S1 | ❌ Mismatch |
```

### Line References

When citing story content, use line numbers or section names:
- `S2 Lines 45-67` - Specific implementation notes
- `S3 Acceptance Criteria` - Section reference
- `S4.AD-2A.4.S4.1` - Architecture decision reference

## Evaluation Thoroughness

### For Small Epics (2-4 stories)
- Full detailed analysis
- Complete traceability matrix
- Line-level references

### For Medium Epics (5-8 stories)
- Section-level references acceptable
- Traceability matrix recommended
- Focus on coverage gaps

### For Large Epics (9+ stories)
- Category-level coverage analysis
- Summary traceability (not every criterion)
- Focus on critical gaps and recommendations

## Example Evaluation Flow

```
1. Read EPIC.md
   - Extract 6 acceptance criteria sections
   - Note dependency graph: S1→S2→S3, S1→S4, S4+S3→S5
   - Note total: 38h across 5 stories

2. Read each story (S1-S5)
   - Map to acceptance criteria
   - Check dependency declarations
   - Sum estimates (verify = 38h)

3. Build coverage matrix
   - Section 1: S1 (100%)
   - Section 2: S2 (100%)
   - Section 3: S3 (100%)
   - Section 4: S4 (partial - missing criterion 4.3)
   - Section 5: S5 (100%)
   - Section 6: Not covered by any story ← GAP

4. Validate dependencies
   - S1: None ✅
   - S2: S1 ✅
   - S3: S2 ✅
   - S4: S1 ✅
   - S5: S3, S4 ✅

5. Compare estimates
   - S1: 4h (EPIC) vs 4h (Story) ✅
   - S2: 8h (EPIC) vs 6h (Story) ⚠️ Under
   - ...

6. Render verdict
   - FAIL: Section 6 not covered, criterion 4.3 missing
   - Required: Add story for Section 6 or expand S5
   - Required: Add criterion 4.3 to S4
```

## Post-Evaluation

After creating `story-eval.md`:

**If PASS**:
- Stories are ready for implementation
- Note optional improvements in eval for consideration

**If FAIL**:
- Update stories to address required changes
- Re-run evaluation
- Do not begin implementation until PASS
