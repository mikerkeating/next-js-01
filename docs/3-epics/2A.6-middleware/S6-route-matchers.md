# Story 2A.6.S6: Route Matcher Utilities

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Middleware Package (Generic)](./EPIC.md)
- **Depends On**: [S1](./S1-package-setup.md)
- **Blocks**: [S7](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2](./S2-logging-middleware.md), [S3](./S3-security-headers.md), [S4](./S4-rate-limiting.md), [S5](./S5-cors-middleware.md)

## User Story

**As a** platform developer
**I want** reusable route matcher utilities for conditional middleware execution
**So that** I can apply middleware to specific paths, patterns, or route types without duplicating matching logic

## Acceptance Criteria

- [ ] Path matcher utility matches exact paths (e.g., `/api/users`)
- [ ] Path prefix matcher matches all paths starting with prefix (e.g., `/admin/*`)
- [ ] Path pattern matcher supports wildcard patterns (e.g., `/api/*/settings`)
- [ ] Regex matcher supports custom regular expressions for complex patterns
- [ ] Route type matchers identify API routes, static files, and public paths
- [ ] Matcher combinators support AND, OR, NOT operations on matchers
- [ ] All matchers work with Next.js pathname format (without query parameters)
- [ ] Matchers are pure functions with no side effects (edge runtime compatible)
- [ ] Unit tests verify exact matching, prefix matching, patterns, and combinators
- [ ] Performance: Matchers execute in < 1ms for typical paths

## Technical Requirements

### Files to Create

| Path                                              | Purpose                               |
| ------------------------------------------------- | ------------------------------------- |
| `packages/middleware/src/matchers.ts`             | Route matcher utilities               |
| `packages/middleware/tests/matchers.test.ts`      | Unit tests for matchers               |

### Files to Modify

| Path                                  | Changes                                          |
| ------------------------------------- | ------------------------------------------------ |
| `packages/middleware/src/index.ts`    | Export matcher utilities                         |
| `packages/middleware/README.md`       | Add matcher utilities usage documentation        |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

All dependencies already installed in S1. No additional dependencies required.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

Route matchers are utility functions and do not require configuration files. However, they must follow these requirements:

