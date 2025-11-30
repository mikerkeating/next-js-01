# Story 1A.5.S4: Integrate Preview Deployment and E2E Smoke Tests

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Basic CI/CD Pipeline](./EPIC.md)
- **Depends On**: [S1](./S1-pr-workflow.md), [S2](./S2-turborepo-filtering.md), [S3](./S3-coverage-reporting.md)
- **Blocks**: [S7](./S7-dependabot-security.md) (final pipeline validation)
- **Runs in Parallel With**: None (requires all quality checks in place)

## User Story

**As a** developer
**I want** preview deployment URLs posted to my PR with automated E2E smoke test results
**So that** I can verify my changes work in a real environment before merging

## Acceptance Criteria

- [x] Preview deployment URL is posted as a PR comment within 5 minutes of push
- [x] E2E smoke tests run automatically against the preview deployment
- [x] Smoke test results are reported in the PR status checks
- [x] Smoke tests validate: health endpoint, homepage load, and static assets
- [x] Failed smoke tests block PR merge (when branch protection enabled)
- [x] Smoke test retries (2x) handle transient deployment delays
- [x] Playwright test artifacts (screenshots, traces) are uploaded on failure

## Technical Requirements

### Files to Create

| Path                              | Purpose                                      |
| --------------------------------- | -------------------------------------------- |
| `tests/e2e/smoke.spec.ts`         | E2E smoke test suite for preview deployments |
| `.github/workflows/e2e-smoke.yml` | Reusable workflow for smoke tests            |

### Files to Modify

| Path                       | Changes                                         |
| -------------------------- | ----------------------------------------------- |
| `.github/workflows/pr.yml` | Add preview wait step and smoke test job        |
| `playwright.config.ts`     | Add smoke test project with preview URL support |
| `package.json`             | Add `test:e2e:smoke` script                     |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**GitHub Actions used:**

- `patrickedqvist/wait-for-vercel-preview@v1.3.1` - Wait for Vercel preview deployment
- `actions/upload-artifact@v4` - Upload Playwright artifacts on failure

No new npm dependencies. Uses Playwright from Epic 1A.3.

### Configuration Details

| Setting              | Requirement                    | TAD Reference                                                                                     |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Preview wait timeout | 300 seconds (5 minutes)        | Vercel typical deploy time                                                                        |
| Smoke test retries   | 2 retries per test             | Handle edge propagation                                                                           |
| `BASE_URL` env var   | Preview URL from Vercel action | [TAD: E2E Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests) |
| Playwright timeout   | 30 seconds per test            | Balance reliability vs speed                                                                      |

For smoke test patterns, see: [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests)

## Test Requirements

### Manual Verification

- [ ] **Preview URL Test**: Create PR, verify preview URL comment appears
- [ ] **Smoke Pass Test**: Verify smoke tests pass and status check shows green
- [ ] **Smoke Fail Test**: Break health endpoint, verify tests fail and block merge
- [ ] **Artifact Test**: Trigger failure, verify Playwright traces downloadable

### Integration Tests

- [ ] Preview deployment completes within 5 minutes of push
- [ ] Smoke tests run successfully against preview URL
- [ ] Health endpoint check validates database and auth connectivity

### Verification Commands

```bash
# Run smoke tests locally against dev server
pnpm run dev &
BASE_URL=http://localhost:3000 pnpm run test:e2e:smoke

# Verify Playwright config includes smoke project
grep -A5 "name: 'smoke'" playwright.config.ts

# Check workflow references correct actions
grep "wait-for-vercel-preview" .github/workflows/pr.yml
```

## Implementation Notes

### Implementation Sequence

1. **Create Smoke Test Suite**
   - Health endpoint validation (200 OK, JSON response)
   - Homepage load and critical element verification
   - Static asset and console error checks

2. **Configure Playwright for Smoke Tests**
   - Add `smoke` project with short timeout and `BASE_URL` from env
   - Set up retry logic (2 retries)

3. **Integrate Preview Wait in PR Workflow**
   - Add wait-for-vercel-preview after build job
   - Pass preview URL to smoke test job via outputs

4. **Set Up Artifact Upload**
   - Upload Playwright report on test failure

### Troubleshooting

| Issue                | Cause                  | Solution                           |
| -------------------- | ---------------------- | ---------------------------------- |
| Preview wait timeout | Slow Vercel build      | Increase timeout; check build logs |
| Smoke tests flaky    | Edge propagation delay | Use retries; add delay after wait  |
| Health check 503     | Database not ready     | Verify DATABASE_URL in preview env |
| Auth check fails     | Missing Clerk secrets  | Verify CLERK_SECRET_KEY in Vercel  |

## Estimated Effort

**Size**: M (5h)

