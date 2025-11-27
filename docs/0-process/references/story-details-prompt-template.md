# Story Details Prompt

> **Usage:** `execute @docs/0-process/references/story-details-prompt-template.md for Story {StoryID} within Epic {EpicID}`
>
> Example: `execute @docs/0-process/references/story-details-prompt-template.md for Story S1 within Epic 0A.1`

---

## Task

Create the story details file for the specified Story within the specified Epic.

## Input Documents

Read and reference these documents:
1. The EPIC.md file at `docs/4-epics/{epic-path}/EPIC.md`
2. Product Requirements Document and Technical Architecture Document files referenced in the EPIC.md

## Output

Create the story file at: `docs/4-epics/{epic-path}/S{N}-{slug}.md`

Use [story-details-template.md](./story-details-template.md) as the template structure.

## Critical Constraints

### Stories Define WHAT, Not HOW

Stories are requirement documents, not implementation guides. The TAD contains implementation patterns and code examples.

**DO NOT include:**
- Copy-paste implementation code (>15 lines)
- Full configuration file contents
- Duplicated TAD content (interfaces, schemas, workflows)
- Hardcoded version numbers

**DO include:**
- Acceptance criteria (specific, measurable outcomes)
- Files to create/modify (paths and purpose only)
- Dependencies (package names, reference canonical-versions.md)
- TAD references (links to implementation patterns)
- Test requirements (what to verify, not test code)

### Architecture Decisions

Consolidate decisions - don't scatter them across stories:
- **Cross-cutting decisions** → Add to TAD, link from story
- **Major architectural decisions** → Create ADR, link from story
- **Story-specific choices only** → Document in story

See [Template Usage Guide](./story-details-template.md#architecture-decision-format) for detailed consolidation rules.

## Reference Documents

| Document | Purpose |
|----------|---------|
| [story-details-template.md](./story-details-template.md) | Story structure template |
| [file-structure.md](docs/1-product/references/file-structure.md) | File location conventions |
| [coding-standards.md](/docs/2-technical/references/coding-standards.md) | Coding standards |
| [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) | Technology versions (single source of truth) |

## Validation

When complete, validate the story against [story-acceptance-criteria.md](./story-acceptance-criteria.md).

### Quality Checks

Before finishing, verify:
- [ ] No code blocks exceed 15 lines
- [ ] No hardcoded version numbers
- [ ] No TAD content duplicated
- [ ] Story length within limits (XS/S: <150, M: <250, L: <350 lines)
- [ ] Implementation patterns link to TAD sections
- [ ] Cross-cutting decisions consolidated to TAD (not in story)

For detailed guidelines, see the [Template Usage Guide](./story-details-template.md#template-usage-guide).
