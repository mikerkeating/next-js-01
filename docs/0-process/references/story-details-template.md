# Story Template

````markdown
# Story {EpicID}.S{N}: {Title}

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [{Epic Name}](./EPIC.md)
- **Depends On**: [S{N-1}](./S{N-1}-{slug}.md) | None (first story or independent)
- **Blocks**: [S{N+1}](./S{N+1}-{slug}.md) | None (final story or independent)
- **Runs in Parallel With**: [S{N}](./S{N}-{slug}.md) | None (stories that can be implemented concurrently)

## User Story

**As a** {role}
**I want** {capability}
**So that** {benefit}

## Acceptance Criteria

- [ ] Criterion 1 - specific, measurable outcome
- [ ] Criterion 2 - specific, measurable outcome
- [ ] Criterion 3 - specific, measurable outcome

## Technical Requirements

### Files to Create

| Path                           | Purpose               |
| ------------------------------ | --------------------- |
| `packages/{name}/src/index.ts` | Package entry point   |
| `packages/{name}/README.md`    | Package documentation |

### Files to Modify

| Path           | Changes                     |
| -------------- | --------------------------- |
| `package.json` | Add {dependency} dependency |
| `turbo.json`   | Add {task} task             |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
pnpm add {package-name}
pnpm add -D {dev-package-name}
```
````

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

Describe key configuration requirements in table format:

| Setting     | Requirement   | TAD Reference                                                      |
| ----------- | ------------- | ------------------------------------------------------------------ |
| `{setting}` | {requirement} | [TAD: {Section}](/docs/2-technical/2-tad.md#{anchor})              |
| `{setting}` | {requirement} | [TAD: {Section}](/docs/2-technical/2-tad-{subsection}.md#{anchor}) |

**Configuration Rationale**: Explain why these requirements exist, referencing TAD/ADRs where applicable.

For complete configuration templates, see: [TAD: {Section}](/docs/2-technical/2-tad.md#{anchor})

## Test Requirements

### Manual Verification

- [ ] **{Test Name}**: {Description of manual test and expected outcome}
- [ ] **{Test Name}**: {Description of manual test and expected outcome}

### Automated Tests

- [ ] Unit: `{file}.test.ts` - {Test description}
- [ ] Unit: `{file}.test.ts` - {Test description}

### Integration Tests

- [ ] {Integration test description} - Verify interaction between components
- [ ] {Integration test description} - Verify end-to-end workflow
- [ ] {Integration test description} - Verify external service integration

### Verification Commands

> **Note**: Verification command blocks may be up to 25 lines to accommodate multiple test commands.

```bash
# Command to verify {aspect}
{command}

