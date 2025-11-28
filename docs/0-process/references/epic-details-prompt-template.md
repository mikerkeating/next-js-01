# Epic Details Prompt

## Template Usage Guide

> **Usage:** `execute @docs/0-process/references/epic-details-prompt-template.md for Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/epic-details-prompt-template.md for Epic 1A.1`

---

## Task

Create the epic details file (EPIC.md) for the specified Epic, including the story index with titles and dependencies.

## Input Documents

Read and reference these documents:

1. **Roadmap**: `docs/1-product/3-roadmap.md` - for epic definition, phase context, and acceptance criteria
2. **PRD**: `docs/1-product/1-prd.md` - for product requirements and feature context
3. **TAD**: `docs/2-technical/2-tad.md` (and related TAD files) - for technical architecture and patterns
4. **ADRs**: `docs/1-product/adr/` - for relevant architecture decisions

## Output

Create the epic directory and EPIC.md file at: `docs/3-epics/{epic-slug}/EPIC.md`

Where `{epic-slug}` follows the pattern: `{PhaseID}.{Number}-{kebab-case-name}`

- Example: `1A.1-monorepo-setup/EPIC.md`
- Example: `2A.3-observability/EPIC.md`

Use [epic-details-template.md](./epic-details-template.md) as the template structure.

## Critical Constraints

### Epics Define SCOPE, Stories Define WORK

Epics are planning documents that define what will be delivered and break it into stories. They should not contain implementation details.

**DO NOT include:**

- Implementation code or configuration examples
- Detailed technical specifications (these belong in TAD)
- Story-level acceptance criteria (those go in individual stories)
- Hardcoded version numbers

**DO include:**

- High-level acceptance criteria (measurable outcomes)
- Story breakdown with titles, sizes, and dependencies
- Dependency graph showing story relationships
- Technical constraints and required patterns (with TAD references)
- Out of scope items to prevent scope creep
- Risks and required decisions

### Story Breakdown Guidelines

When defining stories for the epic:

- Each story should be independently implementable and testable
- Target 4-8 stories per epic (split if more needed)
- Identify parallel execution opportunities
- Size stories appropriately (XS: 1-2h, S: 2-4h, M: 4-8h, L: 8-16h)
- Stories exceeding L size should be split

### Acceptance Criteria

Epic acceptance criteria should be **outcomes**, not **tasks**:

**Good (outcomes):**

- "Developers can run `pnpm build` and get cached results"
- "Preview deployments are created for every PR"

**Bad (tasks):**

- "Install Turborepo"
- "Configure caching"

### Dependencies

Document all three dependency types:

- **Requires**: Epics that must complete before this one can start
- **Blocks**: Epics that depend on this one completing
- **Parallel**: Epics that can run concurrently with this one

## Reference Documents

| Document                                                                    | Purpose                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| [epic-details-template.md](./epic-details-template.md)                      | Epic structure template                             |
| [story-details-template.md](./story-details-template.md)                    | Story structure (for understanding story breakdown) |
| [file-structure.md](docs/1-product/references/file-structure.md)            | File location conventions                           |
| [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) | Technology versions                                 |

## Validation

When complete, validate the epic against [epic-acceptance-criteria.md](./epic-acceptance-criteria.md).

### Quality Checks

Before finishing, verify:

- [ ] All acceptance criteria are measurable outcomes (not tasks)
- [ ] Story table includes Size, Depends On, and Blocks columns
- [ ] Story dependency graph matches the story table
- [ ] No circular dependencies exist
- [ ] Technical constraints reference TAD/ADR documents
- [ ] Out of Scope section defines clear boundaries
- [ ] Epic size is within guidelines (2-12 stories, ≤80h)
- [ ] Parallel execution opportunities are identified
- [ ] All three dependency types documented (Requires/Blocks/Parallel)

### Post-Creation

After creating the EPIC.md:

1. Story files can be created using [story-details-prompt-template.md](./story-details-prompt-template.md)
2. Update the roadmap status if needed
3. Verify cross-references between related epics

For detailed guidelines, see the [Template Usage Guide](./epic-details-template.md#template-usage-guide).
