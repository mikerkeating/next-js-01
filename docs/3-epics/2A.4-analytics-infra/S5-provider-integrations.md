# Story 2A.4.S5: Integrate Analytics Providers

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S2: Core Event Tracking](./S2-core-event-tracking.md), [S4: Consent Management](./S4-consent-management.md)
- **Blocks**: [S6: Component Tracking Utilities](./S6-component-tracking.md), [S7: Feature Flag Utilities](./S7-feature-flags.md)
- **Runs in Parallel With**: None (requires S2 and S4 completion)

## User Story

**As a** developer building applications on the platform
**I want** events to be automatically routed to PostHog, GA4, and Vercel Analytics
**So that** I can track product analytics, marketing attribution, and performance metrics without managing multiple SDK integrations

## Acceptance Criteria

- [ ] Events dispatched via `trackEvent()` are routed to all configured providers (PostHog, GA4, Vercel Analytics)
- [ ] Provider SDKs are initialized with correct API keys from environment variables
- [ ] Events are only sent to providers after user consent is obtained
- [ ] Provider initialization is lazy-loaded to minimize bundle size impact
- [ ] Each provider receives events in its expected format (transformed from generic event structure)
- [ ] Provider failures are logged but do not block event dispatch to other providers
- [ ] Server-side events can be tracked via GA4 Measurement Protocol
- [ ] Client-side providers support both page view and custom event tracking
- [ ] Provider integrations are tree-shakeable (unused providers not included in bundle)
- [ ] PostHog session replay can be enabled/disabled via configuration
- [ ] GA4 consent mode (Advanced) is properly configured

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/analytics/src/providers/posthog.ts` | PostHog provider integration |
| `packages/analytics/src/providers/ga4.ts` | Google Analytics 4 provider integration |
| `packages/analytics/src/providers/vercel.ts` | Vercel Analytics provider integration |
| `packages/analytics/src/providers/index.ts` | Provider registry and routing logic |
| `packages/analytics/src/providers/types.ts` | Provider interface definitions |
| `packages/analytics/src/config.ts` | Provider configuration and environment variables |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/analytics/src/index.ts` | Export provider configuration utilities |
| `packages/analytics/src/core/tracker.ts` | Integrate provider routing into event dispatcher |
| `packages/analytics/package.json` | Add provider SDK dependencies |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to analytics package
cd packages/analytics

# Install provider SDKs
pnpm add posthog-js
pnpm add @vercel/analytics @vercel/speed-insights
```

**Note**: GA4 uses Measurement Protocol (HTTP API), no SDK dependency required.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance URL (defaults to PostHog Cloud EU) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | GA4 measurement ID (G-XXXXXXXXXX) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| `GA4_API_SECRET` | GA4 Measurement Protocol secret (server-side only) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| `VERCEL_ANALYTICS_ID` | Auto-configured by Vercel (optional override) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |

**Configuration Rationale**:
- PostHog requires EU region hosting for GDPR compliance per [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- GA4 Advanced Consent Mode ensures accurate conversion modeling while respecting user privacy
- Vercel Analytics auto-configures when deployed to Vercel platform
- Server-side GA4 API secret enables server component event tracking

**Environment Variable Validation**: Use `@t3-oss/env-nextjs` per [TAD: Environment & Validation](/docs/2-technical/2-tad.md#environment--validation)

## Test Requirements

### Manual Verification

- [ ] **PostHog Events**: Open PostHog dashboard, trigger test event, verify event appears in Live Events
- [ ] **GA4 Events**: Open GA4 DebugView, trigger test event with `?debug_mode=true`, verify event appears
- [ ] **Vercel Analytics**: Deploy to Vercel staging, trigger page view, verify in Vercel Analytics dashboard
- [ ] **Consent Blocking**: Revoke consent, trigger event, verify no network requests to analytics providers
- [ ] **Provider Failure**: Block PostHog domain, trigger event, verify GA4/Vercel still receive event
- [ ] **Bundle Size**: Run `pnpm build` and verify analytics bundle is <10KB gzipped

### Automated Tests

- [ ] Unit: `providers/posthog.test.ts` - PostHog initialization, event formatting, session replay toggle
- [ ] Unit: `providers/ga4.test.ts` - GA4 client/server event dispatch, consent mode integration
- [ ] Unit: `providers/vercel.test.ts` - Vercel Analytics integration, page view tracking
- [ ] Unit: `providers/index.test.ts` - Provider registry, multi-provider routing, failure isolation
- [ ] Integration: `core/tracker.test.ts` - End-to-end event flow with consent + provider routing

### Integration Tests

- [ ] Event routed to all providers when consent granted - Verify parallel dispatch to PostHog, GA4, Vercel
- [ ] Event blocked from all providers when consent denied - Verify no network requests initiated
- [ ] Provider failure isolation - Mock PostHog failure, verify GA4/Vercel still receive events
- [ ] Server-side GA4 tracking - Verify Measurement Protocol API called with correct payload
- [ ] GA4 consent mode state changes - Verify consent update signals sent on opt-in/opt-out

### Verification Commands

```bash
# Build and check bundle size
cd packages/analytics
pnpm build
ls -lh dist/ | grep -E '\.js|\.mjs'

