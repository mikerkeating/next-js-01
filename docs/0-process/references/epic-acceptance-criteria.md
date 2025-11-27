## Epic Acceptance Criteria

Use this checklist to validate epic documents before story creation and implementation begins.

---

### Required Sections

- [ ] **Context**: All fields present
  - [ ] PRD Reference with valid link
  - [ ] TAD Reference with valid link
  - [ ] Phase ID and name
  - [ ] Epic type (Foundation/Feature/Integration/Migration)
- [ ] **Dependencies**: All three categories documented
  - [ ] Requires (Must Complete First) - table or "None"
  - [ ] Blocks (Enables These Epics) - table or "None"
  - [ ] Can Run in Parallel With - table or "None"
- [ ] **Overview**: Present with key deliverables list
- [ ] **Acceptance Criteria**: Minimum 3 measurable outcomes
- [ ] **Stories**: Table with ID, Title, Size, Status, Depends On, Blocks
- [ ] **Story Dependency Graph**: Visual ASCII representation
- [ ] **Technical Constraints**: Patterns, decisions, constraints documented
- [ ] **Estimated Effort**: Totals and story breakdown by size
- [ ] **References**: Links to PRD, TAD, relevant ADRs
- [ ] **Status**: Present with initial state

---

### Content Quality Checks

#### Acceptance Criteria Quality
- [ ] All criteria are **outcomes**, not tasks
- [ ] All criteria are measurable/verifiable
- [ ] At least 3 meaningful criteria (excluding boilerplate)
- [ ] No vague criteria like "system works correctly"

**Fail examples:**
```markdown
- [ ] Install Turborepo
- [ ] Configure caching
- [ ] Everything works as expected
```

**Pass examples:**
```markdown
- [ ] Developers can run `pnpm build` and get cached results
- [ ] Build time reduced by >70% on cache hit
- [ ] All TypeScript packages compile without errors
```

#### Story Table Completeness
- [ ] All stories have unique IDs (S1, S2, etc.)
- [ ] All stories have linked markdown files
- [ ] Size estimates provided (XS/S/M/L)
- [ ] Dependencies documented (Depends On column)
- [ ] Blocking relationships documented (Blocks column)

**Fail example:**
```markdown
| ID | Title | Status |
|----|-------|--------|
| S1 | Setup | ⬜ |
```

**Pass example:**
```markdown
| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [Configure Turborepo](./S1-configure-turborepo.md) | M | ⬜ | - | S2, S3 |
```

#### Dependency Graph Accuracy
- [ ] Graph matches story table dependencies
- [ ] Parallel tracks clearly identified
- [ ] No circular dependencies
- [ ] Parallel execution notes explain concurrency

#### No Orphan Stories
- [ ] Every story contributes to at least one acceptance criterion
- [ ] No stories exist that don't advance epic goals

---

### Epic Size Guidelines

| Epic Size | Stories | Hours | Status |
|-----------|---------|-------|--------|
| Small | 2-4 | 8-20h | - [ ] Within limit |
| Medium | 4-8 | 20-50h | - [ ] Within limit |
| Large | 8-12 | 50-80h | - [ ] Within limit |
| X-Large | 12+ | 80h+ | - [ ] Must be split |

If exceeding limits, verify:
- [ ] Epic has clear, focused scope
- [ ] Cannot be naturally split into phases
- [ ] All stories are necessary for acceptance criteria
- [ ] Dependencies don't allow earlier delivery of subset

---

### Dependency Validation

#### Epic-Level Dependencies
- [ ] All "Requires" epics exist and are documented
- [ ] All "Blocks" epics reference this epic in their "Requires"
- [ ] Parallel epics have no conflicting resource needs
- [ ] No circular epic dependencies

#### Story-Level Dependencies
- [ ] Dependencies form a directed acyclic graph (DAG)
- [ ] No story depends on a story that comes after it
- [ ] Parallel stories have no data dependencies
- [ ] Critical path is identifiable

**Circular dependency example (FAIL):**
```
S1 depends on S3
S2 depends on S1
S3 depends on S2  ← Creates cycle
```

**Valid dependency example (PASS):**
```
S1 (no dependencies)
S2 depends on S1
S3 depends on S1
S4 depends on S2, S3
```

---

### Technical Constraints Validation

- [ ] Required patterns reference TAD sections
- [ ] Technology decisions link to ADRs
- [ ] Constraints explain rationale
- [ ] No constraints contradict TAD/ADRs

---

### Out of Scope Validation

- [ ] Section present (recommended)
- [ ] Excluded items explain where they're handled
- [ ] Deferred items reference future epic/story
- [ ] Scope boundaries are clear

---

### Estimated Effort Validation

- [ ] Total hours = sum of story hours
- [ ] Story breakdown by size is accurate
- [ ] Calendar days accounts for parallel tracks
- [ ] Estimates are realistic for story sizes

| Size | Hours Range |
|------|-------------|
| XS | 1-2h |
| S | 2-4h |
| M | 4-8h |
| L | 8-16h |

---

### Status Tracking Validation

- [ ] Initial state is "Not Started" or "Planning"
- [ ] Started/Completed dates use YYYY-MM-DD format
- [ ] Stories Complete shows 0/{total} initially

---

### Pre-Implementation Checklist

Before creating story details, verify:
- [ ] Epic document passes all above criteria
- [ ] TAD sections referenced exist and are complete
- [ ] PRD requirements are clear and approved
- [ ] All "Requires" epics are complete or in progress
- [ ] Blocking decisions are resolved or have clear owners
- [ ] Resources/access for implementation are available

---

### Validation Questions

Run this mental checklist:

1. **Can someone understand the epic's goal from the Overview alone?**
   - If NO: Overview needs more clarity

2. **Do acceptance criteria describe what success looks like?**
   - If NO: Rewrite as measurable outcomes

3. **Can stories be assigned to different people without coordination issues?**
   - If NO: Review dependencies and parallel execution

4. **Is the epic achievable in 1-2 weeks?**
   - If NO: Consider splitting into multiple epics

5. **Does every story map to an acceptance criterion?**
   - If NO: Remove orphan stories or add missing criteria

6. **Are all technical decisions documented or linked?**
   - If NO: Add to Technical Constraints or reference ADRs

---

### Common Epic Anti-Patterns

| Anti-Pattern | Detection | Resolution |
|--------------|-----------|------------|
| Kitchen Sink Epic | 15+ stories, multiple unrelated features | Split by feature area |
| Vague Goals | "Improve system" acceptance criteria | Define measurable outcomes |
| Missing Dependencies | Stories fail due to unidentified prereqs | Review for implicit dependencies |
| Sequential Lock | All stories in single chain | Identify parallelization opportunities |
| Scope Creep Risk | No "Out of Scope" section | Add explicit boundaries |
| Orphan Stories | Stories don't map to criteria | Remove or add criteria |
| Underestimated Epic | L-sized stories throughout | Break down large stories |

---

### Epic-Story Alignment Check

For each acceptance criterion, verify:
- [ ] At least one story addresses this criterion
- [ ] Story completion will satisfy the criterion
- [ ] No gaps between stories and outcomes

For each story, verify:
- [ ] Story contributes to at least one criterion
- [ ] Story is necessary (not nice-to-have)
- [ ] Story scope is appropriate for its size estimate
