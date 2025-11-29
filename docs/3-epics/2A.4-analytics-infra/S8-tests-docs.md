# Story 2A.4.S8: Write Tests and Documentation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S3: Event Validation](./S3-event-validation.md), [S4: Consent Management](./S4-consent-management.md), [S5: Provider Integration](./S5-provider-integration.md), [S6: Component Tracking](./S6-component-tracking.md), [S7: Feature Flags](./S7-feature-flags.md)
- **Blocks**: None (final story)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** comprehensive tests and documentation for the analytics package
**So that** I can confidently use analytics utilities, understand their behavior, and ensure the package remains stable across changes

## Acceptance Criteria

- [ ] Unit test coverage >80% for all analytics utilities (trackEvent, consent, feature flags, validation)
- [ ] Integration tests verify provider interactions (PostHog, GA4, Vercel Analytics) work correctly
- [ ] Edge runtime tests confirm analytics work in Vercel Edge Functions and middleware
- [ ] React hook tests verify client-side analytics integration (useComponentTracking, useFeatureFlag)
- [ ] README.md provides clear usage examples for all exported functions
- [ ] JSDoc comments document all public APIs with parameter descriptions and return types
- [ ] Example code demonstrates common patterns (tracking events, checking consent, evaluating flags)
- [ ] Migration guide explains how to integrate analytics into Next.js apps
- [ ] All tests pass with no flaky tests or intermittent failures
- [ ] Documentation reviewed for accuracy against implemented code

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/analytics/__tests__/track-event.test.ts` | Unit tests for event tracking |
| `packages/analytics/__tests__/consent.test.ts` | Unit tests for consent management |
| `packages/analytics/__tests__/validation.test.ts` | Unit tests for event validation |
| `packages/analytics/__tests__/providers.test.ts` | Unit tests for provider implementations |
| `packages/analytics/__tests__/component-tracking.test.ts` | React hook and component tracking tests |
| `packages/analytics/__tests__/feature-flags.test.ts` | Feature flag evaluation tests |
| `packages/analytics/__tests__/integration/analytics.test.ts` | Integration tests for full analytics workflow |
| `packages/analytics/__tests__/integration/edge-runtime.test.ts` | Edge runtime compatibility tests |
| `packages/analytics/USAGE.md` | Detailed usage guide with examples |
| `packages/analytics/MIGRATION.md` | Integration guide for Next.js apps |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/analytics/README.md` | Add comprehensive documentation with API reference, quick start, examples |
| `packages/analytics/src/*.ts` | Add JSDoc comments to all exported functions and types |
| `packages/analytics/package.json` | Add test scripts: `test`, `test:watch`, `test:coverage`, `test:edge` |
| `packages/analytics/vitest.config.ts` | Configure Vitest for unit and integration tests |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Testing dependencies (if not already installed in S1)
pnpm add -D vitest@^2.1.0 @vitest/coverage-v8@^2.1.0 @vitest/ui@^2.1.0
pnpm add -D @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.1.0
pnpm add -D @testing-library/user-event@^14.5.0 happy-dom@^14.0.0
pnpm add -D msw@^2.0.0

# Edge runtime testing
pnpm add -D @edge-runtime/vm
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Test coverage threshold | Minimum 80% for statements, branches, functions, lines | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |
| Test isolation | Each test file should run independently; no shared state | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |
| Mocking strategy | Mock external providers (PostHog, GA4) using MSW for network requests | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) |
| Edge runtime validation | Tests must verify edge compatibility (no Node.js APIs like fs, crypto.randomBytes) | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |
| React testing | Use Testing Library for component/hook tests; avoid implementation details | [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing) |
| Documentation standards | JSDoc for all exported functions; README with quick start and API reference | [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation) |

**Configuration Rationale**: High test coverage (>80%) ensures analytics infrastructure remains stable as the platform evolves. Integration tests verify multi-provider routing works correctly, preventing silent failures where events are lost. Edge runtime tests confirm analytics work in middleware and Edge Functions, which have restricted APIs. Comprehensive documentation reduces developer onboarding friction and prevents misuse of privacy-sensitive analytics features.

