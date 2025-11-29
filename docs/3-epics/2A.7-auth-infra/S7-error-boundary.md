# Story 2A.7.S7: Auth Error Boundary and Token Refresh

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Epic 2A.7: Auth Infrastructure](./EPIC.md)
- **Depends On**: [S3: Session Management and Auth Hooks](./S3-session-management.md), [S4: Protected Route HOC](./S4-protected-route.md)
- **Blocks**: [S8: Integration Tests and Documentation](./S8-integration-tests.md)
- **Runs in Parallel With**: None (final implementation story before integration tests)

## User Story

**As a** user of an authenticated application
**I want** graceful error handling when authentication fails
**So that** I see helpful error messages instead of broken UI and can recover from auth errors without losing my work

## Acceptance Criteria

- [ ] `AuthErrorBoundary` component catches authentication-related errors and displays fallback UI
- [ ] Token refresh happens automatically in the background without user intervention
- [ ] Expired session errors trigger automatic re-authentication flow
- [ ] Error boundary logs auth errors to monitoring system (via logger package)
- [ ] Custom fallback UI provides "Sign In Again" action when session is invalid
- [ ] Error boundary resets when user successfully re-authenticates
- [ ] Component works with both client and server component errors
- [ ] TypeScript types exported for error boundary props

## Technical Requirements

### Files to Create

| Path                                                | Purpose                                            |
| --------------------------------------------------- | -------------------------------------------------- |
| `packages/auth/src/components/auth-error-boundary.tsx` | Auth-specific error boundary component             |
| `packages/auth/src/components/auth-error-fallback.tsx` | Default fallback UI for auth errors                |
| `packages/auth/src/utils/auth-error-handlers.ts`    | Error classification and handling utilities        |
| `packages/auth/src/utils/token-refresh.ts`          | Token refresh monitoring utilities                 |
| `packages/auth/src/types/auth-errors.ts`            | TypeScript interfaces for auth error types         |

### Files to Modify

| Path                             | Changes                                             |
| -------------------------------- | --------------------------------------------------- |
| `packages/auth/src/index.ts`     | Export `AuthErrorBoundary` and error utilities      |
| `packages/auth/README.md`        | Add error handling and token refresh documentation  |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

Dependencies should already be installed from S1 (Package Setup). No additional dependencies required.

**Required dependencies** (from S1):
- `@clerk/nextjs` - Token refresh is handled automatically by Clerk SDK
- `react` - Error boundary component implementation

### Configuration Details

