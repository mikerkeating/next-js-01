# Epic 2A.3: Observability Package

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.5 - Content API & Data Layer](/docs/1-product/1-prd.md#feature-m5-content-api--data-layer)
- **TAD Reference**: [TAD: Observability Architecture](/docs/2-technical/2-tad.md#observability-architecture)
- **Phase**: 2A - Core Platform Packages (Week 2)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                   | Reason                                                                |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md) | Shared TypeScript and ESLint configs needed for observability package |

### Blocks (Enables These Epics)

| Epic | Title                                                       | What This Provides                                           |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Logging utilities for analytics event tracking and debugging |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)       | Error boundary component for graceful error handling         |
| 2A.6 | [Middleware Package](../2A.6-middleware/EPIC.md)            | Request logging middleware and error handling patterns       |
| 3A.1 | [CDN & Asset Management](../3A.1-cdn/EPIC.md)               | Health check utilities for CDN monitoring                    |
| 3A.2 | [Routing Application Shell](../3A.2-routing-shell/EPIC.md)  | Web Vitals tracking and error boundary integration           |

### Can Run in Parallel With

| Epic | Title                                                       | Notes                                                                                          |
| ---- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 2A.2 | [Database Infrastructure](../2A.2-database-infra/EPIC.md)   | No data dependencies; can develop independently once 2A.1 complete                             |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Independent infrastructure; analytics uses observability utilities but can develop in parallel |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)       | Independent frontend vs infrastructure concerns; error boundary can be integrated later        |

## Overview

This epic establishes the observability layer for the platform, providing structured logging, error tracking, health checks, and performance monitoring utilities. The `@repo/observability` package ensures the application is monitored, debuggable, and maintainable through consistent observability patterns that all applications and packages can leverage.

**Key Deliverables:**

- `@repo/observability` package with structured JSON logging
- Logger class with 5 log levels (debug, info, warn, error, fatal)
- Sentry SDK integration for error tracking and performance monitoring
- React Error Boundary component with user-friendly fallback UI
- Web Vitals tracking utilities (LCP, FID, CLS, FCP, TTFB)
- Health check utilities for database, auth, and cache services
- API error handling middleware patterns
- Environment-aware configuration (development pretty-print vs production JSON)

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers can import `@repo/observability` and create loggers with structured JSON output
- [ ] All log entries include timestamp, level, service name, environment, and optional trace ID
- [ ] Errors are automatically reported to Sentry with context and breadcrumbs
- [ ] React applications can wrap components in Error Boundary with customisable fallback UI
- [ ] Core Web Vitals are tracked and reported to analytics providers
- [ ] Health check endpoint can aggregate status from multiple services (database, auth, cache)
- [ ] PII is automatically filtered/hashed in logs and error reports
- [ ] Log output is human-readable in development and JSON-formatted in production
- [ ] Test suite achieves 80% coverage for observability utilities
- [ ] All stories complete and verified
- [ ] Documentation updated with usage examples

## Stories

| ID  | Title                                                                     | Size | Status | Depends On         | Blocks             |
| --- | ------------------------------------------------------------------------- | ---- | ------ | ------------------ | ------------------ |
| S1  | [Create @repo/observability Package Structure](./S1-package-structure.md) | S    | ⬜     | -                  | S2, S3, S4, S5, S6 |
| S2  | [Implement Structured Logger](./S2-structured-logger.md)                  | M    | ⬜     | S1                 | S3, S4, S5, S7     |
| S3  | [Integrate Sentry SDK](./S3-sentry-integration.md)                        | M    | ⬜     | S1, S2             | S4, S7             |
| S4  | [Create React Error Boundary Component](./S4-error-boundary.md)           | M    | ⬜     | S2, S3             | S7                 |
| S5  | [Implement Web Vitals Tracking](./S5-web-vitals.md)                       | S    | ⬜     | S2                 | S7                 |
| S6  | [Create Health Check Utilities](./S6-health-checks.md)                    | M    | ⬜     | S1                 | S7                 |
| S7  | [Write Tests and Documentation](./S7-tests-docs.md)                       | M    | ⬜     | S2, S3, S4, S5, S6 | -                  |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package structure)
 │
 ├──→ S2 (Structured logger)
 │     ├──→ S3 (Sentry integration)
 │     │     ↓
 │     │    S4 (Error boundary) ←─┐
 │     │                          │
 │     └──→ S5 (Web Vitals) ──────┤
 │                                │
 └──→ S6 (Health checks) ─────────┤
                                  ↓
                                 S7 (Tests & docs)
