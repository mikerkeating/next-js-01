# Story 3A.2.S4: Integrate Analytics

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: [S1: Initialize Routing Application](./S1-initialize-routing-app.md)
- **Blocks**: [S6: Create Responsive Shell Layout](./S6-responsive-shell.md)
- **Runs in Parallel With**: [S2: Implement Rewrite Configuration Framework](./S2-rewrite-framework.md), [S3: Build SEO Utilities](./S3-seo-utilities.md), [S5: Configure CDN Asset References](./S5-cdn-integration.md)

## User Story

**As a** Product Manager
**I want** analytics tracking integrated into the routing application shell
**So that** we can measure user engagement, track page views, and monitor Core Web Vitals for data-driven product decisions

## Acceptance Criteria

- [ ] Vercel Analytics SDK integrated and tracking page views automatically
- [ ] Vercel Speed Insights tracking Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
- [ ] PostHog initialized and ready for custom event tracking (optional, configurable)
- [ ] Web Vitals data sent to both Vercel Analytics and PostHog
- [ ] Analytics respects user consent and privacy preferences
- [ ] Analytics disabled in development environment to avoid polluting production data
- [ ] Custom tracking utilities available for future event tracking needs
- [ ] Documentation explains how to track custom events and user properties

## Technical Requirements

### Files to Create

| Path                                                 | Purpose                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `apps/routing/src/lib/analytics/posthog.ts`          | PostHog initialization and tracking utilities |
| `apps/routing/src/lib/analytics/web-vitals.ts`       | Web Vitals tracking and reporting             |
| `apps/routing/src/lib/analytics/constants.ts`        | Analytics event names and constants           |
| `apps/routing/src/components/analytics-provider.tsx` | Client-side analytics provider component      |
| `apps/routing/tests/analytics/web-vitals.test.ts`    | Unit tests for Web Vitals tracking            |
| `apps/routing/tests/analytics/posthog.test.ts`       | Unit tests for PostHog utilities              |
| `apps/routing/docs/ANALYTICS.md`                     | Analytics integration documentation           |

### Files to Modify

| Path                              | Changes                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `apps/routing/app/layout.tsx`     | Add Vercel Analytics, Speed Insights, and analytics provider     |
| `apps/routing/.env.local.example` | Add PostHog environment variables (NEXT_PUBLIC_POSTHOG_KEY, etc) |
| `apps/routing/README.md`          | Add section linking to ANALYTICS.md                              |
| `apps/routing/package.json`       | Add analytics dependencies                                       |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/routing
cd apps/routing

# Install Vercel Analytics and Speed Insights
pnpm add @vercel/analytics @vercel/speed-insights

# Install PostHog (optional)
pnpm add posthog-js

