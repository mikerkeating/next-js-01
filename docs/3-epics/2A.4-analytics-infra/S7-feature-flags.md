# Story 2A.4.S7: Implement Feature Flag Utilities

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S2: Core Event Tracking](./S2-core-event-tracking.md)
- **Blocks**: [S8: Tests and Documentation](./S8-tests-docs.md)
- **Runs in Parallel With**: [S6: Component Tracking](./S6-component-tracking.md)

## User Story

**As a** developer
**I want** utilities to evaluate feature flags in both client and server contexts
**So that** I can progressively roll out features, run A/B tests, and control feature availability without deploying new code

## Acceptance Criteria

- [ ] `useFeatureFlag(flagKey)` React hook evaluates flags in client components
- [ ] `getFeatureFlag(flagKey)` function evaluates flags in server components and API routes
- [ ] Feature flags work in Vercel Edge runtime (Edge Functions and Middleware)
- [ ] Flags support boolean, string, number, and JSON value types
- [ ] Default values can be specified when flag is not found
- [ ] Flag evaluation is fast (<5ms) using Edge Config or in-memory cache
- [ ] PostHog feature flags integration is ready (provider interface defined)
- [ ] TypeScript types enforce type-safe flag value access
- [ ] All functions have JSDoc documentation with usage examples
- [ ] Unit tests verify flag evaluation in different contexts

## Technical Requirements

### Files to Create

| Path                                                 | Purpose                                     |
| ---------------------------------------------------- | ------------------------------------------- |
| `packages/analytics/src/feature-flags.ts`            | Core feature flag evaluation logic          |
| `packages/analytics/src/feature-flags-client.ts`     | Client-side feature flag hook and utilities |
| `packages/analytics/src/feature-flags-server.ts`     | Server-side feature flag utilities          |
| `packages/analytics/src/providers/posthog-flags.ts`  | PostHog feature flags provider interface    |
| `packages/analytics/__tests__/feature-flags.test.ts` | Unit tests for feature flag utilities       |

### Files to Modify

| Path                              | Changes                                                                  |
| --------------------------------- | ------------------------------------------------------------------------ |
| `packages/analytics/src/index.ts` | Export `useFeatureFlag`, `getFeatureFlag`, `FeatureFlagProvider`         |
| `packages/analytics/src/types.ts` | Add `FeatureFlagValue`, `FeatureFlagConfig`, `FeatureFlagProvider` types |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# PostHog SDK will be installed in S5 if not already present
# No additional dependencies required for this story beyond existing analytics deps

# Optional: Vercel Edge Config SDK (for edge-based flag storage)
pnpm add @vercel/edge-config
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting            | Requirement                                                                  | TAD Reference                                                                         |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Edge compatibility | Must work in Vercel Edge runtime (no Node.js-specific APIs)                  | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points)              |
| Flag value types   | Support boolean, string, number, and JSON object values                      | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Default values     | Provide safe defaults when flag evaluation fails or flag not found           | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Performance target | <5ms evaluation time using cached or edge-stored values                      | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points)              |
| Provider interface | Abstract provider interface allows swapping PostHog/Edge Config/LaunchDarkly | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |

**Configuration Rationale**: Feature flags must work across all Next.js execution contexts (client components, server components, API routes, middleware, Edge Functions) to enable full-stack feature control. Edge Config integration provides fast, globally distributed flag evaluation without database queries. TypeScript generics enable type-safe flag values while supporting different data types. Provider abstraction allows flexibility to use PostHog flags (product analytics integration) or Edge Config (performance) based on use case.

For complete configuration templates, see: [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)

## Test Requirements

### Manual Verification

- [ ] **Client Hook Test**: Create client component using `useFeatureFlag('test-flag')` and verify it renders flag value correctly
- [ ] **Server Function Test**: Create server component or API route using `getFeatureFlag('test-flag')` and verify it evaluates correctly
- [ ] **Edge Runtime Test**: Use feature flag in middleware and verify it works in Edge runtime without errors
- [ ] **Type Safety Test**: Verify TypeScript enforces correct types when accessing flag values with different type parameters

