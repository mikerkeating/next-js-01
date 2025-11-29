# Story 2A.4.S3: Create Event Validation with Zod

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S1: Package Structure](./S1-package-structure.md), [S2: Core Event Tracking](./S2-core-event-tracking.md)
- **Blocks**: [S8: Tests and Documentation](./S8-tests-docs.md)
- **Runs in Parallel With**: [S4: Consent Management](./S4-consent-management.md)

## User Story

**As a** developer
**I want** event data validated against Zod schemas before being queued or dispatched
**So that** analytics events are type-safe, catch errors early, and prevent malformed data from reaching analytics providers

## Acceptance Criteria

- [ ] Base `AnalyticsEventSchema` defined with Zod for generic event validation
- [ ] Event validation integrated into `trackEvent()` function
- [ ] Invalid events are rejected with descriptive error messages
- [ ] Validation errors are logged but don't throw exceptions (fire-and-forget pattern maintained)
- [ ] TypeScript types are inferred from Zod schemas for compile-time safety
- [ ] Event properties are validated as JSON-serializable values (no functions, circular refs)
- [ ] Validation supports optional properties and custom event schemas
- [ ] Unit tests verify validation logic for valid and invalid events
- [ ] Validation errors are reported via logger (from `@repo/observability`)

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/analytics/src/validation.ts` | Zod schema definitions and validation logic |
| `packages/analytics/__tests__/validation.test.ts` | Unit tests for event validation |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/analytics/src/tracking.ts` | Integrate validation into `trackEvent()` function |
| `packages/analytics/src/types.ts` | Add inferred types from Zod schemas |
| `packages/analytics/src/index.ts` | Export validation schemas and utility functions |
| `packages/analytics/package.json` | Add `zod` dependency |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/analytics

# Install Zod for schema validation
pnpm add zod

# Logger dependency (already available from @repo/observability)
pnpm add @repo/observability
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Schema validation mode | Strict mode with `.strict()` to prevent unknown properties | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| Error handling | Log validation errors, don't throw exceptions | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Type inference | Use `z.infer<typeof Schema>` for compile-time types | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| JSON-serializable check | Prevent functions, symbols, circular references in properties | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |

**Configuration Rationale**: Zod schemas provide both runtime validation and TypeScript type inference, ensuring event data is type-safe at compile time and valid at runtime. Strict mode prevents typos in property names and accidental inclusion of invalid data. Fire-and-forget pattern is maintained by logging validation errors without throwing, preventing analytics from breaking application flow. JSON-serializable validation ensures events can be safely transmitted to analytics providers via network requests.

For complete validation patterns, see: [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)

## Test Requirements

### Manual Verification

- [ ] **Type Safety**: Create test file with `trackEvent()` call using invalid properties and verify TypeScript error appears
- [ ] **Runtime Validation**: Call `trackEvent()` with invalid data and verify error is logged but execution continues
- [ ] **Valid Events**: Call `trackEvent()` with valid data and verify event is queued successfully

### Automated Tests

- [ ] Unit: `validation.test.ts` - Verify base schema validates events with required fields (name, properties, timestamp, context)
- [ ] Unit: `validation.test.ts` - Verify validation rejects events with missing required fields
- [ ] Unit: `validation.test.ts` - Verify validation rejects events with invalid property types (functions, undefined)
- [ ] Unit: `validation.test.ts` - Verify validation accepts events with optional properties
- [ ] Unit: `validation.test.ts` - Verify strict mode rejects events with unknown properties
- [ ] Unit: `validation.test.ts` - Verify nested object properties are validated correctly
- [ ] Unit: `tracking.test.ts` - Verify `trackEvent()` rejects invalid events and logs errors
- [ ] Unit: `tracking.test.ts` - Verify `trackEvent()` accepts valid events and adds to queue

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

