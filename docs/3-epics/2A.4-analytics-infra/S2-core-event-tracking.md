# Story 2A.4.S2: Implement Core Event Tracking

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S1: Package Structure](./S1-package-structure.md)
- **Blocks**: [S3: Event Validation](./S3-event-validation.md), [S4: Consent Management](./S4-consent-management.md), [S5: Provider Integration](./S5-provider-integration.md), [S7: Feature Flags](./S7-feature-flags.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a simple `trackEvent()` function to track analytics events with type-safe properties
**So that** I can instrument my application with analytics without worrying about provider-specific implementations

## Acceptance Criteria

- [ ] `trackEvent(name, properties)` function is exported from `@repo/analytics`
- [ ] Events can be tracked with custom properties as key-value pairs
- [ ] Event queue system stores events when not ready to dispatch (pre-consent)
- [ ] TypeScript types enforce event name as string and properties as object
- [ ] Multiple events can be queued before providers are initialized
- [ ] Queue can be flushed or cleared based on external triggers (consent)
- [ ] Server-side and client-side contexts both supported
- [ ] All functions have JSDoc documentation
- [ ] Unit tests verify event queuing and basic tracking logic

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/analytics/src/tracking.ts` | Core event tracking implementation |
| `packages/analytics/src/queue.ts` | Event queue management |
| `packages/analytics/src/context.ts` | Analytics context detection (client/server) |
| `packages/analytics/__tests__/tracking.test.ts` | Unit tests for tracking functions |
| `packages/analytics/__tests__/queue.test.ts` | Unit tests for queue management |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/analytics/src/index.ts` | Export `trackEvent`, `flushQueue`, `clearQueue` functions |
| `packages/analytics/src/types.ts` | Add `AnalyticsEvent`, `EventProperties`, `AnalyticsContext` types |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**No new dependencies required for this story.** Event validation with Zod will be added in S3.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Event queue storage | In-memory array for MVP; localStorage support optional | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Event properties typing | Generic object with string keys and JSON-serializable values | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| Context detection | Detect client vs server environment using runtime checks | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Queue size limit | Optional max queue size (default: 100 events) to prevent memory issues | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |

**Configuration Rationale**: The event queue enables privacy-first analytics by allowing events to be collected before consent is obtained, then flushed or discarded based on user consent. In-memory storage is sufficient for MVP since queue lifetime is limited to session duration. TypeScript generics enable type-safe event properties while maintaining flexibility for different event schemas. Context detection ensures the tracking code works correctly in both React Server Components and client-side code.

For complete configuration templates, see: [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)

## Test Requirements

### Manual Verification

- [ ] **Import Test**: Create test file in a Next.js app that imports `trackEvent` from `@repo/analytics` and verify TypeScript autocomplete works
- [ ] **Queue Behavior**: Call `trackEvent()` multiple times before queue flush and verify events are stored correctly
- [ ] **Context Detection**: Verify tracking works in both client components and server components without errors

### Automated Tests

- [ ] Unit: `tracking.test.ts` - Verify `trackEvent()` adds events to queue with correct structure
- [ ] Unit: `tracking.test.ts` - Verify event metadata (timestamp, context) is automatically added
- [ ] Unit: `queue.test.ts` - Verify queue stores events in correct order (FIFO)
- [ ] Unit: `queue.test.ts` - Verify `flushQueue()` returns all queued events and clears queue
- [ ] Unit: `queue.test.ts` - Verify `clearQueue()` discards all queued events without returning them
- [ ] Unit: `queue.test.ts` - Verify queue respects max size limit and drops oldest events when full
- [ ] Unit: `context.test.ts` - Verify context detection correctly identifies client vs server environment

### Verification Commands

```bash
# Install dependencies and build
pnpm install
pnpm --filter @repo/analytics build

# Run unit tests
pnpm --filter @repo/analytics test

# Run tests with coverage
pnpm --filter @repo/analytics test:coverage

# Type checking
pnpm --filter @repo/analytics type-check

# Verify exports are accessible
node --input-type=module -e "import('@repo/analytics').then(m => console.log(m.trackEvent))"
```

## Implementation Notes

### Implementation Sequence

1. **Define Core Types**
   - Add `AnalyticsEvent` interface with `name`, `properties`, `timestamp`, `context` fields
   - Add `EventProperties` type as `Record<string, JsonValue>` for type-safe properties
   - Add `AnalyticsContext` type with `isClient`, `isServer`, `url`, `userAgent` fields

2. **Implement Event Queue**
   - Create in-memory array to store queued events
   - Implement `addToQueue(event)` private function
   - Implement `flushQueue()` function to return and clear all events
   - Implement `clearQueue()` function to discard all events
   - Add optional max queue size with FIFO eviction

3. **Implement Context Detection**
   - Create `getAnalyticsContext()` function to detect client vs server
   - Use `typeof window !== 'undefined'` for client detection
   - Capture URL from `window.location.href` (client) or `headers` (server)
   - Capture user agent from `navigator.userAgent` (client) or `headers` (server)

4. **Implement trackEvent Function**
   - Create `trackEvent(name, properties)` function
   - Generate timestamp using `new Date().toISOString()`
   - Call `getAnalyticsContext()` to capture environment context
   - Create `AnalyticsEvent` object with all metadata
   - Add event to queue using `addToQueue()`
   - Return void (fire-and-forget pattern)

5. **Export Public API**
   - Export `trackEvent`, `flushQueue`, `clearQueue` from `index.ts`
   - Add JSDoc comments with usage examples
   - Document return types and parameters

6. **Write Unit Tests**
   - Test event structure and metadata
   - Test queue operations (add, flush, clear)
   - Test queue size limits
   - Test context detection in different environments
   - Achieve >80% code coverage

### Key Concepts

- **Event Queue**: Buffer for analytics events before they can be dispatched to providers (pending consent or initialization)
- **Fire-and-Forget**: `trackEvent()` is synchronous and doesn't return promises; errors are handled internally to avoid blocking application code
- **Context Metadata**: Automatically captured environment information (client/server, URL, user agent) enriches events for debugging
- **Type Safety**: TypeScript generics allow custom event properties while maintaining type checking
- **Privacy-First**: Queue enables consent-first architecture where events can be discarded if consent is denied

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)