### Automated Tests

- [ ] Unit: `feature-flags.test.ts` - Verify flag evaluation returns correct values for different flag types
- [ ] Unit: `feature-flags.test.ts` - Verify default values are used when flag is not found
- [ ] Unit: `feature-flags.test.ts` - Verify type guards correctly identify flag value types
- [ ] Unit: `feature-flags.test.ts` - Verify provider interface contract (PostHog, Edge Config mocks)
- [ ] Unit: `feature-flags.test.ts` - Verify client hook updates when flag value changes (React state integration)
- [ ] Unit: `feature-flags.test.ts` - Verify server function handles missing provider gracefully

### Integration Tests

- [ ] Verify `useFeatureFlag()` integrates with PostHog provider and receives real flag values
- [ ] Verify feature flags work correctly in all Next.js contexts (client, server, edge, middleware)
- [ ] Verify flag changes in PostHog dashboard propagate to application without redeploy

### Verification Commands

```bash
# Install dependencies and build
pnpm install
pnpm --filter @repo/analytics build

# Run unit tests
pnpm --filter @repo/analytics test feature-flags

# Run tests with coverage
pnpm --filter @repo/analytics test:coverage

# Type checking
pnpm --filter @repo/analytics type-check

# Verify exports are accessible
node --input-type=module -e "import('@repo/analytics').then(m => console.log(m.useFeatureFlag, m.getFeatureFlag))"
```

## Implementation Notes

### Implementation Sequence

1. **Define Core Types**
   - Add `FeatureFlagValue` union type: `boolean | string | number | Record<string, unknown>`
   - Add `FeatureFlagConfig` interface with `key`, `defaultValue`, `type` fields
   - Add `FeatureFlagProvider` interface with `getFlag(key, defaultValue)` method
   - Add type guard functions to check flag value types safely

2. **Implement Provider Interface**
   - Create `FeatureFlagProvider` interface with async `getFlag()` method
   - Create PostHog provider implementation (placeholder/ready for S5 integration)
   - Create Edge Config provider implementation (optional, for Vercel Edge Config)
   - Create fallback in-memory provider for local development

3. **Implement Server-Side Utilities**
   - Create `getFeatureFlag<T>(key, defaultValue)` async function for server contexts
   - Use provider to fetch flag value
   - Return typed value or default if not found or error occurs
   - Cache flag values in-memory for request duration to avoid multiple provider calls
   - Ensure Edge runtime compatibility (no Node.js-specific APIs)

4. **Implement Client-Side Hook**
   - Create `useFeatureFlag<T>(key, defaultValue)` React hook
   - Use React state to store flag value
   - Fetch flag value on mount (useEffect)
   - Support PostHog SDK client-side flag evaluation
   - Handle loading state and errors gracefully
   - Optionally re-fetch flag value on PostHog updates (PostHog SDK feature)

5. **Add Provider Configuration**
   - Create singleton provider instance management
   - Allow provider configuration via environment variables
   - Support provider priority: PostHog (default) > Edge Config > In-memory
   - Provide `setFeatureFlagProvider(provider)` function for custom providers

6. **Export Public API**
   - Export `useFeatureFlag`, `getFeatureFlag`, `FeatureFlagProvider` type from `index.ts`
   - Add JSDoc comments with usage examples for each export
   - Document type parameters for flag value types

7. **Write Unit Tests**
   - Test flag evaluation with different value types (boolean, string, number, object)
   - Test default value fallback behavior
   - Test provider interface with mocks
   - Test client hook state management
   - Test server function in different runtime contexts
   - Test edge runtime compatibility
   - Achieve >80% code coverage

### Key Concepts

