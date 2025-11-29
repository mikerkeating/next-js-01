# Story 2A.3.S5: Implement Web Vitals Tracking

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Observability Package](./EPIC.md)
- **Depends On**: [S2: Structured Logger](./S2-structured-logger.md)
- **Blocks**: [S7: Tests and Documentation](./S7-tests-docs.md)
- **Runs in Parallel With**: [S4: Error Boundary](./S4-error-boundary.md), [S6: Health Check Utilities](./S6-health-checks.md)

## User Story

**As a** developer
**I want** Web Vitals tracking utilities that capture Core Web Vitals (LCP, FID, CLS) and other metrics (FCP, TTFB)
**So that** I can monitor real-user performance, identify performance regressions, and report metrics to Sentry and analytics providers

## Acceptance Criteria

- [ ] Web Vitals utility tracks all Core Web Vitals: LCP, FID, CLS
- [ ] Web Vitals utility tracks additional metrics: FCP, TTFB
- [ ] Metrics are logged using structured logger with metric name, value, rating, and delta
- [ ] Metrics are sent to Sentry as measurements for performance monitoring
- [ ] PostHog integration supported (optional, gracefully degrades if not configured)
- [ ] Metrics include rating (good, needs-improvement, poor) based on web.dev thresholds
- [ ] Utility function can be called once in root layout to initialize all listeners
- [ ] Web Vitals utility exported from `@repo/observability`
- [ ] TypeScript types exported for Metric interface

## Technical Requirements

### Files to Create

| Path                                                    | Purpose                                      |
| ------------------------------------------------------- | -------------------------------------------- |
| `packages/observability/src/web-vitals.ts`              | Web Vitals tracking implementation           |
| `packages/observability/src/web-vitals-types.ts`        | TypeScript type definitions for Web Vitals   |
| `packages/observability/__tests__/web-vitals.test.ts`   | Unit tests for Web Vitals tracking           |

### Files to Modify

| Path                                     | Changes                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `packages/observability/src/index.ts`    | Export `reportWebVitals` function and related types              |
| `packages/observability/package.json`    | Add `web-vitals` dependency                                      |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/observability

# Install web-vitals library
pnpm add web-vitals
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                      | Requirement                                              | TAD Reference                                                                  |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Core Web Vitals              | Must track LCP, FID, CLS per web.dev standards           | [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking) |
| Additional metrics           | Must track FCP and TTFB for comprehensive monitoring     | [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking) |
| Metric logging               | Log each metric with name, value, rating, delta, and ID  | [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking) |
| Sentry integration           | Send metrics to Sentry as measurements                   | [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking) |
| PostHog integration          | Optional integration; degrade gracefully if not configured | [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking) |

**Configuration Rationale**: Core Web Vitals (LCP, FID, CLS) are Google's standardized metrics for measuring user experience. Tracking these metrics enables performance monitoring, identification of slow pages, and correlation with business metrics. FCP and TTFB provide additional diagnostic context for performance issues. Logging to structured logger enables querying and analysis, while Sentry integration provides performance trends and alerting. PostHog integration enables correlation between performance and user behavior analytics.

For complete implementation patterns, see: [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking)

## Test Requirements

### Manual Verification

- [ ] **Web Vitals Logging**: Open app in development, trigger navigation, and verify Web Vitals logs appear in console
- [ ] **Metric Values**: Verify LCP, FID, CLS, FCP, TTFB metrics have reasonable values for test pages
- [ ] **Sentry Integration**: Verify metrics appear in Sentry Performance dashboard (requires SENTRY_DSN)
- [ ] **PostHog Integration**: Verify `web_vital` events appear in PostHog (if configured)

### Automated Tests

- [ ] Unit: `__tests__/web-vitals.test.ts` - Verify `reportWebVitals()` initializes all metric listeners
- [ ] Unit: `__tests__/web-vitals.test.ts` - Verify metrics are logged with correct structure
- [ ] Unit: `__tests__/web-vitals.test.ts` - Verify Sentry.setMeasurement is called for each metric
- [ ] Unit: `__tests__/web-vitals.test.ts` - Verify PostHog integration is optional (no errors if not configured)
- [ ] Unit: `__tests__/web-vitals.test.ts` - Verify metric rating is included in log metadata

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