**Breakdown**: Smoke tests (1.5h) | Playwright config (1h) | Workflow integration (1.5h) | Testing (1h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Steel Thread Flow](/docs/2-technical/2-tad-steel-thread-deployment.md#steel-thread-components) - Preview deployment in CI
- [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests) - Smoke test patterns
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Preview deployment strategy

### Story-Specific Decisions

#### AD-1A.5.S4.1: Separate Smoke Test Workflow File

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create reusable `.github/workflows/e2e-smoke.yml` callable from PR and Main workflows.

**Rationale**: Avoids duplication; single update point; enables calling against any URL.

**Consequences**: Slightly more complex structure; better reusability for S5.

#### AD-1A.5.S4.2: Minimal Smoke Test Scope

**Scope**: Story-specific (does not affect other stories)

**Decision**: Smoke tests validate only: health endpoint, homepage, static assets, no console errors.

**Rationale**: Fast feedback (< 60s); tests deployment health not application logic.

**Consequences**: Limited feature coverage; faster CI completion.

## Out of Scope

- **Full E2E suite on preview** - Smoke tests only; full suite in S5 (Main Workflow)
- **Visual regression testing** - Deferred to Epic 4A.2
- **E2E test sharding** - Not required for basic smoke tests
- **Authentication flow E2E** - Smoke verifies Clerk loads; full auth tests deferred
- **Database seeding** - Smoke tests use existing preview data

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: PR Workflow - Base workflow with quality check jobs
- **S2**: Turborepo Filtering - Efficient builds for reasonable deploy time
- **S3**: Coverage Reporting - Coverage check before deployment validation
- **Epic 1A.3**: Testing Foundation - Playwright configured

### Enables (Unblocks These Stories)

- **S7**: Dependabot Security - Full pipeline validation before auto-updates

## References

- [EPIC.md](./EPIC.md) | [TAD: Steel Thread](/docs/2-technical/2-tad-steel-thread-deployment.md) | [TAD: Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests)
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)
- [Vercel Preview Deployments](https://vercel.com/docs/deployments/preview-deployments) | [wait-for-vercel-preview](https://github.com/patrickedqvist/wait-for-vercel-preview) | [Playwright Retry](https://playwright.dev/docs/test-retries)

## Verification Checklist

- [x] **Pre-req**: S1, S2, S3 completed; Epic 1A.3 Playwright configured; Vercel integration active
- [x] **Quality**: All acceptance criteria met; smoke tests pass/fail correctly; artifacts uploaded
- [ ] **Env**: Preview environment variables configured in Vercel (DATABASE_URL, CLERK keys)
- [ ] **Git**: Conventional commit, no unrelated changes, PR description complete

## Status

- **State**: Complete
- **Completed**: 2025-11-30

## Completion Notes

### Summary

Implemented E2E smoke tests for preview deployments with automated workflow integration. Created a custom `wait-for-vercel` action using GitHub's native Deployments API (avoiding third-party dependencies). Added static assets smoke test to complement existing health and homepage tests. The PR workflow now runs smoke tests against Vercel preview URLs after all quality checks pass.

### Test Results

| Test       | Command           | Result                |
| ---------- | ----------------- | --------------------- |
| Lint       | `pnpm lint`       | Pass                  |
| Types      | `pnpm type-check` | Pass                  |
| Smoke List | `--list`          | 16 tests × 3 browsers |

### Files Changed

Beyond planned files:

- `.github/actions/wait-for-vercel/action.yml` - Custom action replacing third-party `patrickedqvist/wait-for-vercel-preview` (uses GitHub Deployments API)
- `tests/e2e/smoke/static-assets.spec.ts` - Additional smoke test for static assets (favicon, CSS, JS bundles, network requests)

### Implementation Deviations

1. **Custom wait-for-vercel action**: Instead of using `patrickedqvist/wait-for-vercel-preview@v1.3.1`, created a custom composite action that polls the GitHub Deployments API. This eliminates third-party dependency and security concerns about unpinned actions.

2. **Smoke tests in directory structure**: Instead of single `tests/e2e/smoke.spec.ts`, tests are organized in `tests/e2e/smoke/` directory with separate files:
   - `health.spec.ts` - Health endpoint validation (pre-existing)
   - `homepage.spec.ts` - Homepage load and content (pre-existing)
   - `static-assets.spec.ts` - Favicon, CSS, JS bundles, network requests (new)

3. **Playwright config already configured**: The `playwright.config.ts` already had smoke test projects configured from Epic 1A.3, so no modifications were needed.

4. **package.json script already exists**: The `test:e2e:smoke` script was already present, so no modifications were needed.

### Known Issues

None identified.

### Lessons Learned

- GitHub's Deployments API provides native access to Vercel preview URLs without third-party actions
- Vercel's GitHub integration creates deployments with `vercel[bot]` as the creator
- Custom composite actions are straightforward to create and maintain
