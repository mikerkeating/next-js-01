# Story 1A.5.S5: Create Main Branch Workflow

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: None (independent workflow file)
- **Blocks**: [S6](./S6-branch-protection.md), [S7](./S7-dependabot-security.md)
- **Runs in Parallel With**: [S1](./S1-pr-workflow.md) (independent workflow files)

## User Story

**As a** developer
**I want** automated deployment to staging when code is merged to the development branch
**So that** the team can validate changes in a staging environment and receive notifications of build failures

## Acceptance Criteria

- [ ] Main workflow triggers on push to `development` branch
- [ ] Workflow runs full test suite (not filtered, all packages)
- [ ] Workflow deploys to staging environment after tests pass
- [ ] Staging deployment triggers E2E smoke tests for validation
- [ ] Build failures send notifications to configured channel (Slack/Discord)
- [ ] Workflow completes within 15 minutes for full test suite
- [ ] Staging URL is consistent (`staging.{domain}`)
- [ ] Deployment status is reported as GitHub check

## Technical Requirements

### Files to Create

| Path                         | Purpose                         |
| ---------------------------- | ------------------------------- |
| `.github/workflows/main.yml` | Main branch deployment workflow |

### Files to Modify

| Path                              | Changes                                             |
| --------------------------------- | --------------------------------------------------- |
| `.github/workflows/e2e-smoke.yml` | Ensure callable from main workflow (if not already) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**GitHub Actions used:**

- `actions/checkout@v4`
- `pnpm/action-setup@v4`
- `actions/setup-node@v4`
- Reusable setup action from S1 (`.github/actions/setup`)
- Notification action (Slack or Discord, depending on team decision)

No new npm dependencies required.

### Configuration Details

