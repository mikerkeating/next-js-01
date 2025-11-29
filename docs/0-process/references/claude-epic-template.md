# CLAUDE.md Epic Template

> **Usage**: Copy this template to `docs/3-epics/{epic-id}/CLAUDE.md` and customize for your epic.

This template provides structured context for AI assistants (Claude Code) when implementing an epic. It references canonical documentation rather than duplicating content.

---

## Project Overview

<!-- Keep this section brief - link to README for details -->

**Repository**: [README.md](/README.md)

**Architecture**: Monorepo with Turborepo and pnpm workspaces

- **Apps**: Next.js 16 applications in `apps/`
- **Packages**: Shared packages in `packages/`
- **Docs**: Documentation in `docs/`

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, PostgreSQL (Drizzle ORM)

---

## Epic Context

<!-- Fill in epic-specific details below -->

**Epic**: `{EPIC_ID}` - {Epic Title}

**Epic File**: [EPIC.md](./EPIC.md)

**Goal**: {One sentence describing the epic's primary objective}

**Key Deliverables**:

- {Deliverable 1}
- {Deliverable 2}
- {Deliverable 3}

**Dependencies**:

- Depends on: {List epics that must complete first, or "None"}
- Blocks: {List epics this enables, or "None"}

---

## Technical Standards

### Coding Standards

**Reference**: [Coding Standards](/docs/2-technical/references/coding-standards.md)

**Critical Rules**:

- Never use `as any` type assertions - use type-safe helpers from `packages/*/src/test/types.ts`
- Always narrow discriminated unions before accessing properties
- Use `z.ZodType` (not `z.ZodTypeAny`) for Zod schemas
- Named exports for React components (no default exports)
- Explicit types for all function parameters and return values

### Quality Gates

```bash
# Must pass before committing
pnpm lint          # 0 errors, 0 warnings
pnpm type-check    # 0 errors
pnpm test          # All passing
pnpm build         # Success
```

### Commit Messages

**Reference**: [Commit Guidelines](/docs/2-technical/references/commit-guidelines.md)

Format: `{type}({scope}): {description}`

Example: `feat(auth): add session validation middleware`

---

## Architecture References

### Technical Architecture Document (TAD)

**Reference**: [TAD](/docs/2-technical/2-tad.md)

Key sections for this epic:

- {Link to relevant TAD section 1}
- {Link to relevant TAD section 2}

### Architecture Decision Records (ADRs)

**Catalog**: [ADR Index](/docs/2-technical/adr/)

Relevant ADRs for this epic:

| ADR                                                            | Decision                |
| -------------------------------------------------------------- | ----------------------- |
| [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)     | Monorepo with Turborepo |
| [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md)   | pnpm as Package Manager |
| {Add epic-specific ADRs}                                       | {Decision summary}      |

---

## File Structure

### Project Layout

```text
{epic-id}/
├── EPIC.md                 # Epic overview and acceptance criteria
├── CLAUDE.md               # This file - AI assistant context
├── S1-{story-slug}.md      # Story 1 specification
├── S2-{story-slug}.md      # Story 2 specification
└── ...
```

### Epic Implementation Locations

<!-- Specify where code for this epic should be created/modified -->

| Location              | Purpose                |
| --------------------- | ---------------------- |
| `apps/{app}/`         | {What goes here}       |
| `packages/{package}/` | {What goes here}       |
| `docs/`               | {What goes here}       |

---

## Implementation Guidance

### Story Workflow

1. Read the story file (S{N}-{slug}.md) completely
2. Review linked TAD sections and ADRs
3. Follow TDD: Write failing tests first
4. Implement to make tests pass
5. Run quality checks (`pnpm lint && pnpm type-check && pnpm test`)
6. Update story file with completion details

**Story Implementation Prompt**: [story-dev-prompt.md](/docs/0-process/references/story-dev-prompt.md)

### Epic-Specific Patterns

<!-- Add patterns specific to this epic -->

**Pattern 1: {Pattern Name}**

```typescript
// Example code demonstrating the pattern
```

**Pattern 2: {Pattern Name}**

```typescript
// Example code demonstrating the pattern
```

### Common Pitfalls

<!-- List known issues or gotchas for this epic -->

- {Pitfall 1}: {How to avoid}
- {Pitfall 2}: {How to avoid}

---

## Testing Requirements

**Reference**: [Testing Standards](/docs/2-technical/references/coding-standards.md#2-test-standards)

### Test Locations

| Test Type   | Location                         |
| ----------- | -------------------------------- |
| Unit Tests  | `packages/*/src/**/*.test.ts`    |
| Integration | `apps/*/src/**/*.integration.ts` |
| E2E         | `apps/*/e2e/`                    |

### Test Helpers

Check for existing helpers before creating mocks:

```text
packages/*/src/test/types.ts    # Package-specific test helpers
```

---

## Dependencies and Versions

**Reference**: [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

**Key Dependencies for this Epic**:

| Package            | Version  | Purpose                 |
| ------------------ | -------- | ----------------------- |
| {dependency-name}  | {x.y.z}  | {Why needed for epic}   |

---

## Notes for AI Assistant

### Context Window Optimization

This CLAUDE.md is designed to provide essential context without overwhelming your token budget. For deeper information:

1. **Read linked files** as needed (TAD sections, ADRs, story files)
2. **Don't duplicate** content from linked documents
3. **Ask the user** if you need clarification on epic-specific decisions

### Implementation Principles

- **Follow TDD**: Write tests before implementation
- **Reference over recreation**: Use existing patterns from linked docs
- **Incremental quality**: Run checks after each significant change
- **Document decisions**: Update story files with completion notes

### When to Update This File

Update this CLAUDE.md when:

- Epic-wide patterns emerge during implementation
- New ADRs are created for this epic
- Dependencies or versions change
- Common pitfalls are discovered

---

*Template Version: 1.0 | Last Updated: {YYYY-MM-DD}*