- **Feature Flags**: Runtime configuration that controls feature availability without code deployment; enables progressive rollouts and A/B testing
- **Edge Compatibility**: Feature flags must work in Vercel Edge runtime, which has limited API surface (no Node.js APIs like `fs`, `crypto.randomBytes`)
- **Provider Abstraction**: Interface-based design allows swapping flag sources (PostHog, Edge Config, LaunchDarkly) without changing application code
- **Type Safety**: TypeScript generics enable type-safe flag access: `useFeatureFlag<boolean>('dark-mode', false)` ensures boolean return type
- **Performance**: Flag evaluation must be fast (<5ms) using cached or edge-stored values; avoid database queries on every flag check
- **Graceful Degradation**: Flag evaluation never throws errors; always returns default value if provider fails or flag not found

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points)

Key pattern notes for this story:

- Use TypeScript generics for type-safe flag value access: `getFeatureFlag<T>(key, defaultValue: T): Promise<T>`
- Use provider pattern to abstract flag source (PostHog vs Edge Config vs custom)
- Cache flag values in-memory for request duration to minimize provider calls
- Use React hook pattern for client-side flags to integrate with component lifecycle
- Follow graceful degradation: return default value on any error (network, parsing, missing flag)

### Troubleshooting

| Issue                                                 | Cause                                  | Solution                                                                            |
| ----------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| Edge runtime error "Module not found"                 | Using Node.js-specific API             | Use only Edge-compatible APIs; check Vercel Edge runtime docs                       |
| Client hook returns stale flag value                  | PostHog SDK not updating hook state    | Implement PostHog onFeatureFlags callback to update React state                     |
| Server function slow (>100ms)                         | Hitting PostHog API on every call      | Implement request-scoped cache; use Edge Config for faster lookups                  |
| TypeScript error on flag value access                 | Incorrect generic type parameter       | Ensure type parameter matches expected flag value type                              |
| Flag evaluation returns default despite flag existing | Provider not configured or initialized | Verify environment variables for PostHog/Edge Config; check provider initialization |
| Tests fail in Edge runtime environment                | Test using Node.js APIs                | Use Vercel Edge runtime test utilities or mock edge-compatible APIs                 |

### Reference Materials