# Command to verify {aspect}
{command}
```

## Implementation Notes

### Implementation Sequence (for M+ stories)

Numbered steps for systematic implementation:

1. **{Step Name}**
   - {Sub-task or detail}
   - {Sub-task or detail}

2. **{Step Name}**
   - {Sub-task or detail}

3. **{Step Name}**
   - {Sub-task or detail}

### Key Concepts

- {Concept 1}: Brief explanation
- {Concept 2}: Brief explanation

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: {Pattern Name}](/docs/2-technical/2-tad.md#{pattern-anchor})
- [TAD: {Pattern Name}](/docs/2-technical/2-tad-{subsection}.md#{pattern-anchor})

Key pattern notes for this story:

- {Note about when/why to use this pattern}
- {Note about customization needed for this story}

### Troubleshooting

| Issue                      | Cause              | Solution         |
| -------------------------- | ------------------ | ---------------- |
| {Common issue description} | {Why this happens} | {How to resolve} |
| {Another common issue}     | {Why this happens} | {How to resolve} |

### Reference Materials

- [{External Doc Title}]({url})
- [{External Doc Title}]({url})

## Estimated Effort

**Size**: {XS|S|M|L|XL} ({hours}h)

**Breakdown** (for M+ stories):

- {Sub-task 1}: {time}
- {Sub-task 2}: {time}
- {Sub-task 3}: {time}

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: {Decision Topic}](/docs/2-technical/2-tad.md#{anchor}) - {Brief description of relevance}
- [ADR-{NNN}: {Title}](/docs/2-technical/adr/{nnn}-{slug}.md) - {Brief description of relevance}

### Story-Specific Decisions

Only include decisions that are isolated to this story and don't affect other stories:

#### AD-{EpicID}.S{N}.1: {Decision Title}

**Scope**: Story-specific (does not affect other stories)

**Decision**: {What was decided}

**Rationale**:

- {Reason 1}
- {Reason 2}

**Consequences**:

- {Positive or negative outcome}

**Alternatives Considered**:

- **Option 1**: {Description} - Rejected because {reason}

## Out of Scope

The following items are explicitly NOT part of this story:

- **{Item 1}** - {Why it's excluded and where it's handled instead}
- **{Item 2}** - {Why it's excluded and where it's handled instead}
- **{Item 3}** - Deferred to {future epic/story}
- **{Item 4}** - Not required for this story's acceptance criteria

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S{N}**: {Story title} - {Reason why this dependency exists}

### Enables (Unblocks These Stories)

- **S{N}**: {Story title} - {What this story provides that unblocks the other}

## References

### Epic & TAD References

- [EPIC.md: {Section}](./EPIC.md#{anchor})
- [TAD: {Section}](/docs/2-technical/2-tad.md#{anchor})

### ADR References

- [ADR-{NNN}: {Title}](/docs/2-technical/adr/{nnn}-{slug}.md)

### External Documentation

- [{Doc Title}]({url})

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Required credentials/access available

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](../../3-references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage > 80% for new code (if applicable)

### Documentation

- [ ] Code comments where logic isn't self-evident
- [ ] README updated (if applicable)
- [ ] Architecture decisions documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started | In Progress | Complete | Blocked
- **PR**: - | #{number}
- **Completed**: - | YYYY-MM-DD

## Appendix (Optional)

### Appendix A: {Template/Script Name}

```{language}
{Template or script content}
```

### Appendix B: {Reference Data}

{Additional reference information, lookup tables, or extended examples}

````

---

## Template Usage Guide

### Story ID Convention

Use the full epic ID in story identifiers:
- **Format**: `{EpicID}.S{N}` (e.g., `1A.1.S1`, `2A.3.S5`)
- **Architecture Decision Format**: `AD-{EpicID}.S{N}.{DecisionNumber}` (e.g., `AD-1A.1.S1.1`)

### Section Guidelines

| Section | Required | Notes |
|---------|----------|-------|
| Context | Yes | All four fields: Epic, Depends On, Blocks, Runs in Parallel With |
| User Story | Yes | Follow As/I want/So that format |
| Acceptance Criteria | Yes | Specific, testable checkboxes |
| Technical Requirements | Yes | Files, dependencies, configuration details |
| Test Requirements | Yes | Split by Manual/Automated/Integration/Commands |
| Implementation Notes | Recommended | Include Implementation Sequence for M+ stories |
| Estimated Effort | Yes | Include breakdown for M+ stories |
| Architecture Decisions | If applicable | Document significant choices |
| Out of Scope | Recommended | Prevents scope creep |
| Dependencies | Yes | Both directions (depends/enables) |
| References | Yes | Link to epic, TAD, ADRs |
| Verification Checklist | Yes | Comprehensive quality gates |
| Status | Yes | Track progress |
| Appendix | Optional | Templates, scripts, reference data |

### Size Guidelines

| Size | Hours | Characteristics |
|------|-------|-----------------|
| XS | 1-2h | Single file change, minimal testing |
| S | 2-4h | Few files, straightforward implementation |
| M | 4-8h | Multiple files, moderate complexity |
| L | 8-16h | Many files, significant complexity, consider splitting |
| XL | 16h+ | Should be split into multiple stories |

### Section Condensation (S/XS Stories Only)

For smaller stories, the following sections may be condensed to reduce verbosity:

| Section | Condensed Format |
|---------|------------------|
| References | Single combined list instead of separate subsections |
| Verification Checklist | Combined bullets by category instead of four separate subsections |
| Estimated Effort | Size and hours only; breakdown not required |

### Writing Effective Acceptance Criteria

**Good criteria are:**
- Specific and measurable
- Independently verifiable
- Written as checkboxes for tracking
- Focused on outcomes, not implementation

**Examples:**
```markdown
- [ ] Health endpoint returns 200 OK with valid JSON response
- [ ] Build time reduced by >70% with caching enabled
- [ ] All TypeScript files compile without errors
````

