# Story 2A.6.S1: Package Setup and Middleware Composer

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Middleware Package (Generic)](./EPIC.md)
- **Depends On**: None (first story)
- **Blocks**: [S2](./S2-logging-middleware.md), [S3](./S3-security-headers.md), [S4](./S4-rate-limiting.md), [S5](./S5-cors-middleware.md), [S6](./S6-route-matchers.md)
- **Runs in Parallel With**: None

## User Story

**As a** platform developer
**I want** a foundational middleware package with a composable middleware chain system
**So that** I can build complex edge middleware by combining simple, reusable functions

## Acceptance Criteria

- [ ] `@repo/middleware` package created with proper Turborepo configuration
- [ ] Middleware composition function executes middleware in order and supports short-circuit responses
- [ ] Context object passes data between middleware functions in the chain
- [ ] Conditional middleware executes only when path matcher returns true
- [ ] Error handling wrapper catches middleware errors and returns 500 responses
- [ ] Package exports TypeScript types for middleware functions and context
- [ ] Unit tests verify composition, short-circuit, context passing, and error handling
- [ ] Package builds successfully and can be imported by other packages

## Technical Requirements

### Files to Create

| Path                                          | Purpose                                  |
| --------------------------------------------- | ---------------------------------------- |
| `packages/middleware/package.json`            | Package configuration                    |
| `packages/middleware/tsconfig.json`           | TypeScript configuration                 |
| `packages/middleware/src/index.ts`            | Package entry point with re-exports      |
| `packages/middleware/src/composer.ts`         | Middleware composition utilities         |
| `packages/middleware/src/types.ts`            | Shared TypeScript types                  |
| `packages/middleware/tests/composer.test.ts`  | Unit tests for composition               |
| `packages/middleware/README.md`               | Package documentation                    |
| `packages/middleware/.eslintrc.js`            | ESLint configuration                     |
| `packages/middleware/tsup.config.ts`          | Build configuration                      |

### Files to Modify

| Path          | Changes                                        |
| ------------- | ---------------------------------------------- |
| `turbo.json`  | Add middleware package to pipeline             |
| `pnpm-workspace.yaml` | Ensure packages/middleware is included |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/middleware

# Production dependencies
pnpm add next

