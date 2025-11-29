# Story 2A.3.S7: Write Tests and Documentation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Observability Package](./EPIC.md)
- **Depends On**: [S2: Structured Logger](./S2-structured-logger.md), [S3: Sentry Integration](./S3-sentry-integration.md), [S4: Error Boundary Component](./S4-error-boundary.md), [S5: Web Vitals Tracking](./S5-web-vitals.md), [S6: Health Check Utilities](./S6-health-checks.md)
- **Blocks**: None (final story)
- **Runs in Parallel With**: None (requires all implementation stories to complete)

## User Story

**As a** developer
**I want** comprehensive tests and documentation for the observability package
**So that** I can confidently use observability utilities, understand their behavior, and maintain >80% test coverage

## Acceptance Criteria

- [ ] Test coverage exceeds 80% for all observability utilities
- [ ] Unit tests cover logger with all log levels (debug, info, warn, error, fatal)
- [ ] Unit tests cover Sentry integration functions (initSentry, captureError, setSentryUser)
- [ ] Unit tests cover Error Boundary component (error catching, fallback rendering)
- [ ] Unit tests cover Web Vitals tracking (reportWebVitals with mocked metrics)
- [ ] Unit tests cover all health check functions (checkDatabase, checkAuth, checkCache, checkAllServices)
- [ ] Integration tests verify logger integrates with Sentry for error/fatal logs
- [ ] Integration tests verify health check utilities work with Steel Thread endpoint pattern
- [ ] README.md includes installation, usage examples, and API documentation
- [ ] All test files follow Vitest conventions and use TypeScript strict mode
- [ ] Tests use appropriate mocking for external dependencies (Sentry, database, fetch)
- [ ] Documentation includes troubleshooting guide and common patterns

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/observability/__tests__/logger.test.ts` | Unit tests for structured logger |
| `packages/observability/__tests__/sentry.test.ts` | Unit tests for Sentry integration |
| `packages/observability/__tests__/error-boundary.test.tsx` | Component tests for Error Boundary |
| `packages/observability/__tests__/web-vitals.test.ts` | Unit tests for Web Vitals tracking |
| `packages/observability/__tests__/health-checks.test.ts` | Unit tests for health check utilities |
| `packages/observability/__tests__/integration/logger-sentry.test.ts` | Integration test for logger + Sentry |
| `packages/observability/__tests__/integration/health-endpoint.test.ts` | Integration test for health checks + API endpoint |
| `packages/observability/vitest.config.ts` | Vitest configuration |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/observability/README.md` | Add comprehensive usage documentation |
| `packages/observability/package.json` | Add test scripts and coverage thresholds |
| `turbo.json` | Add test task for observability package |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/observability

# Add testing dependencies
pnpm add -D vitest @vitest/coverage-v8 @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Vitest config | Coverage threshold 80%, happy-dom environment | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |
| Test scripts | `test`, `test:watch`, `test:coverage`, `test:ui` | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |
| Coverage reporters | Text, JSON, HTML formats | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |
| Mock handlers (MSW) | Mock Clerk API, database queries | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |

**Configuration Rationale**: 80% coverage threshold ensures observability utilities are well-tested and reliable. Using Vitest with happy-dom provides fast test execution for both Node.js and browser-like environments. MSW enables realistic API mocking without complex test fixtures. Integration tests verify utilities work correctly together, preventing regressions when refactoring.

For complete testing patterns, see: [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)

## Test Requirements

### Manual Verification

- [ ] **Coverage Report**: Run `pnpm test:coverage` and verify all utilities exceed 80% coverage
- [ ] **Test Watch Mode**: Run `pnpm test:watch` and verify hot-reload works correctly
- [ ] **Documentation Accuracy**: Read README.md and verify all code examples are accurate and runnable
- [ ] **Type Safety**: Verify all test files compile with TypeScript strict mode

### Automated Tests