# Verify Zod is installed
pnpm --filter @repo/analytics list zod
```

## Implementation Notes

### Implementation Sequence

1. **Define Base Zod Schema**
   - Create `AnalyticsEventSchema` with `name`, `properties`, `timestamp`, `context`
   - Use `z.string()` for name and timestamp
   - Use `z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))` for properties
   - Use custom `AnalyticsContextSchema` for context object
   - Add `.strict()` to prevent unknown properties

2. **Create JSON-Serializable Validator**
   - Define `JsonValueSchema` using `z.union()` for primitives, arrays, and objects
   - Prevent functions: `z.function().refine(() => false)` or exclude via union
   - Prevent undefined: exclude from union types
   - Support nested objects and arrays up to reasonable depth

3. **Create Validation Utilities**
   - Implement `validateEvent(event)` function using schema `.safeParse()`
   - Return `{ success: true, data }` or `{ success: false, error }`
   - Implement `isJsonSerializable(value)` helper for property validation

4. **Integrate Validation into trackEvent**
   - Import logger from `@repo/observability`
   - Call `validateEvent()` before adding event to queue
   - If validation fails, log error with details and return early (don't queue)
   - If validation succeeds, proceed with normal queueing logic

5. **Export Type Inference**
   - Add `export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>`
   - Add `export type EventProperties = z.infer<typeof EventPropertiesSchema>`
   - Update existing type definitions to use inferred types

6. **Write Unit Tests**
   - Test valid event structures (all required fields, optional fields)
   - Test invalid events (missing fields, wrong types, functions in properties)
   - Test strict mode (reject unknown properties)
   - Test nested objects and arrays in properties
   - Test trackEvent integration (validation success/failure paths)
   - Achieve >80% coverage

### Key Concepts

- **Zod Schema Validation**: Runtime type validation that complements TypeScript's compile-time checking
- **Type Inference**: `z.infer<typeof Schema>` generates TypeScript types from Zod schemas, ensuring compile-time and runtime types match
- **Strict Mode**: `.strict()` prevents unknown properties, catching typos and accidental data leakage
- **JSON-Serializable**: Event properties must be serializable for transmission to analytics providers; functions and circular references are invalid
- **Fire-and-Forget**: Validation errors are logged but don't throw exceptions, maintaining analytics as non-blocking

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)

Key pattern notes for this story:

- Use Zod's `.safeParse()` instead of `.parse()` to avoid throwing exceptions
- Define reusable base schemas that can be extended for custom event types (future-proofing for Epic 2B.3)
- Use `z.lazy()` for recursive types if supporting deeply nested objects
- Leverage Zod's error formatting (`zodError.format()`) for readable validation error messages

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| TypeScript error: type mismatch | Zod schema and TypeScript types out of sync | Use `z.infer<typeof Schema>` for all types instead of manual definitions |
| Validation always fails | Schema too strict or missing required fields | Check schema definition matches event structure from S2 |
| Functions pass validation | JSON-serializable check not implemented | Add explicit function rejection in schema or pre-validation check |
| Circular reference crashes | JSON.stringify called on circular object | Add pre-validation check for circular refs before validation |
| Logger import fails | @repo/observability not built or installed | Run `pnpm build --filter @repo/observability` first |

### Reference Materials

- [Zod Documentation](https://zod.dev/)
- [Zod Type Inference](https://zod.dev/?id=type-inference)
- [Zod Error Handling](https://zod.dev/?id=error-handling)
- [JSON-Serializable Types in TypeScript](https://github.com/microsoft/TypeScript/issues/1897)

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - Use of Zod for validation across packages
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - Fire-and-forget pattern for analytics
- [Epic 2A.3: Observability](../2A.3-observability/EPIC.md) - Logging standards and structured error reporting

### Story-Specific Decisions

#### AD-2A.4.S3.1: Strict Schema Validation with Unknown Property Rejection

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use `.strict()` on all event schemas to reject events with unknown properties

**Rationale**:
- Catches typos in property names at runtime (e.g., `trackEvent('click', { buton: 'submit' })`)
- Prevents accidental inclusion of sensitive data (e.g., full user objects instead of user IDs)
- Forces developers to explicitly define all tracked properties, improving documentation
- Aligns with privacy-first approach by preventing unintended data collection

**Consequences**:
- Events with extra properties will be rejected and logged as errors
- Developers must update schemas when adding new properties (intentional friction)
- Slightly more restrictive than permissive validation, but catches more bugs
- May generate false positives if developers accidentally include extra context

**Alternatives Considered**:
- **Permissive validation** (`.passthrough()` or default): Rejected because allows typos and accidental data leakage
- **Strip unknown properties** (`.strip()`): Rejected because silently discards data, making bugs harder to detect

#### AD-2A.4.S3.2: Log Validation Errors, Don't Throw Exceptions

**Scope**: Story-specific (does not affect other stories)

**Decision**: Validation failures are logged via `@repo/observability` logger but don't throw exceptions; `trackEvent()` returns void regardless of validation outcome

**Rationale**:
- Maintains fire-and-forget analytics pattern from S2
- Analytics should never crash or block application code
- Validation errors indicate developer bugs (bad instrumentation), not user errors
- Errors are observable via logs for debugging without affecting UX
- Consistent with industry-standard analytics APIs (PostHog, Segment, GA)

**Consequences**:
- Developers must check logs to detect validation failures
- Invalid events are silently dropped (with log entry)
- No runtime feedback to calling code about validation success
- Simplifies API surface (no error handling needed by callers)

**Alternatives Considered**:
- **Throw exceptions**: Rejected because analytics should never break application flow
- **Return boolean success flag**: Rejected because encourages callers to handle analytics errors (anti-pattern)
- **Silent failure (no logging)**: Rejected because makes debugging impossible

## Out of Scope

The following items are explicitly NOT part of this story:

- **Product-specific event schemas** - Deferred to Epic 2B.3 (Product Analytics Events & Taxonomy)
- **Custom event schema registry** - Not required for MVP; base schema is sufficient
- **Event schema versioning** - Deferred to future iteration if needed
- **Validation performance optimization** - Zod is fast enough for MVP; optimize if profiling shows bottleneck
- **Schema documentation generation** - Deferred to S8 (Tests and Documentation)
- **Server-side vs client-side validation differences** - Same validation logic works in both environments
- **Consent-based validation** - Validation happens before consent check; deferred to S4 integration

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Structure** - Provides the `@repo/analytics` package foundation for adding validation
- **S2: Core Event Tracking** - Provides `trackEvent()` function and `AnalyticsEvent` type to validate

### Enables (Unblocks These Stories)

- **S8: Tests and Documentation** - Validation schemas will be documented and tested comprehensively in S8

## References

**Internal**:
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [Epic 2A.3: Observability](../2A.3-observability/EPIC.md) - Logger package for error reporting
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)

**External**:
- [Zod Documentation](https://zod.dev/)
- [Zod Type Inference](https://zod.dev/?id=type-inference)
- [Zod Error Handling](https://zod.dev/?id=error-handling)
- [Zod Strict Mode](https://zod.dev/?id=strict)
- [JSON Schema Specification](https://json-schema.org/)

## Verification Checklist

- [ ] **Pre-Verification**: S1 (Package Structure) and S2 (Core Event Tracking) complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md); `@repo/observability` built and available
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed; Zod schemas use strict mode; validation integrated into trackEvent
- [ ] **Quality**: No lint errors; types compile; all tests pass; coverage >80%; validation errors logged correctly
- [ ] **Documentation**: JSDoc comments on schemas and validation functions; clear examples of valid/invalid events
- [ ] **Git**: Conventional commit (e.g., `feat(analytics): add event validation with Zod`); PR references Epic 2A.4.S3

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