# Run provider integration tests
pnpm test providers/

# Type-check provider integrations
pnpm type-check

# Verify tree-shaking (unused providers excluded)
pnpm build --metafile && pnpm analyze-bundle
```

## Implementation Notes

### Implementation Sequence

1. **Create Provider Interface**
   - Define `AnalyticsProvider` interface in `types.ts`
   - Define provider lifecycle methods: `initialize()`, `trackEvent()`, `trackPageView()`, `setUser()`
   - Define provider configuration type with consent integration

2. **Implement PostHog Provider**
   - Initialize PostHog client with lazy loading
   - Map generic events to PostHog event format
   - Implement session replay toggle
   - Handle PostHog feature flags (separate from S7)

3. **Implement GA4 Provider**
   - Client-side: Use gtag.js with Advanced Consent Mode
   - Server-side: Implement Measurement Protocol HTTP client
   - Map generic events to GA4 event schema (event_name, event_params)
   - Handle consent mode state changes (granted, denied)

4. **Implement Vercel Analytics Provider**
   - Initialize `@vercel/analytics` with auto-configuration
   - Map page views and custom events
   - Integrate `@vercel/speed-insights` for Web Vitals

5. **Build Provider Registry**
   - Create provider registry with conditional loading based on env vars
   - Implement multi-provider event routing with Promise.allSettled
   - Add error handling and logging for provider failures
   - Ensure providers only initialize after consent obtained

6. **Integrate with Core Tracker**
   - Modify `trackEvent()` to route through provider registry
   - Integrate consent check before provider dispatch
   - Add provider initialization on first event post-consent

### Key Concepts

- **Provider Abstraction**: Generic interface allows adding new providers without changing core tracking logic
- **Lazy Initialization**: Provider SDKs only loaded when first event tracked (reduces initial bundle size)
- **Consent-First**: No provider initialization until explicit user consent obtained per GDPR
- **Failure Isolation**: Provider failures logged but don't block other providers via Promise.allSettled
- **Tree-Shaking**: Conditional exports allow unused providers to be excluded from production builds

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Key pattern notes for this story:

- **Dynamic Provider Loading**: Use dynamic imports (`import()`) to lazy-load provider SDKs
- **Event Transformation**: Each provider receives events in its native format (PostHog properties, GA4 parameters, etc.)
- **Consent Integration**: Reference consent state from S4 before any provider action
- **Error Boundaries**: Wrap provider calls in try-catch to prevent SDK errors from breaking app

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| PostHog events not appearing | EU region not configured | Set `NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com` |
| GA4 DebugView empty | Debug mode not enabled | Add `?debug_mode=true` to URL or set via gtag config |
| Vercel Analytics missing | Not deployed to Vercel | Analytics only active in Vercel deployments (staging/prod) |
| Large bundle size | All providers bundled | Verify tree-shaking config; use conditional exports |
| "Consent not granted" errors | Consent checked before initialization | Ensure consent obtained before calling provider methods |
| GA4 consent mode errors | Advanced mode not configured | Set consent mode defaults in gtag initialization |

### Reference Materials

- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js)
- [PostHog React Integration](https://posthog.com/docs/libraries/react)
- [Google Analytics 4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## Estimated Effort

**Size**: L (12h)

**Breakdown**:

- Provider interface design: 1h
- PostHog integration: 3h
- GA4 integration (client + server): 4h
- Vercel Analytics integration: 1h
- Provider registry and routing: 2h
- Testing and verification: 1h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - Provider selection rationale (PostHog, GA4, Vercel)
- [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture) - GDPR compliance and consent-first tracking
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - Tree-shaking and bundle size constraints

### Story-Specific Decisions

#### AD-2A.4.S5.1: PostHog Cloud EU Region

**Scope**: Story-specific (provider configuration choice)

**Decision**: Use PostHog Cloud EU region (`https://eu.posthog.com`) as default host

**Rationale**:
- GDPR compliance requires data residency in EU for European users
- PostHog Cloud EU provides same features as US region with EU data storage
- Simpler than self-hosting PostHog instance for MVP

**Consequences**:
- Positive: GDPR-compliant by default
- Positive: No infrastructure overhead for PostHog hosting
- Negative: Slight latency increase for non-EU users (acceptable for analytics)

**Alternatives Considered**:
- **Self-hosted PostHog**: Rejected due to operational complexity and maintenance overhead
- **PostHog Cloud US**: Rejected due to GDPR data residency requirements

#### AD-2A.4.S5.2: GA4 Measurement Protocol for Server-Side Tracking

