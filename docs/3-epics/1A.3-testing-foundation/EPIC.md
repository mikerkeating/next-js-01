# Epic 1A.3: Testing Foundation

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- **TAD Reference**: [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- **Phase**: 1A - Foundation & Infrastructure (Days 3-7)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                                    | Reason                                                                                                                              |
| ---- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1A.2 | [Package Management & Quality Gates](../1A.2-package-management/EPIC.md) | lint-staged integration for test file linting, environment validation pattern for test configuration, Husky hooks for test commands |

### Blocks (Enables These Epics)

| Epic | Title                                                               | What This Provides                                                                                                           |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md)                  | Test execution commands (`turbo run test`, `turbo run test:e2e`), coverage reporting patterns, and smoke test infrastructure |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md)             | Vitest configuration patterns to be extracted into shared config package                                                     |
| 2A.2 | [Database Infrastructure](../2A.2-database-infrastructure/EPIC.md)  | Test database utilities, mock patterns, and integration test infrastructure                                                  |
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md)              | Test utilities for verifying logging and error tracking behaviour                                                            |
| 4A.1 | [Advanced Testing Infrastructure](../4A.1-advanced-testing/EPIC.md) | Foundation for load testing, visual regression, and contract testing                                                         |

### Can Run in Parallel With

| Epic | Title                                                                | Notes                                                      |
| ---- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1A.4 | [Documentation Foundation](../1A.4-documentation-foundation/EPIC.md) | No resource conflicts; different tooling and file patterns |

## Overview

Testing Foundation establishes the test infrastructure required for Test-Driven Development (TDD) across the monorepo. This epic configures Vitest for unit testing with React Testing Library support, Playwright for end-to-end testing across browsers, and creates a shared `@repo/testing` package with reusable utilities. The foundation ensures developers can write fast, reliable tests from day one with proper coverage tracking and CI integration.

**Key Deliverables:**

- Vitest installed and configured with shared workspace configuration
- React Testing Library setup for component testing
- Playwright configured for Chrome, Firefox, and Safari with screenshot/video on failure
- `@repo/testing` package with `renderWithProviders`, mock factories, and MSW integration
- Coverage thresholds enforced (80% minimum)
- E2E smoke test validating health endpoint deployment
- Turborepo pipeline tasks for `test`, `test:e2e`, and `test:coverage`

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers can run `pnpm test` from any package and get consistent Vitest results with coverage
- [ ] Running `pnpm test:e2e` executes Playwright tests across Chrome, Firefox, and Safari browsers
- [ ] Failed E2E tests automatically capture screenshots and video recordings for debugging
- [ ] The `@repo/testing` package provides `renderWithProviders` for testing React components with providers
- [ ] Mock Service Worker (MSW) is configured for API mocking in both unit and integration tests
- [ ] Coverage reports show 80%+ coverage threshold enforcement (tests fail below threshold)
- [ ] Smoke test validates `/api/health` endpoint returns 200 OK on preview deployments
- [ ] Turborepo caches test results correctly (second run with no changes completes in <2 seconds)
- [ ] Test configuration files include inline documentation explaining patterns and decisions
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID  | Title                                                                  | Size | Status | Depends On | Blocks         |
| --- | ---------------------------------------------------------------------- | ---- | ------ | ---------- | -------------- |
| S1  | [Install and Configure Vitest](./S1-vitest-setup.md)                   | M    | ⬜     | -          | S2, S3, S5, S6 |
| S2  | [Configure React Testing Library](./S2-react-testing-library.md)       | S    | ⬜     | S1         | S5             |
| S3  | [Set Up Mock Utilities and Factories](./S3-mock-utilities.md)          | M    | ⬜     | S1         | S5             |
| S4  | [Install and Configure Playwright](./S4-playwright-setup.md)           | M    | ⬜     | -          | S7             |
| S5  | [Create @repo/testing Package](./S5-testing-package.md)                | M    | ⬜     | S2, S3     | S6             |
| S6  | [Configure Coverage Thresholds and Reporting](./S6-coverage-config.md) | S    | ⬜     | S1, S5     | S7             |
| S7  | [Create E2E Smoke Test Suite](./S7-smoke-tests.md)                     | S    | ⬜     | S4, S6     | -              |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Vitest Setup) ─────────────────────────┐
 │                                          │
 ├──→ S2 (React Testing Library)            │
 │     ↓                                    │
 │     └──→ S5 (@repo/testing Package) ←── S3 (Mock Utilities)
 │           ↓
 ├──→ S3 (Mock Utilities)
 │     ↓
 └──→ S6 (Coverage Config) ←── S5
           ↓
           └──→ S7 (Smoke Tests) ←── S4 (Playwright Setup)