- [ ] Unit: `__tests__/logger.test.ts` - Test logger outputs JSON with correct schema and log levels
- [ ] Unit: `__tests__/logger.test.ts` - Test logger hashes user IDs for privacy
- [ ] Unit: `__tests__/logger.test.ts` - Test logger pretty-prints in development mode
- [ ] Unit: `__tests__/sentry.test.ts` - Test Sentry initialization with/without DSN
- [ ] Unit: `__tests__/sentry.test.ts` - Test Sentry user context management (set/clear)
- [ ] Unit: `__tests__/sentry.test.ts` - Test error filtering (AbortError, NetworkError)
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Test Error Boundary catches rendering errors
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Test Error Boundary renders fallback UI
- [ ] Unit: `__tests__/error-boundary.test.tsx` - Test Error Boundary calls custom onError handler
- [ ] Unit: `__tests__/web-vitals.test.ts` - Test Web Vitals tracking with mocked metrics
- [ ] Unit: `__tests__/web-vitals.test.ts` - Test metrics sent to logger and Sentry
- [ ] Unit: `__tests__/health-checks.test.ts` - Test checkDatabase() with success/error/slow response
- [ ] Unit: `__tests__/health-checks.test.ts` - Test checkAuth() with various HTTP status codes
- [ ] Unit: `__tests__/health-checks.test.ts` - Test checkCache() with/without REDIS_URL
- [ ] Unit: `__tests__/health-checks.test.ts` - Test checkAllServices() overall status determination

### Integration Tests

- [ ] Logger + Sentry integration - Verify error/fatal logs automatically captured by Sentry
- [ ] Health checks + API endpoint - Verify utilities integrate with Steel Thread health endpoint pattern
- [ ] Error Boundary + Sentry - Verify React errors automatically reported to Sentry with component stack

### Verification Commands

```bash
# Build the observability package
pnpm --filter @repo/observability build

# Run all tests
pnpm --filter @repo/observability test

# Run tests in watch mode
pnpm --filter @repo/observability test:watch

# Run tests with coverage report
pnpm --filter @repo/observability test:coverage

# Run tests with UI
pnpm --filter @repo/observability test:ui

# Type check all test files
pnpm --filter @repo/observability type-check

# Lint all test files
pnpm --filter @repo/observability lint

# Verify coverage meets 80% threshold
pnpm --filter @repo/observability test:coverage && \
  grep -A 3 "All files" coverage/coverage-summary.json | grep "lines" | grep -q "[8-9][0-9]\|100"
```

## Implementation Notes

### Implementation Sequence

1. **Configure Vitest** (~30min)
   - Create `vitest.config.ts` with coverage thresholds and happy-dom environment
   - Add test scripts to `package.json` (test, test:watch, test:coverage, test:ui)
   - Configure coverage reporters (text, JSON, HTML)
   - Add `turbo.json` task for observability package tests

2. **Write Logger Tests** (~60min)
   - Test all log levels (debug, info, warn, error, fatal)
   - Test JSON output schema validation
   - Test user ID hashing for privacy
   - Test environment-aware formatting (development pretty-print vs production JSON)
   - Test metadata and performance fields
   - Mock console methods to capture output

3. **Write Sentry Integration Tests** (~60min)
   - Test `initSentry()` with/without DSN configuration
   - Test `setSentryUser()` and `clearSentryUser()` context management
   - Test `captureError()` and `captureMessage()` functions
   - Test error filtering (AbortError, NetworkError)
   - Test PII scrubbing (cookies, headers)
   - Mock Sentry SDK methods

4. **Write Error Boundary Tests** (~45min)
   - Test error catching with `getDerivedStateFromError()`
   - Test fallback UI rendering
   - Test custom `onError` callback invocation
   - Test Sentry integration for React errors
   - Use `@testing-library/react` for component testing

5. **Write Web Vitals Tests** (~45min)
   - Test `reportWebVitals()` initialization
   - Mock web-vitals library (onCLS, onFID, onLCP, onFCP, onTTFB)
   - Test metrics sent to logger with correct format
   - Test Sentry measurement integration
   - Test PostHog integration (if window.posthog available)

