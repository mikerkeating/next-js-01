# Epic 3A.2: Routing Application Shell

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature M.3 Organization-Specific Content Views](/docs/1-product/1-prd.md#feature-m3-Organization-specific-content-views)
- **TAD Reference**: [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture), [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md)
- **Phase**: 3A - Platform Applications
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                     | Reason                                                                          |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 3A.1 | [CDN & Asset Management Application](../3A.1-cdn/EPIC.md) | Routing shell requires CDN infrastructure for asset references and optimization |
| 2A.8 | [API Client Package](../2A.8-api-client/EPIC.md)          | API client needed for server-side data fetching                                 |

### Blocks (Enables These Epics)

| Epic | Title                                                                    | What This Provides                                                 |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 3B.3 | [Routing Configuration (Product Routes)](../3B.3-routing-config/EPIC.md) | Generic routing shell enables product-specific route configuration |
| 3B.4 | [Documentation Application](../3B.4-docs-app/EPIC.md)                    | Routing infrastructure for docs app integration                    |
| 3B.5 | [Demo & Marketing Application](../3B.5-demo-marketing/EPIC.md)           | Routing infrastructure for demo/marketing apps                     |

### Can Run in Parallel With

| Epic | Title                                                        | Notes                                                 |
| ---- | ------------------------------------------------------------ | ----------------------------------------------------- |
| 2B.1 | [Product Database Schema](../2B.1-product-schema/EPIC.md)    | Product schema is independent of routing shell        |
| 2B.2 | [Multi-Tenant Organization Model](../2B.2-org-model/EPIC.md) | Organization model can be developed alongside routing |

## Overview

This epic establishes the main routing application shell using Next.js 16 App Router, providing the generic infrastructure for all product applications. The routing shell handles URL management, SEO optimization, analytics integration, and serves as the entry point for the platform.

**Key Deliverables:**

- Next.js 16 routing application at `/apps/routing`
- Rewrite configuration framework for multi-app delegation
- SEO utilities (meta tags, sitemap generation, robots.txt)
- Analytics integration with Vercel Analytics
- CDN asset reference integration
- Mobile responsive shell with Lighthouse SEO > 90

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Routing application serves requests at `/apps/routing` with Next.js 16 App Router
- [ ] Developers can configure URL rewrites to delegate to other apps without modifying core routing logic
- [ ] All pages include proper SEO meta tags and generate sitemap.xml and robots.txt automatically
- [ ] Page views and user interactions are tracked through Vercel Analytics integration
- [ ] Static assets are served from CDN with proper cache headers and content-hashed URLs
- [ ] Lighthouse SEO audit scores > 90 on all shell pages
- [ ] Mobile responsive layout renders correctly across viewport sizes (320px - 2560px)
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID  | Title                                                                  | Size | Status | Depends On     | Blocks         |
| --- | ---------------------------------------------------------------------- | ---- | ------ | -------------- | -------------- |
| S1  | [Initialize Routing Application](./S1-initialize-routing-app.md)       | M    | ⬜     | -              | S2, S3, S4, S5 |
| S2  | [Implement Rewrite Configuration Framework](./S2-rewrite-framework.md) | M    | ⬜     | S1             | S6             |
| S3  | [Build SEO Utilities](./S3-seo-utilities.md)                           | M    | ⬜     | S1             | S6             |
| S4  | [Integrate Analytics](./S4-analytics-integration.md)                   | S    | ⬜     | S1             | S6             |
| S5  | [Configure CDN Asset References](./S5-cdn-integration.md)              | S    | ⬜     | S1             | S6             |
| S6  | [Create Responsive Shell Layout](./S6-responsive-shell.md)             | M    | ⬜     | S2, S3, S4, S5 | S7             |
| S7  | [Testing and Documentation](./S7-testing-documentation.md)             | M    | ⬜     | S6             | -              |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Initialize routing app)
 ├──→ S2 (Rewrite framework)
 ├──→ S3 (SEO utilities)
 ├──→ S4 (Analytics integration)
 └──→ S5 (CDN integration)
       ↓
      S6 (Responsive shell layout)
       ↓
      S7 (Testing & documentation)
