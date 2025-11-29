# Story 2A.8.S7: Integration Tests and Documentation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: [S2](./S2-request-interceptors.md), [S3](./S3-response-interceptors.md), [S4](./S4-retry-logic.md), [S5](./S5-request-caching.md), [S6](./S6-file-upload.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None (requires all feature stories to complete)

## User Story

**As a** developer using the @repo/api-client package
**I want** comprehensive integration tests and clear documentation
**So that** I can confidently use the package in production applications and troubleshoot issues effectively

## Acceptance Criteria

- [ ] Integration tests verify all features work together correctly (auth + retry + cache + error handling)
- [ ] End-to-end test validates complete request lifecycle from client instantiation to response handling
- [ ] README.md provides installation instructions, quick start guide, and API overview
- [ ] All public APIs have JSDoc documentation with examples
- [ ] Package exports are documented with TypeScript types visible in IDE IntelliSense
- [ ] Common usage patterns documented with code examples
- [ ] Troubleshooting guide covers typical error scenarios and solutions
- [ ] Test coverage reaches ≥80% across all package modules
- [ ] CI pipeline runs all tests (unit + integration) on every commit
- [ ] Package builds successfully and passes all quality gates (lint, type-check, tests)

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/api-client/README.md` | Package documentation with usage examples |
| `packages/api-client/tests/integration/full-lifecycle.test.ts` | End-to-end integration test for complete request lifecycle |
| `packages/api-client/tests/integration/auth-cache.test.ts` | Integration test for auth + cache interaction |
| `packages/api-client/tests/integration/retry-error.test.ts` | Integration test for retry + error handling |
| `packages/api-client/tests/integration/upload-auth.test.ts` | Integration test for file upload + auth |
| `packages/api-client/docs/TROUBLESHOOTING.md` | Common issues and solutions |
| `packages/api-client/docs/EXAMPLES.md` | Extended usage examples |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/api-client/src/**/*.ts` | Add comprehensive JSDoc comments to all public APIs |
| `packages/api-client/package.json` | Add test scripts for integration tests |
| `packages/api-client/vitest.config.ts` | Configure integration test patterns |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Test dependencies (already installed in S1):**
- `vitest` - Test runner
- `@testing-library/react` - React component testing utilities
- `msw` - Mock Service Worker for API mocking

**No additional dependencies required.**

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Test coverage threshold | ≥80% coverage required for statements, branches, functions, lines | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| Integration test pattern | Files matching `*.integration.test.ts` run separately from unit tests | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) |
| JSDoc coverage | All exported functions, classes, and types require JSDoc | [TAD: Documentation](/docs/2-technical/2-tad-documentation.md) |

**Configuration Rationale**:
- 80% coverage ensures critical functionality is tested while allowing flexibility for edge cases
- Separate integration test pattern enables running fast unit tests in development, full suite in CI
- JSDoc on all exports provides IntelliSense support in consuming applications

For complete testing patterns, see: [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)

## Test Requirements

### Manual Verification

- [ ] **README Walkthrough**: Follow README installation and quick start guide in a fresh Next.js app - verify all steps work
- [ ] **IntelliSense Check**: Import APIClient in VS Code and verify JSDoc appears in autocomplete
- [ ] **Error Handling Demo**: Trigger various error scenarios and verify error messages match troubleshooting guide
- [ ] **Example Code Execution**: Copy/paste examples from EXAMPLES.md and verify they run without modification

### Automated Tests

- [ ] Integration: `full-lifecycle.test.ts` - Complete request flow with auth, retry on failure, success response
- [ ] Integration: `auth-cache.test.ts` - Authenticated GET request cached, second request returns cached response
- [ ] Integration: `retry-error.test.ts` - 500 error triggers retry with backoff, eventually succeeds or fails after max retries
- [ ] Integration: `upload-auth.test.ts` - File upload includes auth token, handles progress callback, returns success
- [ ] Coverage: All packages achieve ≥80% coverage threshold
- [ ] CI: All tests (unit + integration) pass in CI pipeline

### Integration Tests