For complete configuration templates, see: [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)

## Test Requirements

### Manual Verification

- [ ] **Documentation Accuracy**: Read USAGE.md and verify all code examples are copy-pasteable and work correctly
- [ ] **Migration Guide Test**: Follow MIGRATION.md to integrate analytics into a new Next.js app; verify instructions are complete
- [ ] **API Reference Completeness**: Check README.md API reference and verify all exported functions are documented
- [ ] **JSDoc Rendering**: Verify JSDoc comments render correctly in IDE hover tooltips (VS Code)

### Automated Tests

- [ ] Unit: `track-event.test.ts` - Verify event tracking queues events before consent, dispatches after consent
- [ ] Unit: `track-event.test.ts` - Verify multi-provider routing sends events to all configured providers
- [ ] Unit: `consent.test.ts` - Verify consent state persists across page reloads (localStorage)
- [ ] Unit: `consent.test.ts` - Verify opt-out discards queued events; opt-in flushes queued events
- [ ] Unit: `validation.test.ts` - Verify event validation rejects invalid event schemas
- [ ] Unit: `validation.test.ts` - Verify custom Zod schemas can extend base event schema
- [ ] Unit: `providers.test.ts` - Verify PostHog provider sends events with correct format
- [ ] Unit: `providers.test.ts` - Verify GA4 provider sends events with correct Measurement Protocol format
- [ ] Unit: `providers.test.ts` - Verify provider errors are logged but don't throw exceptions
- [ ] Unit: `component-tracking.test.ts` - Verify useComponentTracking hook tracks impressions and interactions
- [ ] Unit: `component-tracking.test.ts` - Verify data-component-id attributes are captured in events
- [ ] Unit: `feature-flags.test.ts` - Verify useFeatureFlag hook returns correct flag values
- [ ] Unit: `feature-flags.test.ts` - Verify getFeatureFlag returns default value when flag not found
- [ ] Unit: `feature-flags.test.ts` - Verify flag evaluation works with different value types (boolean, string, number, JSON)

### Integration Tests

- [ ] Integration: Verify trackEvent with PostHog provider sends events to PostHog API (mocked with MSW)
- [ ] Integration: Verify consent management blocks events until consent granted, then flushes queue
- [ ] Integration: Verify multi-provider routing dispatches single event to PostHog, GA4, and Vercel Analytics
- [ ] Integration: Verify component tracking hook integrates with trackEvent for automatic event dispatch
- [ ] Integration: Verify feature flags integrate with PostHog SDK for real-time flag updates
- [ ] Integration: Verify edge runtime compatibility (no Node.js-specific APIs used in analytics code)
- [ ] Integration: Verify analytics work correctly in React Server Components (server-side context)

### Verification Commands

```bash
# Install dependencies and build package
pnpm install
pnpm --filter @repo/analytics build

# Run all unit tests
pnpm --filter @repo/analytics test

# Run tests with coverage report
pnpm --filter @repo/analytics test:coverage

# Run tests in watch mode during development
pnpm --filter @repo/analytics test:watch

# Run integration tests only
pnpm --filter @repo/analytics test integration/

# Run edge runtime tests
pnpm --filter @repo/analytics test:edge

# Type checking
pnpm --filter @repo/analytics type-check

# Lint documentation
pnpm --filter @repo/analytics lint

# Verify all tests pass and coverage >80%
pnpm --filter @repo/analytics test:coverage && \
  echo "✓ All tests passed with >80% coverage"
```

## Implementation Notes

### Implementation Sequence

1. **Configure Vitest for Analytics Package**
   - Create `vitest.config.ts` extending base config from `@repo/config`
   - Configure coverage thresholds (80% for all metrics)
   - Set up test environment (happy-dom for React testing)
   - Configure path aliases to match TypeScript config
   - Add edge runtime test environment configuration