**Avoid:**

```markdown
- [ ] Code is good quality (too vague)
- [ ] Everything works (not measurable)
- [ ] Implement the feature (not an outcome)
```

### Architecture Decision Format

#### Decision Consolidation Rules

Decisions must be consolidated to prevent duplication and enable cross-referencing:

| Decision Type                                     | Where to Document | Story Action     |
| ------------------------------------------------- | ----------------- | ---------------- |
| **Cross-cutting** (affects multiple stories/apps) | TAD section       | Link from story  |
| **Major architectural**                           | ADR document      | Link from story  |
| **Story-specific** (isolated, no broader impact)  | Story AD section  | Document in full |

**Cross-cutting decisions that belong in TAD (not stories):**

- Directory structure conventions
- Environment variable naming patterns
- Configuration file formats
- Testing patterns and tool choices
- Security configurations
- API response format standards

#### When to Document in Story

Only use AD-{id} format for decisions that:

1. Are isolated to this story only
2. Don't affect other stories or apps
3. Won't need to be referenced elsewhere

#### Format for Story-Specific Decisions

1. **Numbering**: Sequential within story (AD-1A.1.S1.1, AD-1A.1.S1.2)
2. **Required fields**: Scope, Decision, Rationale, Consequences
3. **Scope field**: Must state "Story-specific (does not affect other stories)"
4. **Optional fields**: Alternatives Considered

### Out of Scope Best Practices

Explicitly listing what's NOT included prevents scope creep and clarifies boundaries:

- State where excluded items ARE handled (future epic, different story)
- Explain why items are excluded if not obvious
- Reference related stories/epics when deferring work

### Test Requirements Categories

| Category              | Purpose                       | Examples                                                            |
| --------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Manual Verification   | Human-verified outcomes       | UI rendering, deployment success, configuration validation          |
| Automated Tests       | Unit tests in code            | `{file}.test.ts`, component tests, utility function tests           |
| Integration Tests     | Cross-component/service tests | API integration, external service interaction, end-to-end workflows |
| Verification Commands | CLI commands to run           | `pnpm build`, `curl /api/health`, `git commit` hooks                |

### Integration Tests Guidelines

The Integration Tests section is **optional** - include only when the story involves cross-component or external service interactions.

#### When to Include Integration Tests

| Story Type                              | Include Integration Tests? | Example                            |
| --------------------------------------- | -------------------------- | ---------------------------------- |
| Infrastructure setup (repo, CI, config) | No                         | S1: GitHub Repository setup        |
| Pure frontend/UI component              | Rarely                     | Component library stories          |
| API endpoint implementation             | Yes                        | S4: Health Check Endpoint          |
| External service integration            | Yes                        | Auth, database, payment stories    |
| E2E test infrastructure                 | Yes                        | S6: Playwright Smoke Tests         |
| Multi-service workflow                  | Yes                        | Stories spanning multiple services |

#### When to Skip Integration Tests

Write "N/A - {reason}" or omit the section entirely for stories that:

- Set up infrastructure without runtime behavior (GitHub config, CI workflows)
- Create standalone utilities with no external dependencies
- Are purely documentation or configuration focused
- Have integration testing deferred to a later story (state where)

**Example of skipping:**

```markdown
### Integration Tests

N/A - Infrastructure setup story; no runtime integration to test.
```

