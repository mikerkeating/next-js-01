# Epic 2A.6: Middleware Package (Generic)

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.4 - Authentication & Authorization](/docs/1-product/1-prd.md#feature-m4-authentication--authorization)
- **TAD Reference**: [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad.md#edge-middleware-architecture)
- **Detailed TAD**: [TAD: Edge Middleware Architecture (Detailed)](/docs/2-technical/2-tad-edge-middleware.md)
- **Phase**: 2A - Core Platform Packages
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title | Reason |
|------|-------|--------|
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md) | Middleware requires structured logging utilities for request logging |

### Blocks (Enables These Epics)

| Epic | Title | What This Provides |
|------|-------|-------------------|
| 2A.7 | [Auth Infrastructure](../2A.7-auth-infra/EPIC.md) | Provides middleware composition and route protection patterns for auth middleware |
| 2B.6 | Product Middleware | Generic middleware utilities that product-specific middleware extends |

### Can Run in Parallel With

| Epic | Title | Notes |
|------|-------|-------|
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md) | Independent package with no shared dependencies |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md) | Independent package with no shared dependencies |

## Overview

Create the `@repo/middleware` package providing reusable Next.js edge middleware patterns for request logging, rate limiting, security headers, CORS configuration, and middleware chain composition. This package establishes generic middleware utilities that work at the Vercel Edge, compatible with the edge runtime constraints (Web APIs only, no Node.js APIs).

**Key Deliverables:**

- Middleware composition system for chaining multiple middleware functions
- Request logging middleware with structured JSON output
- Security headers middleware (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting utilities with configurable thresholds
- CORS configuration middleware
- Route matcher utilities for conditional middleware execution
- Edge runtime compatible (all utilities work within Vercel Edge constraints)

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] `@repo/middleware` package is published and can be imported by applications
- [ ] Middleware chain composition executes middleware in order and supports short-circuit responses
- [ ] Request logging middleware produces structured JSON logs with request ID, method, path, and timing
- [ ] Security headers middleware sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy
- [ ] Rate limiting middleware can be configured with different thresholds per identifier type (user, org, anonymous)
- [ ] CORS middleware allows configurable origins, methods, and headers
- [ ] All middleware works within Vercel Edge runtime constraints (< 50ms cold start, < 10ms warm execution)
- [ ] Package has ≥80% test coverage
- [ ] All stories complete and verified
- [ ] Documentation updated (README, inline JSDoc)

## Stories

| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [Package Setup and Middleware Composer](./S1-package-setup.md) | M | ⬜ | - | S2, S3, S4, S5, S6 |
| S2 | [Logging Middleware](./S2-logging-middleware.md) | S | ⬜ | S1 | S7 |
| S3 | [Security Headers Middleware](./S3-security-headers.md) | S | ⬜ | S1 | S7 |
| S4 | [Rate Limiting Middleware](./S4-rate-limiting.md) | M | ⬜ | S1 | S7 |
| S5 | [CORS Middleware](./S5-cors-middleware.md) | S | ⬜ | S1 | S7 |
| S6 | [Route Matcher Utilities](./S6-route-matchers.md) | S | ⬜ | S1 | S7 |
| S7 | [Integration Tests and Documentation](./S7-integration-tests.md) | M | ⬜ | S2, S3, S4, S5, S6 | - |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package setup & middleware composer)
 ├──→ S2 (Logging middleware)
 ├──→ S3 (Security headers middleware)
 ├──→ S4 (Rate limiting middleware)
 ├──→ S5 (CORS middleware)
 └──→ S6 (Route matcher utilities)
       ↓
      S7 (Integration tests & documentation)
```

**Parallel Execution Notes:**

- S2, S3, S4, S5, and S6 can all run in parallel after S1 completes
- S7 requires all middleware implementations (S2-S6) to complete before integration testing

## Technical Constraints

### Required Patterns

- **Edge Runtime Compatibility**: All code must work within Vercel Edge runtime constraints (Web APIs only, no Node.js APIs, no file system access) - [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)
- **Middleware Composition Pattern**: Use the composable middleware chain pattern with context passing - [TAD: Middleware Chain Composition](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition)
- **Structured Logging**: JSON format with consistent fields (timestamp, level, service, requestId) - [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)

### Technology Decisions

| Decision | Choice | Reference |
|----------|--------|-----------|
| Edge Runtime | Vercel Edge Functions | [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md) |
| Rate Limit Storage | Vercel KV (distributed) | [TAD: Rate Limiting](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware) |
| Hosting Platform | Vercel | [ADR-004: Vercel as hosting platform](/docs/2-technical/adr/004-vercel-hosting.md) |

### Constraints

- **Execution Time**: Middleware must complete within 30 seconds (Vercel Edge limit), target < 50ms
- **Cold Start**: Must achieve < 50ms cold start time, target < 30ms
- **Response Size**: Maximum response size 4MB (Vercel Edge limit)
- **Code Size**: Maximum middleware code size 1MB (Vercel Edge limit)
- **No Node.js APIs**: Cannot use `fs`, `path`, `crypto` (use Web Crypto API instead), or other Node.js-specific APIs
- **Rate Limiting**: Must fail open (allow requests) if rate limit storage is unavailable

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Authentication Middleware** - Handled in Epic 2A.7 (Auth Infrastructure) which uses this package's composition utilities
- **Organisation Context Middleware** - Product-specific, deferred to Epic 2B.6 (Product Middleware)
- **Role-Based Access Middleware** - Product-specific, deferred to Epic 2B.6 (Product Middleware)
- **CSRF Protection Middleware** - Deferred to Epic 2A.7 (Auth Infrastructure) as it requires session handling
- **Product-Specific Route Protection** - Deferred to Epic 2B.6 (Product Middleware)
- **Vercel KV Setup** - Infrastructure provisioning is handled separately; this epic assumes KV is available

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| Rate limit storage backend | Vercel KV vs in-memory with Edge Config | Determines persistence and distribution of rate limits | ✅ Resolved: Vercel KV per TAD |
| Default rate limits | Conservative (20/min anon) vs permissive (100/min anon) | Affects public API accessibility | ✅ Resolved: 20/min anon, 100/min user, 1000/min org per TAD |
| CSP policy strictness | Strict (no unsafe-inline) vs practical (allow unsafe-inline for dev) | Affects development experience and security | ⬜ Open |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cold start times exceed target | Low | Medium | Use lazy loading for non-critical middleware, minimize dependencies |
| Rate limit storage unavailable | Low | Medium | Fail open strategy - allow requests when storage is unavailable |
| CSP blocks legitimate resources | Medium | Medium | Start with report-only mode, iterate based on violations |
| Edge runtime API limitations | Low | High | Thoroughly test all utilities in edge environment during development |

## Estimated Effort

| Metric | Value |
|--------|-------|
| Total Stories | 7 |
| Total Hours | 32h |
| Calendar Days | 3-4 days |
| Parallel Tracks | 5 (S2-S6 can run in parallel) |

### Story Breakdown

| Size | Count | Hours |
|------|-------|-------|
| XS (1-2h) | 0 | 0h |
| S (2-4h) | 4 | 14h |
| M (4-8h) | 3 | 18h |
| L (8-16h) | 0 | 0h |

## References

### Internal Documentation

- [PRD: Feature M.4 - Authentication & Authorization](/docs/1-product/1-prd.md#feature-m4-authentication--authorization)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad.md#edge-middleware-architecture)
- [TAD: Edge Middleware Architecture (Detailed)](/docs/2-technical/2-tad-edge-middleware.md)
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)

### ADRs

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Content Security Policy MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
