# Architecture Decision Records (ADRs)

## Overview

This directory contains Architecture Decision Records (ADRs) documenting significant architectural decisions made for this project. ADRs capture the context, decision, rationale, and consequences of important technical choices.

ADRs are part of Level 1 (WHY) of our [Documentation Pyramid](/docs/2-technical/2-tad-documentation.md#level-1-why-strategic), explaining the strategic thinking behind our technology and architecture choices.

## ADR Index

| ADR | Title | Status | Date | Epic |
|-----|-------|--------|------|------|
| [001](./001-monorepo-turborepo.md) | Monorepo with Turborepo | Accepted | 2025-11-24 | 1A.1 |
| [002](./002-pnpm-package-manager.md) | pnpm as Package Manager | Accepted | 2025-11-24 | 1A.1 |
| [003](./003-nextjs-framework.md) | Next.js 16 as Framework | Accepted | 2025-11-24 | 1A.1 |
| [004](./004-vercel-hosting.md) | Vercel as Hosting Platform | Accepted | 2025-11-24 | 1A.1 |
| [005](./005-drizzle-orm.md) | Drizzle as ORM | Accepted | 2025-11-24 | 1A.1 |
| [006](./006-clerk-authentication.md) | Clerk for Authentication | Accepted | 2025-11-24 | 1A.1 |
| [007](./007-multi-tenant-model.md) | Multi-tenant Data Model | Accepted | 2025-11-24 | 1A.1 |

## Creating a New ADR

### Step 1: Reserve Your ADR Number

Before creating a new ADR, determine the next available number from the index above. This prevents numbering conflicts when multiple people create ADRs simultaneously.

**Next available number**: `008`

### Step 2: Copy the Template

```bash
# From repository root
cp docs/0-process/references/adr-template.md docs/2-technical/adr/{NNN}-{slug}.md

# Example
cp docs/0-process/references/adr-template.md docs/2-technical/adr/008-graphql-api.md
```

### Step 3: Fill In All Sections

The template includes guidance for each section. Key sections:

- **Status**: Start with "Proposed" until approved
- **Context**: Problem statement, requirements, constraints
- **Decision**: Clear statement of what was decided
- **Rationale**: Why this option was chosen
- **Alternatives**: Other options considered with pros/cons
- **Consequences**: Positive, negative, and neutral outcomes

### Step 4: Update the Catalog

Add your ADR to the index table in this README (above), maintaining sequential order.

### Step 5: Update Related Documentation

- Update [TAD ADR Index](/docs/2-technical/2-tad.md#architecture-decision-records) if the ADR represents a major decision
- Link from relevant epic/story files
- Reference from related ADRs

### Step 6: Submit for Review

Create a PR with your ADR. Include relevant stakeholders as reviewers.

## ADR Naming Convention

| Element | Format | Example |
|---------|--------|---------|
| File naming | `{NNN}-{slug}.md` | `008-graphql-api.md` |
| Numbering | Sequential (001-999) | 001, 002, 003... |
| Slug format | Lowercase with dashes | `graphql-api`, `redis-cache` |

## ADR Status Lifecycle

```
Proposed  ──────►  Accepted  ──────►  Deprecated
                       │                  ▲
                       │                  │
                       └──► Superseded ───┘
                            by ADR-XXX
```

| Status | Description |
|--------|-------------|
| **Proposed** | Under discussion, not yet approved |
| **Accepted** | Approved and in effect |
| **Deprecated** | No longer recommended, may still be in use |
| **Superseded** | Replaced by a newer ADR (link to replacement) |

## When to Create an ADR

Create an ADR for:

- **Major technology choices**: Frameworks, languages, databases, ORMs
- **Architectural patterns**: Monorepo, microservices, event-driven architecture
- **Cross-cutting concerns**: Authentication, logging, error handling, caching
- **Infrastructure decisions**: Hosting platform, CI/CD, CDN, monitoring
- **Security/compliance decisions**: Data protection, access control, privacy

## When NOT to Create an ADR

Use **story-level decisions** (`AD-{EpicID}.S{N}.{DecisionNumber}`) instead for:

- Story-specific implementation choices that don't affect other stories
- Isolated tactical decisions within a larger strategy
- Implementation details that follow an existing ADR's guidance

Story-level decisions are documented inline in story files, not as separate ADRs.

## ADR Immutability Principle

**Once an ADR is accepted, do not edit it.** ADRs are historical records of decisions made at a point in time.

If a decision needs to change:

1. Create a new ADR with the next sequential number
2. Set the new ADR's status to reflect the relationship (e.g., "Supersedes ADR-003")
3. Update the old ADR's status to "Superseded by ADR-XXX"
4. Explain in the new ADR why the previous decision is being changed

This preserves the decision history and makes it clear when and why changes occurred.

## Quick Reference

| Task | Command/Action |
|------|----------------|
| Find next ADR number | Check index table above |
| Create new ADR | `cp docs/0-process/references/adr-template.md docs/2-technical/adr/{NNN}-{slug}.md` |
| View template | [ADR Template](/docs/0-process/references/adr-template.md) |
| View writing guide | [ADR Writing Guide](/docs/0-process/references/adr-writing-guide.md) |
| View in TAD | [TAD ADR Section](/docs/2-technical/2-tad.md#architecture-decision-records) |

## Related Documentation

- [ADR Template](/docs/0-process/references/adr-template.md) - Standard template for all ADRs
- [ADR Writing Guide](/docs/0-process/references/adr-writing-guide.md) - Guidance on writing effective ADRs
- [TAD: Architecture Decision Records](/docs/2-technical/2-tad.md#architecture-decision-records) - ADRs in context of overall architecture
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md) - Where ADRs fit in the documentation pyramid

## External Resources

- [ADR GitHub Organization](https://adr.github.io/) - ADR community resources and best practices
- [Michael Nygard's ADR Article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Original ADR concept
- [Thoughtworks Technology Radar - ADRs](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records) - Industry adoption

---

**Last Updated**: 2025-11-28
**Maintainer**: Technical Lead
