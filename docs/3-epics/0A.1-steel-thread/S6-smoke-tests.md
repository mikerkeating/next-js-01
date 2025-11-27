# Story 0A.1.S6: Create Playwright Smoke Test Suite

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S4: Implement Health Check Endpoint](./S4-health-endpoint.md), [S5: Configure Environment Variables](./S5-environment-variables.md)
- **Blocks**: [S7: Setup GitHub Actions CI Workflow](./S7-github-actions.md)
- **Runs in Parallel With**: None

## User Story
**As a** developer
**I want** automated smoke tests that run against deployed environments
**So that** I can verify critical functionality works after each deployment before merging PRs

## Acceptance Criteria
- [ ] Playwright installed and configured per canonical versions
- [ ] Smoke test suite validates health endpoint returns 200 OK with "healthy" status
- [ ] Smoke test verifies homepage loads successfully
- [ ] Smoke test verifies no console errors on page load
- [ ] Tests can run against any deployment URL via `BASE_URL` environment variable
- [ ] Test results output to `playwright-report/` directory
- [ ] Tests complete within 60 seconds for full suite
- [ ] `pnpm test:e2e:smoke` command runs the smoke test suite

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright configuration with base URL and reporters |
| `tests/e2e/smoke.spec.ts` | Smoke test suite for deployment validation |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` | Add Playwright dependency and test:e2e:smoke script |
| `.gitignore` | Add playwright-report/, test-results/, playwright/.cache/ |
| `README.md` | Document smoke test usage and commands |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**
```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### Configuration Details

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Base URL | Configurable via `BASE_URL` env var | [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests) |
| Browsers | Chromium only (speed optimization) | [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing) |
| Timeout | 30s per test, 60s total suite | [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests) |
| Retries | 2 in CI, 0 locally | [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests) |

## Test Requirements

### Manual Verification
- [ ] `pnpm test:e2e:smoke` runs successfully against local dev server
- [ ] Tests pass against Vercel preview deployment
- [ ] HTML report generated in `playwright-report/`

### Verification Commands
```bash
# Run smoke tests locally
pnpm dev &
pnpm test:e2e:smoke

# Run against specific URL
BASE_URL=https://preview-url.vercel.app pnpm test:e2e:smoke

# View report
npx playwright show-report
```

## Implementation Notes

### Implementation Sequence

1. **Install Playwright** (~15min)
   - Add @playwright/test dependency
   - Install Chromium browser
   - Create playwright.config.ts

2. **Create Smoke Test Suite** (~1h)
   - Health endpoint test (200 OK, "healthy" status)
   - Homepage load test (title verification)
   - Console error detection test

3. **Configure Package Scripts** (~15min)
   - Add `test:e2e:smoke` script
   - Update .gitignore for test artifacts

4. **Verify and Document** (~30min)
   - Test against local and Vercel preview
   - Update README with usage

### Key Concepts
- **Smoke Tests**: Quick validation of critical paths; not comprehensive testing
- **Base URL Pattern**: Tests use configurable BASE_URL for environment flexibility
- **Fail Fast**: Health check failure should fail entire suite early

### Common Patterns

Reference the TAD for implementation patterns:
- [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests)

Key pattern notes:
- Use `request` context for API tests, `page` for browser tests
- Configure `baseURL` from `BASE_URL` env var with localhost fallback

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout on preview | Use wait-for-vercel-preview in CI; handle cold starts |
| Console error test fails on expected errors | Filter by type ('error'); ignore known benign errors |
| BASE_URL not used | Verify `baseURL: process.env.BASE_URL` in config |

## Estimated Effort
**Size**: M (4-8h)

**Breakdown**: Install/config (30min), test suite (1.5h), testing (1h), docs (30min)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing) - E2E testing with Playwright
- [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests)

### Story-Specific Decisions

#### AD-0A.1.S6.1: Chromium-Only for Smoke Tests
**Scope**: Story-specific (does not affect other stories)

**Decision**: Run smoke tests only in Chromium, not full cross-browser suite.

**Rationale**: Smoke tests validate deployment, not browser compatibility. Single browser reduces CI time ~60%. Cross-browser testing deferred to Epic 1A.3.

**Consequences**: Firefox/WebKit issues not caught in deployment pipeline; faster PR feedback.

#### AD-0A.1.S6.2: Minimal Smoke Test Scope
**Scope**: Story-specific (does not affect other stories)

**Decision**: Smoke suite includes 4 tests: health check, homepage load, console errors, static assets.

**Rationale**: Smoke tests prove deployment works, not feature completeness. Auth flow deferred until Clerk integration (Epic 2A.7).

## Out of Scope

- **Cross-Browser Testing** - Deferred to Epic 1A.3; smoke tests use Chromium only
- **Visual Regression Testing** - Deferred; requires Chromatic setup
- **Authentication Flow Tests** - Deferred to Epic 2A.7; Clerk not integrated
- **Performance/Load Testing** - Deferred; requires k6/Artillery setup
- **Accessibility Testing** - Deferred to Epic 1A.3; requires axe-core

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S4**: Health Check Endpoint - Primary smoke test target
- **S5**: Environment Variables - Provides BASE_URL pattern

### Enables (Unblocks These Stories)
- **S7**: GitHub Actions CI Workflow - Needs smoke tests as CI quality gate

## References

### Epic & TAD References
- [EPIC.md](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing)
- [TAD: Deployment Smoke Tests](/docs/2-technical/2-tad-steel-thread-deployment.md#deployment-smoke-tests)

### External Documentation
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Playwright CI Configuration](https://playwright.dev/docs/ci)

## Verification Checklist

### Pre-Verification
- [ ] S4 (Health Check Endpoint) completed
- [ ] S5 (Environment Variables) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Playwright installed and Chromium browser available
- [ ] `pnpm test:e2e:smoke` executes without errors locally
- [ ] Tests pass against Vercel preview deployment URL
- [ ] `pnpm lint` and `pnpm type-check` pass

### Git Hygiene
- [ ] Conventional commit message used (e.g., `test(e2e): add Playwright smoke test suite`)
- [ ] No unrelated changes included
- [ ] playwright-report/ and test-results/ not committed

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
