# Epic 2A.4: Analytics Infrastructure

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.7 - Basic Analytics & Tracking](/docs/1-product/1-prd.md#feature-m7-basic-analytics--tracking)
- **TAD Reference**: [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- **Phase**: 2A - Core Platform Packages (Week 2)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                   | Reason                                                            |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md) | Shared TypeScript and ESLint configs needed for analytics package |
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md)  | Logging utilities for analytics debugging and error tracking      |

### Blocks (Enables These Epics)

| Epic | Title                                                                 | What This Provides                                                |
| ---- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)                 | Component tracking utilities and `data-component-id` patterns     |
| 2A.6 | [Middleware Package](../2A.6-middleware/EPIC.md)                      | Analytics middleware for request tracking                         |
| 2B.3 | [Product Analytics Events & Taxonomy](../2B.3-product-events/EPIC.md) | Generic event tracking infrastructure for product-specific events |
| 3A.2 | [Routing Application Shell](../3A.2-routing-shell/EPIC.md)            | Page view tracking and analytics integration                      |
| 3B.5 | [Demo & Marketing Application](../3B.5-demo-marketing/EPIC.md)        | Lead capture and conversion tracking                              |
| 3B.7 | [Landing Page Builder Application](../3B.7-landing-builder/EPIC.md)   | A/B testing and traffic splitting utilities                       |

### Can Run in Parallel With

| Epic | Title                                                     | Notes                                                                     |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| 2A.2 | [Database Infrastructure](../2A.2-database-infra/EPIC.md) | Independent infrastructure; no data dependencies                          |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)     | Independent frontend concerns; component tracking can be integrated later |

## Overview

This epic establishes the analytics infrastructure layer for the platform, providing event tracking, consent management, feature flags, and multi-provider routing. The `@repo/analytics` package delivers generic, reusable analytics capabilities that all applications can leverage. This infrastructure enables product-specific event taxonomies to be built on top while maintaining provider flexibility and privacy compliance.

**Key Deliverables:**

- `@repo/analytics` package with `trackEvent(name, properties)` function
- Event validation with Zod schemas (generic base schema)
- `data-component-id` tracking utilities for component-level analytics
- `useComponentTracking()` hook for React component tracking
- Provider integrations: PostHog, GA4, Vercel Analytics
- Consent management system with opt-in/opt-out controls
- Events blocked until consent obtained
- Feature flag utilities (Edge Config/LaunchDarkly ready)
- Multi-destination event routing

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers can import `@repo/analytics` and track events with `trackEvent(name, properties)`
- [ ] Events are validated against Zod schemas before dispatching to providers
- [ ] React components can use `useComponentTracking()` hook to add automatic impression/interaction tracking
- [ ] `data-component-id` attributes are automatically captured in tracked events
- [ ] Events are routed to configured providers (PostHog, GA4, Vercel Analytics)
- [ ] No events are sent until user consent is explicitly obtained
- [ ] Consent preferences are persisted and respected across sessions
- [ ] Feature flags can be evaluated client-side and server-side
- [ ] Analytics work in both client components and server contexts
- [ ] Test suite achieves 80% coverage for analytics utilities
- [ ] All stories complete and verified
- [ ] Documentation updated with usage examples

## Stories

| ID  | Title                                                                 | Size | Status | Depends On         | Blocks             |
| --- | --------------------------------------------------------------------- | ---- | ------ | ------------------ | ------------------ |
| S1  | [Create @repo/analytics Package Structure](./S1-package-structure.md) | S    | ⬜     | -                  | S2, S3, S4, S5, S6 |
| S2  | [Implement Core Event Tracking](./S2-core-event-tracking.md)          | M    | ⬜     | S1                 | S3, S4, S5, S7     |
| S3  | [Create Event Validation with Zod](./S3-event-validation.md)          | S    | ⬜     | S1, S2             | S7                 |
| S4  | [Implement Consent Management System](./S4-consent-management.md)     | M    | ⬜     | S2                 | S5, S7             |
| S5  | [Integrate Analytics Providers](./S5-provider-integration.md)         | L    | ⬜     | S2, S4             | S6, S7             |
| S6  | [Create Component Tracking Utilities](./S6-component-tracking.md)     | M    | ⬜     | S1, S5             | S7                 |
| S7  | [Implement Feature Flag Utilities](./S7-feature-flags.md)             | M    | ⬜     | S2                 | S8                 |
| S8  | [Write Tests and Documentation](./S8-tests-docs.md)                   | M    | ⬜     | S3, S4, S5, S6, S7 | -                  |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package structure)
 │
 ├──→ S2 (Core event tracking)
 │     ├──→ S3 (Event validation)
 │     │
 │     ├──→ S4 (Consent management)
 │     │     ↓
 │     │    S5 (Provider integration)
 │     │     ↓
 │     │    S6 (Component tracking) ←────────┐
 │     │                                     │
 │     └──→ S7 (Feature flags) ──────────────┤
 │                                           ↓
 └───────────────────────────────────────→ S8 (Tests & docs)
