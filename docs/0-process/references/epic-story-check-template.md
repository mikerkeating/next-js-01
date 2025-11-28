# Epic-Story Check Template

```markdown
# Epic {EpicID}: {Epic Name} - Story Evaluation

**Evaluation Date**: YYYY-MM-DD
**Epic Version**: {version}
**Stories Evaluated**: S1-S{N}

---

## Executive Summary

**Overall Assessment**: **{PASS|FAIL}** - {One sentence summary of coverage status}

{2-3 sentences describing the evaluation outcome and any critical findings}

| Category    | Epic Requirements | Story Coverage    | Status                  |
| ----------- | ----------------- | ----------------- | ----------------------- |
| {Section 1} | {N} criteria      | S{N} ({%})        | {Status emoji} {Status} |
| {Section 2} | {N} criteria      | S{N} + S{M} ({%}) | {Status emoji} {Status} |
| {Section N} | {N} criteria      | S{N} ({%})        | {Status emoji} {Status} |

**Status Legend**: :white_check_mark: Complete | :warning: Partial | :x: Missing

---

## Detailed Coverage Analysis

### {Section 1 Name} (EPIC.md:{line-range})

**Epic Criteria**:

- [x] {Criterion 1 from epic acceptance criteria}
- [x] {Criterion 2 from epic acceptance criteria}
- [ ] {Criterion 3 - uncovered}

**Story Coverage**: **S{N} ({Story Title})**

- {Criterion 1}: Lines {N}-{M} or specific section reference
- {Criterion 2}: Lines {N}-{M} or specific section reference
- {Criterion 3}: **NOT COVERED** - {reason or recommendation}

**Status**: {Status emoji} **{Fully Covered|Partially Covered|Not Covered}**

---

### {Section 2 Name} (EPIC.md:{line-range})

**Epic Criteria**:

- [x] {Criterion 1}
- [x] {Criterion 2}

**Story Coverage**: **S{N} ({Story Title})** + **S{M} ({Story Title})**

- S{N}: {What it covers}
- S{M}: {What it covers}

**Status**: {Status emoji} **{Fully Covered|Partially Covered|Not Covered}**

---

{Repeat for each section of epic acceptance criteria}

---

## Story Dependency Analysis

### EPIC Dependency Graph
```

S1 ({Brief description})
↓
S2 ({Brief description}) ←──────────────┐
↓ │
S3 ({Brief description}) │
↓ │
S4 ({Brief description}) → S5 ({Brief}) │
↓ ↓ │
S6 ({Brief description}) ←──────────────┘
↓
S{N} ({Brief description}) ← depends on all previous stories

```

### Story Dependencies Validation

| Story | EPIC Dependency | Story Dependency | Match |
|-------|-----------------|------------------|-------|
| S1 | None | None | {Match emoji} |
| S2 | S1 | S1 | {Match emoji} |
| S3 | S2 | S2 | {Match emoji} |
| S{N} | S{N-1} | S{N-1} | {Match emoji} |

**Parallel Execution Opportunities**:
- {Stories that can run in parallel}: {Reason}
- {Additional parallel tracks}: {Reason}

**Dependency Issues**: {None found | List of issues}

---

## Effort Estimation Review

| Story | EPIC Size | EPIC Hours | Story Hours | Match | Assessment |
|-------|-----------|------------|-------------|-------|------------|
| S1 | {S/M/L} | {N}h | {N}h | {Match emoji} | {Appropriate/Under/Over-estimated} |
| S2 | {S/M/L} | {N}h | {N}h | {Match emoji} | {Assessment} |
| S{N} | {S/M/L} | {N}h | {N}h | {Match emoji} | {Assessment} |
| **Total** | | **{N}h** | **{N}h** | {Match emoji} | {Overall assessment} |

**Estimation Notes**:
- {Any stories that may need adjustment}
- {Rationale for estimation discrepancies}

---

## Story Quality Assessment

### Strengths

1. **{Strength 1}** - {Description}
2. **{Strength 2}** - {Description}
3. **{Strength 3}** - {Description}

### Template Adherence

| Aspect | Status | Notes |
|--------|--------|-------|
| Context section | {%}% | {Notes on compliance} |
| User Story format | {%}% | {Notes on compliance} |
| Acceptance Criteria | {%}% | {Notes on compliance} |
| Technical Requirements | {%}% | {Notes on compliance} |
| Test Requirements | {%}% | {Notes on compliance} |
| Implementation Notes | {%}% | {Notes on compliance} |
| Architecture Decisions | {%}% | {Notes on compliance} |
| Out of Scope | {%}% | {Notes on compliance} |
| Dependencies | {%}% | {Notes on compliance} |
| Verification Checklist | {%}% | {Notes on compliance} |
| Status | {%}% | {Notes on compliance} |

### Areas for Improvement

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| {Issue description} | {Low/Med/High} | {How to address} |

---

## Open Questions & Decisions

The EPIC identified decisions requiring approval. Status of each:

| Decision | EPIC Recommendation | Story Implementation | Status |
|----------|---------------------|----------------------|--------|
| {Decision 1} | {Option recommended} | S{N}: {How implemented} | {Approved/Pending/Needs Discussion} |
| {Decision 2} | {Option recommended} | S{N}: {How implemented} | {Status} |

**Decisions Requiring Resolution Before Implementation**:
- {List any decisions that must be resolved}

---

## Recommendations

### Required Changes

{If no changes required, state: "No blocking changes required. Stories are production-ready."}

| Story | Change Required | Priority | Reason |
|-------|-----------------|----------|--------|
| S{N} | {Change description} | {High/Med/Low} | {Why needed} |

### Minor Polish (Optional)

1. **S{N}**: {Minor improvement suggestion}
2. **S{N}**: {Minor improvement suggestion}

### Optional Enhancements (Beyond EPIC Scope)

{Items that would add value but are not required by the EPIC}

1. **{Enhancement}** - {Description and rationale}

---

## Conclusion

### Delivery Confidence: {High|Medium|Low}

**Epic Delivery**: {Complete|Partial|Incomplete} - {Summary of coverage}

**Story Quality**: {Excellent|Good|Needs Work} - {Summary of quality}

**Template Adherence**: {N}% - {Summary}

### Recommended Action

**{Proceed with implementation|Address required changes first|Significant rework needed}**

{Final recommendation with any conditions or prerequisites}

---

## Appendix: Traceability Matrix

| EPIC Acceptance Criteria | Story | Section/Lines |
|--------------------------|-------|---------------|
| {Criterion 1 text} | S{N} | {Section name or line numbers} |
| {Criterion 2 text} | S{N} | {Section name or line numbers} |
| {Criterion N text} | S{N} | {Section name or line numbers} |

---

**Evaluator**: {Name or Claude Code Agent}
**Date**: YYYY-MM-DD
```