2. **Write Unit Tests for Core Event Tracking (S2)**
   - Test event queueing before consent obtained
   - Test event dispatch after consent granted
   - Test multi-provider routing to all configured providers
   - Test event batching and throttling
   - Test error handling (provider failures don't break tracking)
   - Mock provider implementations using Vitest mocks

3. **Write Unit Tests for Event Validation (S3)**
   - Test base event schema validation (name, properties, timestamp)
   - Test custom schema extension with Zod
   - Test validation error messages are clear and actionable
   - Test invalid events are rejected with proper error types
   - Test edge cases (null values, missing properties, type mismatches)

4. **Write Unit Tests for Consent Management (S4)**
   - Test consent state persistence in localStorage
   - Test opt-in flow: queue flushed, tracking enabled
   - Test opt-out flow: queue discarded, tracking disabled
   - Test consent revocation: future events blocked
   - Test consent state checked before every event dispatch
   - Test cross-session consent state (reload page, consent persists)

5. **Write Unit Tests for Provider Implementations (S5)**
   - Mock PostHog SDK and verify events sent with correct format
   - Mock GA4 Measurement Protocol API and verify request format
   - Mock Vercel Analytics and verify event format
   - Test provider initialization with configuration
   - Test provider error handling (network failures, API errors)
   - Test provider retry logic for transient failures

6. **Write Unit Tests for Component Tracking (S6)**
   - Test `useComponentTracking()` hook tracks impressions on mount
   - Test hook tracks interactions (click, view) correctly
   - Test `data-component-id` attribute capture in events
   - Test hook integrates with `trackEvent` function
   - Test hook cleanup on unmount (no memory leaks)
   - Use React Testing Library for hook testing

7. **Write Unit Tests for Feature Flags (S7)**
   - Test `useFeatureFlag()` hook returns correct flag values
   - Test `getFeatureFlag()` returns default when flag not found
   - Test flag evaluation with different types (boolean, string, number, JSON)
   - Test flag provider abstraction (PostHog, Edge Config, in-memory)
   - Test client hook updates when PostHog flag changes
   - Test server function works in edge runtime

8. **Write Integration Tests**
   - Create integration test suite that tests full analytics workflow
   - Test: trackEvent → consent check → validation → provider dispatch
   - Test: PostHog provider integration with real SDK (mocked network)
   - Test: Multi-provider routing sends events to all providers
   - Test: Component tracking integrates with event tracking
   - Test: Feature flags integrate with PostHog SDK
   - Use MSW to mock network requests to external providers

9. **Write Edge Runtime Tests**
   - Create edge runtime test environment using `@edge-runtime/vm`
   - Test analytics utilities run without errors in edge runtime
   - Verify no Node.js-specific APIs used (fs, crypto.randomBytes, etc.)
   - Test feature flags work in edge middleware context
   - Test event tracking works in Edge Functions

10. **Add JSDoc Comments to All Public APIs**
    - Document all exported functions with JSDoc
    - Include parameter descriptions with types
    - Include return type descriptions
    - Add usage examples in JSDoc @example blocks
    - Document error conditions in @throws tags
    - Add @see tags linking to related functions

11. **Write README.md with Quick Start and API Reference**
    - Add quick start guide: install, configure, track first event
    - Document all exported functions with signatures
    - Provide code examples for common use cases
    - Document environment variables needed (PostHog key, GA4 ID)
    - Add troubleshooting section for common issues
    - Link to USAGE.md for detailed documentation

12. **Write USAGE.md with Detailed Examples**
    - Document event tracking patterns (page views, user actions)
    - Explain consent management integration (cookie banners)
    - Show component tracking usage with React hooks
    - Demonstrate feature flag usage (client and server)
    - Provide multi-provider routing configuration examples
    - Include privacy compliance guidance (GDPR, CCPA)

13. **Write MIGRATION.md for Next.js Integration**
    - Step-by-step guide to integrate analytics into Next.js app
    - Configure environment variables for providers
    - Set up consent management (cookie banner integration)
    - Initialize analytics in app layout (client and server)
    - Add page view tracking to route changes
    - Configure component tracking for interactive elements
    - Set up feature flags for server and client contexts

14. **Verify Test Coverage and Documentation Quality**
    - Run coverage report and verify >80% for all metrics
    - Manually review documentation for accuracy
    - Test all code examples in docs are copy-pasteable
    - Follow migration guide to verify completeness
    - Fix any gaps in test coverage or documentation

### Key Concepts

- **Test Coverage**: Percentage of code executed by tests; >80% threshold ensures analytics infrastructure is well-tested
- **Integration Testing**: Tests that verify multiple components work together correctly (e.g., consent + validation + providers)
- **Edge Runtime Testing**: Tests that verify code works in Vercel Edge runtime, which has restricted APIs compared to Node.js
- **Mock Service Worker (MSW)**: Library for mocking network requests in tests, used to simulate provider API responses
- **JSDoc**: Documentation format embedded in code comments, renders in IDE tooltips and can generate API reference docs
- **Test Isolation**: Each test runs independently without shared state, preventing flaky tests and race conditions

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)
- [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing)
- [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation)

