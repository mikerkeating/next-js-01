# Story 1A.3.S4: Install and Configure Playwright

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Testing Foundation](./EPIC.md)
- **Depends On**: None (independent from Vitest setup)
- **Blocks**: [S7: E2E Smoke Test Suite](./S7-smoke-tests.md)
- **Runs in Parallel With**: [S1: Vitest Setup](./S1-vitest-setup.md), [S2: React Testing Library](./S2-react-testing-library.md), [S3: Mock Utilities](./S3-mock-utilities.md)

## User Story

**As a** developer
**I want** Playwright configured for cross-browser E2E testing
**So that** I can validate critical user journeys work correctly across Chrome, Firefox, and Safari before deployment

## Acceptance Criteria

- [ ] Running `pnpm test:e2e` executes Playwright tests from the `tests/e2e` directory
- [ ] Tests execute across Chrome, Firefox, and WebKit (Safari) browsers
- [ ] Failed tests automatically capture screenshots and video recordings
- [ ] Screenshots and videos are stored in `testing/e2e/results/` directory
- [ ] BASE_URL environment variable configures the target URL for preview deployments
- [ ] Playwright retries failed tests twice in CI environments automatically
- [ ] Turborepo caches Playwright test results correctly
- [ ] Browser installation command works without manual intervention (`pnpm exec playwright install --with-deps`)

## Technical Requirements

### Files to Create

| Path                        | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `playwright.config.ts`      | Root Playwright configuration           |
| `tests/e2e/.gitkeep`        | E2E test directory placeholder          |
| `tests/e2e/example.spec.ts` | Example E2E test demonstrating patterns |

### Files to Modify