> **Note**: For complete error boundary patterns, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting              | Requirement                                                        | TAD Reference                                                                 |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Error classification | Distinguish auth errors from general errors (check error codes)    | [TAD: Observability - React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |
| Logging integration  | Use `@repo/logger` for error logging with structured metadata      | [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema) |
| Token refresh        | Rely on Clerk's automatic token refresh; monitor for failures      | [ADR-006: Best Practices - Session Management](/docs/2-technical/adr/006-clerk-authentication.md#best-practices) |
| Fallback UI          | Provide actionable fallback with "Sign In Again" button            | [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) |

**Configuration Rationale**:
- Auth-specific error boundary focuses on authentication failures (session expiry, token issues) while delegating general application errors to broader error boundaries
- Clerk SDK handles token refresh automatically; our implementation monitors for refresh failures and provides user feedback
- Logging auth errors with structured metadata enables monitoring authentication reliability and debugging session issues
- Fallback UI with re-authentication action provides recovery path without losing user's page context

For complete error boundary implementation patterns, see: [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary)

## Test Requirements

### Manual Verification

- [ ] **Session Expiry**: Expire session manually (clear cookies) - verify error boundary shows fallback UI with "Sign In Again" button
- [ ] **Re-authentication**: Click "Sign In Again" button - verify redirect to sign-in page with return URL
- [ ] **Token Refresh**: Wait for token to near expiration - verify automatic refresh without UI disruption
- [ ] **Error Logging**: Trigger auth error - verify error logged to console/monitoring with correct metadata
- [ ] **Boundary Reset**: Sign in again after error - verify error boundary resets and app renders normally

### Automated Tests

- [ ] Unit: `auth-error-boundary.test.tsx` - Error boundary catches and displays fallback for auth errors
- [ ] Unit: `auth-error-boundary.test.tsx` - Error boundary ignores non-auth errors (passes to parent boundary)
- [ ] Unit: `auth-error-handlers.test.ts` - Correctly classifies Clerk error types (session expiry, token invalid, network errors)
- [ ] Unit: `token-refresh.test.ts` - Token refresh monitoring detects refresh failures
- [ ] Integration: Error boundary with ClerkProvider - verify boundary catches auth hook errors

### Integration Tests

- [ ] Error boundary catches `useAuth()` errors when Clerk session is invalid
- [ ] Error boundary resets when user re-authenticates successfully
- [ ] Auth errors are logged with correct structured metadata to logger package
- [ ] Token refresh failures trigger error boundary fallback UI

### Verification Commands

```bash
# Run unit tests for error boundary
pnpm --filter @repo/auth test auth-error

# Run tests with coverage
pnpm --filter @repo/auth test:coverage

# Type-check the package
pnpm --filter @repo/auth typecheck

# Lint the code
pnpm --filter @repo/auth lint

# Build the package
pnpm --filter @repo/auth build

# Test in example app
pnpm --filter web dev
# Clear session cookies in browser DevTools to trigger auth error
```

## Implementation Notes

### Implementation Sequence

1. **Create Auth Error Types**
   - Define `AuthError` interface with error codes and messages
   - Define error classification utilities (isAuthError, isSessionExpiredError, etc.)
   - Export types from `src/types/auth-errors.ts`

2. **Implement Error Classification**
   - Create `classifyClerkError()` function to identify auth error types
   - Create `isAuthError()` predicate to distinguish auth from general errors
   - Add error code mapping for common Clerk errors

3. **Create Fallback UI Component**
   - Design simple, accessible fallback UI
   - Include error message and "Sign In Again" button
   - Use redirect with return URL on button click
   - Export from `src/components/auth-error-fallback.tsx`

4. **Implement Error Boundary**
   - Extend React.Component with error boundary lifecycle methods
   - Filter errors using `isAuthError()` classification
   - Integrate with `@repo/logger` for error logging
   - Reset boundary state when user re-authenticates
   - Use `"use client"` directive

5. **Add Token Refresh Monitoring**
   - Create utility to detect token refresh failures
   - Log refresh failures for monitoring
   - Token refresh is automatic via Clerk SDK; no manual implementation needed

6. **Update Package Exports**
   - Export `AuthErrorBoundary` from main index
   - Export error classification utilities
   - Export TypeScript types

7. **Update Documentation**
   - Add error handling examples to README
   - Document how to wrap app with `AuthErrorBoundary`
   - Document error classification for custom error handling

### Key Concepts

- **Error Boundary**: React component that catches JavaScript errors in child component tree and displays fallback UI
- **Auth-Specific Errors**: Errors related to authentication (session expiry, invalid token, network failures during auth)
- **Token Refresh**: Clerk SDK automatically refreshes tokens before expiration; monitoring detects failures
- **Error Classification**: Distinguishing auth errors from general errors to route to appropriate error boundary
- **Graceful Degradation**: Providing recovery path (re-authentication) instead of broken UI

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) - Error boundary implementation pattern with logging
- [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema) - How to log errors with structured metadata
- [ADR-006: Best Practices - Error Handling](/docs/2-technical/adr/006-clerk-authentication.md#best-practices) - Clerk error handling patterns

Key pattern notes for this story:

- Use React's `componentDidCatch` lifecycle method to catch errors
- Check error type/code before handling to distinguish auth errors
- Use `getDerivedStateFromError` to update UI state on error
- Provide reset mechanism when auth state changes (user signs in)
- Log errors asynchronously to avoid blocking UI rendering

### Troubleshooting

| Issue                                      | Cause                                          | Solution                                                          |
| ------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------- |
| Error boundary doesn't catch auth errors   | Error boundary placed incorrectly in tree      | Ensure `AuthErrorBoundary` wraps components using auth hooks      |
| All errors caught as auth errors           | Error classification too broad                 | Use strict error code checking in `isAuthError()`                 |
| Token refresh not working                  | Clerk SDK not configured correctly             | Verify Clerk environment variables and provider setup (S1, S2)    |
| Error boundary doesn't reset after sign-in | Missing key prop or reset mechanism            | Use `userId` as key prop on boundary or implement manual reset    |
| Errors not logged to monitoring            | Logger not imported or configured              | Verify `@repo/logger` dependency and import in error boundary     |

### Reference Materials

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Clerk Session Management](https://clerk.com/docs/references/nextjs/auth#session-management)
- [Clerk Error Handling](https://clerk.com/docs/references/javascript/clerk/error-handling)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Create auth error types and classification: 0.5h
- Implement fallback UI component: 0.5h
- Implement error boundary with logging: 1h
- Add token refresh monitoring: 0.5h
- Tests and documentation: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](/docs/0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Observability - React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary) - General error boundary pattern used across packages
- [ADR-006: Best Practices - Session Management](/docs/2-technical/adr/006-clerk-authentication.md#best-practices) - Clerk handles token refresh automatically
- [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema) - Standardized error logging format

### Story-Specific Decisions

#### AD-2A.7.S7.1: Auth-Specific Error Boundary vs Generic Error Boundary

**Scope**: Story-specific (isolated to auth package)

**Decision**: Provide an auth-specific error boundary (`AuthErrorBoundary`) that filters for authentication errors, rather than relying solely on a generic error boundary from `@repo/ui`.

**Rationale**:

- Authentication errors require different handling than general application errors (e.g., redirect to sign-in vs. show generic error page)
- Auth-specific boundary can provide contextual fallback UI with "Sign In Again" action
- Allows auth package to be self-contained without depending on UI package
- Enables auth-specific error logging with relevant metadata (userId, session state, etc.)
- Can be composed with generic error boundary (auth boundary catches auth errors, falls through to generic boundary for others)

**Consequences**:

- Applications can choose to use either `AuthErrorBoundary` alone or compose it with generic error boundaries
- Auth package remains independent of UI package
- Clearer separation of concerns between auth and general error handling
- Slightly more boilerplate (need to wrap app with multiple boundaries), but more flexible

**Alternatives Considered**:

- **Use Generic Error Boundary Only**: Rely on `@repo/ui` error boundary for all errors - Rejected because it doesn't provide auth-specific recovery actions or logging context
- **Extend Generic Error Boundary**: Make auth boundary extend UI package boundary - Rejected because it creates dependency between auth and UI packages

#### AD-2A.7.S7.2: Automatic Token Refresh via Clerk SDK

**Scope**: Story-specific (applies to this auth infrastructure implementation)

**Decision**: Rely on Clerk SDK's automatic token refresh mechanism rather than implementing custom token refresh logic.

**Rationale**:

- Clerk SDK automatically refreshes tokens before expiration (per ADR-006 best practices)
- Custom token refresh logic is error-prone and introduces security risks
- Clerk's implementation is battle-tested and handles edge cases (network failures, race conditions)
- Reduces maintenance burden and code complexity
- Aligns with "use platform defaults" principle

**Consequences**:

- Less control over token refresh timing and behavior
- Dependent on Clerk SDK for token management reliability
- Simpler implementation with fewer edge cases to handle
- Monitoring focuses on detecting failures rather than implementing refresh

**Alternatives Considered**:

- **Custom Token Refresh Logic**: Implement manual token refresh using Clerk API - Rejected because it duplicates Clerk SDK functionality and introduces security risks
- **Periodic Token Check**: Poll token expiration and refresh proactively - Rejected because Clerk SDK already does this automatically

## Out of Scope

The following items are explicitly NOT part of this story:

- **Generic application error boundary** - Provided by `@repo/ui` package (Epic 2A.5)
- **Network error handling** - Handled by API client package retry logic (Epic 2A.8)
- **Form validation errors** - Handled by form components, not error boundary
- **Sentry integration** - Handled by observability package (Epic 2A.3); auth boundary uses `@repo/logger`
- **Custom error pages** (404, 500) - Application-level concern, not package responsibility
- **Organization-specific error handling** - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Multi-factor authentication errors** - Handled by Clerk UI components, not error boundary

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S3: Session Management and Auth Hooks** - Error boundary uses `useAuth()` hook to detect auth state changes for boundary reset
- **S4: Protected Route HOC** - Error boundary needs protected routes to test error handling in auth context

### Enables (Unblocks These Stories)

- **S8: Integration Tests and Documentation** - Comprehensive testing requires error handling to be complete

## References

### Epic & TAD References

- [EPIC.md: Auth Infrastructure Overview](./EPIC.md#overview)
- [TAD: Observability - React Error Boundary](/docs/2-technical/2-tad-observability.md#react-error-boundary)
- [TAD: Structured Logging Schema](/docs/2-technical/2-tad-observability.md#structured-logging-schema)

### ADR References

- [ADR-006: Clerk for Authentication - Best Practices](/docs/2-technical/adr/006-clerk-authentication.md#best-practices)
- [ADR-006: Error Handling](/docs/2-technical/adr/006-clerk-authentication.md#best-practices)

### External Documentation

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Clerk Session Management](https://clerk.com/docs/references/nextjs/auth)
- [Clerk Error Handling](https://clerk.com/docs/references/javascript/clerk/error-handling)

## Verification Checklist

### Pre-Verification

- [ ] S3 (Session Management) completed - auth hooks available for testing
- [ ] S4 (Protected Route HOC) completed - protected routes available for testing error scenarios
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Clerk development instance configured with test user

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm --filter @repo/auth lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/auth typecheck`)
- [ ] Tests written and passing (`pnpm --filter @repo/auth test`)
- [ ] Coverage > 80% for error boundary and utilities

### Documentation

- [ ] JSDoc comments on error boundary component and utilities
- [ ] README.md updated with error handling examples
- [ ] TypeScript types exported and documented
- [ ] Troubleshooting section covers common error scenarios

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(auth): add auth error boundary and token refresh monitoring`)
- [ ] No unrelated changes included
- [ ] PR description includes before/after examples of error handling

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