**Scope**: Story-specific (server-side implementation choice)

**Decision**: Use GA4 Measurement Protocol (HTTP API) instead of server-side SDK

**Rationale**:
- No official Node.js SDK for GA4 (only Firebase SDK, which is overkill)
- Measurement Protocol is lightweight HTTP API, no dependencies
- Consistent with Google's recommendation for server-side tracking

**Consequences**:
- Positive: Zero dependencies for server-side GA4 tracking
- Positive: Simple HTTP requests, easy to test and debug
- Negative: Manual event schema mapping (vs SDK abstraction)

**Alternatives Considered**:
- **gtag.js in Server Components**: Rejected because gtag.js is client-side only
- **Firebase SDK**: Rejected due to excessive dependencies and complexity

#### AD-2A.4.S5.3: Promise.allSettled for Multi-Provider Dispatch

**Scope**: Story-specific (error handling strategy)

**Decision**: Use `Promise.allSettled()` instead of `Promise.all()` for provider event dispatch

**Rationale**:
- Provider failures should not block other providers from receiving events
- `allSettled` continues execution even if one provider rejects
- Allows logging individual provider failures while maintaining system resilience

**Consequences**:
- Positive: Provider failures isolated (PostHog down doesn't affect GA4/Vercel)
- Positive: Comprehensive error logging (know which provider failed)
- Negative: Slightly more complex error handling logic

**Alternatives Considered**:
- **Promise.all()**: Rejected because one provider failure would abort all dispatches
- **Sequential dispatch**: Rejected due to performance impact (serial vs parallel)

## Out of Scope

The following items are explicitly NOT part of this story:

- **PostHog Feature Flags Integration** - Deferred to S7 (Feature Flag Utilities)
- **Product-Specific Event Schemas** - Deferred to Epic 2B.3 (Product Analytics Events & Taxonomy)
- **Custom Analytics Dashboards** - Use PostHog/GA4 built-in dashboards
- **Real-Time Analytics Streaming** - Batch event dispatch sufficient for MVP
- **Cookie Banner UI** - Infrastructure only; UI deferred to Epic 2A.5 or product apps
- **Server-Side PostHog Integration** - PostHog client-side only for MVP; server-side deferred
- **Advanced GA4 Conversion Tracking** - Basic event tracking only; conversion goals configured in GA4 UI
- **Attribution Modeling** - Handled natively by GA4; no custom implementation needed

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Core Event Tracking** - Provides `trackEvent()` function and event dispatcher infrastructure
- **S4: Consent Management** - Provides consent state check before provider initialization

### Enables (Unblocks These Stories)

- **S6: Component Tracking Utilities** - Requires provider integrations to be functional for component event tracking
- **S7: Feature Flag Utilities** - PostHog provider integration needed for PostHog feature flags

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)

### External Documentation

- [PostHog JavaScript SDK Documentation](https://posthog.com/docs/libraries/js)
- [PostHog Session Replay](https://posthog.com/docs/session-replay)
- [Google Analytics 4 Measurement Protocol API Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference)
- [GA4 Consent Mode Implementation Guide](https://developers.google.com/tag-platform/security/guides/consent)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

## Verification Checklist

### Pre-Verification

- [ ] S2 (Core Event Tracking) completed
- [ ] S4 (Consent Management) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] PostHog account created with EU project
- [ ] GA4 property created with Measurement ID
- [ ] Vercel project deployed for analytics verification

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage > 80% for provider integration code

### Documentation

- [ ] Code comments for provider-specific configuration
- [ ] README updated with provider setup instructions
- [ ] Architecture decisions documented
- [ ] Environment variable requirements documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references story ID (2A.4.S5)

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Provider Event Format Examples

### PostHog Event Format

```typescript
// Generic event from trackEvent()
{
  name: "button_clicked",
  properties: { label: "Submit", page: "/contact" }
}

// Transformed to PostHog format
posthog.capture("button_clicked", {
  label: "Submit",
  page: "/contact"
})
```

### GA4 Event Format

```typescript
// Generic event
{
  name: "button_clicked",
  properties: { label: "Submit", page: "/contact" }
}

// Transformed to GA4 Measurement Protocol
POST https://www.google-analytics.com/mp/collect
{
  client_id: "<user-id>",
  events: [{
    name: "button_clicked",
    params: {
      label: "Submit",
      page: "/contact"
    }
  }]
}
```

### Vercel Analytics Event Format

```typescript
// Generic event
{
  name: "button_clicked",
  properties: { label: "Submit", page: "/contact" }
}

// Transformed to Vercel Analytics
import { track } from '@vercel/analytics';
track("button_clicked", { label: "Submit", page: "/contact" });
```

## Appendix B: GA4 Consent Mode Configuration

```typescript
// Initialize gtag with consent mode defaults
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});

// Update consent on user opt-in
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```
