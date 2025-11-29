# Story 2A.4.S6: Create Component Tracking Utilities

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S1: Package Structure](./S1-package-structure.md), [S5: Provider Integration](./S5-provider-integrations.md)
- **Blocks**: [S8: Tests and Documentation](./S8-tests-docs.md)
- **Runs in Parallel With**: [S7: Feature Flag Utilities](./S7-feature-flags.md)

## User Story

**As a** developer building UI components
**I want** automatic tracking of component impressions and interactions via a React hook and data attributes
**So that** I can understand component usage without manually instrumenting every component with analytics calls

## Acceptance Criteria

- [ ] `useComponentTracking()` React hook tracks component impressions automatically when component mounts
- [ ] Hook tracks component interactions (clicks, focus, etc.) via optional callbacks
- [ ] `data-component-id` attribute is automatically applied to tracked components
- [ ] Component metadata (ID, type, location) is included in all component events
- [ ] Hook supports both automatic impression tracking and manual event triggering
- [ ] `trackComponentEvent()` standalone function available for non-React contexts
- [ ] Intersection Observer API used for viewport-based impression tracking (optional)
- [ ] Multiple component tracking hooks on same page work independently without conflicts
- [ ] Hook respects consent state - no events sent until consent obtained
- [ ] TypeScript provides autocomplete for component event properties

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/analytics/src/components/useComponentTracking.ts` | React hook for component tracking |
| `packages/analytics/src/components/trackComponent.ts` | Standalone component tracking function |
| `packages/analytics/src/components/types.ts` | Component tracking type definitions |
| `packages/analytics/src/components/observers.ts` | Intersection Observer utilities for viewport tracking |
| `packages/analytics/src/components/index.ts` | Component tracking public exports |
| `packages/analytics/__tests__/components/useComponentTracking.test.tsx` | Hook unit tests |
| `packages/analytics/__tests__/components/trackComponent.test.ts` | Standalone function tests |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/analytics/src/index.ts` | Export `useComponentTracking`, `trackComponentEvent` functions |
| `packages/analytics/package.json` | Add React peer dependency (if not already present) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to analytics package
cd packages/analytics

# Add React Testing Library for component tests (dev dependency)
pnpm add -D @testing-library/react @testing-library/react-hooks
```

**Note**: React is a peer dependency (already required by the monorepo).

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Component ID format | String identifier following pattern `{type}:{name}` (e.g., `button:submit`, `card:pricing`) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Impression threshold | Intersection Observer threshold (default: 50% visibility for 1 second) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Event naming | Component events follow pattern `component_{action}` (e.g., `component_impression`, `component_click`) | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Automatic data attributes | Hook automatically adds `data-component-id`, `data-component-type` attributes to tracked elements | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |

**Configuration Rationale**: The `data-component-id` pattern enables consistent component identification across the platform and supports debugging via browser DevTools. Intersection Observer provides accurate viewport-based impression tracking without manual scroll event listeners. The event naming convention (`component_{action}`) creates a clear namespace for component-level analytics, separating them from page-level or custom events. Automatic data attributes ensure tracked components are identifiable in the DOM for debugging and QA.

## Test Requirements

### Manual Verification

- [ ] **Hook Impression Tracking**: Create test component with `useComponentTracking()`, verify `component_impression` event fires on mount
- [ ] **Data Attributes**: Inspect tracked component in DevTools, verify `data-component-id` and `data-component-type` attributes present
- [ ] **Interaction Tracking**: Add click handler via hook options, click component, verify `component_click` event fires
- [ ] **Viewport Tracking**: Create component below fold with viewport tracking enabled, verify impression only fires when scrolled into view
- [ ] **Multiple Components**: Add 5+ tracked components to page, verify each tracks independently with correct IDs

### Automated Tests

- [ ] Unit: `useComponentTracking.test.tsx` - Hook returns ref object and applies data attributes
- [ ] Unit: `useComponentTracking.test.tsx` - Hook fires `component_impression` event on mount
- [ ] Unit: `useComponentTracking.test.tsx` - Hook respects `trackImpression: false` option
- [ ] Unit: `useComponentTracking.test.tsx` - Hook tracks custom interaction events via `onInteraction` callback
- [ ] Unit: `useComponentTracking.test.tsx` - Hook cleanup removes event listeners on unmount
- [ ] Unit: `trackComponent.test.ts` - Standalone function tracks component event with correct metadata
- [ ] Unit: `observers.test.ts` - Intersection Observer triggers callback when element enters viewport

### Integration Tests

- [ ] Component impression tracked and routed to providers - Verify hook calls `trackEvent()` with correct payload
- [ ] Data attributes accessible in tracked events - Verify PostHog/GA4 receive `componentId` and `componentType` properties
- [ ] Multiple hooks on same page operate independently - Verify no cross-contamination of component IDs
- [ ] Viewport-based impressions only fire when visible - Mock Intersection Observer, verify callback only fires at threshold
- [ ] Consent blocking applies to component events - Verify no component events sent when consent denied

### Verification Commands

```bash
# Run component tracking tests
cd packages/analytics
pnpm test components/

