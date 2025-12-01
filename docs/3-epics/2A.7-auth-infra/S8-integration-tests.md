# Story 2A.7.S8: Integration Tests and Documentation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Epic 2A.7: Auth Infrastructure](./EPIC.md)
- **Depends On**: [S6: User Database Sync](./S6-user-sync.md), [S7: Auth Error Boundary and Token Refresh](./S7-error-boundary.md)
- **Blocks**: None (final story)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** comprehensive tests and documentation for the auth package
**So that** I can confidently integrate authentication, understand auth flows, and ensure the package remains stable across changes

## Acceptance Criteria

- [ ] Unit test coverage >80% for all auth utilities (hooks, webhook handlers, error boundaries, protected routes)
- [ ] Integration tests verify complete auth flows (sign-in, session management, webhook sync, error handling)
- [ ] Edge runtime tests confirm auth middleware works in Vercel Edge Functions
- [ ] React component tests verify ClerkProvider, AuthErrorBoundary, and protected routes work correctly
- [ ] README.md provides clear usage examples for all exported components and utilities
- [ ] JSDoc comments document all public APIs with parameter descriptions and return types
- [ ] Example code demonstrates common patterns (protected routes, webhook setup, error handling)
- [ ] Migration guide explains how to integrate auth into Next.js apps
- [ ] All tests pass with no flaky tests or intermittent failures
- [ ] Documentation reviewed for accuracy against implemented code

## Technical Requirements

### Files to Create

| Path                                                              | Purpose                                       |
| ----------------------------------------------------------------- | --------------------------------------------- |
| `packages/auth/__tests__/hooks/use-auth.test.tsx`                 | Unit tests for useAuth hook                   |
| `packages/auth/__tests__/hooks/use-user.test.tsx`                 | Unit tests for useUser hook                   |
| `packages/auth/__tests__/components/clerk-provider.test.tsx`      | Unit tests for ClerkProvider wrapper          |
| `packages/auth/__tests__/components/auth-error-boundary.test.tsx` | Unit tests for auth error boundary            |
| `packages/auth/__tests__/components/protected-route.test.tsx`     | Unit tests for protected route HOC            |
| `packages/auth/__tests__/webhooks/user-events.test.ts`            | Unit tests for webhook user event handlers    |
| `packages/auth/__tests__/webhooks/signature-verification.test.ts` | Unit tests for webhook signature verification |
| `packages/auth/__tests__/integration/auth-flow.test.tsx`          | Integration tests for complete auth flow      |
| `packages/auth/__tests__/integration/webhook-sync.test.ts`        | Integration tests for webhook database sync   |
| `packages/auth/__tests__/integration/edge-runtime.test.ts`        | Edge runtime compatibility tests              |
| `packages/auth/USAGE.md`                                          | Detailed usage guide with examples            |
| `packages/auth/MIGRATION.md`                                      | Integration guide for Next.js apps            |

### Files to Modify

| Path                             | Changes                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| `packages/auth/README.md`        | Add comprehensive documentation with API reference, quick start, examples |
| `packages/auth/src/**/*.ts`      | Add JSDoc comments to all exported functions, hooks, and components       |
| `packages/auth/package.json`     | Add test scripts: `test`, `test:watch`, `test:coverage`, `test:edge`      |
| `packages/auth/vitest.config.ts` | Configure Vitest for unit and integration tests                           |

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

