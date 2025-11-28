# ADR-{NNN}: {Title}

> **Copy this template**: `cp docs/0-process/references/adr-template.md docs/2-technical/adr/{NNN}-{slug}.md`
>
> Replace `{NNN}` with the next sequential number (e.g., 008), `{Title}` with a descriptive title, and `{slug}` with a lowercase-dashed version (e.g., `graphql-api`).

## Status

{Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

**Date**: YYYY-MM-DD
**Deciders**: {Names or roles of decision makers}
**Epic Context**: {Related epic ID if applicable, e.g., "1A.1", or "N/A"}

## Context

{Describe the problem, requirements, and constraints that led to this decision. What situation are we in? What forces are at play? Why do we need to make a decision?}

### Key Requirements

1. {Requirement 1: What must this decision achieve?}
2. {Requirement 2: Critical capability needed}
3. {Requirement 3: Non-negotiable constraint}

### Constraints

- {Constraint 1: Technical limitation}
- {Constraint 2: Business constraint}
- {Constraint 3: Resource or timeline constraint}

## Decision

{State what was decided clearly and concisely. Be specific about what will be used, how it will be configured, and what patterns will be followed.}

### Configuration

{Optional: Include key configuration details, file structure, or code examples if they clarify the decision.}

```typescript
// Example configuration or code pattern
```

## Rationale

{Explain why this decision was made. What factors led to choosing this option over alternatives?}

### Why {Chosen Option}?

1. **{Reason Category 1}**
   - Detail 1
   - Detail 2

2. **{Reason Category 2}**
   - Detail 1
   - Detail 2

3. **{Reason Category 3}**
   - Detail 1
   - Detail 2

## Alternatives Considered

### Option 1: {Alternative Name}

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Decision**: Rejected - {Brief explanation of why this was not chosen}

### Option 2: {Alternative Name}

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Decision**: Rejected - {Brief explanation of why this was not chosen}

{Add more options as needed}

## Consequences

### Positive

1. {Positive outcome 1: What benefits does this decision bring?}
2. {Positive outcome 2}
3. {Positive outcome 3}

### Negative

1. {Negative outcome 1: What trade-offs are we accepting?}
2. {Negative outcome 2}
3. {Negative outcome 3}

### Neutral

1. {Neutral observation 1: Things that change but aren't strictly better or worse}

### Mitigation Strategies

{For each significant negative consequence, describe how it will be mitigated:}

1. **{Negative 1}**: {How we'll address or minimize this}
2. **{Negative 2}**: {How we'll address or minimize this}

## Implementation Plan

{Optional but recommended for major decisions. Break down into phases if helpful.}

### Phase 1: {Phase Name}

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Phase 2: {Phase Name}

- [ ] Task 1
- [ ] Task 2

## Validation

{Optional: Define how we'll know this decision was correct.}

### Success Metrics

- [ ] {Metric 1: Measurable outcome}
- [ ] {Metric 2: Measurable outcome}
- [ ] {Metric 3: Measurable outcome}

### Testing Strategy

1. {How we'll validate the decision works}
2. {What tests or checks will be performed}

## References

- [External Resource 1](URL)
- [External Resource 2](URL)
- [Documentation](URL)

## Related ADRs

- [ADR-XXX: Related Decision](./XXX-related-decision.md) - {Brief description of relationship}
- [ADR-YYY: Another Related Decision](./YYY-another-decision.md) - {Brief description of relationship}

## Notes

{Optional: Additional context, historical notes, or important considerations that don't fit elsewhere.}

---

**Author**: {Name or Role}
**Date**: YYYY-MM-DD
**Reviewers**: {Names or Roles}
**Last Updated**: YYYY-MM-DD

---

## Template Usage Guide

### When to Create an ADR

Create an ADR for:

- **Major technology choices**: Frameworks, languages, databases, ORMs
- **Architectural patterns**: Monorepo, microservices, event-driven
- **Cross-cutting concerns**: Authentication, logging, error handling
- **Infrastructure decisions**: Hosting, CI/CD, CDN
- **Security/compliance decisions**: Data protection, access control

Use story-level decisions (`AD-{EpicID}.S{N}.{DecisionNumber}`) for:

- Story-specific implementation choices
- Isolated decisions not affecting other stories
- Tactical choices within a larger strategy

### ADR Status Lifecycle

```
Proposed → Accepted → [Deprecated | Superseded by ADR-XXX]
```

- **Proposed**: Under discussion, not yet approved
- **Accepted**: Approved and in effect
- **Deprecated**: No longer recommended, but may still be in use
- **Superseded**: Replaced by a newer ADR (link to replacement)

### Naming Convention

| Element     | Format                 | Example                    |
| ----------- | ---------------------- | -------------------------- |
| File naming | `{NNN}-{slug}.md`      | `008-graphql-api.md`       |
| Numbering   | Sequential (001-999)   | 001, 002, 003...           |
| Slug format | Lowercase with dashes  | `graphql-api`, `redis-cache` |

### Best Practices

1. **Be concise but complete**: Include enough detail for future readers to understand the decision
2. **Document alternatives**: Show what was considered, not just what was chosen
3. **Include consequences**: Be honest about trade-offs
4. **Link to related ADRs**: Build a connected decision history
5. **Keep ADRs immutable**: Once accepted, don't edit; create a new ADR to supersede

### After Creating an ADR

1. Update the [ADR catalog](/docs/2-technical/adr/README.md) index table
2. Update the [TAD ADR index](/docs/2-technical/2-tad.md#architecture-decision-records) if needed
3. Link from relevant epic/story documentation
4. Submit for review via PR

---

*Delete this "Template Usage Guide" section after copying the template to create your ADR.*