- [PostHog Feature Flags Documentation](https://posthog.com/docs/feature-flags)
- [PostHog JavaScript SDK Feature Flags](https://posthog.com/docs/libraries/js#feature-flags)
- [Vercel Edge Config Documentation](https://vercel.com/docs/edge-config)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)
- [LaunchDarkly SDK Patterns](https://docs.launchdarkly.com/sdk/concepts/client-side-server-side)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions and provider interface: 1h
- Server-side flag utilities with edge compatibility: 1.5h
- Client-side React hook with state management: 1.5h
- Provider implementations (PostHog, Edge Config, in-memory): 1.5h
- Unit tests (6 test cases) and integration tests (3 cases): 2h
- Documentation and verification: 0.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - PostHog as primary feature flag source
- [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) - Edge Config for fast edge-based lookups
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - Monorepo package patterns

### Story-Specific Decisions

#### AD-2A.4.S7.1: Provider Abstraction for Flag Sources

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create `FeatureFlagProvider` interface to abstract flag source (PostHog, Edge Config, LaunchDarkly)

**Rationale**:

- Flexibility to use different flag sources based on performance requirements
- PostHog flags integrate with product analytics but may have higher latency
- Edge Config provides fast (<5ms) lookups for critical flags in middleware
- Allows testing with in-memory provider without external dependencies
- Future-proof: can add LaunchDarkly or other providers without breaking changes

**Consequences**:

- Slightly more complex implementation (interface + multiple providers)
- More flexible and testable architecture
- Can optimize flag evaluation based on use case (PostHog for product flags, Edge Config for infrastructure flags)
- Easier to mock in tests

**Alternatives Considered**:

- **PostHog only**: Rejected because PostHog API latency may be too high for middleware/edge contexts; limits flexibility
- **Edge Config only**: Rejected because Edge Config requires manual flag updates via API; PostHog provides better UX for product teams

#### AD-2A.4.S7.2: Typed Flag Values with TypeScript Generics

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use TypeScript generics for type-safe flag value access: `getFeatureFlag<T>(key, defaultValue: T): Promise<T>`

**Rationale**:

- Type safety ensures developers access flag values correctly (no runtime type errors)
- Default value constrains return type: `getFeatureFlag('limit', 10)` infers `number` type
- Better developer experience with IDE autocomplete and type checking
- Prevents common bugs like treating boolean flag as string

**Consequences**:

- Cleaner API with better type inference
- Requires developers to provide default value (good practice anyway)
- Slightly more complex type definitions but much better DX
- May need type assertions when flag type is dynamic

**Alternatives Considered**:

- **Untyped values (any)**: Rejected because loses type safety; error-prone
- **Separate functions per type**: (`getBooleanFlag`, `getStringFlag`) - Rejected due to verbose API and code duplication

#### AD-2A.4.S7.3: Client Hook Auto-Updates from PostHog

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement `useFeatureFlag()` hook that automatically updates when PostHog flag values change (without page refresh)

**Rationale**:

- PostHog SDK supports real-time flag updates via `onFeatureFlags` callback
- Better UX: users see feature changes immediately without refresh
- Useful for gradual rollouts and A/B test reassignments
- Matches PostHog SDK capabilities

**Consequences**:

- More React state management complexity in hook implementation
- Better UX for dynamic feature rollouts
- Need to handle rapid flag changes gracefully (debouncing may be needed)
- Requires PostHog SDK to be properly initialized on client

**Alternatives Considered**:

- **Static flag values (no updates)**: Rejected because PostHog supports real-time updates; would miss valuable capability
- **Manual refresh function**: Rejected because automatic updates provide better UX

## Out of Scope

The following items are explicitly NOT part of this story:

- **PostHog SDK initialization** - Handled in S5 (Provider Integration)
- **PostHog user identification** - Handled in S5 (Provider Integration)
- **A/B test tracking and variant assignment** - Deferred to Epic 2B.3 (Product Analytics Events)
- **Feature flag analytics events** (flag_viewed, flag_evaluated) - Deferred to Epic 2B.3
- **Feature flag management UI** - Use PostHog dashboard for flag configuration
- **Complex flag targeting rules** (geography, user properties) - Configured in PostHog dashboard, not in code
- **Flag value caching beyond request scope** - Local/session storage persistence deferred
- **Multivariate flags** (>2 variants) - Start with boolean/simple flags; multivariate support can be added incrementally
- **Server-side flag bootstrapping** - Deferred to performance optimization story if needed

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Core Event Tracking** - Provides analytics context detection (`isClient`, `isServer`) used in feature flag utilities

### Enables (Unblocks These Stories)

- **S8: Tests and Documentation** - Requires feature flag utilities to write comprehensive tests and usage documentation

## References

**Internal**:

- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points)
- [PRD: Feature M.7 - Basic Analytics & Tracking](/docs/1-product/1-prd.md#feature-m7-basic-analytics--tracking)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)

**External**:

- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js#feature-flags)
- [PostHog React SDK](https://posthog.com/docs/libraries/react)
- [Vercel Edge Config](https://vercel.com/docs/edge-config)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)
- [React Hooks Documentation](https://react.dev/reference/react)

## Verification Checklist

- [ ] **Pre-Verification**: S2 (Core Event Tracking) complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] **Quality**: No lint errors; types compile; all tests pass; coverage >80%; edge runtime compatible
- [ ] **Documentation**: JSDoc comments on all exported functions; clear usage examples; type parameters documented
- [ ] **Git**: Conventional commit (e.g., `feat(analytics): implement feature flag utilities`); PR references Epic 2A.4.S7

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