| Setting                 | Requirement                                                                                | TAD Reference                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Test coverage threshold | Minimum 80% for statements, branches, functions, lines                                     | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)                              |
| Test isolation          | Each test file should run independently; no shared state                                   | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)                              |
| Mocking strategy        | Mock Clerk SDK and database connections using Vitest mocks; mock webhook requests with MSW | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)                              |
| Edge runtime validation | Tests must verify edge compatibility (no Node.js APIs like fs, crypto.randomBytes)         | [ADR-006: Clerk Best Practices](/docs/2-technical/adr/006-clerk-authentication.md#best-practices) |
| React testing           | Use Testing Library for component/hook tests; avoid implementation details                 | [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing)             |
| Database testing        | Use real database connection for integration tests; reset database between tests           | [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)                              |
| Documentation standards | JSDoc for all exported functions; README with quick start and API reference                | [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation) |

**Configuration Rationale**: High test coverage (>80%) ensures authentication infrastructure remains secure and stable as the platform evolves. Integration tests verify complete auth flows (sign-in → session → webhook sync) work correctly, preventing authentication failures in production. Edge runtime tests confirm auth middleware works in Vercel Edge environment. Database integration tests ensure webhook sync is reliable and idempotent. Comprehensive documentation reduces developer onboarding friction and prevents security misconfigurations.

For complete configuration templates, see: [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)

## Test Requirements

### Manual Verification

- [ ] **Documentation Accuracy**: Read USAGE.md and verify all code examples are copy-pasteable and work correctly
- [ ] **Migration Guide Test**: Follow MIGRATION.md to integrate auth into a new Next.js app; verify instructions are complete
- [ ] **API Reference Completeness**: Check README.md API reference and verify all exported components/hooks are documented
- [ ] **JSDoc Rendering**: Verify JSDoc comments render correctly in IDE hover tooltips (VS Code)

### Automated Tests

- [ ] Unit: `use-auth.test.tsx` - Verify useAuth hook returns auth state (userId, isLoaded, isSignedIn)
- [ ] Unit: `use-auth.test.tsx` - Verify hook throws error when used outside ClerkProvider
- [ ] Unit: `use-user.test.tsx` - Verify useUser hook returns user data when authenticated
- [ ] Unit: `use-user.test.tsx` - Verify hook returns null when not authenticated
- [ ] Unit: `clerk-provider.test.tsx` - Verify ClerkProvider initializes Clerk SDK with correct config
- [ ] Unit: `clerk-provider.test.tsx` - Verify provider makes auth context available to children
- [ ] Unit: `auth-error-boundary.test.tsx` - Verify boundary catches auth errors and displays fallback UI
- [ ] Unit: `auth-error-boundary.test.tsx` - Verify boundary ignores non-auth errors (passes to parent)
- [ ] Unit: `auth-error-boundary.test.tsx` - Verify boundary resets when user re-authenticates
- [ ] Unit: `protected-route.test.tsx` - Verify HOC redirects unauthenticated users to sign-in
- [ ] Unit: `protected-route.test.tsx` - Verify HOC renders component for authenticated users
- [ ] Unit: `user-events.test.ts` - Verify handleUserCreated creates user with all fields
- [ ] Unit: `user-events.test.ts` - Verify handleUserUpdated updates existing user
- [ ] Unit: `user-events.test.ts` - Verify handlers are idempotent (safe to replay)
- [ ] Unit: `signature-verification.test.ts` - Verify webhook signature verification accepts valid signatures
- [ ] Unit: `signature-verification.test.ts` - Verify webhook signature verification rejects invalid signatures

### Integration Tests

- [ ] Integration: Complete auth flow - sign in → useAuth returns user → protected route grants access
- [ ] Integration: ClerkProvider + useAuth hook integration works correctly
- [ ] Integration: Protected route HOC redirects to sign-in for unauthenticated requests
- [ ] Integration: Webhook handler receives user.created event → verifies signature → syncs to database
- [ ] Integration: Webhook handler receives user.updated event → updates database record idempotently
- [ ] Integration: Webhook handler receives user.deleted event → soft deletes user (sets deletedAt)
- [ ] Integration: Auth error boundary catches useAuth errors and displays fallback UI
- [ ] Integration: Edge runtime compatibility - auth utilities run without errors in edge environment
- [ ] Integration: Database sync - webhook creates/updates/deletes users correctly with transactions
- [ ] Integration: Concurrent webhook events don't create race conditions or duplicate users

### Verification Commands

```bash
# Install dependencies and build package
pnpm install
pnpm --filter @repo/auth build

# Run all unit tests
pnpm --filter @repo/auth test

# Run tests with coverage report
pnpm --filter @repo/auth test:coverage

# Run tests in watch mode during development
pnpm --filter @repo/auth test:watch

# Run integration tests only
pnpm --filter @repo/auth test integration/

# Run edge runtime tests
pnpm --filter @repo/auth test:edge

# Type checking
pnpm --filter @repo/auth typecheck

# Lint code
pnpm --filter @repo/auth lint

# Verify all tests pass and coverage >80%
pnpm --filter @repo/auth test:coverage && \
  echo "✓ All tests passed with >80% coverage"
```

## Implementation Notes

### Implementation Sequence

1. **Configure Vitest for Auth Package**
   - Create `vitest.config.ts` extending base config from `@repo/config`
   - Configure coverage thresholds (80% for all metrics)
   - Set up test environment (happy-dom for React testing)
   - Configure path aliases to match TypeScript config
   - Add edge runtime test environment configuration

2. **Write Unit Tests for Auth Hooks (S3)**
   - Test `useAuth()` hook returns correct auth state
   - Test hook throws error when used outside ClerkProvider
   - Test `useUser()` hook returns user data when authenticated
   - Test hook returns null when not authenticated
   - Mock Clerk SDK using Vitest mocks

3. **Write Unit Tests for ClerkProvider (S2)**
   - Test provider initializes Clerk SDK with environment variables
   - Test provider makes auth context available to children
   - Test provider handles missing environment variables gracefully
   - Use React Testing Library to render provider

4. **Write Unit Tests for Protected Route HOC (S4)**
   - Test HOC redirects unauthenticated users to sign-in page
   - Test HOC renders component for authenticated users
   - Test HOC preserves return URL for post-login redirect
   - Mock useAuth hook for different auth states

5. **Write Unit Tests for Auth Error Boundary (S7)**
   - Test boundary catches auth errors and displays fallback UI
   - Test boundary ignores non-auth errors (passes to parent boundary)
   - Test boundary resets when user re-authenticates
   - Test error logging integration
   - Simulate auth errors in test environment

6. **Write Unit Tests for Webhook Handlers (S5, S6)**
   - Test webhook signature verification accepts valid signatures
   - Test webhook signature verification rejects invalid/expired signatures
   - Test handleUserCreated creates user with all fields
   - Test handleUserUpdated updates existing user idempotently
   - Test handleUserDeleted soft deletes user (sets deletedAt)
   - Mock database queries using Vitest mocks

7. **Write Integration Tests for Complete Auth Flow**
   - Create integration test suite that tests full auth workflow
   - Test: Sign in → ClerkProvider → useAuth returns user data
   - Test: Protected route grants access to authenticated users
   - Test: Protected route redirects unauthenticated users
   - Test: Auth error boundary catches and handles auth errors
   - Use real Clerk SDK with mocked network requests (MSW)

8. **Write Integration Tests for Webhook Database Sync**
   - Set up test database connection (reset between tests)
   - Test: user.created webhook → signature verification → database insert
   - Test: user.updated webhook → database update (idempotent)
   - Test: user.deleted webhook → soft delete (deletedAt set)
   - Test: Invalid signature → webhook rejected with 401
   - Test: Concurrent webhooks don't create duplicate users
   - Use real database connection for integration tests
   - Use MSW to mock Clerk webhook requests

9. **Write Edge Runtime Tests**
   - Create edge runtime test environment using `@edge-runtime/vm`
   - Test auth utilities run without errors in edge runtime
   - Verify no Node.js-specific APIs used (fs, crypto.randomBytes, etc.)
   - Test auth middleware works in edge context
   - Test server-side auth helpers work in Edge Functions

10. **Add JSDoc Comments to All Public APIs**
    - Document all exported hooks with JSDoc
    - Document ClerkProvider wrapper component
    - Document protected route HOC with usage examples
    - Document webhook handler functions
    - Include parameter descriptions with types
    - Include return type descriptions
    - Add usage examples in JSDoc @example blocks
    - Document error conditions in @throws tags

11. **Write README.md with Quick Start and API Reference**
    - Add quick start guide: install, configure, set up ClerkProvider
    - Document all exported hooks (useAuth, useUser, useClerk)
    - Document ClerkProvider configuration
    - Document protected route HOC usage
    - Document webhook handler setup
    - Provide code examples for common use cases
    - Document environment variables needed (Clerk publishable key, secret key)
    - Add troubleshooting section for common issues
    - Link to USAGE.md for detailed documentation

12. **Write USAGE.md with Detailed Examples**
    - Document authentication patterns (sign-in, sign-out, session management)
    - Explain protected route usage (HOC and middleware patterns)
    - Show webhook handler setup and signature verification
    - Demonstrate user database sync patterns
    - Explain error boundary usage and customization
    - Provide multi-tenant patterns (organization-aware auth)
    - Include security best practices (session management, token handling)

13. **Write MIGRATION.md for Next.js Integration**
    - Step-by-step guide to integrate auth into Next.js app
    - Configure environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc.)
    - Set up ClerkProvider in app layout
    - Add middleware for route protection
    - Set up webhook endpoint for user sync
    - Configure Clerk dashboard webhook settings
    - Add protected routes using HOC or middleware
    - Set up error boundary for auth errors
    - Test authentication flow end-to-end