# Install Web Vitals library
pnpm add web-vitals
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting               | Requirement                                     | TAD Reference                                                              |
| --------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| Environment Detection | Disable analytics in development environment    | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture) |
| PostHog API Key       | Optional public API key for PostHog integration | [TAD: Observability](/docs/2-technical/2-tad-observability.md)             |
| PostHog Host          | Custom PostHog instance URL (optional)          | [TAD: Observability](/docs/2-technical/2-tad-observability.md)             |
| Consent Management    | Respect user privacy preferences                | [EPIC: Technical Constraints](./EPIC.md#technical-constraints)             |
| Web Vitals Sampling   | Track all vitals in production                  | [TAD: Observability](/docs/2-technical/2-tad-observability.md)             |
| Vercel Analytics Mode | Auto-inject in production via Vercel            | [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)     |

**Configuration Rationale**:

- Vercel Analytics and Speed Insights are built-in and zero-config for Vercel deployments
- PostHog provides product analytics and feature flags for advanced use cases
- Web Vitals tracking enables performance monitoring and optimization
- Environment detection prevents development activity from polluting analytics data
- Privacy-first approach ensures compliance with GDPR and user consent requirements

For complete analytics integration patterns, see: [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)

## Test Requirements

### Manual Verification

- [ ] **Vercel Analytics Dashboard**: Deploy to Vercel preview environment and verify page views appear in dashboard
- [ ] **Speed Insights Data**: Verify Core Web Vitals data appears in Vercel Speed Insights dashboard
- [ ] **PostHog Events**: If configured, verify web vitals events appear in PostHog dashboard
- [ ] **Development Mode**: Confirm analytics are disabled in local development (check browser network tab)
- [ ] **Console Logs**: Verify no analytics errors in browser console (production and development)

### Automated Tests

- [ ] Unit: `web-vitals.test.ts` - Web Vitals tracking initializes correctly
- [ ] Unit: `web-vitals.test.ts` - Metrics sent to analytics providers with correct format
- [ ] Unit: `posthog.test.ts` - PostHog initialization respects environment variable
- [ ] Unit: `posthog.test.ts` - PostHog tracking disabled when key not configured

### Integration Tests

- [ ] Vercel Analytics component renders without errors in production build
- [ ] Speed Insights component renders without errors in production build
- [ ] Web Vitals metrics are captured on page load
- [ ] Analytics provider initializes PostHog only when configured
- [ ] Environment detection correctly disables tracking in development

### Verification Commands

```bash
# Navigate to routing app
cd apps/routing

# Type check
pnpm type-check

# Run tests
pnpm test

# Build production bundle
pnpm build

# Start production server locally
pnpm start

# Verify analytics components in production build
# Open http://localhost:3000 and check browser DevTools Network tab
# Should see requests to Vercel Analytics (va.vercel-scripts.com)
# Should see Speed Insights requests (vitals.vercel-insights.com)

# Verify development mode disables analytics
pnpm dev
# Open http://localhost:3000 and check browser DevTools Network tab
# Should NOT see analytics requests in development
```

## Implementation Notes

### Implementation Sequence

1. **Install Analytics Dependencies**
   - Add Vercel Analytics and Speed Insights packages
   - Add PostHog SDK (optional but recommended)
   - Add Web Vitals library for custom tracking

2. **Implement Web Vitals Tracking**
   - Create utility to capture Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
   - Send metrics to Vercel Analytics automatically
   - Send metrics to PostHog if configured
   - Add environment detection to disable in development

3. **Create PostHog Integration**
   - Initialize PostHog with API key from environment
   - Implement tracking utilities (identify user, track event, reset)
   - Add consent management support
   - Configure autocapture settings (disabled by default)

4. **Create Analytics Provider Component**
   - Client-side component to initialize analytics
   - Wrap PostHog initialization with environment checks
   - Initialize Web Vitals tracking on mount
   - Handle analytics errors gracefully

5. **Integrate into Root Layout**
   - Add Vercel Analytics component to layout
   - Add Speed Insights component to layout
   - Wrap children with analytics provider
   - Verify components are client-side only

6. **Configure Environment Variables**
   - Add NEXT_PUBLIC_POSTHOG_KEY to .env.local.example
   - Add NEXT_PUBLIC_POSTHOG_HOST to .env.local.example (optional)
   - Document environment variable purposes
   - Note that Vercel Analytics requires no configuration

7. **Create Documentation**
   - Document how to track custom events with PostHog
   - Explain Web Vitals metrics and thresholds
   - Provide examples for common tracking patterns
   - Include troubleshooting guide for analytics issues

8. **Write Tests**
   - Unit tests for Web Vitals tracking
   - Unit tests for PostHog initialization
   - Environment detection tests
   - Error handling tests

### Key Concepts

- **Vercel Analytics**: Automatic page view tracking and visitor analytics built into Vercel platform
- **Speed Insights**: Real User Monitoring (RUM) for Core Web Vitals performance metrics
- **PostHog**: Product analytics platform for custom event tracking, feature flags, and session replay
- **Core Web Vitals**: Google's performance metrics (LCP, FID, CLS) that impact SEO and user experience
- **Web Vitals Library**: Official library from Google for measuring performance metrics
- **Privacy-First Analytics**: Analytics that respect user consent and don't collect PII

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Web Vitals Tracking](/docs/2-technical/2-tad-observability.md#web-vitals-tracking)
- [TAD: PostHog Integration](/docs/2-technical/2-tad-observability.md#monitoring-dashboard-integration)

Key pattern notes for this story:

- Use Next.js `'use client'` directive for analytics components (client-side only)
- Initialize analytics in root layout for app-wide coverage
- Check environment variables before initializing PostHog to support optional integration
- Use web-vitals library's onXXX functions to capture metrics as they occur
- Send metrics to multiple providers (Vercel, PostHog) for redundancy and different use cases

### Troubleshooting

| Issue                                       | Cause                                      | Solution                                                      |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Analytics not appearing in Vercel dashboard | Vercel Analytics not enabled for project   | Enable Analytics in Vercel project settings                   |
| PostHog events not tracking                 | Missing or incorrect API key               | Verify NEXT_PUBLIC_POSTHOG_KEY in environment variables       |
| Analytics running in development            | Environment detection not working          | Ensure VERCEL_ENV or NODE_ENV set correctly                   |
| Web Vitals metrics missing                  | Web Vitals library not initialized         | Verify web-vitals library installed and tracking initialized  |
| Console errors about analytics              | Analytics SDK version mismatch             | Update to latest @vercel/analytics and @vercel/speed-insights |
| Hydration errors with analytics             | Analytics components not client-side       | Ensure 'use client' directive on analytics components         |
| Speed Insights not showing data             | Preview deployments don't track by default | Deploy to production or enable in project settings            |

### Reference Materials

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [PostHog Next.js Integration](https://posthog.com/docs/libraries/next-js)
- [Web Vitals Library Documentation](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Google Analytics 4 Migration Guide](https://support.google.com/analytics/answer/9744165)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Install dependencies and configure environment: 0.5h
- Implement Web Vitals tracking: 1h
- Implement PostHog integration: 0.5h
- Integrate into root layout: 0.5h
- Documentation and testing: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md) - Vercel Analytics built-in with hosting platform
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md#monitoring-dashboard-integration) - Analytics provider selection and integration patterns
- [EPIC: Technical Constraints](./EPIC.md#technical-constraints) - PostHog for product analytics, Vercel for performance

### Story-Specific Decisions

#### AD-3A.2.S4.1: PostHog as Optional Dependency

**Scope**: Story-specific (does not affect other stories)

**Decision**: Make PostHog integration optional and configurable via environment variables, allowing the routing shell to function with or without advanced analytics.

**Rationale**:

- Routing shell is generic infrastructure that shouldn't require all analytics features
- PostHog provides advanced features (feature flags, session replay) not needed initially
- Vercel Analytics provides sufficient basic analytics for shell monitoring
- Optional integration reduces dependencies and configuration complexity
- Future product apps can enable PostHog when they need advanced features

**Consequences**:

- PostHog SDK installed but only initialized when NEXT_PUBLIC_POSTHOG_KEY is set
- Analytics provider checks for PostHog availability before sending events
- Shell remains functional without PostHog configuration
- Documentation must clearly explain when to enable PostHog
- Future epics can enable PostHog for product-specific tracking needs

**Alternatives Considered**:

- **Option 1**: Require PostHog for all deployments - Rejected because it adds unnecessary complexity for basic shell
- **Option 2**: Skip PostHog entirely - Rejected because advanced analytics will be needed by product apps

#### AD-3A.2.S4.2: Web Vitals Multi-Provider Strategy

**Scope**: Story-specific (does not affect other stories)

**Decision**: Send Web Vitals metrics to both Vercel Speed Insights and PostHog (when configured) for redundancy and different analysis capabilities.

**Rationale**:

- Vercel Speed Insights provides excellent RUM dashboard and trend analysis
- PostHog allows custom queries, segmentation, and correlation with user events
- Dual tracking provides backup if one provider has issues
- Minimal performance overhead (metrics computed once, sent to multiple endpoints)
- Each provider offers unique analysis capabilities

**Consequences**:

- Web Vitals metrics appear in both Vercel and PostHog dashboards
- Slight increase in network requests (negligible impact)
- Provides flexibility to choose preferred analytics interface
- Teams can use different tools for different analysis needs

**Alternatives Considered**:

- **Option 1**: Only Vercel Speed Insights - Rejected because PostHog provides richer querying
- **Option 2**: Only PostHog - Rejected because Vercel Speed Insights is built-in and excellent for RUM

## Out of Scope

The following items are explicitly NOT part of this story:

- **Google Analytics 4 Integration** - GA4 is for marketing analytics; deferred to Epic 3B.5 (Marketing Application)
- **Custom Event Tracking Implementation** - Shell has no user events yet; custom tracking added in Epic 3B.3 (Product Routes)
- **User Identification** - User tracking requires authentication; implemented in Epic 2A.7 (Auth Infrastructure)
- **A/B Testing Framework** - Experimentation features deferred to analytics infrastructure epic
- **Session Replay** - PostHog session replay enabled later when needed for debugging
- **Heatmaps and Click Tracking** - Advanced UX analytics deferred to product-specific epics
- **Conversion Tracking** - No conversion funnels in shell; added with product features
- **Analytics Consent Banner** - Cookie consent UI deferred to Epic 2B.6 (Product Middleware)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Initialize Routing Application - Requires Next.js App Router structure and root layout.tsx

### Enables (Unblocks These Stories)

- **S6**: Create Responsive Shell Layout - Requires analytics to track shell performance
- **Epic 2A.4**: Analytics Infrastructure Package - Shell integration serves as reference implementation
- **Epic 3B.3**: Routing Configuration (Product Routes) - Product routes will use analytics utilities for custom tracking

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Key Deliverables](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md)

### ADR References

- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [PostHog Next.js Docs](https://posthog.com/docs/libraries/next-js)
- [Web Vitals](https://web.dev/vitals/)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Initialize Routing Application) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Vercel project created (for Analytics dashboard access)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully with strict mode
- [ ] All analytics tests passing (unit + integration)
- [ ] No console errors in production build
- [ ] Analytics disabled in development environment
- [ ] PostHog gracefully handles missing API key

### Documentation

- [ ] ANALYTICS.md created with tracking examples
- [ ] README.md updated with link to analytics documentation
- [ ] Environment variables documented in .env.local.example
- [ ] Code comments added for analytics initialization
- [ ] Architecture decisions documented in this story

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `feat(3A.2.S4): integrate analytics`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Analytics Provider Component Template

Example structure for client-side analytics initialization:

```typescript
// apps/routing/src/components/analytics-provider.tsx
'use client';

import { useEffect } from 'react';
import { initPostHog } from '@/lib/analytics/posthog';
import { reportWebVitals } from '@/lib/analytics/web-vitals';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog if configured
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      initPostHog();
    }

    // Initialize Web Vitals tracking
    reportWebVitals();
  }, []);

  return <>{children}</>;
}
```

## Appendix B: Web Vitals Tracking Example

Example Web Vitals implementation pattern:

```typescript
// apps/routing/src/lib/analytics/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

export function reportWebVitals(): void {
  function sendToAnalytics(metric: Metric): void {
    // Metrics automatically sent to Vercel Speed Insights
    // Optionally send to PostHog if configured
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("web_vital", {
        metric_name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
    }
  }

  // Core Web Vitals
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

## Appendix C: Environment Variables

Example environment configuration:

```bash
# apps/routing/.env.local.example

# PostHog (Optional - enables product analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Vercel Analytics and Speed Insights
# No configuration needed - automatically enabled on Vercel
```