Key pattern notes for this story:

- Use Vitest for unit tests with happy-dom for React component/hook testing
- Use MSW (Mock Service Worker) to mock network requests to analytics providers
- Use React Testing Library for testing hooks and components (avoid implementation details)
- Use `describe` blocks to group related tests; use clear test descriptions (`it('should track event after consent granted')`)
- Mock external dependencies (PostHog SDK, GA4 API) to isolate unit tests
- Use integration tests to verify multi-component workflows (consent → validation → tracking)
- Test edge cases and error conditions, not just happy paths
- Write JSDoc comments with `@param`, `@returns`, `@throws`, `@example` tags

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Tests fail with "localStorage is not defined" | happy-dom environment not configured | Add `environment: 'happy-dom'` to vitest.config.ts |
| Coverage report shows <80% | Missing tests for edge cases or error handling | Review uncovered lines in coverage report; add tests for missing branches |
| Edge runtime tests fail with "fs is not defined" | Analytics code uses Node.js-specific API | Remove Node.js APIs; use Web APIs only (fetch, localStorage, etc.) |
| React hook tests fail with "not wrapped in act()" | State updates not wrapped in React Testing Library utilities | Use `renderHook`, `waitFor` from @testing-library/react |
| Integration tests fail intermittently (flaky) | Tests have race conditions or shared state | Ensure test isolation; use `beforeEach` to reset state; avoid shared mocks |
| Documentation examples don't work when copy-pasted | Examples are outdated or incorrect | Manually test all examples in docs; update based on actual implementation |

