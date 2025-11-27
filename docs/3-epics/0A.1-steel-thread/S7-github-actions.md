# Story 0A.1.S7: Setup GitHub Actions CI Workflow

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S6: Create Playwright Smoke Test Suite](./S6-smoke-tests.md)
- **Blocks**: [S8: Document Deployment Process](./S8-documentation.md)
- **Runs in Parallel With**: None

## User Story
**As a** developer
**I want** automated CI checks that run on every pull request and push
**So that** code quality is enforced and deployment failures are caught before merging

## Acceptance Criteria
- [ ] GitHub Actions workflow file created at `.github/workflows/ci.yml`
- [ ] Workflow runs on pull requests to `development` branch
- [ ] Workflow runs on pushes to `development` branch
- [ ] Lint job validates code style with ESLint
- [ ] Type-check job validates TypeScript compilation
- [ ] Test job runs Vitest test suite (or placeholder if no tests yet)
- [ ] Build job verifies the Next.js application builds successfully
- [ ] E2E smoke test job runs Playwright tests against Vercel preview deployment
- [ ] All jobs use pnpm and Node.js versions per canonical-versions.md
- [ ] Workflow uses concurrency to cancel in-progress runs on new pushes
- [ ] E2E smoke tests wait for Vercel preview deployment before running
- [ ] PR cannot merge unless all required status checks pass

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main CI workflow with lint, type-check, test, build, and E2E jobs |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` | Ensure lint, type-check, test, and build scripts exist |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional npm dependencies required. GitHub Actions uses:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `pnpm/action-setup@v4`
- `patrickedqvist/wait-for-vercel-preview@v1.3.1`
- `actions/upload-artifact@v4`

### Configuration Details

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Trigger branches | `development` for PR and push events | [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow) |
| Node.js version | Per canonical-versions.md (22.x) | [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) |
| pnpm version | Per canonical-versions.md (10.x) | [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) |
| Concurrency | Cancel in-progress runs for same branch | [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow) |
| E2E timeout | 300s for Vercel preview wait | [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests) |

## Test Requirements

### Manual Verification
- [ ] Create a PR to `development` branch and verify all jobs run
- [ ] Verify lint job catches ESLint violations
- [ ] Verify type-check job catches TypeScript errors
- [ ] Verify build job completes successfully
- [ ] Verify E2E smoke tests run against preview URL
- [ ] Verify failed checks prevent PR merge

### Verification Commands
```bash
# Test workflow locally with act (optional)
act -j lint --container-architecture linux/amd64

# Verify scripts exist in package.json
pnpm run lint --help
pnpm run type-check --help
pnpm run build --help
pnpm run test:e2e:smoke --help
```

## Implementation Notes

### Implementation Sequence

1. **Create Workflow File** (~30min)
   - Create `.github/workflows/ci.yml`
   - Configure triggers for PR and push to `development`
   - Add concurrency group settings

2. **Configure Core Jobs** (~1h)
   - Add lint job with pnpm/action-setup and actions/setup-node
   - Add type-check job
   - Add test job (with placeholder if no tests exist yet)
   - Add build job

3. **Configure E2E Job** (~1h)
   - Add e2e-smoke job with dependency on core jobs
   - Configure wait-for-vercel-preview action
   - Pass BASE_URL to Playwright
   - Upload test results as artifacts

4. **Verify Branch Protection** (~30min)
   - Verify required status checks in GitHub repository settings
   - Test full workflow with a real PR

### Key Concepts
- **Job Parallelization**: lint, type-check, test, and build run in parallel for faster feedback
- **E2E Dependency**: e2e-smoke job uses `needs: [lint, type-check, test, build]` to run only after all pass
- **Concurrency Groups**: Prevent wasted CI minutes by cancelling outdated runs
- **Vercel Preview Wait**: E2E tests must wait for Vercel to complete preview deployment

### Common Patterns

Reference the TAD for implementation patterns:
- [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow)

Key pattern notes:
- Use `pnpm install --frozen-lockfile` to ensure reproducible builds
- Cache pnpm store with `actions/setup-node` cache option
- Run E2E only on `pull_request` events (not needed for push to development)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| E2E tests timeout waiting for preview | Increase `max_timeout` in wait-for-vercel-preview; verify Vercel GitHub app is connected |
| pnpm cache not working | Verify `cache: 'pnpm'` is set in actions/setup-node |
| Workflow not triggering | Check branch name matches trigger; verify workflow file syntax |
| Status checks not appearing | GitHub may take a few minutes to register new workflow; push a commit to trigger |

## Estimated Effort
**Size**: M (4-8h)

**Breakdown**:
- Workflow file creation: 30min
- Core jobs configuration: 1h
- E2E job with Vercel wait: 1h
- Testing and debugging: 1.5h
- Branch protection verification: 30min

## Architecture Decisions

### Consolidated Decisions (reference only)
- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach) - GitHub Actions for CI/CD pipeline
- [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow) - Workflow structure and jobs

### Story-Specific Decisions

#### AD-0A.1.S7.1: Parallel Core Jobs
**Scope**: Story-specific (does not affect other stories)

**Decision**: Run lint, type-check, test, and build jobs in parallel rather than sequentially.

**Rationale**: Parallel execution reduces total CI time from ~8min to ~3min. Each job is independent and doesn't require output from others.

**Consequences**: Higher concurrent runner usage; faster developer feedback.

#### AD-0A.1.S7.2: E2E Only on Pull Requests
**Scope**: Story-specific (does not affect other stories)

**Decision**: Only run E2E smoke tests on `pull_request` events, not on `push` events.

**Rationale**: Push to `development` already passed E2E in the PR. Running again wastes CI minutes and doesn't provide new information.

**Consequences**: Production deployment relies on PR E2E results; faster post-merge deployment.

## Out of Scope

- **Code Coverage Reporting** - Deferred to Epic 1A.5 (Basic CI/CD Pipeline)
- **Security Scanning (SAST)** - Deferred to Epic 1A.5
- **Dependency Vulnerability Scanning** - Deferred to Epic 1A.5
- **Bundle Size Checks** - Deferred to Epic 1A.5
- **Staging Deployment** - Deferred; steel thread uses Vercel auto-deploy
- **Slack/Discord Notifications** - Deferred to Epic 1A.5

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S6**: Create Playwright Smoke Test Suite - Provides `test:e2e:smoke` script for E2E job

### Enables (Unblocks These Stories)
- **S8**: Document Deployment Process - Needs CI workflow complete to document full pipeline

## References

### Epic & TAD References
- [EPIC.md](./EPIC.md)
- [TAD: CI/CD Approach](/docs/2-technical/2-tad.md#cicd-approach)
- [TAD: GitHub Actions Workflow](/docs/2-technical/2-tad-steel-thread-deployment.md#github-actions-workflow)
- [TAD: Branch Protection Rules](/docs/2-technical/2-tad-steel-thread-deployment.md#github-repository-configuration)

### External Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [wait-for-vercel-preview](https://github.com/patrickedqvist/wait-for-vercel-preview)

## Verification Checklist

### Pre-Verification
- [ ] S6 (Playwright Smoke Test Suite) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Vercel GitHub integration connected to repository

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Workflow syntax valid (GitHub validates on push)
- [ ] All jobs pass on a test PR
- [ ] E2E tests successfully run against preview URL
- [ ] Concurrency correctly cancels outdated runs

### Git Hygiene
- [ ] Conventional commit message used (e.g., `ci: add GitHub Actions CI workflow`)
- [ ] No unrelated changes included
- [ ] Workflow file properly indented (2 spaces)

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