# Run tests with coverage
pnpm test:coverage components/

# Type-check component tracking utilities
pnpm type-check

# Build and verify exports
pnpm build
node --input-type=module -e "import('@repo/analytics').then(m => console.log(m.useComponentTracking, m.trackComponentEvent))"

# Test in example app (manual verification)
cd ../../apps/web
pnpm dev
# Visit http://localhost:3000/analytics-test and check DevTools Console + Network tab
```

## Implementation Notes

### Implementation Sequence

1. **Define Component Tracking Types**
   - Create `ComponentTrackingOptions` interface with `componentId`, `componentType`, `trackImpression`, `trackViewport`, `onInteraction` fields
   - Create `ComponentEventMetadata` type with `componentId`, `componentType`, `location` (pathname) fields
   - Create `ComponentEventType` union: `'impression' | 'click' | 'focus' | 'custom'`

2. **Implement Intersection Observer Utilities**
   - Create `createViewportObserver()` function to manage Intersection Observer instances
   - Implement threshold logic (default: 50% visibility for 1000ms)
   - Handle cleanup and disconnection on unmount
   - Support multiple observers on same page without conflicts

3. **Implement trackComponentEvent Function**
   - Create standalone `trackComponentEvent(eventType, metadata, properties)` function
   - Combine component metadata with event properties
   - Call underlying `trackEvent()` with namespaced event name (`component_${eventType}`)
   - Include `componentId`, `componentType`, `location` in all events

4. **Implement useComponentTracking Hook**
   - Create React hook that accepts `ComponentTrackingOptions`
   - Use `useRef()` to create element reference for attaching to DOM
   - Use `useEffect()` to add `data-component-id` and `data-component-type` attributes
   - Track impression on mount if `trackImpression: true` (default)
   - Set up Intersection Observer if `trackViewport: true`
   - Provide helper functions for tracking interactions (`trackClick`, `trackFocus`, etc.)
   - Return ref object and interaction tracking functions

5. **Add Hook Cleanup**
   - Remove Intersection Observer on unmount
   - Clean up event listeners if applicable
   - Ensure no memory leaks from observers

6. **Write Tests**
   - Test hook with React Testing Library
   - Mock Intersection Observer API
   - Test standalone function with various inputs
   - Verify data attribute application
   - Test viewport tracking behavior
   - Achieve >80% coverage

### Key Concepts

- **Component Impression**: Automatic event fired when component becomes visible to user (mount or viewport entry)
- **Component ID Pattern**: Follows `{type}:{name}` format (e.g., `button:cta`, `modal:signup`) for consistent identification
- **Viewport Tracking**: Uses Intersection Observer to track when component enters user's viewport (more accurate than mount-based tracking)
- **Data Attributes**: `data-component-id` and `data-component-type` enable debugging and QA via browser DevTools
- **Event Metadata**: All component events include consistent metadata (ID, type, location) for analysis

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Key pattern notes for this story:

- **React Hooks Pattern**: Use `useRef` for element reference, `useEffect` for side effects (tracking, observers)
- **Data Attribute Pattern**: Apply attributes via `ref.current?.setAttribute()` in `useEffect` after render
- **Intersection Observer Pattern**: Create observer instance in `useEffect`, disconnect in cleanup function
- **Callback Pattern**: Provide interaction tracking functions (`trackClick`, `trackInteraction`) as return values from hook
- **Namespaced Events**: Prefix all component events with `component_` to avoid naming conflicts with page-level events

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Hook doesn't track impressions | `trackImpression` option set to `false` | Remove option or set to `true` (default) |
| Data attributes not appearing | Ref not attached to element | Ensure `ref={componentRef}` is added to JSX element |
| Multiple impressions firing | Hook re-running due to dependency changes | Use `useRef` for stable values; check `useEffect` dependencies |
| Viewport tracking not working | Intersection Observer not supported | Add polyfill or fall back to mount-based tracking |
| Component ID conflicts | Duplicate IDs across components | Use unique IDs following `{type}:{uniqueName}` pattern |
| Events not reaching providers | Consent not granted | Verify consent obtained before component renders |

### Reference Materials

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React useRef Hook](https://react.dev/reference/react/useRef)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Data Attributes (MDN)](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Component tracking types: 0.5h
- Intersection Observer utilities: 1h
- `trackComponentEvent` function: 1h
- `useComponentTracking` hook: 2h
- Testing and verification: 1.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - Component tracking patterns and event naming conventions
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - React hook patterns and TypeScript typing

### Story-Specific Decisions

#### AD-2A.4.S6.1: Intersection Observer for Viewport Tracking

**Scope**: Story-specific (viewport impression tracking implementation)

**Decision**: Use Intersection Observer API for viewport-based impression tracking instead of scroll event listeners

**Rationale**:
- Intersection Observer is more performant than scroll listeners (runs off main thread)
- Provides accurate visibility percentage (can require 50%+ visibility before tracking)
- Automatically handles scroll, resize, and DOM changes
- Modern browser API with good support (95%+ browsers per caniuse.com)

**Consequences**:
- Positive: Better performance and battery life (no scroll listener overhead)
- Positive: More accurate impression tracking (threshold-based visibility)
- Positive: Simpler code (browser handles visibility calculations)
- Negative: Requires polyfill for older browsers (acceptable for MVP)

**Alternatives Considered**:
- **Scroll event listeners**: Rejected due to performance overhead and complexity of visibility calculations
- **Mount-based tracking only**: Rejected because doesn't track actual user visibility (component may be off-screen)

#### AD-2A.4.S6.2: Component ID Format `{type}:{name}`

**Scope**: Story-specific (component identifier format)

**Decision**: Use colon-separated format `{type}:{name}` for component IDs (e.g., `button:submit`, `card:pricing`)

**Rationale**:
- Human-readable and self-documenting (clear component type from ID)
- Easy to parse and filter in analytics dashboards (split on colon)
- Consistent with common analytics conventions (e.g., Google Tag Manager)
- Prevents naming conflicts (type namespace prevents ID collisions)

**Consequences**:
- Positive: Self-documenting IDs improve analytics dashboard readability
- Positive: Type prefix enables filtering by component type in PostHog/GA4
- Positive: Clear pattern for developers to follow when adding tracking
- Negative: Slightly longer IDs than simple names (acceptable trade-off)

**Alternatives Considered**:
- **Simple names** (`submit`, `pricing`): Rejected due to potential naming conflicts across component types
- **Dot notation** (`button.submit`): Rejected because dots have special meaning in some analytics platforms
- **Underscore notation** (`button_submit`): Rejected because underscores used for event type namespacing

#### AD-2A.4.S6.3: 50% Visibility Threshold for Impressions

**Scope**: Story-specific (viewport tracking threshold)

**Decision**: Require 50% of component visible for 1 second before firing impression event

**Rationale**:
- Industry standard for viewable impressions (IAB standard for ad viewability)
- Balances accuracy (user likely saw component) with coverage (not too strict)
- 1-second duration prevents scroll-through false positives
- Configurable via hook options if different threshold needed

**Consequences**:
- Positive: More accurate impression data (user actually saw component)
- Positive: Reduces noise from components user scrolled past quickly
- Positive: Aligns with industry standards for viewability
- Negative: May miss genuine impressions if user scrolls quickly (acceptable for analytics accuracy)

**Alternatives Considered**:
- **Any visibility**: Rejected because fires for components user didn't actually see
- **100% visibility**: Rejected as too strict (many components extend beyond viewport)
- **Immediate impression**: Rejected because tracks scroll-through components user didn't engage with

## Out of Scope

The following items are explicitly NOT part of this story:

- **Product-Specific Component Events** - Deferred to Epic 2B.3 (e.g., `demo_card_clicked`, `pricing_tier_selected`)
- **Component A/B Test Utilities** - Deferred to Epic 2B.3 or S7 (feature flags)
- **Heat Maps / Click Maps** - Not required for MVP; use PostHog session replay instead
- **Component Performance Tracking** - Out of scope; covered by Vercel Analytics Web Vitals
- **Automated Component ID Generation** - Manual IDs sufficient for MVP; auto-generation deferred
- **Component Lifecycle Tracking** - Impression and interactions only; mount/unmount tracking not required
- **Component Error Tracking** - Covered by Epic 2A.3 (Observability package with Sentry)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Structure** - Provides `@repo/analytics` package foundation for component tracking utilities
- **S5: Provider Integration** - Component events must be routed to PostHog/GA4/Vercel providers

### Enables (Unblocks These Stories)

- **S8: Tests and Documentation** - Component tracking utilities must be implemented before comprehensive testing and docs

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Key Deliverables](./EPIC.md#overview) - Component tracking utilities listed as key deliverable
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)

### External Documentation

- [Intersection Observer API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Hooks Reference](https://react.dev/reference/react)
- [React Testing Library API](https://testing-library.com/docs/react-testing-library/api)
- [IAB Viewability Standards](https://www.iab.com/guidelines/viewability/)
- [PostHog Event Properties](https://posthog.com/docs/product-analytics/events)
- [GA4 Event Parameters](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Structure) completed
- [ ] S5 (Provider Integration) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] React Testing Library installed and configured

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage > 80% for component tracking code

### Documentation

- [ ] JSDoc comments on all public functions and hooks
- [ ] README updated with component tracking usage examples
- [ ] Architecture decisions documented
- [ ] Hook API documented (parameters, return values, options)

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references story ID (2A.4.S6)

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: useComponentTracking Hook Usage Example

```typescript
import { useComponentTracking } from '@repo/analytics';