| Setting              | Requirement                 | TAD Reference                                                                |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `on.push.branches`   | `[development]`             | [TAD: Main Branch Workflow](/docs/2-technical/2-tad.md#main-branch-workflow) |
| `concurrency`        | Single deployment at a time | Prevent staging conflicts                                                    |
| Full test execution  | No Turborepo filtering      | Ensure complete validation                                                   |
| Notification webhook | Environment secret          | SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL                                     |

**Configuration Rationale**: Main branch workflow runs full test suite (no filtering) to ensure all packages pass before staging deployment. Concurrency prevents simultaneous deployments to staging.

For workflow patterns, see: [TAD: Main Branch Workflow](/docs/2-technical/2-tad.md#main-branch-workflow)

## Test Requirements

### Manual Verification

- [ ] **Merge Trigger Test**: Merge PR to development, verify workflow starts
- [ ] **Full Test Suite**: Confirm all packages tested (no filtering applied)
- [ ] **Staging Deploy Test**: Verify staging deployment completes successfully
- [ ] **Smoke Tests on Staging**: Confirm E2E smoke tests run against staging URL
- [ ] **Failure Notification Test**: Intentionally break test, verify notification sent

### Integration Tests

- [ ] Workflow triggers only on push to development (not on PRs to development)
- [ ] Smoke tests validate staging deployment health
- [ ] Notification includes commit info, author, and failure details

### Verification Commands

```bash
# Verify workflow file is valid YAML
pnpm dlx yaml-lint .github/workflows/main.yml

# Check workflow targets correct branch
grep -A3 "push:" .github/workflows/main.yml

# Verify notification step exists
grep -i "slack\|discord" .github/workflows/main.yml

# Run full test suite locally (what main workflow does)
pnpm run test
pnpm run build
```

## Implementation Notes

### Implementation Sequence

1. **Create Main Workflow File**
   - Configure push trigger for development branch
   - Set up concurrency to prevent parallel deployments
   - Use reusable setup action from S1

2. **Configure Full Test Suite Execution**
   - Run lint, type-check, test, build without Turborepo filtering
   - All jobs must pass before deployment

3. **Add Staging Deployment Job**
   - Depends on all quality check jobs passing
   - Vercel auto-deploys via GitHub integration
   - Explicit staging URL validation

4. **Integrate E2E Smoke Tests**
   - Call reusable smoke workflow against staging URL
   - Use same smoke tests as preview deployments

5. **Configure Failure Notifications**
   - Add notification step on workflow failure
   - Include commit, author, and error context

### Key Concepts

- **Full Suite vs Filtered**: Unlike PR workflow (S2), main workflow runs full test suite for comprehensive validation
- **Staging Environment**: Dedicated environment for pre-production validation
- **Notifications**: Alert team to failures that may affect deployment cadence

### Troubleshooting

| Issue                   | Cause                  | Solution                               |
| ----------------------- | ---------------------- | -------------------------------------- |
| Workflow not triggering | Wrong branch name      | Verify `development` matches exactly   |
| Staging deploy fails    | Missing Vercel env     | Check staging environment in Vercel    |
| Notification not sent   | Missing webhook secret | Add SLACK_WEBHOOK_URL to repo secrets  |
| Smoke tests fail        | Staging not ready      | Add deployment wait; check Vercel logs |

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Main workflow configuration: 1.5h
- Full test suite setup: 1h
- Staging deployment integration: 1h
- Notification setup: 1h
- Testing and validation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Main Branch Workflow](/docs/2-technical/2-tad.md#main-branch-workflow) - Workflow structure and triggers
- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach) - Deployment strategy
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Staging deployment via Vercel

### Story-Specific Decisions

#### AD-1A.5.S5.1: Full Test Suite on Main Branch

**Scope**: Story-specific (does not affect other stories)

**Decision**: Main branch workflow runs full test suite without Turborepo filtering.

**Rationale**:

- Staging deployment is critical path; all packages must be validated
- Cross-package integration issues caught before staging
- PR workflow uses filtering for speed; main workflow uses completeness

**Consequences**:

- Longer CI time (~10-15 minutes vs ~5 minutes)
- Higher confidence in staging deployments

**Alternatives Considered**:

- **Use Turborepo filtering**: Rejected because staging needs complete validation

#### AD-1A.5.S5.2: Notification Channel Configuration

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use repository secret for notification webhook URL, supporting Slack or Discord based on team preference.

**Rationale**:

- Flexible deployment without code changes
- Team can switch channels without workflow updates
- Secret keeps webhook URL secure

**Consequences**:

- Requires manual secret configuration
- Notification format may vary by provider

## Out of Scope

The following items are explicitly NOT part of this story:

- **Production deployment** - Staging only; production release process deferred to later epic
- **Deployment approval gates** - Automatic deployment to staging; approval gates deferred
- **Rollback automation** - Manual rollback via Vercel dashboard (documented in TAD)
- **Multi-environment matrix** - Single staging environment only
- **Performance benchmarks in CI** - Deferred to Epic 4A.1
- **Semantic versioning** - Deferred to Epic 5A.1
- **Dependabot integration** - Handled in S7

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **Epic 1A.3**: Testing Foundation - Test execution commands must exist

### Enables (Unblocks These Stories)

- **S6**: Branch Protection Rules - Requires main workflow status checks
- **S7**: Dependabot Security - Full pipeline must be in place for auto-updates

## References

- [EPIC.md](./EPIC.md) | [TAD: Main Branch Workflow](/docs/2-technical/2-tad.md#main-branch-workflow) | [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions) | [Slack GitHub Action](https://github.com/slackapi/slack-github-action) | [Vercel Deployments](https://vercel.com/docs/deployments)

## Verification Checklist

- [ ] **Pre-req**: Epic 1A.3 completed; Vercel project configured with staging environment
- [ ] **Quality**: All acceptance criteria met; YAML valid; full suite runs; notifications work
- [ ] **Env**: Staging environment variables configured; notification webhook secret set
- [ ] **Docs**: Workflow file has explanatory comments
- [ ] **Git**: Conventional commit, no unrelated changes, PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