```

**Parallel Execution Notes:**

- S2 (Logger) and S6 (Health checks) can run in parallel after S1 completes
- S3 (Sentry) depends on S2 for logger integration
- S4 (Error Boundary) and S5 (Web Vitals) can run in parallel after S3/S2
- S7 (Tests) requires all implementation stories to complete

## Technical Constraints

### Required Patterns

- **Structured JSON Logging**: All logs must use JSON format with standardised schema per [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)
- **Privacy-First Logging**: User IDs must be hashed; no PII in logs or error reports per [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- **Monorepo Package**: Package must follow `@repo/*` naming convention per [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)
- **Environment-Aware**: Configuration must adapt to development, preview, staging, and production environments

### Technology Decisions

| Decision              | Choice             | Reference                                                                                             |
| --------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| Error Tracking        | Sentry SDK         | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)                 |
| Web Vitals            | web-vitals library | [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md#web-vitals-tracking)       |
| Performance Analytics | Vercel Analytics   | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)                 |
| Log Format            | Structured JSON    | [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md#structured-logging-schema) |

### Constraints

- **No Direct Database Access**: Health checks query database via `@repo/database` package utilities
- **Edge Compatibility**: Logger and utilities must work in Vercel Edge Functions
- **Minimal Bundle Impact**: Client-side utilities must be tree-shakeable and lightweight
- **Sentry Optional**: Application must function without Sentry DSN (graceful degradation)
- **Log Retention Compliance**: Log levels have different retention periods (debug: 7d, info: 30d, warn: 90d, error: 180d, fatal: 365d)

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Product-specific health checks** - Generic utilities only; product services added later
- **Custom Sentry dashboards** - Use Sentry defaults initially; customise in production readiness phase
- **Log aggregation infrastructure** - Vercel handles log storage; external aggregation deferred
- **APM (Application Performance Monitoring) beyond Sentry** - Additional APM tools not required for MVP
- **Real-time alerting configuration** - Alerting rules configured in production readiness (Phase 4A)
- **PostHog integration** - PostHog setup is in Epic 2A.4 (Analytics Infrastructure)
- **Database query performance logging** - Handled in Epic 2A.2 (Database Infrastructure)

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                       | Options                                               | Impact                          | Status                                        |
| ------------------------------ | ----------------------------------------------------- | ------------------------------- | --------------------------------------------- |
| Sentry replay configuration    | Enable session replay for errors only vs all sessions | Privacy vs debugging capability | ✅ Resolved: Errors only (1.0 sample) per TAD |
| Error boundary fallback design | Generic fallback vs customisable per app              | UX consistency vs flexibility   | ⬜ Open                                       |
| Health check endpoint path     | `/api/health` vs `/_health`                           | Discoverability vs convention   | ✅ Resolved: `/api/health` per Steel Thread   |

## Risks and Mitigations

| Risk                       | Likelihood | Impact | Mitigation                                                      |
| -------------------------- | ---------- | ------ | --------------------------------------------------------------- |
| Sentry SDK bundle size     | Medium     | Medium | Use selective imports; tree-shake unused features               |
| Web Vitals library updates | Low        | Low    | Pin to stable version; test before upgrade                      |
| Log volume costs           | Medium     | Medium | Implement log level filtering; use sampling for debug logs      |
| PII leakage in errors      | Low        | High   | Automated PII scrubbing in Sentry config; code review checklist |
| Edge runtime compatibility | Low        | Medium | Test all utilities in Edge environment early                    |

## Estimated Effort

| Metric          | Value    |
| --------------- | -------- |
| Total Stories   | 7        |
| Total Hours     | 30-42h   |
| Calendar Days   | 3-4 days |
| Parallel Tracks | 2        |

### Story Breakdown

| Size      | Count | Hours  |
| --------- | ----- | ------ |
| XS (1-2h) | 0     | 0h     |
| S (2-4h)  | 2     | 4-8h   |
| M (4-8h)  | 5     | 20-40h |
| L (8-16h) | 0     | 0h     |

## References

### Internal Documentation

- [PRD: Feature M.5 - Content API & Data Layer](/docs/1-product/1-prd.md#feature-m5-content-api--data-layer)
- [TAD: Observability Architecture](/docs/2-technical/2-tad.md#observability-architecture)
- [TAD: Observability Implementation Details](/docs/2-technical/2-tad-observability.md)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)
- [web-vitals Library](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