6. **Write Health Check Tests** (~90min)
   - Test `checkDatabase()` with mocked database (success, error, slow response)
   - Test `checkAuth()` with mocked fetch (various HTTP status codes)
   - Test `checkCache()` with/without REDIS_URL environment variable
   - Test `checkAllServices()` overall status determination logic
   - Test response time threshold detection (degraded vs ok)
   - Test error handling and logger integration
   - Mock database, fetch, and environment variables

7. **Write Integration Tests** (~60min)
   - Test logger + Sentry integration (error/fatal logs trigger Sentry capture)
   - Test health checks + API endpoint pattern (verify utilities work with Steel Thread)
   - Test Error Boundary + Sentry integration (React errors reported with context)

8. **Write Documentation** (~45min)
   - Update README.md with installation instructions
   - Add usage examples for each utility (logger, Sentry, Error Boundary, Web Vitals, health checks)
   - Document API reference (interfaces, functions, configuration)
   - Add troubleshooting guide for common issues
   - Include common patterns and best practices

9. **Verify Coverage** (~30min)
   - Run coverage report and identify gaps
   - Add missing tests to reach 80% threshold
   - Review coverage HTML report for uncovered lines

### Key Concepts

- **Test Coverage**: 80% minimum threshold ensures utilities are reliable and maintainable
- **Mocking External Dependencies**: Use Vitest mocking for Sentry, database, fetch to isolate unit tests
- **Integration Testing**: Verify utilities work together correctly (logger + Sentry, health checks + endpoint)
- **Happy-DOM Environment**: Provides browser-like DOM for React component testing without real browser

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)
- [TAD: Observability Test Coverage Requirements](/docs/2-technical/2-tad-observability.md#test-coverage-requirements)

Key pattern notes for this story:

- Use `vi.spyOn(console, 'log')` to capture logger output in tests
- Mock Sentry SDK with `vi.mock('@sentry/nextjs')` to avoid real error reporting in tests
- Use MSW (Mock Service Worker) to mock Clerk API endpoints for auth health checks
- Mock database with `vi.mock('@repo/database')` to control health check responses
- Use `@testing-library/react` for Error Boundary component testing with `renderHook` and error throwing

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Tests fail with "Cannot find module @repo/database" | Database package not built or peer dependency issue | Verify Epic 2A.2 complete; run `pnpm build --filter @repo/database` |
| Coverage below 80% | Missing test cases for edge cases or error paths | Review coverage HTML report; add tests for uncovered branches |
| Sentry tests interfere with each other | Sentry SDK maintains global state between tests | Use `vi.clearAllMocks()` in `beforeEach()` hook |
| Error Boundary tests don't catch errors | React Testing Library swallows errors by default | Wrap component in error-throwing test component; use `console.error` spy |
| Web Vitals tests timeout | web-vitals library doesn't call callbacks in test | Mock library completely with `vi.mock('web-vitals')` |
| Health check tests fail with real database | Tests not properly mocked | Ensure `vi.mock('@repo/database')` before imports |

### Reference Materials

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Testing React Error Boundaries](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Vitest configuration: 30min
- Logger tests: 60min
- Sentry integration tests: 60min
- Error Boundary tests: 45min
- Web Vitals tests: 45min
- Health check tests: 90min
- Integration tests: 60min
- Documentation: 45min
- Coverage verification and gap filling: 30min

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) - Testing frameworks and patterns
- [TAD: Observability Test Coverage Requirements](/docs/2-technical/2-tad-observability.md#test-coverage-requirements) - 80% coverage requirement
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Package structure rationale

### Story-Specific Decisions

#### AD-2A.3.S7.1: Use Happy-DOM Instead of JSDOM

**Scope**: Story-specific (isolated to observability package testing)

**Decision**: Use happy-dom as the DOM implementation for Vitest instead of jsdom.

**Rationale**:

- Happy-DOM is significantly faster than JSDOM (4-10x performance improvement)
- Lower memory footprint reduces test execution time
- Sufficient DOM API coverage for Error Boundary and Web Vitals testing
- Native ESM support improves compatibility with Vitest

**Consequences**:

- Tests run faster, improving developer experience
- Some advanced DOM APIs may not be available (not needed for this package)
- Consistent with modern Vitest best practices

**Alternatives Considered**:

- **JSDOM**: Rejected - slower performance with no benefit for our use case
- **No DOM environment**: Rejected - need DOM for React component testing

#### AD-2A.3.S7.2: Separate Integration Test Directory

**Scope**: Story-specific (observability package test organization)

**Decision**: Create `__tests__/integration/` subdirectory for integration tests, separate from unit tests.

**Rationale**:

- Clear distinction between unit tests (isolated utilities) and integration tests (multiple utilities)
- Easier to run only fast unit tests during development vs full suite in CI
- Matches common testing conventions in JavaScript ecosystem
- Integration tests may require more setup/teardown or run slower

**Consequences**:

- Slightly more complex directory structure
- Can run unit tests faster with `vitest --exclude integration`
- Integration tests clearly identified for different CI stages

**Alternatives Considered**:

- **Single test directory**: Rejected - harder to distinguish unit vs integration tests
- **Suffix convention (*.integration.test.ts)**: Rejected - less clear than directory separation

## Out of Scope

The following items are explicitly NOT part of this story:

- **E2E Tests for Observability** - E2E tests handled in Epic 1A.3 (Steel Thread Testing); observability package focuses on unit/integration tests
- **Performance Benchmarking** - Performance testing of logger/health checks not required for MVP
- **Visual Regression Testing** - Error Boundary UI tested functionally; visual regression deferred to Storybook integration
- **Load Testing Health Checks** - Testing health check performance under load deferred to production readiness (Phase 4A)
- **Sentry Dashboard Screenshots** - Documentation focuses on code usage; Sentry UI guide deferred
- **Test Fixtures for All Error Types** - Tests cover common error scenarios; exhaustive error taxonomy not required
- **Automated Documentation Generation** - README.md written manually; tools like TypeDoc deferred

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Structured Logger** - Requires logger implementation to test
- **S3: Sentry Integration** - Requires Sentry functions to test
- **S4: Error Boundary Component** - Requires Error Boundary implementation to test
- **S5: Web Vitals Tracking** - Requires Web Vitals utilities to test
- **S6: Health Check Utilities** - Requires health check functions to test

### Enables (Unblocks These Stories)

- None - Final story in Epic 2A.3

## References

**Internal**:

- [EPIC.md: Overview](./EPIC.md#overview), [Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)
- [TAD: Observability Test Coverage Requirements](/docs/2-technical/2-tad-observability.md#test-coverage-requirements)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- [Story S2: Structured Logger](./S2-structured-logger.md)
- [Story S3: Sentry Integration](./S3-sentry-integration.md)
- [Story S4: Error Boundary Component](./S4-error-boundary.md)
- [Story S5: Web Vitals Tracking](./S5-web-vitals.md)
- [Story S6: Health Check Utilities](./S6-health-checks.md)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

**External**:

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage.html)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [happy-dom GitHub](https://github.com/capricorn86/happy-dom)
- [Testing React Error Boundaries](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)

## Verification Checklist

- [ ] **Pre-Verification**: All dependent stories (S2-S6) complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md); Vitest and testing dependencies installed
- [ ] **Implementation**: All acceptance criteria met; test coverage >80%; all test files follow Vitest conventions; [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] **Quality**: No lint errors; all tests pass; types compile with strict mode; coverage report shows >80% for all utilities
- [ ] **Documentation**: README.md includes installation, usage examples, API reference, and troubleshooting; code examples verified as accurate
- [ ] **Git**: Conventional commit (e.g., `test(observability): add comprehensive tests and documentation`); PR references Epic 2A.3.S7

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