| Path           | Changes                                      |
| -------------- | -------------------------------------------- |
| `package.json` | Add Playwright dependency, `test:e2e` script |
| `turbo.json`   | Add `test:e2e` pipeline task                 |
| `.gitignore`   | Add Playwright results directory patterns    |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
pnpm add -D @playwright/test
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting          | Requirement             | TAD Reference                                                                        |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `testDir`        | `./tests/e2e`           | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)                      |
| `projects`       | Chrome, Firefox, WebKit | [EPIC: Browser Coverage](/docs/3-epics/1A.3-testing-foundation/EPIC.md#constraints)  |
| `retries`        | 2 on CI, 0 locally      | [EPIC: Risks](/docs/3-epics/1A.3-testing-foundation/EPIC.md#risks-and-mitigations)   |
| `use.baseURL`    | From `BASE_URL` env var | [EPIC: Constraints](/docs/3-epics/1A.3-testing-foundation/EPIC.md#constraints)       |
| `use.trace`      | `on-first-retry`        | [EPIC: Failure Artifacts](/docs/3-epics/1A.3-testing-foundation/EPIC.md#constraints) |
| `use.screenshot` | `only-on-failure`       | [EPIC: Failure Artifacts](/docs/3-epics/1A.3-testing-foundation/EPIC.md#constraints) |
| `use.video`      | `retain-on-failure`     | [EPIC: Failure Artifacts](/docs/3-epics/1A.3-testing-foundation/EPIC.md#constraints) |
| `outputDir`      | `tests/e2e/results`     | Standard output directory                                                            |

**Configuration Rationale**:

- Multi-browser testing catches browser-specific issues before they reach production
- Screenshots and video on failure enable faster debugging without reproducing issues
- Retry on CI reduces flaky test failures while keeping local runs fast
- Configurable BASE_URL enables testing against preview deployments

## Test Requirements

### Manual Verification

- [ ] **Browser Installation**: Run `pnpm exec playwright install --with-deps` completes without errors
- [ ] **Example Test Execution**: `pnpm test:e2e` runs the example test successfully
- [ ] **Multi-Browser Check**: Test output shows Chrome, Firefox, and WebKit all executed
- [ ] **Failure Artifacts**: Force a test failure and verify screenshot/video appear in `testing/e2e/results/`
- [ ] **BASE_URL Override**: `BASE_URL=https://example.com pnpm test:e2e` uses the specified URL

### Automated Tests

- [ ] Example: `example.spec.ts` - Navigates to homepage and verifies title element exists

### Integration Tests

N/A - Infrastructure setup story; integration testing deferred to [S7: Smoke Tests](./S7-smoke-tests.md)

### Verification Commands

```bash
# Install Playwright browsers
pnpm exec playwright install --with-deps

# Run E2E tests
pnpm test:e2e

# Run with specific base URL
BASE_URL=http://localhost:3000 pnpm test:e2e

# Run in headed mode for debugging
pnpm exec playwright test --headed

# View HTML report
pnpm exec playwright show-report
```

## Implementation Notes

### Implementation Sequence

1. **Install Playwright**
   - Add `@playwright/test` as dev dependency
   - Install browser binaries with `playwright install --with-deps`

2. **Create Configuration**
   - Create `playwright.config.ts` with multi-browser setup
   - Configure output directories and failure artifacts
   - Set up BASE_URL environment variable support

3. **Set Up Test Directory**
   - Create `tests/e2e/` directory structure
   - Add example test demonstrating basic patterns
   - Add `.gitignore` entries for results artifacts

4. **Configure Build Pipeline**
   - Add `test:e2e` script to root `package.json`
   - Add `test:e2e` task to `turbo.json`
   - Ensure proper caching configuration

### Key Concepts

- **Browser Projects**: Playwright runs tests across multiple browser engines in parallel
- **Failure Artifacts**: Screenshots, videos, and traces capture test context on failure
- **Retries**: Automatic retry on CI reduces flaky test impact without hiding issues
- **Base URL**: Configurable base URL enables testing deployed previews

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: E2E Tests Pattern](/docs/2-technical/2-tad-testing.md)

Key pattern notes:

- Use `test.describe` for grouping related tests
- Use `test.beforeEach` for common setup (e.g., authentication)
- Use page object model for complex page interactions
- Keep E2E tests focused on critical user journeys

### Troubleshooting

**Issue**: Browser installation fails on CI

- **Cause**: Missing system dependencies for browser binaries
- **Solution**: Use `playwright install --with-deps` which installs OS-level dependencies

**Issue**: Tests timeout waiting for elements

- **Cause**: Default timeout too short for slow preview deployments
- **Solution**: Increase `timeout` in config or use `waitForLoadState('networkidle')`

**Issue**: Flaky tests in CI but pass locally

- **Cause**: Race conditions or timing issues
- **Solution**: Use proper Playwright assertions (auto-waiting) instead of manual waits

### Reference Materials

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Playwright installation and configuration: 2h
- Multi-browser setup and testing: 1.5h
- Turborepo pipeline integration: 1h
- Documentation and verification: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - E2E testing patterns and file organization
- [EPIC: Technology Decisions](/docs/3-epics/1A.3-testing-foundation/EPIC.md#technology-decisions) - Playwright as E2E framework choice

### Story-Specific Decisions

#### AD-1A.3.S4.1: Test Results Directory Location

**Scope**: Story-specific (does not affect other stories)

**Decision**: Store Playwright results in `testing/e2e/results/` rather than default `test-results/`

**Rationale**:

- Keeps all E2E-related files under `tests/e2e/` for discoverability
- Matches the test directory structure
- Simplifies `.gitignore` patterns

**Consequences**:

- Results path must be specified in `playwright.config.ts`
- CI artifact upload paths must reference this location

## Out of Scope

- **Test fixtures for authentication** - Deferred to [S7: Smoke Tests](./S7-smoke-tests.md)
- **Page object models** - Introduced as tests grow in complexity (future epics)
- **Visual regression with Playwright** - Deferred to Epic 4A.1 (using Chromatic instead)
- **Mobile viewport testing** - Deferred to feature epics requiring mobile support
- **Accessibility testing with axe-core** - Deferred to Epic 4A.3
- **CI/CD workflow integration** - Test commands only; workflow configuration in Epic 1A.5

## Dependencies on Other Stories

### Depends On (Must Complete First)

- None - This story is independent and can run in parallel with S1-S3

### Enables (Unblocks These Stories)

- **S7**: E2E Smoke Test Suite - Requires Playwright configuration to write smoke tests

## References

### Epic & TAD References

- [EPIC.md: Playwright Configuration](./EPIC.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)

### External Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)

## Verification Checklist

### Pre-Verification

- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] No blocking stories (none for this story)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Example E2E test passing across all browsers
- [ ] Failure artifacts captured correctly

### Documentation

- [ ] Configuration file includes inline comments explaining key settings
- [ ] Example test includes comments explaining pattern usage

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