# Development dependencies
pnpm add -D typescript @types/node vitest @vitest/coverage-v8 tsup
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
| ------- | ----------- | ------------- |
| TypeScript `compilerOptions.target` | ES2022 | [TAD: TypeScript Configuration](/docs/2-technical/2-tad.md#typescript-configuration) |
| TypeScript `compilerOptions.module` | ESNext | [TAD: TypeScript Configuration](/docs/2-technical/2-tad.md#typescript-configuration) |
| TypeScript `compilerOptions.strict` | true | [TAD: TypeScript Configuration](/docs/2-technical/2-tad.md#typescript-configuration) |
| Turborepo build task | `pnpm build` | [TAD: Monorepo Build Pipeline](/docs/2-technical/2-tad.md#turborepo-configuration) |

**Configuration Rationale**: Edge middleware requires strict TypeScript configuration to catch runtime errors early. ES2022 target ensures compatibility with Vercel Edge runtime. Turborepo integration enables incremental builds across the monorepo.

For complete configuration templates, see: [TAD: Package Configuration](/docs/2-technical/2-tad.md#package-configuration)

## Test Requirements

### Manual Verification

- [ ] **Package Import**: Create a test file that imports `@repo/middleware` and verify no module resolution errors
- [ ] **Type Checking**: Run TypeScript compiler and verify all types resolve correctly

### Automated Tests

- [ ] Unit: `composer.test.ts` - Middleware chain executes in order
- [ ] Unit: `composer.test.ts` - Middleware chain short-circuits when middleware returns response
- [ ] Unit: `composer.test.ts` - Context object passes data between middleware
- [ ] Unit: `composer.test.ts` - Conditional middleware only executes when matcher returns true
- [ ] Unit: `composer.test.ts` - Error handling wrapper catches errors and returns 500 response
- [ ] Unit: `composer.test.ts` - Headers are properly forwarded to application after middleware chain completes

### Integration Tests

N/A - Integration testing deferred to S7 (Integration Tests and Documentation) which tests complete middleware chain with all middleware implementations.

### Verification Commands

```bash
# Build package
cd packages/middleware
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint

# Verify package exports
node -e "console.log(require('./dist/index.js'))"
```

## Implementation Notes

### Implementation Sequence

1. **Package Structure**
   - Create `packages/middleware` directory
   - Add `package.json` with dependencies and scripts
   - Configure TypeScript with strict mode and edge-compatible target
   - Add tsup build configuration for dual ESM/CJS output

2. **Core Types**
   - Define `MiddlewareFunction` type signature
   - Define `MiddlewareContext` interface with userId, organizationId, role, and metadata
   - Export types for external use

3. **Middleware Composer**
   - Implement `composeMiddleware` function that chains middleware
   - Support short-circuit when middleware returns NextResponse
   - Pass context object through middleware chain
   - Forward context data to application via request headers

4. **Utility Functions**
   - Implement `createConditionalMiddleware` for path-based execution
   - Implement `withErrorHandling` wrapper for graceful error handling
   - Add JSDoc comments for all exported functions

5. **Testing**
   - Write unit tests for composition logic
   - Test short-circuit behavior
   - Test context passing
   - Test error handling
   - Achieve ≥80% code coverage

6. **Documentation**
   - Create README with usage examples
   - Document all exported functions with JSDoc
   - Add inline comments for complex logic

### Key Concepts

- **Middleware Composition**: Combining multiple middleware functions into a single function that executes them sequentially
- **Short-Circuit Execution**: Stopping middleware chain execution when a middleware returns a response instead of undefined
- **Context Passing**: Shared mutable object that allows middleware to communicate data to downstream middleware
- **Edge Runtime Constraints**: Middleware must use Web APIs only (no Node.js APIs) and complete within execution time limits

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Middleware Chain Composition](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition)
- [TAD: Conditional Middleware Pattern](/docs/2-technical/2-tad-edge-middleware.md#middleware-composition-pattern)
- [TAD: Error Handling Middleware](/docs/2-technical/2-tad-edge-middleware.md#middleware-composition-pattern)

Key pattern notes for this story:

- Use `for...of` loop (not `forEach`) to enable early return on short-circuit
- Always initialize context with empty `metadata` object to prevent undefined errors
- Headers must be passed using `NextResponse.next()` with custom request headers
- Error handling should log errors but never expose internal details to client

### Troubleshooting

| Issue | Cause | Solution |
| ----- | ----- | -------- |
| "Cannot find module '@repo/middleware'" | Package not built or Turborepo cache stale | Run `pnpm build` in middleware package, then `turbo build --force` |
| TypeScript errors about NextRequest/NextResponse | Missing or incorrect Next.js types | Ensure `next` is installed as dependency (not devDependency) |
| Middleware not executing in expected order | Middleware returning response instead of void | Verify middleware returns `undefined` (or nothing) to continue chain |
| Context not passing between middleware | Context object being replaced instead of mutated | Ensure middleware mutates context properties, not reassigns context |
| Headers not forwarding to application | Using wrong NextResponse method | Use `NextResponse.next({ request: { headers } })` not `NextResponse.json()` |

### Reference Materials

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Vercel Edge Runtime API](https://edge-runtime.vercel.app/packages/primitives)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Package setup and configuration: 1h
- Middleware composer implementation: 2h
- Utility functions (conditional, error handling): 1.5h
- Unit tests and coverage: 1h
- Documentation and verification: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md) - Edge runtime constraints and composition patterns
- [TAD: Monorepo Package Structure](/docs/2-technical/2-tad.md#package-structure) - Package naming conventions and organization

### Story-Specific Decisions

#### AD-2A.6.S1.1: Context Metadata Design

**Scope**: Story-specific (defines context structure for this package only)

**Decision**: Use a two-tier context structure with known fields (`userId`, `organizationId`, `role`) at the top level and unknown fields in a `metadata` Record.

**Rationale**:

- Provides type safety for commonly-used authentication/authorization fields
- `metadata` Record allows middleware to store arbitrary data without type conflicts
- Prevents middleware from accidentally overwriting critical auth fields
- Simplifies TypeScript usage by avoiding excessive generics

**Consequences**:

- Known fields have autocomplete and type checking
- Custom middleware data goes in `metadata` with string keys
- Slightly more verbose to access custom data (`context.metadata.foo` vs `context.foo`)

**Alternatives Considered**:

- **Fully generic context with type parameter** - Rejected because it adds complexity and doesn't scale well with many middleware in a chain
- **Flat context object with all unknown properties** - Rejected because it loses type safety for auth fields

#### AD-2A.6.S1.2: Header Forwarding Strategy

**Scope**: Story-specific (applies to composer only)

**Decision**: Forward context values to application via custom request headers (`x-user-id`, `x-organization-id`, `x-user-role`) when no middleware returns a response.

**Rationale**:

- Next.js server components and route handlers cannot directly access middleware context
- Headers are the standard mechanism for passing data from middleware to application code
- `x-` prefix clearly indicates custom headers added by middleware
- Lowercase header names follow HTTP/2 conventions

**Consequences**:

- Application code reads from `headers()` to access user/org context
- Headers are visible in browser dev tools (acceptable for non-sensitive IDs)
- Slight performance overhead from header serialization (minimal < 1ms)

**Alternatives Considered**:

- **Store context in Edge Config/KV** - Rejected due to latency overhead and complexity
- **Use cookies for context** - Rejected because it pollutes cookie namespace and has size limits

## Out of Scope

The following items are explicitly NOT part of this story:

- **Actual Middleware Implementations** - Logging, security headers, rate limiting, etc. are implemented in S2-S6
- **CORS Configuration** - Handled in S5 (CORS Middleware)
- **Rate Limiting Logic** - Handled in S4 (Rate Limiting Middleware)
- **Integration Testing** - Deferred to S7 (Integration Tests and Documentation)
- **Production Deployment** - Package will be published but not yet used in production applications

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - This is the foundation story for the middleware package.

### Enables (Unblocks These Stories)

- **S2**: Logging Middleware - Requires middleware composer and types
- **S3**: Security Headers Middleware - Requires middleware composer and types
- **S4**: Rate Limiting Middleware - Requires middleware composer and types
- **S5**: CORS Middleware - Requires middleware composer and types
- **S6**: Route Matcher Utilities - Requires middleware types and conditional middleware pattern
- **S7**: Integration Tests and Documentation - Requires composer to test complete middleware chain

## References

### Epic & TAD References

- [EPIC.md: Middleware Package Overview](./EPIC.md#overview)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)
- [TAD: Middleware Chain Composition](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition)

### External Documentation

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Vercel Edge Runtime](https://edge-runtime.vercel.app/)

## Verification Checklist

### Pre-Verification

- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Turborepo is properly configured in root `turbo.json`

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code

### Documentation

- [ ] JSDoc comments on all exported functions
- [ ] README.md includes usage examples
- [ ] Inline comments explain complex composition logic

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(middleware): add middleware composer`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.6 and Story S1

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