```

**Parallel Execution Notes:**

- S2 (Core tracking) begins immediately after S1 completes
- S3 (Validation) and S4 (Consent) can start in parallel after S2
- S5 (Providers) depends on S4 for consent integration
- S6 (Component tracking) and S7 (Feature flags) can run in parallel after S5/S2
- S8 (Tests) requires all implementation stories to complete

## Technical Constraints

### Required Patterns

- **Privacy-First Analytics**: No tracking before consent obtained per [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- **Event Validation**: All events must be validated against Zod schemas before dispatch
- **Multi-Provider Routing**: Single event dispatched to multiple analytics providers
- **Monorepo Package**: Package must follow `@repo/*` naming convention per [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)
- **Edge Compatibility**: Feature flags must work in Vercel Edge Functions

### Technology Decisions

| Decision              | Choice                | Reference                                                                             |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| Product Analytics     | PostHog               | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Web Analytics         | Google Analytics 4    | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Performance Analytics | Vercel Analytics      | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Event Validation      | Zod                   | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)          |
| Feature Flags         | Edge Config + PostHog | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points)              |

### Constraints

- **No Product-Specific Events**: This epic covers infrastructure only; product-specific event taxonomy defined in Epic 2B.3
- **No PII in Events**: User IDs must be hashed; no personally identifiable information in analytics events
- **Consent-First**: Events must be queued until consent granted, then flushed or discarded based on consent status
- **Bundle Size**: Client-side analytics code must be tree-shakeable and <10KB gzipped
- **Server-Side Support**: Analytics must work in React Server Components and API routes

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Product-specific event taxonomy** - Deferred to Epic 2B.3
- **Product-specific event schemas** (content_created, demo_started, etc.) - Deferred to Epic 2B.3
- **Product-specific A/B tests** - Deferred to Epic 2B.3
- **Custom analytics dashboards** - Use PostHog/GA4 built-in dashboards
- **Real-time analytics streaming** - Batch events sufficient for MVP
- **Complex funnel configuration** - Basic page/event tracking only; advanced funnels configured in PostHog
- **Attribution modelling** - Handled by GA4 natively
- **Cookie banner UI** - Generic infrastructure only; UI deferred to Epic 2A.5 or product implementation

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision            | Options                                      | Impact                             | Status                                     |
| ------------------- | -------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| PostHog hosting     | Cloud vs Self-hosted                         | Data residency, costs, maintenance | ✅ Resolved: Cloud (EU region for GDPR)    |
| Consent storage     | Cookies vs localStorage vs DB                | Persistence, cross-device sync     | ⬜ Open                                    |
| Feature flag source | PostHog flags vs Edge Config vs LaunchDarkly | Performance, cost, complexity      | ⬜ Open                                    |
| GA4 consent mode    | Basic vs Advanced                            | Conversion modelling accuracy      | ✅ Resolved: Advanced consent mode per TAD |

## Risks and Mitigations

| Risk                        | Likelihood | Impact | Mitigation                                             |
| --------------------------- | ---------- | ------ | ------------------------------------------------------ |
| PostHog SDK bundle size     | Medium     | Medium | Use selective imports; implement lazy loading          |
| GA4 consent mode complexity | Medium     | Low    | Follow Google's official implementation guide          |
| Event validation overhead   | Low        | Low    | Validate in development, skip in production hot paths  |
| Consent banner UX impact    | Medium     | Medium | Minimise banner footprint; provide clear choices       |
| Feature flag latency        | Low        | Medium | Cache flags in Edge Config; use stale-while-revalidate |
| Provider SDK conflicts      | Low        | Medium | Isolate provider SDKs; test in combination             |

## Estimated Effort

| Metric          | Value    |
| --------------- | -------- |
| Total Stories   | 8        |
| Total Hours     | 38-56h   |
| Calendar Days   | 4-6 days |
| Parallel Tracks | 2        |

### Story Breakdown

| Size      | Count | Hours  |
| --------- | ----- | ------ |
| XS (1-2h) | 0     | 0h     |
| S (2-4h)  | 2     | 4-8h   |
| M (4-8h)  | 5     | 20-40h |
| L (8-16h) | 1     | 8-16h  |

## References

### Internal Documentation

- [PRD: Feature M.7 - Basic Analytics & Tracking](/docs/1-product/1-prd.md#feature-m7-basic-analytics--tracking)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [PostHog React SDK](https://posthog.com/docs/libraries/react)
- [Google Analytics 4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Vercel Edge Config](https://vercel.com/docs/edge-config)
- [Zod Documentation](https://zod.dev/)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/8
