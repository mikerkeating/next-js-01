## Story Acceptance Criteria

Use this checklist to validate story documents before implementation begins.

---

### Required Sections

- [ ] **Context**: All four fields present (Epic, Depends On, Blocks, Runs in Parallel With)
- [ ] **User Story**: Follows "As a... I want... So that..." format
- [ ] **Acceptance Criteria**: Specific, measurable checkboxes (minimum 3)
- [ ] **Technical Requirements**:
  - [ ] Files to Create table with paths and purposes
  - [ ] Files to Modify table (or "N/A" if none)
  - [ ] Dependencies section with canonical-versions.md reference
- [ ] **Test Requirements**: At least one category populated (Manual/Automated/Integration/Commands)
- [ ] **Verification Checklist**: Present with relevant quality gates
- [ ] **References**: Links to Epic, TAD, and relevant ADRs
- [ ] **Status**: Present with initial state

---

### Content Quality Checks

#### No Hardcoded Versions

- [ ] No version numbers in dependency install commands
- [ ] No version numbers in configuration examples
- [ ] All versions reference [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Fail examples:**

```markdown
pnpm add next@16 react@19
node-version: '24'
```

**Pass examples:**

```markdown
Install per [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)
```

#### No Excessive Code Blocks

- [ ] No code blocks exceed 15 lines
- [ ] Long implementations reference TAD sections instead
- [ ] Code blocks illustrate concepts, not copy-paste implementation

**Fail example:** 50-line TypeScript implementation in story

**Pass example:** "Implement following [TAD: Section](link)" with 5-line key requirements

#### No TAD Duplication

- [ ] TypeScript interfaces link to TAD, not inline definitions
- [ ] Configuration templates link to TAD, not full file contents
- [ ] GitHub Actions workflows link to TAD templates
- [ ] API response formats link to TAD specifications

#### Architecture Decisions Consolidation

- [ ] No cross-cutting decisions documented in story (should be in TAD)
- [ ] All story decisions include "Scope: Story-specific" field
- [ ] Cross-cutting decisions link to TAD, not inline documentation
- [ ] "Consolidated Decisions" section links to relevant TAD/ADR decisions

**Cross-cutting decisions that should NOT be in stories:**

- Directory structure conventions
- Environment variable patterns
- Configuration file formats
- Testing patterns
- Security configurations
- API response formats

**Pass example:**

```markdown
### Consolidated Decisions

- [TAD: Directory Structure](link) - Using src/ convention
```

**Fail example:**

```markdown
### AD-S1.1: Use src/ Directory

Decision: All apps will use src/ directory...
```

(This affects all apps, should be in TAD)

---

### Story Length Guidelines

| Size | Target Length | Status                            |
| ---- | ------------- | --------------------------------- |
| XS   | < 100 lines   | - [ ] Within limit                |
| S    | < 150 lines   | - [ ] Within limit                |
| M    | < 250 lines   | - [ ] Within limit                |
| L    | < 350 lines   | - [ ] Within limit                |
| XL   | N/A           | - [ ] Split into multiple stories |

If exceeding limits, verify:

- [ ] No copy-paste implementation code
- [ ] No duplicated TAD content
- [ ] No over-detailed configuration
- [ ] Scope is appropriate (use Out of Scope section)

---

### TAD Integration Validation

- [ ] All TypeScript interfaces reference TAD definitions
- [ ] All configuration requirements reference TAD templates
- [ ] All workflow patterns link to TAD examples
- [ ] Implementation notes reference TAD patterns, not inline code

---

### Acceptance Criteria Quality

Each acceptance criterion should be:

- [ ] **Specific**: Clearly states what must be true
- [ ] **Measurable**: Can be objectively verified (pass/fail)
- [ ] **Outcome-focused**: Describes result, not implementation steps

**Fail examples:**

```markdown
- [ ] Code is good quality
- [ ] Everything works
- [ ] Implement the feature
```

**Pass examples:**

```markdown
- [ ] Health endpoint returns 200 OK with valid JSON
- [ ] Build completes in < 5 minutes
- [ ] All TypeScript files compile without errors
```

---

### Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Story document passes all above criteria
- [ ] TAD sections referenced in story exist and are complete
- [ ] Dependencies listed are available at specified versions
- [ ] No blocking stories are incomplete
- [ ] Architecture decisions that require input are flagged

---

### Validation Command

Run this mental checklist:

1. **Can I implement this story using only the TAD for code examples?**
   - If NO: Story has too much implementation detail

2. **Are all versions coming from canonical-versions.md?**
   - If NO: Story has hardcoded versions

3. **Is the story under the length limit for its size?**
   - If NO: Story likely has TAD duplication or scope creep

4. **Do acceptance criteria describe outcomes, not steps?**
   - If NO: Rewrite acceptance criteria

5. **Are all architecture decisions truly story-specific?**
   - If a decision affects other stories → Move to TAD
   - If a decision is a major architectural choice → Create ADR
   - If decision could be referenced elsewhere → Consolidate to TAD
