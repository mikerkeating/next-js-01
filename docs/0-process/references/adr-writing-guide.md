# ADR Writing Guide

This guide provides practical advice for writing effective Architecture Decision Records (ADRs).

## Quick Reference

| Resource | Location |
|----------|----------|
| ADR Template | [adr-template.md](./adr-template.md) |
| ADR Catalog | [docs/2-technical/adr/README.md](/docs/2-technical/adr/README.md) |
| TAD ADR Section | [2-tad.md#architecture-decision-records](/docs/2-technical/2-tad.md#architecture-decision-records) |

## When to Write an ADR

### Create an ADR For

| Category | Examples |
|----------|----------|
| **Major technology choices** | Frameworks, languages, databases, ORMs, hosting platforms |
| **Architectural patterns** | Monorepo vs polyrepo, microservices, event-driven architecture |
| **Cross-cutting concerns** | Authentication, logging, error handling, caching strategies |
| **Infrastructure decisions** | CI/CD pipelines, CDN, monitoring, deployment strategies |
| **Security/compliance** | Data encryption, access control, privacy compliance |

### Use Story-Level Decisions Instead For

Story-level decisions use the format `AD-{EpicID}.S{N}.{DecisionNumber}` and are documented inline in story files:

| Scenario | Example |
|----------|---------|
| **Story-specific choices** | Which React component pattern to use for a specific feature |
| **Isolated implementations** | Specific API endpoint design that doesn't set a precedent |
| **Tactical decisions** | Choices within the boundaries of an existing ADR |

**Rule of Thumb**: If the decision affects multiple stories, epics, or packages, it's an ADR. If it's contained within a single story, it's a story-level decision.

## ADR Section Guide

### Status

The status section captures the current state of the decision:

```markdown
## Status

{Status} - YYYY-MM-DD

**Date**: YYYY-MM-DD
**Deciders**: {Names or roles}
**Epic Context**: {Epic ID or "N/A"}
```

| Status | When to Use |
|--------|-------------|
| **Proposed** | Initial state; decision under discussion |
| **Accepted** | Decision approved and in effect |
| **Deprecated** | No longer recommended; may still be in use |
| **Superseded by ADR-XXX** | Replaced by a newer decision |

### Context

The context section explains **why** a decision is needed:

**Good Context**:
- States the problem clearly
- Lists specific requirements
- Identifies constraints
- Explains the forces at play

**Example**:

```markdown
## Context

We need to select an authentication provider for our multi-tenant SaaS application
that supports SSO, MFA, and organization-level access control.

### Key Requirements

1. Support for OAuth 2.0 and OIDC providers
2. Multi-factor authentication out of the box
3. Organization/team management
4. Webhook support for user sync

### Constraints

- Must work with Next.js App Router
- Must integrate with Vercel Edge Functions
- Budget: < $500/month at 10K users
- Team has limited auth infrastructure experience
```

### Decision

The decision section states **what** was decided:

**Good Decision**:
- Clear and unambiguous
- States the specific choice made
- Includes key configuration details

**Example**:

```markdown
## Decision

We will use **Clerk** (latest version) as our authentication provider.

### Configuration

- Clerk Organizations for multi-tenancy
- Custom roles mapped to our RBAC system
- Webhooks for user sync to our database
```

### Rationale

The rationale section explains **why** this option was chosen:

**Structure**:
1. List the key reasons grouped by category
2. Connect reasons to requirements from Context
3. Be specific about what makes this option superior

**Example**:

```markdown
## Rationale

### Why Clerk?

1. **Developer Experience**
   - Pre-built UI components
   - Excellent Next.js integration
   - Minimal configuration needed

2. **Multi-tenancy Support**
   - Built-in Organizations feature
   - Role and permission management
   - Invitation workflows
```

### Alternatives Considered

Document **all** options you evaluated, even briefly:

**Format**:

```markdown
### Option 1: {Name}

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Decision**: Rejected - {Brief explanation}
```

**Tips**:
- Be fair to rejected options
- Explain specifically why each was rejected
- Future readers may revisit these if circumstances change

### Consequences

Document the **outcomes** of the decision:

**Structure**:

```markdown
## Consequences

### Positive

1. {Benefit 1}
2. {Benefit 2}

### Negative

1. {Trade-off 1}
2. {Trade-off 2}

### Neutral

1. {Change that's neither better nor worse}

### Mitigation Strategies

1. **{Negative 1}**: {How we'll address it}
2. **{Negative 2}**: {How we'll address it}
```

**Tips**:
- Be honest about trade-offs
- Don't oversell positives
- Every decision has negatives; document them
- Always include mitigation strategies for significant negatives

## Writing Tips

### Be Concise

ADRs should be read quickly. Aim for:
- 1-2 page summary (Status through Consequences)
- Extended sections (Implementation, Examples) as needed

### Write for Future Readers

Consider someone reading this ADR in 2 years:
- Will they understand the context?
- Will the decision make sense?
- Will they know what constraints have changed?

### Use Specific Language

| Avoid | Prefer |
|-------|--------|
| "We chose the best option" | "We chose Option A because it meets requirements X, Y, Z" |
| "This is faster" | "This reduces API latency by 50ms (p95)" |
| "Better developer experience" | "Reduces authentication implementation from 2 weeks to 2 days" |

### Document Trade-offs Honestly

- Every decision has downsides
- Hiding negatives damages trust
- Future teams need to know what to watch for

### Link Generously

- Link to related ADRs
- Link to external documentation
- Link to relevant epic/story files
- Link to TAD sections

## Common Mistakes

### Mistake 1: Skipping Alternatives

**Problem**: Only documenting the chosen option

**Fix**: Always document at least 2-3 alternatives, even if briefly

### Mistake 2: Vague Context

**Problem**: "We need to choose a database"

**Fix**: "We need a PostgreSQL-compatible database that supports serverless connections, has < 10ms cold start, and costs < $100/month for our expected 100GB storage"

### Mistake 3: Missing Consequences

**Problem**: Only listing positive outcomes

**Fix**: Include at least 2-3 negative consequences with mitigation strategies

### Mistake 4: Implementation Details in Decision

**Problem**: Putting detailed code in the Decision section

**Fix**: Keep Decision focused on what; put how in Implementation Plan or separate docs

### Mistake 5: Editing After Acceptance

**Problem**: Updating an accepted ADR to reflect new information

**Fix**: Create a new ADR that supersedes the old one

## ADR vs Story-Level Decision Examples

### ADR Example

> "Which ORM should we use across all packages?"

This affects:
- Multiple packages (@repo/database, @repo/auth, etc.)
- All applications
- Team-wide conventions

**Result**: Write ADR-005 (Drizzle ORM)

### Story-Level Decision Example

> "Which Drizzle query pattern should we use for this specific API endpoint?"

This affects:
- One story
- One endpoint
- Follows patterns established by ADR-005

**Result**: Write AD-3.2.S5.1 in the story file

## Checklist Before Submitting

- [ ] Status is set correctly (Proposed for new ADRs)
- [ ] Context clearly states the problem and requirements
- [ ] Decision is unambiguous
- [ ] Rationale connects to requirements
- [ ] At least 2 alternatives are documented
- [ ] Positive and negative consequences are listed
- [ ] Mitigation strategies for negatives are provided
- [ ] Related ADRs are linked
- [ ] ADR catalog index is updated
- [ ] TAD is updated if this is a major decision

## After Your ADR is Accepted

1. **Update the catalog**: Add entry to [ADR README](/docs/2-technical/adr/README.md)
2. **Update TAD if needed**: Major decisions should appear in [TAD ADR index](/docs/2-technical/2-tad.md#architecture-decision-records)
3. **Link from epics/stories**: Reference the ADR from relevant documentation
4. **Announce to team**: Share the decision in appropriate channels

---

**See Also**:
- [ADR Template](./adr-template.md)
- [ADR Catalog](/docs/2-technical/adr/README.md)
- [Michael Nygard's Original Article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
