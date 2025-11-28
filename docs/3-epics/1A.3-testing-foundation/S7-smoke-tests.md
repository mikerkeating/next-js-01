# Story 1A.3.S7: Create E2E Smoke Test Suite

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: [S4: Playwright Setup](./S4-playwright-setup.md), [S6: Coverage Config](./S6-coverage-config.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** E2E smoke tests that validate critical deployment functionality
**So that** I can verify preview deployments are working before merging pull requests

## Acceptance Criteria

- [ ] Smoke test validates `/api/health` endpoint returns 200 OK with valid JSON
- [ ] Smoke test validates homepage loads successfully with expected title element
- [ ] Tests run against configurable BASE_URL for preview deployments
- [ ] Running `pnpm test:e2e:smoke` executes only smoke tests (fast feedback)
- [ ] Smoke tests complete in under 30 seconds across all browsers
- [ ] Failed smoke tests produce actionable error messages with screenshots

## Technical Requirements

### Files to Create

| Path                               | Purpose                     |
| ---------------------------------- | --------------------------- |
| `tests/e2e/smoke/health.spec.ts`   | Health endpoint smoke test  |
| `tests/e2e/smoke/homepage.spec.ts` | Homepage loading smoke test |

### Files to Modify

| Path                   | Changes                                 |
| ---------------------- | --------------------------------------- |
| `package.json`         | Add `test:e2e:smoke` script             |
| `playwright.config.ts` | Add smoke test project with grep filter |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required - uses Playwright from S4.

### Configuration Details

| Setting        | Requirement               | TAD Reference                                      |
| -------------- | ------------------------- | -------------------------------------------------- |
| Test directory | `tests/e2e/smoke/`        | [TAD: Testing](/docs/2-technical/2-tad-testing.md) |
| Timeout        | 30s per test              | [EPIC: Constraints](./EPIC.md#constraints)         |
| BASE_URL       | From environment variable | [S4: BASE_URL Config](./S4-playwright-setup.md)    |

## Test Requirements

### Manual Verification

- [ ] **Health Test**: Run smoke tests against local dev server, verify health check passes
- [ ] **Homepage Test**: Verify homepage test detects title element correctly
- [ ] **Preview URL Test**: Set `BASE_URL` to a deployed preview, verify tests run against it

### Automated Tests

- [ ] Smoke: `health.spec.ts` - GET `/api/health` returns 200 with valid JSON structure
- [ ] Smoke: `homepage.spec.ts` - Homepage loads and contains expected title element

### Integration Tests

- [ ] Health endpoint integration - Validates full request/response cycle via Playwright
- [ ] Multi-browser execution - All three browsers (Chrome, Firefox, WebKit) pass

### Verification Commands

```bash
# Run smoke tests only (fast)
pnpm test:e2e:smoke

# Run against local dev server
BASE_URL=http://localhost:3000 pnpm test:e2e:smoke

# Run against preview deployment
BASE_URL=https://preview-123.vercel.app pnpm test:e2e:smoke
```

## Implementation Notes

### Troubleshooting

| Issue                               | Solution                                         |
| ----------------------------------- | ------------------------------------------------ |
| Health test fails with ECONNREFUSED | Start dev server before running tests            |
| Tests pass locally but fail preview | Add retry logic or wait-for-deployment in CI     |
| Homepage test flaky on title check  | Use `waitForLoadState('domcontentloaded')` first |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - E2E testing patterns
- [S4: Playwright Setup](./S4-playwright-setup.md) - Base Playwright configuration

### Story-Specific Decisions

#### AD-1A.3.S7.1: Separate Smoke Test Directory

**Scope**: Story-specific (does not affect other stories)

**Decision**: Place smoke tests in `tests/e2e/smoke/` subdirectory

**Rationale**:

- Clear separation between fast smoke tests and longer feature tests
- Enables simple glob pattern for selective execution

## Out of Scope

- **Authentication flow smoke tests** - Requires auth setup; deferred to Epic 2A
- **Database health checks** - Deferred to Epic 2A.2 (Database Infrastructure)
- **Full user journey tests** - Feature E2E tests, not smoke tests
- **CI/CD pipeline integration** - Workflow configuration deferred to Epic 1A.5

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S4**: Playwright Setup - Provides Playwright configuration and test infrastructure
- **S6**: Coverage Config - Completes testing infrastructure foundation

### Enables (Unblocks These Stories)

- None - Final story in Epic 1A.3

## References

- [EPIC.md](./EPIC.md) | [TAD: Testing](/docs/2-technical/2-tad-testing.md) | [Playwright API Testing](https://playwright.dev/docs/api-testing)

## Verification Checklist

- [ ] S4 and S6 completed
- [ ] All acceptance criteria met
- [ ] Smoke tests pass on local dev server
- [ ] Smoke tests complete in under 30 seconds
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