S4 (Playwright Setup) ──→ S7 (Smoke Tests)
```

**Parallel Execution Notes:**

- S1 (Vitest) and S4 (Playwright) can run in parallel as they are independent test runners
- S2 (React Testing Library) and S3 (Mock Utilities) can run in parallel after S1 completes
- S5 (@repo/testing) requires both S2 and S3 to complete before consolidating utilities
- S7 (Smoke Tests) is the final convergence point requiring both unit and E2E infrastructure

## Technical Constraints

### Required Patterns

- **Test File Naming**: `*.test.ts`, `*.test.tsx` for unit tests; `*.e2e.test.ts` for E2E tests per [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- **Test Colocation**: Unit tests colocated with source files; E2E tests in `/tests/e2e` directory
- **Test Isolation**: Each test must be independent and parallelisable per [TAD Testing Philosophy](/docs/2-technical/2-tad-testing.md#testing-philosophy)
- **Coverage Strategy**: Minimum 80% overall, 95% for critical paths (auth, payments) per [TAD: Test Coverage Requirements](/docs/2-technical/2-tad-testing.md#test-coverage-requirements)

### Technology Decisions

| Decision          | Choice                       | Reference                                                                    |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| Unit Test Runner  | Vitest                       | [TAD: Testing](/docs/2-technical/2-tad.md#testing)                           |
| Component Testing | React Testing Library        | [TAD: Testing](/docs/2-technical/2-tad.md#testing)                           |
| E2E Testing       | Playwright                   | [TAD: Testing](/docs/2-technical/2-tad.md#testing)                           |
| API Mocking       | MSW (Mock Service Worker)    | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)              |
| Visual Regression | Chromatic (deferred to 4A.2) | [Roadmap: 4A.2](/docs/1-product/3-roadmap.md#epic-4a2-storybook-enhancement) |

### Constraints

- **Versions**: All technology versions per [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- **Test Speed**: Unit test suite must complete in <30 seconds for affected packages (Turborepo filtering)
- **Browser Coverage**: Playwright must test Chrome, Firefox, and WebKit (Safari) per TAD requirement
- **Failure Artifacts**: Screenshots and video must be captured on E2E failure for debugging
- **No Flaky Tests**: Tests must be deterministic; flaky tests should be quarantined or fixed immediately
- **Base URL Configurability**: E2E tests must accept BASE_URL environment variable for preview deployments

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Load Testing (k6/Artillery)** - Deferred to Epic 4A.1 (Advanced Testing Infrastructure)
- **Visual Regression Testing (Chromatic)** - Deferred to Epic 4A.2 (Storybook Enhancement)
- **API Contract Testing** - Deferred to Epic 4A.1 (Advanced Testing Infrastructure)
- **Test Database with Real Migrations** - Deferred to Epic 2A.2 (Database Infrastructure); mock database only for now
- **Accessibility Testing (axe-core in CI)** - Deferred to Epic 4A.3 (Accessibility Audit & Remediation)
- **Performance Budgets in Tests** - Deferred to Epic 4A.1 (Advanced Testing Infrastructure)
- **CI/CD Pipeline Integration** - Test commands only; pipeline configuration deferred to Epic 1A.5
- **Advanced MSW Scenarios** - Basic request mocking only; advanced scenarios added with feature epics

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                               | Options                                                        | Impact                                     | Status                        |
| -------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ | ----------------------------- |
| Vitest workspace vs per-package config | Single root vitest.workspace.ts vs individual vitest.config.ts | Affects caching and IDE integration        | ⬜ Open                       |
| Coverage reporter format               | `text`, `lcov`, `html` combination                             | Affects CI integration and local debugging | ✅ Resolved: Use all three    |
| Test database strategy                 | In-memory SQLite vs Docker Postgres                            | Affects test speed vs production parity    | ⬜ Open                       |
| MSW server location                    | packages/testing vs inline in tests                            | Affects reusability vs flexibility         | ✅ Resolved: packages/testing |
| Playwright trace retention             | Always vs on-failure-only                                      | Affects artifact storage and CI costs      | ✅ Resolved: On failure only  |

## Risks and Mitigations

| Risk                                           | Likelihood | Impact | Mitigation                                                                                   |
| ---------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------- |
| Vitest/Next.js compatibility issues            | Medium     | High   | Use `@vitejs/plugin-react`; consult Next.js testing docs; fallback to Jest if blocking       |
| Playwright tests flaky in CI                   | High       | Medium | Use retry on CI (2x); quarantine flaky tests; capture video/screenshots for debugging        |
| Coverage threshold breaks development velocity | Medium     | Medium | Start at 60%, incrementally raise to 80%; exclude generated files from coverage              |
| MSW handlers become stale vs actual API        | Medium     | Low    | Generate handlers from OpenAPI spec when available (Epic 3B.1); add handler freshness checks |
| Test run times degrade as codebase grows       | Medium     | High   | Enforce Turborepo caching; run only affected tests on PR; parallelize E2E with sharding      |

## Estimated Effort

| Metric          | Value                                |
| --------------- | ------------------------------------ |
| Total Stories   | 7                                    |
| Total Hours     | 30h                                  |
| Calendar Days   | 3-4 days                             |
| Parallel Tracks | 2 (S1-S3 and S4 can run in parallel) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 3     | 9h    |
| M (4-8h)  | 4     | 21h   |
| L (8-16h) | 0     | 0h    |

**Note**: M-sized stories account for complexity of configuring multiple testing tools to work together (Vitest + React Testing Library + MSW integration). Coverage configuration requires careful tuning to avoid blocking development.

## References

### Internal Documentation

- [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Testing (Overview)](/docs/2-technical/2-tad.md#testing)
- [Roadmap: Phase 1A](/docs/1-product/3-roadmap.md#phase-1a-foundation--infrastructure-days-3-7)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- (No testing-specific ADRs yet; decisions may warrant new ADRs)

### External Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Workspace Guide](https://vitest.dev/guide/workspace)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [MSW (Mock Service Worker) Documentation](https://mswjs.io/)
- [Testing Next.js Apps](https://nextjs.org/docs/app/building-your-application/testing)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