function PricingCard({ tier }: { tier: string }) {
  const { ref, trackClick, trackInteraction } = useComponentTracking({
    componentId: `card:pricing-${tier}`,
    componentType: 'card',
    trackImpression: true,
    trackViewport: true, // Only fire impression when 50%+ visible
  });

  return (
    <div ref={ref}>
      <h3>{tier} Plan</h3>
      <button
        onClick={() => {
          trackClick({ tier, action: 'select_plan' });
          // Additional click handling...
        }}
      >
        Select Plan
      </button>
    </div>
  );
}
```

**Tracked events:**
1. `component_impression` - Fires when card 50%+ visible in viewport
2. `component_click` - Fires when "Select Plan" button clicked

**Event properties include:**
- `componentId: "card:pricing-premium"`
- `componentType: "card"`
- `location: "/pricing"`
- `tier: "premium"` (from trackClick properties)

## Appendix B: Standalone Component Tracking

```typescript
import { trackComponentEvent } from '@repo/analytics';

// For non-React contexts or manual tracking
function handleManualInteraction() {
  trackComponentEvent('custom', {
    componentId: 'widget:calculator',
    componentType: 'widget',
    location: window.location.pathname
  }, {
    calculationType: 'roi',
    resultValue: 12500
  });
}
```

## Appendix C: Intersection Observer Configuration

```typescript
// Default configuration (configurable via hook options)
const observerOptions = {
  threshold: 0.5,        // 50% visibility required
  rootMargin: '0px',     // No margin adjustment
  trackOnce: true,       // Fire impression only once
  minDuration: 1000      // Visible for 1 second minimum
};
```
