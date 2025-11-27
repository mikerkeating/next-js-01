# Epic Template

```markdown
# Epic {PhaseID}.{Number}: {Name}

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](./story-details-template.md). Each story should be independently implementable and testable.

## Context
- **PRD Reference**: [PRD: {Section}](/docs/1-product/1-prd.md#{anchor})
- **TAD Reference**: [TAD: {Section}](/docs/2-technical/2-tad.md#{anchor})
- **Phase**: {Phase ID} - {Phase Name}
- **Type**: Foundation | Feature | Integration | Migration

## Dependencies

### Requires (Must Complete First)
| Epic | Title | Reason |
|------|-------|--------|
| {PhaseID}.{N} | [{Epic Name}](../{epic-slug}/EPIC.md) | {Why this dependency exists} |

### Blocks (Enables These Epics)
| Epic | Title | What This Provides |
|------|-------|-------------------|
| {PhaseID}.{N} | [{Epic Name}](../{epic-slug}/EPIC.md) | {What this epic provides that unblocks the other} |

### Can Run in Parallel With
| Epic | Title | Notes |
|------|-------|-------|
| {PhaseID}.{N} | [{Epic Name}](../{epic-slug}/EPIC.md) | {Why these can run concurrently} |

## Overview

{2-3 sentence description of what this epic delivers and why it matters}

**Key Deliverables:**
- {Deliverable 1}
- {Deliverable 2}
- {Deliverable 3}

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] {Outcome 1} - measurable result that indicates epic completion
- [ ] {Outcome 2} - measurable result that indicates epic completion
- [ ] {Outcome 3} - measurable result that indicates epic completion
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [{Story Title}](./S1-{slug}.md) | {S/M/L} | ⬜ | - | S2, S3 |
| S2 | [{Story Title}](./S2-{slug}.md) | {S/M/L} | ⬜ | S1 | S4 |
| S3 | [{Story Title}](./S3-{slug}.md) | {S/M/L} | ⬜ | S1 | S4 |
| S4 | [{Story Title}](./S4-{slug}.md) | {S/M/L} | ⬜ | S2, S3 | - |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 ({Brief description})
 ├──→ S2 ({Brief description})
 │     ↓
 └──→ S3 ({Brief description})
       ↓
      S4 ({Brief description})
```

**Parallel Execution Notes:**
- S2 and S3 can run in parallel after S1 completes
- S4 requires both S2 and S3 to complete

## Technical Constraints

### Required Patterns
- {Pattern 1}: {Brief explanation and TAD reference}
- {Pattern 2}: {Brief explanation and TAD reference}