**Example of deferring:**

```markdown
### Integration Tests

- [ ] Deferred to S6 (Smoke Tests) - Health endpoint will be validated via E2E tests
```

#### Writing Effective Integration Tests

Good integration test criteria:

- Describe the interaction being verified, not implementation details
- Specify which components/services are involved
- Include expected outcomes for both success and failure cases

**Good examples:**

```markdown
- [ ] Health endpoint returns degraded status when database connection fails
- [ ] Auth callback correctly creates user session in database
- [ ] Webhook handler processes Stripe events and updates subscription status
```

**Avoid:**

```markdown
- [ ] Test the API (too vague)
- [ ] Integration works (not measurable)
- [ ] Call the function with test data (describes implementation, not outcome)
```

### Parallel Execution Guidelines

Use **Runs in Parallel With** when:

- Stories have no data dependencies on each other
- Stories can be implemented by different developers simultaneously
- Stories don't modify the same files
- Both stories depend on the same prerequisite (can start together after prerequisite completes)

Example from Epic 1A.2:

- S6 (Dependabot) and S7 (CodeRabbit) are independent GitHub configurations
- Both can be implemented in parallel after S1 (pnpm) completes
- Neither blocks the other

### Anti-Patterns to Avoid

Stories should define **requirements**, not provide **copy-paste implementation**. The TAD contains implementation patterns and code examples.

#### Code Block Length

Stories should NOT contain code blocks longer than 10-15 lines. Reference the TAD instead.

**Avoid this (implementation in story):**

```markdown
### Health Check Implementation

` ` `typescript
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const [databaseResult, authResult, cacheResult] = await Promise.allSettled([
    checkDatabase(),
    checkAuth(),
    checkCache(),
  ]);
  // ... 40 more lines of implementation
}
` ` `
```

**Do this instead (reference TAD):**

```markdown
### Health Check Implementation

Implement the health endpoint following the pattern in
[TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification).

Key requirements:

- Return `HealthCheckResponse` interface (defined in TAD)
- Use `Promise.allSettled` for parallel dependency checks
- Return HTTP 503 when any critical check fails
```

#### Version Numbers

Never hardcode version numbers. Always reference canonical-versions.md.

**Avoid:**

```bash
pnpm add -D playwright@1.40.0
node-version: '24'
```

**Do this instead:**

```markdown
Install Playwright per [canonical-versions.md](/docs/2-technical/canonical-versions.md#testing)
```

#### Configuration Files

Don't include complete configuration file contents. Reference TAD templates.

**Avoid (80 lines of YAML in story):**

```markdown
### GitHub Actions Workflow

` ` `yaml
name: CI
on:
pull_request:
branches: [main]

# ... 75 more lines

` ` `
```

**Do this instead:**

```markdown
### GitHub Actions Workflow

Create `.github/workflows/ci.yml` following the template in
[TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow).

Required jobs: `lint`, `type-check`, `test`, `build`
```

#### TypeScript Interfaces

Don't duplicate TypeScript interfaces from the TAD.

**Avoid:**

```markdown
` ` `typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  // ... 15 more lines
}
` ` `
```

**Do this instead:**

```markdown
Use the `HealthCheckResponse` interface defined in
[TAD: Health Check Specification](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification)
```

### Story Length Guidelines

| Size | Target Length | If Exceeding                                      |
| ---- | ------------- | ------------------------------------------------- |
| XS/S | < 150 lines   | Review for unnecessary detail                     |
| M    | < 250 lines   | Consider splitting or moving content to TAD       |
| L    | < 350 lines   | Strongly consider splitting into multiple stories |
| XL   | N/A           | Must be split - too large for single story        |

If a story exceeds these limits, check for:

1. Copy-paste implementation code (move to TAD)
2. Duplicated TAD content (replace with links)
3. Over-detailed configuration (summarize requirements, link TAD)
4. Scope creep (move items to Out of Scope)