- [ ] Verify request interceptor chain executes correctly with auth + custom interceptors
- [ ] Verify response interceptor processes errors before cache storage
- [ ] Verify retry logic respects cache (doesn't cache failed responses)
- [ ] Verify file upload works with all interceptors (auth, error handling)
- [ ] Verify cache invalidation clears entries and forces fresh requests
- [ ] Verify concurrent identical requests deduplicate correctly
- [ ] Verify client works in both server component and client component contexts

### Verification Commands

```bash
# Run all unit tests
pnpm --filter @repo/api-client test

# Run integration tests specifically
pnpm --filter @repo/api-client test:integration

# Run tests with coverage report
pnpm --filter @repo/api-client test:coverage

# Type check
pnpm --filter @repo/api-client type-check

# Lint
pnpm --filter @repo/api-client lint

# Build package
pnpm --filter @repo/api-client build

# Run all quality gates
pnpm --filter @repo/api-client ci
```

## Implementation Notes

### Implementation Sequence

1. **Add JSDoc to All Public APIs**
   - Document all exported functions, classes, interfaces, and types
   - Include `@param`, `@returns`, `@throws`, and `@example` tags
   - Add usage examples for complex APIs (client instantiation, interceptors, cache config)

2. **Create Integration Tests**
   - Set up Mock Service Worker to simulate API responses
   - Write `full-lifecycle.test.ts` covering complete request flow
   - Write feature interaction tests (auth+cache, retry+error, upload+auth)
   - Verify all features work together without conflicts

3. **Write README.md**
   - Installation section with pnpm command
   - Quick start with minimal example (create client, make request)
   - API overview listing main classes and methods
   - Configuration options table with defaults
   - Link to detailed examples and troubleshooting

4. **Create Extended Documentation**
   - EXAMPLES.md with realistic use cases (authenticated requests, file upload, error handling, cache management)
   - TROUBLESHOOTING.md with common errors and solutions
   - Include code snippets that can be copy-pasted

5. **Configure Test Scripts**
   - Add `test:integration` script to run integration tests
   - Add `test:coverage` script with coverage thresholds
   - Update `ci` script to run all quality gates

6. **Verify Coverage and Quality Gates**
   - Run coverage report and identify uncovered code
   - Add tests to reach 80% threshold
   - Verify CI pipeline passes all checks

### Key Concepts

- **Integration Tests**: Tests that verify multiple components work together correctly, unlike unit tests which test components in isolation
- **JSDoc**: Documentation comments following the JSDoc standard, providing IDE IntelliSense and API documentation
- **Quality Gates**: Automated checks (tests, linting, type-checking) that must pass before code can be merged
- **Mock Service Worker (MSW)**: Tool for intercepting network requests in tests and returning mock responses

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - Integration test patterns and structure
- [TAD: Documentation](/docs/2-technical/2-tad-documentation.md) - JSDoc standards and README templates

Key pattern notes for this story:

- Use MSW to mock API responses in integration tests for consistent, repeatable tests
- Structure integration tests with clear Arrange-Act-Assert sections
- Write JSDoc with `@example` tags showing real-world usage, not trivial examples
- Include both success and error examples in documentation

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Integration tests flaky | Race conditions in concurrent tests | Use `beforeEach` to reset client state, ensure tests are isolated |
| Coverage below 80% | Edge cases not tested | Identify uncovered lines with coverage report, add targeted tests |
| JSDoc not appearing in IDE | Type declarations not exported | Verify exports in `src/index.ts` and `package.json` exports field |
| Examples fail to run | Outdated code in docs | Run examples as part of CI to ensure they stay current |
| MSW not intercepting requests | MSW server not started in test setup | Initialize MSW server in `vitest.setup.ts` |

### Reference Materials

- [JSDoc Reference](https://jsdoc.app/)
- [Vitest Integration Testing](https://vitest.dev/guide/)
- [Mock Service Worker Docs](https://mswjs.io/docs/)
- [TypeScript Module Documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

## Estimated Effort

**Size**: M (7h)

**Breakdown**:

- JSDoc documentation for all public APIs: 2h
- Integration tests (4 test files): 2.5h
- README.md and extended docs: 1.5h
- Coverage improvements and quality gates: 1h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - Testing strategy and coverage requirements
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md) - Documentation standards and JSDoc requirements
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Package structure and exports

### Story-Specific Decisions

#### AD-2A.8.S7.1: Integration Tests Use MSW Instead of Real API

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use Mock Service Worker (MSW) to intercept and mock API responses in integration tests rather than hitting a real test API.

**Rationale**:

- **Speed**: MSW responses are instant, no network latency
- **Reliability**: No dependency on external services or network stability
- **Consistency**: Same mock responses every test run, no flakiness
- **Isolation**: Tests can run offline and in parallel without conflicts
- **Control**: Can simulate edge cases (timeouts, rate limits, malformed responses) that are hard to trigger with real APIs

**Consequences**:

- Integration tests run fast and reliably in CI
- Tests don't verify actual API contract (use E2E tests for that)
- Must keep MSW mocks in sync with real API behavior
- Developers can run tests offline without API credentials

**Alternatives Considered**:

- **Real test API**: Hit actual backend endpoints - Rejected because it's slow, requires network, and introduces flakiness
- **Manual mocking**: Use `vi.fn()` for fetch - Rejected because MSW provides more realistic request/response handling
- **No integration tests**: Only unit tests - Rejected because integration tests catch bugs unit tests miss (feature interactions)

#### AD-2A.8.S7.2: Separate Integration Test Script

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create separate `test:integration` npm script that runs only integration tests, distinct from `test` which runs unit tests.

**Rationale**:

- **Development Speed**: Developers can run fast unit tests during development (`pnpm test`)
- **CI Flexibility**: CI can run unit and integration tests in separate jobs for parallelism
- **Debugging**: Easier to debug specific test types when they're separated
- **Clarity**: Clear distinction between fast unit tests and slower integration tests

**Consequences**:

- Developers must remember to run both test commands before committing
- CI must run both test suites (can be parallel)
- Test file naming convention must differentiate unit vs integration (`*.test.ts` vs `*.integration.test.ts`)

**Alternatives Considered**:

- **Single test command**: Run all tests together - Rejected because it's slower for development workflow
- **Automatic detection**: Vitest runs all tests, no separation - Rejected because developers want fast feedback loop

## Out of Scope

The following items are explicitly NOT part of this story:

- **API Reference Website** - Auto-generated documentation site (e.g., TypeDoc); deferred to Epic 7 (Documentation Delivery)
- **Interactive Examples/Playground** - CodeSandbox or StackBlitz demos; deferred to future enhancement
- **Video Tutorials** - Screencasts showing package usage; deferred to post-MVP
- **Migration Guides** - Guides for migrating from other HTTP clients (axios, ky); not needed for greenfield project
- **Performance Benchmarks** - Comparative performance tests vs other clients; deferred to optimization phase
- **Visual API Diagrams** - Architecture diagrams in documentation; deferred to Epic 7
- **Changelog Generation** - Automated changelog from commit history; deferred to release automation

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Request Interceptors and Auth Integration** - Integration tests require auth functionality to test authenticated requests
- **S3: Response Interceptors and Error Handling** - Integration tests verify error handling across complete request flow
- **S4: Retry Logic with Exponential Backoff** - Integration tests verify retry behavior with various failure scenarios
- **S5: Request Caching Utilities** - Integration tests verify cache behavior and invalidation
- **S6: File Upload Support** - Integration tests verify file upload with auth and error handling

### Enables (Unblocks These Epics)

- **Epic 3A.1: CDN & Asset Management Application** - Complete API client package ready for use
- **Epic 3A.2: Routing Application Shell** - Complete API client package ready for integration
- **Epic 3B.1: API Application** - API client available for frontend consumption of product endpoints

## References

### Epic & TAD References

- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [TAD: Package Architecture - API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Mock Service Worker](https://mswjs.io/)
- [JSDoc Guide](https://jsdoc.app/about-getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (S2, S3, S4, S5, S6)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All unit tests from previous stories passing

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] All tests passing (`pnpm test` and `pnpm test:integration`)
- [ ] Coverage ≥80% for all modules (`pnpm test:coverage`)

### Documentation

- [ ] README.md complete with installation, quick start, and API overview
- [ ] All public APIs have JSDoc with `@param`, `@returns`, and `@example` tags
- [ ] TROUBLESHOOTING.md covers common error scenarios
- [ ] EXAMPLES.md includes realistic usage patterns
- [ ] Code examples in docs are tested and working

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(api-client): add integration tests and documentation")
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.8 and all completed stories

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