### Technology Decisions
| Decision | Choice | Reference |
|----------|--------|-----------|
| {Decision area} | {Choice made} | [ADR-{NNN}](/docs/2-technical/adr/{nnn}-{slug}.md) |
| {Decision area} | {Choice made} | [TAD: {Section}](/docs/2-technical/2-tad.md#{anchor}) |

### Constraints
- {Constraint 1}: {Why this constraint exists}
- {Constraint 2}: {Why this constraint exists}

## Out of Scope

The following items are explicitly NOT part of this epic:

- **{Item 1}** - {Why excluded and where handled instead}
- **{Item 2}** - Deferred to Epic {PhaseID}.{N}
- **{Item 3}** - Not required for MVP/this phase

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| {Decision needed} | {Option A, Option B} | {What depends on this} | ⬜ Open |
| {Decision needed} | {Option A, Option B} | {What depends on this} | ✅ Resolved |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {Risk description} | Low/Med/High | Low/Med/High | {Mitigation strategy} |

## Estimated Effort

| Metric | Value |
|--------|-------|
| Total Stories | {N} |
| Total Hours | {N}h |
| Calendar Days | {N} days |
| Parallel Tracks | {N} |

### Story Breakdown
| Size | Count | Hours |
|------|-------|-------|
| XS (1-2h) | {N} | {N}h |
| S (2-4h) | {N} | {N}h |
| M (4-8h) | {N} | {N}h |
| L (8-16h) | {N} | {N}h |

## References

### Internal Documentation
- [PRD: {Section}](/docs/1-product/1-prd.md#{anchor})
- [TAD: {Section}](/docs/2-technical/2-tad.md#{anchor})
- [Roadmap: {Phase}](/docs/1-product/1-prd.m#{anchor})

### ADRs
- [ADR-{NNN}: {Title}](/docs/2-technical/adr/{nnn}-{slug}.md)

### External Documentation
- [{Doc Title}]({url})

## Status

- **State**: Not Started | Planning | In Progress | Complete | Blocked
- **Started**: - | YYYY-MM-DD
- **Completed**: - | YYYY-MM-DD
- **Stories Complete**: 0/{total}
```

---

## Template Usage Guide

### Epic ID Convention

Use hierarchical IDs that indicate phase and sequence:
- **Format**: `{PhaseID}.{Number}` (e.g., `1A.1`, `2A.3`, `3B.2`)
- **Phase prefixes**: `0A` (Steel Thread), `1A/1B` (Foundation), `2A/2B` (Core), `3A/3B` (Features)
- **Story format**: `{EpicID}.S{N}` (e.g., `1A.1.S1`, `2A.3.S5`)

### Section Guidelines

| Section | Required | Notes |
|---------|----------|-------|
| Context | Yes | Must link to PRD and TAD |
| Dependencies | Yes | All three categories (Requires/Blocks/Parallel) |
| Overview | Yes | Concise description with key deliverables |
| Acceptance Criteria | Yes | High-level outcomes, minimum 3 |
| Stories | Yes | Full table with dependencies |
| Story Dependency Graph | Yes | Visual representation of story flow |
| Technical Constraints | Yes | Patterns, decisions, constraints |
| Out of Scope | Recommended | Prevents scope creep |
| Actions/Decisions | If applicable | Flag unresolved decisions |
| Risks | Recommended | For M+ sized epics |
| Estimated Effort | Yes | Totals and breakdown |
| References | Yes | PRD, TAD, ADRs |
| Status | Yes | Track progress |

### Epic Types

| Type | Description | Examples |
|------|-------------|----------|
| Foundation | Infrastructure, tooling, configuration | Monorepo setup, CI/CD, testing framework |
| Feature | User-facing functionality | Authentication, dashboard, reporting |
| Integration | Connecting systems/services | API integrations, third-party services |
| Migration | Moving from one state to another | Database migration, framework upgrade |

### Story Breakdown Guidelines

**When to split stories:**
- Story exceeds 16 hours (L size limit)
- Story has multiple independent deliverables
- Story blocks other work that could start earlier
- Story has mixed concerns (e.g., backend + frontend)

**Optimal epic size:**
- 4-8 stories per epic
- 2-5 days total calendar time
- At least 2 parallel tracks when possible

### Dependency Graph Conventions

Use ASCII art for simple graphs:
```
S1 ──→ S2 ──→ S3    (Linear dependency)

S1 ─┬─→ S2          (Fan out)
    └─→ S3

S1 ─┬─→ S2 ─┬─→ S4  (Diamond)
    └─→ S3 ─┘
```

For complex dependencies, consider:
- Mermaid diagrams in documentation
- Separate dependency visualization tool
- Simplifying the epic structure

### Writing Effective Epic Acceptance Criteria

Epic criteria should be **outcomes**, not **tasks**:

**Good criteria (outcomes):**
```markdown
- [ ] Developers can run `pnpm build` and get cached results
- [ ] Preview deployments are created for every PR
- [ ] Health endpoint responds within 100ms under load
- [ ] All packages have >80% test coverage
```

**Bad criteria (tasks):**
```markdown
- [ ] Install Turborepo
- [ ] Configure caching
- [ ] Write tests
- [ ] Update documentation
```

### Parallel Execution Guidelines

Epics can run in parallel when:
- No data dependencies between them
- Different team members can work independently
- No conflicting file modifications
- Infrastructure requirements are independent

Document parallel opportunities to optimize delivery timeline.

### Anti-Patterns to Avoid

#### Overly Large Epics
- **Problem**: Epic has 15+ stories or spans multiple weeks
- **Solution**: Split into multiple focused epics

#### Missing Dependencies
- **Problem**: Stories fail because prerequisites weren't identified
- **Solution**: Review all stories for implicit dependencies before starting

#### Vague Acceptance Criteria
- **Problem**: "System works correctly" - not measurable
- **Solution**: Specific, testable outcomes with metrics

#### Scope Creep
- **Problem**: New requirements added mid-epic without evaluation
- **Solution**: Use "Out of Scope" section, create new stories/epics for additions

#### Orphan Stories
- **Problem**: Stories that don't contribute to epic acceptance criteria
- **Solution**: Every story should map to at least one epic criterion

#### Circular Dependencies
- **Problem**: S1 needs S2, S2 needs S3, S3 needs S1
- **Solution**: Identify shared foundation, extract to prerequisite story

### Epic Length Guidelines

| Epic Size | Stories | Hours | Calendar Days |
|-----------|---------|-------|---------------|
| Small | 2-4 | 8-20h | 1-2 days |
| Medium | 4-8 | 20-50h | 3-5 days |
| Large | 8-12 | 50-80h | 1-2 weeks |
| X-Large | 12+ | 80h+ | Split required |

If an epic exceeds Large size:
1. Identify natural split points (phases, components, concerns)
2. Create separate epics with clear boundaries
3. Document dependencies between the new epics

### Status Tracking

Update epic status as work progresses:

| State | Meaning |
|-------|---------|
| Not Started | No stories have begun |
| Planning | Stories being detailed/refined |
| In Progress | At least one story started |
| Blocked | Cannot proceed due to external dependency |
| Complete | All stories done, acceptance criteria met |

Update "Stories Complete" count as stories finish to show progress.