### Reference Materials

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Mock Service Worker (MSW)](https://mswjs.io/)
- [JSDoc Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Configure Vitest and test scripts: 0.5h
- Unit tests for core tracking, validation, consent (S2-S4): 2h
- Unit tests for providers, component tracking, feature flags (S5-S7): 2h
- Integration and edge runtime tests: 1.5h
- JSDoc comments for all public APIs: 1h
- README.md, USAGE.md, MIGRATION.md documentation: 2h
- Documentation review and verification: 1h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) - Vitest for unit tests, Playwright for E2E
- [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing) - Testing best practices and patterns
- [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation) - JSDoc and README standards

### Story-Specific Decisions

#### AD-2A.4.S8.1: 80% Test Coverage Threshold

**Scope**: Story-specific (does not affect other stories)

**Decision**: Require minimum 80% test coverage for statements, branches, functions, and lines in the analytics package

**Rationale**:
- Analytics infrastructure is privacy-sensitive; bugs could leak user data or break tracking
- High coverage ensures consent management works correctly (legal compliance)
- Provider integrations have many edge cases (network failures, API changes)
- 80% is industry standard for critical infrastructure packages
- Automated coverage checks prevent coverage regression over time

**Consequences**:
- More time spent writing tests (included in effort estimate)
- Higher confidence in analytics stability across changes
- Easier to refactor code knowing tests will catch regressions
- Forces developers to think about edge cases and error handling
- May need to add tests for code that's hard to test (requires good test design)

**Alternatives Considered**:
- **60% coverage**: Rejected because analytics is too critical; insufficient for privacy-sensitive code
- **90-100% coverage**: Rejected because diminishing returns; last 10-20% often requires excessive mocking

#### AD-2A.4.S8.2: Separate USAGE.md and MIGRATION.md Files

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create separate USAGE.md (detailed examples) and MIGRATION.md (integration guide) files instead of putting all documentation in README.md

**Rationale**:
- README.md should be concise for quick reference; detailed docs overwhelm new users
- USAGE.md provides in-depth examples for developers already using the package
- MIGRATION.md targets developers integrating analytics into Next.js apps (different audience)
- Separation improves discoverability (developers can find the doc they need)
- Matches monorepo package documentation patterns (concise README + detailed guides)

**Consequences**:
- More files to maintain, but each is focused on specific audience
- Better documentation organization and user experience
- Easier to update migration guide independently from API reference
- Follows monorepo package documentation best practices

**Alternatives Considered**:
- **Single README.md**: Rejected because would be too long (>500 lines); hard to navigate
- **Inline JSDoc only**: Rejected because lacks narrative structure; doesn't explain integration patterns

#### AD-2A.4.S8.3: MSW for Provider Mocking

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use Mock Service Worker (MSW) to mock network requests to analytics providers (PostHog, GA4) in integration tests

**Rationale**:
- MSW intercepts network requests at fetch/XMLHttpRequest level (most realistic mocking)
- Works in both Node.js (tests) and browser (manual testing) environments
- Provides clear separation between unit tests (mocked modules) and integration tests (mocked network)
- Easier to verify request format sent to providers (captures actual fetch calls)
- Prevents tests from hitting real provider APIs (faster, no API keys needed)

**Consequences**:
- Additional dependency (MSW) but standard in React ecosystem
- Integration tests more closely match production behavior
- Can reuse MSW handlers for manual testing in development
- Need to define MSW handlers for each provider API endpoint
- More realistic error simulation (network failures, API errors)

**Alternatives Considered**:
- **Vitest module mocks**: Rejected for integration tests because less realistic (mocks implementation, not network)
- **Real API calls**: Rejected because slow, requires API keys, and tests fail if provider has outage

## Out of Scope

The following items are explicitly NOT part of this story:

- **E2E tests for analytics** - Deferred to Epic 1A.5 (E2E Testing Infrastructure) or application-level testing
- **Performance benchmarks** - Deferred to performance optimization story if needed
- **Storybook documentation for React components** - Analytics package has no UI components; Storybook not applicable
- **Visual regression tests** - No UI components to test visually
- **Load testing** (high-volume event tracking) - Deferred to performance validation if needed
- **Security testing** (penetration testing, vulnerability scanning) - Deferred to security audit story
- **Accessibility testing** - Analytics package has no UI; accessibility not applicable
- **Cross-browser compatibility testing** - Covered by Next.js and provider SDKs; not package responsibility
- **Documentation website** (hosted docs) - README/USAGE/MIGRATION files sufficient for monorepo package

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S3: Event Validation** - Tests require event validation utilities to verify schema validation works
- **S4: Consent Management** - Tests require consent utilities to verify opt-in/opt-out flows work
- **S5: Provider Integration** - Tests require provider implementations to verify multi-provider routing
- **S6: Component Tracking** - Tests require component tracking hooks to verify React integration
- **S7: Feature Flags** - Tests require feature flag utilities to verify flag evaluation works

### Enables (Unblocks These Stories)

- None - This is the final story in the epic; all implementation stories must complete before tests can be written

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [PRD: Feature M.7 - Basic Analytics & Tracking](/docs/1-product/1-prd.md#feature-m7-basic-analytics--tracking)
- [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing)
- [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

**External**:
- [Vitest Documentation](https://vitest.dev/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [Mock Service Worker (MSW)](https://mswjs.io/)
- [MSW with Vitest](https://mswjs.io/docs/integrations/node)
- [JSDoc Reference](https://jsdoc.app/)
- [TypeScript JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)

## Verification Checklist

- [ ] **Pre-Verification**: S3, S4, S5, S6, S7 complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] **Quality**: All tests pass; coverage >80% for statements, branches, functions, lines; no flaky tests
- [ ] **Documentation**: README.md, USAGE.md, MIGRATION.md complete; JSDoc on all exported functions; all examples tested
- [ ] **Git**: Conventional commit (e.g., `test(analytics): add comprehensive test suite and documentation`); PR references Epic 2A.4.S8

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