| Requirement                | Rationale                                                      | TAD Reference                                                           |
| -------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Pure functions only        | Edge runtime compatibility; predictable behavior               | [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md) |
| No regex compilation cache | Avoid stateful behavior; regex compilation is fast enough      | [TAD: Edge Runtime Constraints](/docs/2-technical/2-tad-edge-middleware.md) |
| Type-safe matcher API      | Prevent runtime errors from incorrect matcher usage            | [TAD: TypeScript Configuration](/docs/2-technical/2-tad.md#typescript-configuration) |

**Configuration Rationale**: Route matchers execute on every request in middleware chain, so they must be fast (< 1ms) and stateless. Pure functions ensure predictable behavior and enable edge runtime compatibility. Type safety prevents common errors like passing wrong pathname format.

## Test Requirements

### Manual Verification

- [ ] **Exact Path Matching**: Create matcher for `/api/users` and verify it matches only that exact path
- [ ] **Prefix Matching**: Create matcher for `/admin` and verify it matches all paths starting with `/admin`
- [ ] **Wildcard Pattern**: Create matcher for `/api/*/settings` and verify it matches `/api/users/settings`, `/api/orgs/settings`, etc.

### Automated Tests

- [ ] Unit: `matchers.test.ts` - Exact path matcher matches correct path and rejects others
- [ ] Unit: `matchers.test.ts` - Prefix matcher matches all paths with prefix
- [ ] Unit: `matchers.test.ts` - Wildcard pattern matcher handles single and multiple wildcards
- [ ] Unit: `matchers.test.ts` - Regex matcher validates custom patterns
- [ ] Unit: `matchers.test.ts` - API route matcher identifies API routes (paths starting with `/api`)
- [ ] Unit: `matchers.test.ts` - Static file matcher identifies static assets (Next.js `_next/static`, `_next/image`, etc.)
- [ ] Unit: `matchers.test.ts` - Public path matcher identifies public folder paths
- [ ] Unit: `matchers.test.ts` - AND combinator returns true only when all matchers match
- [ ] Unit: `matchers.test.ts` - OR combinator returns true when any matcher matches
- [ ] Unit: `matchers.test.ts` - NOT combinator inverts matcher result
- [ ] Unit: `matchers.test.ts` - Matchers handle edge cases (empty string, root path, trailing slashes)
- [ ] Unit: `matchers.test.ts` - Performance test: 1000 matcher executions complete in < 1ms

### Integration Tests

N/A - Integration testing deferred to S7 (Integration Tests and Documentation) which tests matchers within complete middleware chain with conditional middleware.

### Verification Commands

```bash
# Run tests
cd packages/middleware
pnpm test matchers

# Type check
pnpm type-check

# Lint
pnpm lint

# Performance benchmark
pnpm test matchers --reporter=verbose
```

## Implementation Notes

### Implementation Sequence

1. **Core Matcher Types**
   - Define `PathMatcher` function type: `(pathname: string) => boolean`
   - Define `MatcherConfig` type for configuration options
   - Export types for external use

2. **Basic Matchers**
   - Implement `exactPath(path: string): PathMatcher` for exact path matching
   - Implement `pathPrefix(prefix: string): PathMatcher` for prefix matching
   - Handle trailing slash normalization (optional)
   - Add JSDoc comments with usage examples

3. **Pattern Matchers**
   - Implement `pathPattern(pattern: string): PathMatcher` for wildcard patterns
   - Convert wildcard patterns to regex (e.g., `/api/*/settings` → `/^\/api\/[^/]+\/settings$/`)
   - Implement `regex(pattern: RegExp): PathMatcher` for custom regex patterns
   - Handle edge cases (empty patterns, invalid regex)

4. **Route Type Matchers**
   - Implement `isApiRoute(): PathMatcher` - matches paths starting with `/api`
   - Implement `isStaticFile(): PathMatcher` - matches `_next/static`, `_next/image`, `favicon.ico`
   - Implement `isPublicPath(): PathMatcher` - matches `/public/*` paths
   - Add configuration for custom static/public path patterns

5. **Matcher Combinators**
   - Implement `and(...matchers: PathMatcher[]): PathMatcher` - logical AND
   - Implement `or(...matchers: PathMatcher[]): PathMatcher` - logical OR
   - Implement `not(matcher: PathMatcher): PathMatcher` - logical NOT
   - Support nested combinations (e.g., `and(or(m1, m2), not(m3))`)

6. **Testing and Optimization**
   - Write comprehensive unit tests for all matchers
   - Add performance benchmarks
   - Optimize regex compilation if needed
   - Achieve ≥80% code coverage

### Key Concepts

- **Path Matcher**: Function that takes pathname and returns boolean indicating match
- **Wildcard Pattern**: Pattern with `*` character matching any path segment (e.g., `/api/*/users`)
- **Matcher Combinator**: Higher-order function combining multiple matchers with logical operations
- **Trailing Slash Normalization**: Optional handling of paths with/without trailing slashes as equivalent
- **Pure Function**: Function with no side effects, same input always produces same output

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Conditional Middleware Pattern](/docs/2-technical/2-tad-edge-middleware.md#middleware-composition-pattern) - Using matchers with `createConditionalMiddleware`

Key pattern notes for this story:

- Use `createConditionalMiddleware` from S1 to integrate matchers with middleware chain
- Path patterns should use simple wildcard syntax (user-friendly) converted to regex internally
- Combinators enable complex matching logic without nested if statements
- Common matchers (API routes, static files) should be pre-built and exported for convenience
- Matchers should not modify input (pure functions) to enable memoization if needed

### Troubleshooting

| Issue                                  | Cause                                     | Solution                                                     |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Matcher not matching expected paths    | Trailing slash inconsistency              | Normalize paths by removing trailing slashes before matching |
| Wildcard pattern matches too broadly   | Incorrect regex conversion                | Ensure `*` converts to `[^/]+` (not `.*`) to match single segment only |
| Performance degradation                | Regex compiled on every request           | Compile regex once when matcher is created (closure)        |
| Matcher matches query parameters       | Not stripping query string from pathname  | Ensure pathname is extracted without query string            |
| Type errors with combinator nesting    | Incorrect return type inference           | Explicitly type combinator return as `PathMatcher`           |

### Reference Materials

- [Next.js Middleware Matcher Config](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher)
- [MDN: Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Path-to-RegExp Library](https://github.com/pillarjs/path-to-regexp) - Reference for pattern syntax

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Core matcher types and basic matchers: 1h
- Pattern matchers and route type matchers: 1h
- Combinators and unit tests: 0.5h
- Documentation and verification: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md) - Edge runtime constraints and middleware patterns
- [AD-2A.6.S1.1: Context Metadata Design](./S1-package-setup.md#ad-2a6s11-context-metadata-design) - Matchers used with conditional middleware that accesses context

### Story-Specific Decisions

#### AD-2A.6.S6.1: Wildcard Syntax Choice

**Scope**: Story-specific (defines pattern syntax for this package only)

**Decision**: Use simple `*` wildcard syntax (e.g., `/api/*/settings`) instead of path-to-regexp syntax (e.g., `/api/:id/settings`).

**Rationale**:

- `*` syntax is more intuitive for developers familiar with glob patterns
- Simpler to explain and document than named parameters
- Named parameters (`:id`) are not needed since matchers only return boolean (don't extract values)
- Conversion to regex is straightforward: `*` → `[^/]+` (match any non-slash characters)
- Aligns with Next.js middleware matcher config which uses glob-like patterns

**Consequences**:

- Developers can use familiar glob pattern syntax
- No parameter extraction capability (if needed, use regex matcher instead)
- Internal implementation converts wildcard to regex for matching
- Multiple wildcards in one pattern supported (e.g., `/api/*/users/*`)

**Alternatives Considered**:

- **Path-to-regexp syntax** - Rejected because named parameters are unnecessary for boolean matching
- **Glob pattern library (minimatch)** - Rejected to avoid external dependency and edge runtime concerns
- **Regex only** - Rejected as less user-friendly for simple patterns

#### AD-2A.6.S6.2: Trailing Slash Handling

**Scope**: Story-specific (applies to matchers in this package only)

**Decision**: Matchers perform strict matching without automatic trailing slash normalization. Applications can opt into normalization by wrapping matchers.

**Rationale**:

- Strict matching is more predictable and explicit
- Different applications have different trailing slash policies
- Next.js itself distinguishes between `/path` and `/path/` in some contexts
- Normalization wrapper can be provided for apps that want it (opt-in)
- Simpler implementation without hidden behavior

**Consequences**:

- `/admin` matcher will not match `/admin/` (and vice versa)
- Applications must handle trailing slashes consistently in their routing
- Optional `withTrailingSlashNormalization(matcher)` wrapper can be provided for opt-in behavior
- Developers must be aware of exact vs normalized matching

**Alternatives Considered**:

- **Always normalize (remove trailing slashes)** - Rejected as it hides behavior and may conflict with some routing needs
- **Always normalize (add trailing slashes)** - Rejected for same reasons
- **Configuration flag for normalization** - Deferred; can be added later if many users request it

## Out of Scope

The following items are explicitly NOT part of this story:

- **Parameter Extraction** - Matchers only return boolean; parameter extraction from paths deferred
- **Query Parameter Matching** - Matchers operate on pathname only; query parameter matching deferred
- **HTTP Method Matching** - Method-based matching deferred (matchers are path-only)
- **Header-Based Matching** - Deferred to future enhancement if needed
- **Matcher Memoization/Caching** - Optimization deferred; matchers should be fast enough without caching
- **Custom Matcher DSL** - No domain-specific language for complex matching; use combinators instead

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package Setup and Middleware Composer - Requires middleware types and `createConditionalMiddleware` pattern

### Enables (Unblocks These Stories)

- **S7**: Integration Tests and Documentation - Requires matchers for testing conditional middleware in complete chain

## References

### Epic & TAD References

- [EPIC.md: Middleware Package Overview](./EPIC.md#overview)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)
- [TAD: Conditional Middleware Pattern](/docs/2-technical/2-tad-edge-middleware.md#middleware-composition-pattern)

### External Documentation

- [Next.js Middleware Matcher](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher)
- [MDN: Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup) completed and middleware types available
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code
- [ ] Performance benchmark: 1000 executions < 1ms

### Documentation

- [ ] JSDoc comments on all exported matcher functions
- [ ] README.md updated with matcher utilities usage examples
- [ ] Inline comments explain wildcard-to-regex conversion logic
- [ ] Examples show combinator usage (AND, OR, NOT)

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(middleware): add route matcher utilities`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.6 and Story S6

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
