# Story 2A.3.S3: Integrate Sentry SDK

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Observability Package](./EPIC.md)
- **Depends On**: [S1: Package Structure](./S1-package-structure.md), [S2: Structured Logger](./S2-structured-logger.md)
- **Blocks**: [S4: Error Boundary](./S4-error-boundary.md), [S7: Tests and Documentation](./S7-tests-docs.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** Sentry SDK integrated with automatic error reporting and performance monitoring
**So that** I can track errors, performance issues, and user sessions across all applications with privacy-compliant error capturing

## Acceptance Criteria

- [ ] Sentry SDK initializes with DSN from environment variables
- [ ] All error and fatal logs from structured logger are automatically sent to Sentry
- [ ] Performance monitoring is enabled with environment-based sampling rates
- [ ] Session replay captures errors in production (1.0 sample rate for errors only)
- [ ] PII is automatically filtered from error reports (cookies, headers, sensitive breadcrumbs)
- [ ] User context can be set after authentication (with automatic email hashing)
- [ ] Benign errors are filtered (AbortError, NetworkError)
- [ ] Application functions without Sentry DSN (graceful degradation)
- [ ] Sentry utility functions exported from `@repo/observability`

## Technical Requirements

### Files to Create

| Path                                                    | Purpose                                        |
| ------------------------------------------------------- | ---------------------------------------------- |
| `packages/observability/src/sentry.ts`                  | Sentry SDK initialization and configuration    |
| `packages/observability/src/sentry-types.ts`            | TypeScript type definitions for Sentry utils   |
| `packages/observability/__tests__/sentry.test.ts`       | Unit tests for Sentry integration              |

### Files to Modify

| Path                                     | Changes                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `packages/observability/src/index.ts`    | Export Sentry utilities: `initSentry`, `setSentryUser`, `clearSentryUser`, `captureError`, `captureMessage` |
| `packages/observability/src/logger.ts`   | Integrate `sendToSentry()` method to route error/fatal logs to Sentry |
| `packages/observability/package.json`    | Add `@sentry/nextjs` dependency                                  |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/observability

# Install Sentry SDK
pnpm add @sentry/nextjs
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                      | Requirement                                              | TAD Reference                                                                  |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Sentry DSN                   | Must be optional; gracefully degrade if missing          | [TAD: Error Tracking Integration](/docs/2-technical/2-tad-observability.md#error-tracking-integration) |
| Performance sampling         | Production: 0.1 (10%), Development: 1.0 (100%)           | [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration) |
| Session replay sampling      | Production errors only: 1.0 (100%), All sessions: 0.01 (1%) | [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration) |
| PII filtering                | Remove cookies, headers, console breadcrumbs             | [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration) |
| Error filtering              | Filter AbortError and NetworkError                       | [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration) |
| Trace propagation targets    | Include localhost, Vercel domains, API URL               | [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration) |

**Configuration Rationale**: Sentry provides centralized error tracking and performance monitoring across all applications. Optional DSN ensures the application functions during local development without Sentry credentials. Environment-based sampling rates balance monitoring coverage with cost (production uses 10% performance tracing to reduce quota usage). Session replay only captures errors to protect user privacy while enabling debugging. PII filtering ensures compliance with GDPR/CCPA regulations.

For complete implementation patterns, see: [TAD: Error Tracking Integration](/docs/2-technical/2-tad-observability.md#error-tracking-integration)

## Test Requirements

### Manual Verification

- [ ] **Sentry Initialization**: Start app without `SENTRY_DSN` and verify warning logged but app runs normally
- [ ] **Error Capture**: Trigger an error and verify it appears in Sentry dashboard
- [ ] **User Context**: Set user context and verify user ID appears in Sentry event
- [ ] **PII Filtering**: Verify cookies and headers are removed from Sentry events

### Automated Tests

- [ ] Unit: `__tests__/sentry.test.ts` - Verify `initSentry()` handles missing DSN gracefully
- [ ] Unit: `__tests__/sentry.test.ts` - Verify `captureError()` calls Sentry SDK with correct parameters
- [ ] Unit: `__tests__/sentry.test.ts` - Verify `setSentryUser()` sets user context correctly
- [ ] Unit: `__tests__/sentry.test.ts` - Verify `clearSentryUser()` clears user context
- [ ] Unit: `__tests__/sentry.test.ts` - Verify error filtering excludes AbortError and NetworkError
- [ ] Unit: `__tests__/logger.test.ts` - Verify error/fatal logs trigger Sentry capture

### Verification Commands

```bash
# Build the observability package
pnpm --filter @repo/observability build

# Run unit tests
pnpm --filter @repo/observability test

# Run tests with coverage
pnpm --filter @repo/observability test:coverage

# Type checking
pnpm --filter @repo/observability type-check

# Test Sentry initialization without DSN
NODE_ENV=production node -e "
  import('@repo/observability').then(({ initSentry }) => {
    initSentry();
    console.log('Sentry initialization handled gracefully without DSN');
  })
"

# Test error capture (requires SENTRY_DSN)
SENTRY_DSN=your_dsn_here node -e "
  import('@repo/observability').then(({ initSentry, captureError }) => {
    initSentry();
    const error = new Error('Test error from CLI');
    captureError(error, { context: 'test' });
    console.log('Error sent to Sentry');
  })
"
```

## Implementation Notes

### Implementation Sequence

1. **Create Sentry Type Definitions**
   - Create `sentry-types.ts` with utility function signatures
   - Define types for error context and user context

2. **Implement Sentry Initialization**
   - Create `sentry.ts` with `initSentry()` function
   - Check for `SENTRY_DSN` environment variable, log warning if missing
   - Configure Sentry with environment, sampling rates, integrations
   - Set up `beforeSend` hook for error filtering and PII removal
   - Set up `beforeBreadcrumb` hook to filter console breadcrumbs

3. **Implement User Context Management**
   - Implement `setSentryUser()` to set authenticated user context
   - Implement `clearSentryUser()` to clear user context on logout
   - Ensure user ID is set, email is optional (Sentry auto-hashes)

4. **Implement Error Capture Utilities**
   - Implement `captureError()` to capture exceptions with context
   - Implement `captureMessage()` to capture custom messages with severity levels
   - Use Sentry SDK methods: `captureException()`, `captureMessage()`

5. **Integrate with Structured Logger**
   - Modify `logger.ts` to import Sentry utilities
   - Implement `sendToSentry()` private method
   - Call `sendToSentry()` from error and fatal log methods
   - Extract error details from log entry and send to Sentry

6. **Update Package Exports**
   - Export all Sentry utilities from `src/index.ts`
   - Ensure type definitions are exported for consuming apps

7. **Write Unit Tests**
   - Mock Sentry SDK methods using Vitest
   - Test initialization with and without DSN
   - Test error capture, message capture, user context
   - Test error filtering for benign errors
   - Test PII removal in beforeSend hook

### Key Concepts

- **Error Tracking**: Centralized error collection across all applications for debugging and monitoring
- **Performance Monitoring**: Distributed tracing to identify slow API calls and database queries
- **Session Replay**: Video-like reproduction of user sessions leading to errors
- **Graceful Degradation**: Application functions normally without Sentry DSN (development or missing config)
- **PII Filtering**: Automatic removal of personally identifiable information to comply with privacy regulations

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration)
- [TAD: Error Tracking Integration](/docs/2-technical/2-tad-observability.md#error-tracking-integration)

Key pattern notes for this story:

- Use conditional initialization: check `SENTRY_DSN` before calling `Sentry.init()`
- Use `beforeSend` hook to filter errors and remove PII before sending to Sentry
- Use `beforeBreadcrumb` hook to filter out noisy breadcrumbs (console logs)
- Set trace propagation targets to include localhost, Vercel domains, and API URL
- Session replay should mask all text and block all media for privacy

### Troubleshooting

| Issue                                      | Cause                                        | Solution                                                         |
| ------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| Sentry errors not appearing in dashboard   | DSN not configured or incorrect              | Verify `SENTRY_DSN` environment variable is set correctly        |
| Application crashes without DSN            | Sentry initialization not checking for DSN   | Add conditional check before `Sentry.init()`                     |
| PII appears in Sentry events               | `beforeSend` hook not removing PII           | Verify `beforeSend` deletes cookies and headers                  |
| Too many Sentry events (quota exceeded)    | Sampling rates too high                      | Reduce `tracesSampleRate` to 0.1 or lower in production          |
| Session replay not working                 | Replay integration not configured            | Verify `Replay` integration is added with correct sampling rates |
| TypeScript errors importing Sentry utils   | Types not exported correctly                 | Ensure `sentry-types.ts` is exported from `src/index.ts`         |

### Reference Materials

- [Sentry Next.js SDK Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions: 0.5h
- Sentry initialization and configuration: 1.5h
- User context management: 1h
- Error capture utilities: 1h
- Logger integration: 1h
- Unit tests: 1.5h
- Manual verification and debugging: 1.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md) - Overall error tracking strategy
- [TAD: Error Tracking Integration](/docs/2-technical/2-tad-observability.md#error-tracking-integration) - Sentry configuration and integration patterns
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md) - PII filtering requirements
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints) - Sentry optional (graceful degradation)

**Story-Specific Decisions**:

### AD-2A.3.S3.1: Session Replay Sampling Strategy

**Scope**: Story-specific (affects Sentry configuration only)

**Decision**: Enable session replay only for errors (1.0 sample rate) in production; disable for all regular sessions (0.01 sample rate for exceptions only).

**Rationale**:
- Balances debugging capability with user privacy
- Reduces Sentry quota usage (replays consume significant storage)
- Captures sufficient context for debugging errors (100% of errors)
- Minimizes surveillance concerns (1% of normal sessions)

**Consequences**:
- Errors have full session replay for debugging
- Non-error sessions rarely recorded (reduces privacy concerns)
- May miss context for issues that don't trigger errors

**Alternatives Considered**:
- **Replay all sessions**: Rejected due to privacy concerns and quota cost
- **No session replay**: Rejected because debugging UI errors is difficult without visual context
- **Higher sample rate (10%)**: Rejected due to privacy and cost concerns

### AD-2A.3.S3.2: Error Filtering for Benign Errors

**Scope**: Story-specific (affects Sentry error filtering only)

**Decision**: Filter out `AbortError` and `NetworkError` in `beforeSend` hook to prevent noise in Sentry.

**Rationale**:
- `AbortError` occurs when users cancel requests (e.g., navigating away) - not an application error
- `NetworkError` is often intermittent connectivity (handled by retry logic) - not actionable
- Reduces Sentry noise, improves signal-to-noise ratio for actionable errors

**Consequences**:
- Sentry won't track cancelled requests or network failures
- Reduces quota usage and improves error dashboard clarity
- May miss patterns of network issues (acceptable trade-off)

**Alternatives Considered**:
- **Track all errors**: Rejected due to noise from benign errors
- **Filter more aggressively**: Considered but deferred; may add more filters based on production patterns

## Out of Scope

The following items are explicitly NOT part of this story:

- **React Error Boundary component** - Deferred to S4 (Error Boundary); will use Sentry utilities created here
- **API error handler middleware** - Deferred to Epic 2A.6 (Middleware Package); will use Sentry utilities
- **Sentry project creation** - Manual setup in Sentry dashboard; DSN provided via environment variables
- **Custom Sentry dashboards** - Use Sentry defaults; customization deferred to production readiness phase
- **Alerting configuration** - Deferred to Phase 4A (Production Readiness); alert rules configured in Sentry
- **PostHog integration** - Deferred to Epic 2A.4 (Analytics Infrastructure)
- **Sentry Cron Monitoring** - Not required for MVP; deferred to future enhancements
- **Sentry Profiling** - Not required for MVP; performance monitoring sufficient

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Structure** - Requires package directory and build tooling to install Sentry SDK
- **S2: Structured Logger** - Logger integration requires logger class to be implemented first

### Enables (Unblocks These Stories)

- **S4: Error Boundary** - Error Boundary component will use Sentry utilities to capture React errors
- **S7: Tests and Documentation** - Comprehensive testing requires Sentry integration complete

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- [TAD: Error Tracking Integration](/docs/2-technical/2-tad-observability.md#error-tracking-integration)
- [TAD: Sentry SDK Configuration](/docs/2-technical/2-tad-observability.md#sentry-sdk-configuration)
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

**External**:
- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)

## Verification Checklist

**Pre-Verification**:
- [ ] S1 (Package Structure) complete
- [ ] S2 (Structured Logger) complete
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/observability` package builds successfully

**Implementation Quality**:
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage > 80% for Sentry integration code

**Documentation**:
- [ ] JSDoc comments on public Sentry utility functions
- [ ] Type definitions include documentation comments
- [ ] Environment variable `SENTRY_DSN` documented in README (if applicable)

**Git Hygiene**:
- [ ] Conventional commit message (e.g., `feat(observability): integrate Sentry SDK`)
- [ ] No unrelated changes included
- [ ] PR references Epic 2A.3.S3

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