---

## Template Usage Guide

### When to Use This Template

Use this template to create a `story-eval.md` file after:

1. The EPIC.md has been created and approved
2. All story files (S1-S{N}.md) have been created
3. Before implementation begins

### Purpose

The story evaluation serves as a quality gate ensuring:

- Stories fully deliver the epic's acceptance criteria
- No gaps exist between epic requirements and story coverage
- Dependencies are correctly sequenced
- Effort estimates are reasonable
- Stories follow template standards

### Required Sections

| Section                    | Required      | Notes                               |
| -------------------------- | ------------- | ----------------------------------- |
| Executive Summary          | Yes           | Quick pass/fail assessment          |
| Detailed Coverage Analysis | Yes           | Maps each epic criterion to stories |
| Story Dependency Analysis  | Yes           | Validates dependency graph          |
| Effort Estimation Review   | Yes           | Compares epic vs story estimates    |
| Story Quality Assessment   | Recommended   | Template adherence check            |
| Open Questions & Decisions | If applicable | Decision status tracking            |
| Recommendations            | Yes           | Required/optional changes           |
| Conclusion                 | Yes           | Final recommendation                |
| Traceability Matrix        | Recommended   | Detailed criterion-to-story mapping |

### Coverage Status Indicators

Use consistent status indicators:

- :white_check_mark: or `✅` - Fully covered
- :warning: or `⚠️` - Partially covered (specify gaps)
- :x: or `❌` - Not covered (blocking issue)

### Assessment Verdicts

**PASS**: All acceptance criteria covered, no blocking issues

- Stories fully deliver epic requirements
- Dependencies correctly ordered
- Estimates reasonable

**FAIL**: Critical gaps or issues exist

- Missing acceptance criteria coverage
- Circular or incorrect dependencies
- Significant estimation issues

### Traceability Depth

For each epic acceptance criterion, provide:

1. **Which story** covers it (S1, S2, etc.)
2. **Where in the story** (line numbers or section name)
3. **How completely** (full/partial/not covered)

### Common Issues to Check

1. **Orphan criteria** - Epic requirements not covered by any story
2. **Orphan stories** - Stories that don't map to any epic criterion
3. **Dependency mismatches** - Story dependencies don't match epic graph
4. **Estimation drift** - Story hours don't sum to epic total
5. **Template violations** - Stories missing required sections
6. **Scope creep** - Stories include work beyond epic scope

### Output Location

Save the evaluation as: `docs/3-epics/{epic-slug}/story-eval.md`

Example: `docs/3-epics/1A.2-package-management/story-eval.md`

### Post-Evaluation Actions

Based on the verdict:

**If PASS**:

- Proceed to implementation
- Note any optional improvements for consideration

**If FAIL**:

- Address required changes first
- Re-run evaluation after changes
- Do not begin implementation until PASS