Key pattern notes for this story:

- Use singleton pattern for event queue to ensure consistent state across imports
- Use type guards (`typeof window !== 'undefined'`) for safe client/server detection
- Follow fire-and-forget pattern for analytics to prevent blocking user interactions
- Use ISO 8601 timestamps for consistent time representation across timezones

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| TypeScript error on `trackEvent()` import | Package not built or types not generated | Run `pnpm build --filter @repo/analytics` |
| Events not queuing in server components | Context detection failing on server | Verify environment detection uses safe checks (typeof window) |
| Queue growing unbounded | No max size limit implemented | Add optional `maxQueueSize` configuration with FIFO eviction |
| Missing event metadata | Context function not called | Ensure `getAnalyticsContext()` is called in `trackEvent()` |
| Tests fail with "window is not defined" | Test environment not configured | Use happy-dom or jsdom for browser API tests |

### Reference Materials

- [PostHog Event Tracking Best Practices](https://posthog.com/docs/product-analytics/capture-events)
- [TypeScript Generics Handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Vitest Testing Guide](https://vitest.dev/guide/)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions and context detection: 1h
- Event queue implementation: 1.5h
- trackEvent function and exports: 1h
- Unit tests (7 test cases): 2h
- Documentation and verification: 0.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - Overall analytics strategy and privacy-first approach
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - Monorepo package patterns and TypeScript configuration

### Story-Specific Decisions

#### AD-2A.4.S2.1: In-Memory Event Queue (No localStorage)

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use in-memory array for event queue; do not persist to localStorage in this story

**Rationale**:
- Simplifies initial implementation and testing
- Event queue lifetime is limited to session duration (sufficient for consent flow)
- localStorage persistence can be added later if needed without breaking changes
- Reduces privacy concerns about storing events before consent obtained
- Server-side contexts don't have localStorage access

**Consequences**:
- Events are lost on page refresh before consent is obtained
- Simpler implementation with fewer edge cases
- No synchronization issues between tabs
- May need to add localStorage in future story if product requirements demand it

**Alternatives Considered**:
- **localStorage persistence**: Rejected for MVP due to privacy concerns and added complexity; can be added incrementally
- **sessionStorage**: Rejected because server-side tracking wouldn't have access; in-memory simpler

#### AD-2A.4.S2.2: Fire-and-Forget trackEvent Pattern

**Scope**: Story-specific (does not affect other stories)

**Decision**: `trackEvent()` returns void and handles errors internally; no Promise or callback

**Rationale**:
- Analytics should never block or slow down application code
- Developers don't need to await or handle analytics failures
- Simplifies usage: `trackEvent('page_view', { url })` with no error handling required
- Matches industry-standard analytics APIs (PostHog, GA, Segment)

**Consequences**:
- Callers cannot know if tracking succeeded or failed
- Errors are logged internally but not surfaced to application
- Simpler API surface and better DX
- Consistent with analytics best practices

**Alternatives Considered**:
- **Return Promise**: Rejected because waiting for analytics is anti-pattern; adds unnecessary async complexity
- **Error callback parameter**: Rejected because analytics errors are rarely actionable by application code

## Out of Scope

The following items are explicitly NOT part of this story:

- **Event validation with Zod schemas** - Deferred to S3 (Event Validation)
- **Consent management integration** - Deferred to S4 (Consent Management)
- **Dispatching events to providers** (PostHog, GA4, Vercel Analytics) - Deferred to S5 (Provider Integration)
- **Component tracking utilities** (`data-component-id`, `useComponentTracking()`) - Deferred to S6 (Component Tracking)
- **Feature flags** - Deferred to S7 (Feature Flags)
- **localStorage persistence** - Not required for MVP; can be added in future iteration if needed
- **Offline event batching** - Not required for MVP
- **Event retry logic** - Handled by provider SDKs in S5
- **User identification** - Handled by provider integration in S5
- **Session tracking** - Handled by provider SDKs in S5

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Structure** - Provides the `@repo/analytics` package, TypeScript configuration, and build tooling required for this story

### Enables (Unblocks These Stories)

- **S3: Event Validation** - Requires `trackEvent()` and event queue to add Zod validation layer
- **S4: Consent Management** - Requires event queue (`flushQueue`, `clearQueue`) to implement consent-based event dispatch
- **S5: Provider Integration** - Requires `AnalyticsEvent` type and queue to dispatch events to PostHog/GA4/Vercel
- **S7: Feature Flags** - Requires analytics context detection for environment-aware feature flag evaluation

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [PRD: Feature M.7 - Basic Analytics & Tracking](/docs/1-product/1-prd.md#feature-m7-basic-analytics--tracking)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)

**External**:
- [PostHog Event Tracking](https://posthog.com/docs/product-analytics/capture-events)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Vitest Documentation](https://vitest.dev/)

## Verification Checklist

- [ ] **Pre-Verification**: S1 (Package Structure) complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] **Quality**: No lint errors; types compile; all tests pass; coverage >80%
- [ ] **Documentation**: JSDoc comments on all exported functions; clear usage examples
- [ ] **Git**: Conventional commit (e.g., `feat(analytics): implement core event tracking`); PR references Epic 2A.4.S2

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