```

**Parallel Execution Notes:**

- S2, S3, S4, and S5 can run in parallel after S1 completes
- S6 requires all four middleware stories (S2-S5) to complete for full integration
- S7 is the final story requiring the complete shell

## Technical Constraints

### Required Patterns

- **Next.js App Router**: Use App Router exclusively (no Pages Router) per [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)
- **Server Components First**: Default to Server Components, use Client Components only when interactivity required per [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)
- **CDN Cache Headers**: All static assets must use immutable cache headers (1 year) per [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#caching-strategy)

### Technology Decisions

| Decision  | Choice                     | Reference                                                                             |
| --------- | -------------------------- | ------------------------------------------------------------------------------------- |
| Framework | Next.js 16 with App Router | [ADR-003: Next.js Framework](/docs/2-technical/adr/003-nextjs-framework.md)           |
| Hosting   | Vercel Edge Network        | [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)                |
| Analytics | Vercel Analytics + PostHog | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Styling   | Tailwind CSS v4            | [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack)                  |

### Constraints

- **Generic Only**: This epic creates the routing shell without product-specific routes (those are in Epic 3B.3)
- **No Business Logic**: Routing shell contains no product-specific business logic
- **Edge-Compatible**: All middleware must be Edge-runtime compatible for <50ms latency
- **Accessibility**: Shell must meet WCAG 2.1 Level AA standards

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Product-Specific Routes** - Handled in Epic 3B.3 (Routing Configuration)
- **Product-Specific Pages** - Each product app (docs, demo, tools) creates its own pages
- **Authentication Middleware** - Handled in Epic 2A.7 (Auth Infrastructure)
- **Organization Context Middleware** - Handled in Epic 2B.6 (Product Middleware)
- **Custom Error Pages (Product)** - Generic 404/500 only; product-specific errors in respective apps

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                    | Options                         | Impact                          | Status                                                        |
| --------------------------- | ------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| Analytics provider priority | PostHog primary vs. GA4 primary | Affects tracking implementation | ✅ Resolved: PostHog for product analytics, GA4 for marketing |
| Sitemap generation approach | Build-time vs. on-demand        | Affects deployment workflow     | ⬜ Open                                                       |

## Risks and Mitigations

| Risk                               | Likelihood | Impact | Mitigation                                                             |
| ---------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| Next.js 16 App Router edge cases   | Med        | Med    | Use stable patterns, reference Next.js docs, test thoroughly           |
| Rewrite conflicts between apps     | Low        | High   | Establish clear URL namespace conventions documented in routing config |
| Lighthouse score regression        | Low        | Med    | Add CI checks for Lighthouse scores, automated audits on PR            |
| Mobile layout issues on edge cases | Med        | Low    | Test across device matrix, use responsive design tokens                |

## Estimated Effort

| Metric          | Value              |
| --------------- | ------------------ |
| Total Stories   | 7                  |
| Total Hours     | 38h                |
| Calendar Days   | 4-5 days           |
| Parallel Tracks | 4 (S2-S5 parallel) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 2     | 6h    |
| M (4-8h)  | 5     | 32h   |
| L (8-16h) | 0     | 0h    |

## References

### Internal Documentation

- [PRD: Feature M.3 Organization-Specific Content Views](/docs/1-product/1-prd.md#feature-m3-Organization-specific-content-views)
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)
- [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md)
- [Roadmap: Phase 3A](/docs/1-product/3-roadmap.md#phase-3a-platform-applications-week-4)

### ADRs

- [ADR-003: Next.js 16 as Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Google Lighthouse SEO Audit](https://developer.chrome.com/docs/lighthouse/seo/)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