# Verify Web Vitals can be imported
node -e "import('@repo/observability').then(m => console.log('reportWebVitals:', m.reportWebVitals))"

# Test Web Vitals in browser (manual test in Next.js app)
# Add to apps/routing/src/app/layout.tsx:
# useEffect(() => { reportWebVitals(); }, []);
# Then navigate app and check console for Web Vitals logs
```

## Implementation Notes

### Implementation Sequence

1. **Create Type Definitions**
   - Create `web-vitals-types.ts` with type re-exports from `web-vitals` library
   - Import `Metric` type from `web-vitals` package

2. **Implement Web Vitals Tracking**
   - Create `web-vitals.ts` with `reportWebVitals()` function
   - Import all metric listeners from `web-vitals`: `onCLS`, `onFID`, `onFCP`, `onLCP`, `onTTFB`
   - Import Logger and Sentry utilities from package

3. **Implement Metric Handler**
   - Create `sendToAnalytics()` function that processes each metric
   - Log metric using structured logger with name, value, rating, delta, and ID
   - Send metric to Sentry using `Sentry.setMeasurement()`
   - Send metric to PostHog if `window.posthog` is available (optional)

4. **Initialize Metric Listeners**
   - Call each metric listener (`onCLS`, `onFID`, `onLCP`, `onFCP`, `onTTFB`) with `sendToAnalytics` callback
   - Listeners automatically trigger when metric is available

5. **Update Package Exports**
   - Export `reportWebVitals` function from `src/index.ts`
   - Export type definitions for consuming apps

6. **Write Unit Tests**
   - Mock `web-vitals` library functions
   - Mock Logger and Sentry modules
   - Test that `reportWebVitals()` registers all listeners
   - Test that metrics are logged and sent to Sentry correctly
   - Test PostHog integration is optional

### Key Concepts

- **Core Web Vitals**: Google's standardized metrics for user experience (LCP: visual load, FID: interactivity, CLS: visual stability)
- **Metric Listeners**: `web-vitals` library provides callback-based listeners that trigger when metrics are calculated
- **Rating Thresholds**: Metrics are rated as "good", "needs-improvement", or "poor" based on web.dev thresholds
- **Real User Monitoring**: Web Vitals measure actual user experience, not synthetic tests
- **Delta Values**: Metric delta represents change from previous measurement (useful for SPAs)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking)

Key pattern notes for this story:

- Use `reportWebVitals()` once in root layout `useEffect` to initialize all listeners
- Metrics are reported asynchronously as they become available (not all at once)
- Use structured logger to enable querying metrics by name, rating, or value
- Sentry measurements enable trend analysis and performance dashboards
- PostHog integration is optional; check for `window.posthog` before calling

### Troubleshooting

| Issue                                  | Cause                                       | Solution                                                       |
| -------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| Metrics not appearing in logs          | `reportWebVitals()` not called in client component | Ensure called in `'use client'` component with `useEffect`    |
| CLS metric never fires                 | CLS only fires on page unload/navigation    | Test by navigating to another page or closing tab             |
| FID not available                      | FID deprecated in favor of INP (not in library yet) | FID still tracked for compatibility; will migrate to INP      |
| Sentry measurements missing            | Sentry not initialized before reportWebVitals | Ensure `initSentry()` called before `reportWebVitals()`        |
| PostHog errors in console              | PostHog not configured, code doesn't check  | Add conditional check for `window.posthog` before calling      |
| TypeScript errors importing Metric type | Type not exported from package            | Ensure `web-vitals-types.ts` exports Metric type               |

### Reference Materials

- [web-vitals Library](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals](https://web.dev/vitals/)
- [LCP (Largest Contentful Paint)](https://web.dev/lcp/)
- [FID (First Input Delay)](https://web.dev/fid/)
- [CLS (Cumulative Layout Shift)](https://web.dev/cls/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

## Estimated Effort

**Size**: S (2-4h)

**Breakdown**:

- Type definitions: 0.25h
- Web Vitals tracking implementation: 1h
- Logger and Sentry integration: 0.75h
- PostHog integration (optional): 0.5h
- Unit tests: 1h
- Manual verification: 0.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md) - Overall performance monitoring strategy
- [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking) - Web Vitals implementation pattern
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints) - PostHog integration deferred to Epic 2A.4

**Story-Specific Decisions**:

### AD-2A.3.S5.1: Track FCP and TTFB in Addition to Core Web Vitals

**Scope**: Story-specific (affects Web Vitals tracking only)

**Decision**: Track FCP (First Contentful Paint) and TTFB (Time to First Byte) in addition to Core Web Vitals (LCP, FID, CLS).

**Rationale**:
- Core Web Vitals (LCP, FID, CLS) measure user experience, but don't provide diagnostic context
- FCP indicates when users first see content (useful for debugging slow initial renders)
- TTFB measures server response time (useful for debugging API/database performance)
- Minimal overhead to track additional metrics (same library)
- Provides comprehensive performance picture for debugging

**Consequences**:
- Additional log volume (5 metrics per page instead of 3)
- More comprehensive performance data for debugging
- FCP and TTFB not part of Google's Core Web Vitals but still valuable

**Alternatives Considered**:
- **Only Core Web Vitals**: Rejected because diagnostic context is valuable for debugging
- **Track all available metrics**: Rejected due to noise and limited value of other metrics

### AD-2A.3.S5.2: PostHog Integration Optional with Graceful Degradation

**Scope**: Story-specific (affects Web Vitals tracking only)

**Decision**: Support PostHog integration for Web Vitals but make it optional with graceful degradation if not configured.

**Rationale**:
- PostHog setup is in Epic 2A.4 (Analytics Infrastructure), not yet available
- Web Vitals tracking should work independently of analytics provider
- Checking for `window.posthog` before calling prevents errors
- Enables local development without PostHog credentials

**Consequences**:
- Web Vitals work without PostHog (logged and sent to Sentry)
- Applications can add PostHog later without modifying Web Vitals code
- No errors in console if PostHog not configured

**Alternatives Considered**:
- **Require PostHog**: Rejected because it creates dependency on Epic 2A.4
- **No PostHog integration**: Rejected because correlation with user analytics is valuable

## Out of Scope

The following items are explicitly NOT part of this story:

- **PostHog configuration and initialization** - Deferred to Epic 2A.4 (Analytics Infrastructure)
- **Custom performance marks and measures** - Web Vitals only; custom timing deferred to future enhancements
- **Performance budgets and alerting** - Monitoring thresholds deferred to production readiness phase
- **INP (Interaction to Next Paint) tracking** - Not yet available in `web-vitals` library; will replace FID when stable
- **Server-side performance metrics** - Web Vitals are client-side only; server metrics handled separately
- **Custom Web Vitals reporting UI** - Use Sentry and Vercel dashboards; custom UI deferred
- **A/B testing correlation** - Deferred to analytics infrastructure phase

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Structured Logger** - Web Vitals tracking uses logger to log metrics

### Enables (Unblocks These Stories)

- **S7: Tests and Documentation** - Comprehensive testing requires Web Vitals implementation complete

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

**External**:
- [web-vitals Library](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals](https://web.dev/vitals/)
- [LCP Documentation](https://web.dev/lcp/)
- [FID Documentation](https://web.dev/fid/)
- [CLS Documentation](https://web.dev/cls/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

## Verification Checklist

**Pre-Verification**:
- [ ] S2 (Structured Logger) complete
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/observability` package builds successfully

**Implementation Quality**:
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage > 80% for Web Vitals code

**Documentation**:
- [ ] JSDoc comments on `reportWebVitals` function
- [ ] Type definitions include documentation comments
- [ ] Usage example documented (if applicable)

**Git Hygiene**:
- [ ] Conventional commit message (e.g., `feat(observability): implement Web Vitals tracking`)
- [ ] No unrelated changes included
- [ ] PR references Epic 2A.3.S5

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