14. **Verify Test Coverage and Documentation Quality**
    - Run coverage report and verify >80% for all metrics
    - Manually review documentation for accuracy
    - Test all code examples in docs are copy-pasteable
    - Follow migration guide to verify completeness
    - Fix any gaps in test coverage or documentation

### Key Concepts

- **Test Coverage**: Percentage of code executed by tests; >80% threshold ensures auth infrastructure is secure and well-tested
- **Integration Testing**: Tests that verify multiple components work together correctly (e.g., sign-in flow → hooks → protected routes)
- **Edge Runtime Testing**: Tests that verify code works in Vercel Edge runtime, which has restricted APIs compared to Node.js
- **Mock Service Worker (MSW)**: Library for mocking network requests in tests, used to simulate Clerk API and webhook responses
- **JSDoc**: Documentation format embedded in code comments, renders in IDE tooltips and can generate API reference docs
- **Test Isolation**: Each test runs independently without shared state, preventing flaky tests and race conditions
- **Database Testing**: Integration tests use real database connection; reset database between tests for isolation
- **Idempotency Testing**: Verify webhook handlers can be called multiple times with same event without errors or duplicates

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)
- [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing)
- [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation)
- [ADR-006: Clerk Authentication - Best Practices](/docs/2-technical/adr/006-clerk-authentication.md#best-practices)

Key pattern notes for this story:

- Use Vitest for unit tests with happy-dom for React component/hook testing
- Use MSW (Mock Service Worker) to mock Clerk API and webhook requests
- Use React Testing Library for testing hooks and components (avoid implementation details)
- Use `describe` blocks to group related tests; use clear test descriptions
- Mock Clerk SDK for unit tests; use real SDK with mocked network for integration tests
- Use real database connection for integration tests; reset between tests with `beforeEach`
- Test idempotency by calling webhook handlers multiple times with same payload
- Test edge cases and error conditions (invalid signatures, expired sessions, etc.)
- Write JSDoc comments with `@param`, `@returns`, `@throws`, `@example` tags

### Troubleshooting

| Issue                                                 | Cause                                                        | Solution                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Tests fail with "Clerk SDK not initialized"           | ClerkProvider not wrapping test component                    | Wrap test components with ClerkProvider or mock useAuth hook              |
| Tests fail with "localStorage is not defined"         | happy-dom environment not configured                         | Add `environment: 'happy-dom'` to vitest.config.ts                        |
| Coverage report shows <80%                            | Missing tests for edge cases or error handling               | Review uncovered lines in coverage report; add tests for missing branches |
| Edge runtime tests fail with "process is not defined" | Auth code uses Node.js-specific API                          | Remove Node.js APIs; use Web APIs only (fetch, crypto.subtle, etc.)       |
| React hook tests fail with "not wrapped in act()"     | State updates not wrapped in React Testing Library utilities | Use `renderHook`, `waitFor` from @testing-library/react                   |
| Integration tests fail intermittently (flaky)         | Tests have race conditions or shared database state          | Ensure test isolation; reset database in `beforeEach`; avoid shared mocks |
| Webhook signature verification fails in tests         | Incorrect test signature generation                          | Use Svix library to generate valid test signatures or mock verification   |
| Database tests fail with connection errors            | Database not running or env vars not set                     | Verify DATABASE_URL is set; start local database with `pnpm db:start`     |

### Reference Materials

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [Mock Service Worker (MSW)](https://mswjs.io/)
- [Clerk Testing Documentation](https://clerk.com/docs/testing/overview)
- [Clerk Webhooks Testing](https://clerk.com/docs/integrations/webhooks/testing)
- [JSDoc Reference](https://jsdoc.app/)
- [TypeScript JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)
- [Svix Webhook Library](https://docs.svix.com/)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Configure Vitest and test scripts: 0.5h
- Unit tests for hooks, provider, protected routes (S2-S4): 1.5h
- Unit tests for error boundary and webhook handlers (S5-S7): 1.5h
- Integration tests (auth flow, webhook sync, edge runtime): 2h
- JSDoc comments for all public APIs: 0.5h
- README.md, USAGE.md, MIGRATION.md documentation: 1.5h
- Documentation review and verification: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](/docs/0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy) - Vitest for unit tests, coverage thresholds, testing best practices
- [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing) - Testing patterns and conventions
- [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation) - JSDoc and README standards
- [ADR-006: Clerk Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Auth implementation patterns and best practices

### Story-Specific Decisions

#### AD-2A.7.S8.1: Real Database for Webhook Integration Tests

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use real database connection for webhook integration tests rather than mocking database queries

**Rationale**:

- Webhook sync is critical for data integrity; mocking hides integration bugs
- Real database tests verify transactions, unique constraints, and race conditions work correctly
- Idempotency testing requires actual database state (can't verify with mocks)
- Tests verify Drizzle ORM queries work correctly with PostgreSQL
- Catches SQL errors and constraint violations that mocks would miss
- Database reset between tests ensures test isolation

**Consequences**:

- Requires test database setup (documented in MIGRATION.md)
- Integration tests slower than unit tests (acceptable tradeoff for reliability)
- Need to reset database between tests (use `beforeEach` hook)
- More realistic testing catches production bugs earlier
- Developers need local database for running integration tests

**Alternatives Considered**:

- **Mock database queries**: Rejected because doesn't test actual SQL/ORM integration; hides data integrity issues
- **In-memory SQLite**: Rejected because PostgreSQL-specific features (unique constraints, transactions) behave differently

#### AD-2A.7.S8.2: Separate USAGE.md and MIGRATION.md Files

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create separate USAGE.md (detailed examples) and MIGRATION.md (integration guide) files instead of putting all documentation in README.md

**Rationale**:

- README.md should be concise for quick reference; detailed docs overwhelm new users
- USAGE.md provides in-depth examples for developers already using the package
- MIGRATION.md targets developers integrating auth into Next.js apps (different audience)
- Separation improves discoverability (developers can find the doc they need)
- Matches monorepo package documentation patterns (concise README + detailed guides)
- Auth integration has multiple steps (environment variables, provider setup, webhooks) that need narrative structure

**Consequences**:

- More files to maintain, but each is focused on specific audience
- Better documentation organization and user experience
- Easier to update migration guide independently from API reference
- Follows monorepo package documentation best practices

**Alternatives Considered**:

- **Single README.md**: Rejected because would be too long (>500 lines); hard to navigate
- **Inline JSDoc only**: Rejected because lacks narrative structure; doesn't explain integration patterns

#### AD-2A.7.S8.3: MSW for Clerk API and Webhook Mocking

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use Mock Service Worker (MSW) to mock Clerk API requests and webhook deliveries in integration tests

**Rationale**:

- MSW intercepts network requests at fetch/XMLHttpRequest level (most realistic mocking)
- Works in both Node.js (tests) and browser (manual testing) environments
- Provides clear separation between unit tests (mocked Clerk SDK) and integration tests (mocked network)
- Easier to verify webhook signature verification logic (captures actual webhook requests)
- Prevents tests from hitting real Clerk API (faster, no API keys needed, no rate limits)
- Allows testing webhook retry scenarios and error responses

**Consequences**:

- Additional dependency (MSW) but standard in React ecosystem
- Integration tests more closely match production behavior
- Can reuse MSW handlers for manual testing in development
- Need to define MSW handlers for Clerk API endpoints and webhook events
- More realistic error simulation (network failures, API errors, invalid signatures)

**Alternatives Considered**:

- **Vitest module mocks**: Rejected for integration tests because less realistic (mocks implementation, not network)
- **Real Clerk API calls**: Rejected because slow, requires API keys, tests fail if Clerk has outage, and can't test error scenarios

## Out of Scope

The following items are explicitly NOT part of this story:

- **E2E tests for auth flows** - Deferred to Epic 1A.5 (E2E Testing Infrastructure) or application-level testing
- **Performance benchmarks** (auth operation latency) - Deferred to performance optimization story if needed
- **Load testing** (concurrent auth requests, webhook processing) - Deferred to performance validation if needed
- **Security testing** (penetration testing, OWASP checks) - Deferred to security audit story
- **Accessibility testing** - Auth package has minimal UI (error boundary); accessibility handled at app level
- **Cross-browser compatibility testing** - Covered by Clerk SDK; not package responsibility
- **Documentation website** (hosted docs) - README/USAGE/MIGRATION files sufficient for monorepo package
- **Storybook documentation** - Auth package has no visual UI components; Storybook not applicable
- **Visual regression tests** - No UI components to test visually
- **Multi-organization auth testing** - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Role-based access control testing** - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S6: User Database Sync** - Integration tests require webhook handlers and database sync to be implemented
- **S7: Auth Error Boundary and Token Refresh** - Tests require error boundary and token handling to be complete

### Enables (Unblocks These Stories)

- None - This is the final story in the epic; auth package is complete and ready for use in applications

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md)
- [TAD: Testing Strategy](/docs/2-technical/2-tad.md#testing-strategy)

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)
- [ADR-006: Best Practices](/docs/2-technical/adr/006-clerk-authentication.md#best-practices)
- [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)

### Reference Documents

- [Coding Standards: Testing](/docs/2-technical/references/coding-standards.md#testing)
- [Coding Standards: Documentation](/docs/2-technical/references/coding-standards.md#documentation)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

### External Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Mock Service Worker (MSW)](https://mswjs.io/)
- [Clerk Testing](https://clerk.com/docs/testing/overview)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [JSDoc Reference](https://jsdoc.app/)
- [TypeScript JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (S6, S7)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Test database configured and accessible
- [ ] Clerk development instance configured with test credentials

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] All tests pass with no flaky tests
- [ ] Coverage >80% for statements, branches, functions, lines
- [ ] No lint errors (`pnpm --filter @repo/auth lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/auth typecheck`)

### Documentation

- [ ] README.md complete with quick start, API reference, troubleshooting
- [ ] USAGE.md complete with detailed examples for all auth patterns
- [ ] MIGRATION.md complete with step-by-step integration guide
- [ ] JSDoc comments on all exported functions, hooks, and components
- [ ] All code examples in documentation tested and working

### Git Hygiene

- [ ] Conventional commit message used (e.g., `test(auth): add comprehensive test suite and documentation`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.7 and Story S8

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
