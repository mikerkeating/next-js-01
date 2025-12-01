# Story 2A.8.S2: Request Interceptors and Auth Integration

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: [S1](./S1-package-setup.md) - Requires base client to add interceptor hooks
- **Blocks**: [S7](./S7-integration-tests.md) - Provides authenticated request functionality for integration testing
- **Runs in Parallel With**: [S3](./S3-response-interceptors.md), [S4](./S4-retry-logic.md), [S5](./S5-request-caching.md), [S6](./S6-file-upload.md)

## User Story

**As a** developer building authenticated Next.js applications
**I want** automatic authentication token injection for API requests
**So that** I don't have to manually manage tokens and can ensure secure authenticated requests

## Acceptance Criteria

- [ ] Request interceptor architecture allows multiple interceptors to be registered and executed in sequence
- [ ] Authentication token is automatically retrieved from `@repo/auth` and injected into request headers
- [ ] Client supports both authenticated and unauthenticated requests via configuration flag
- [ ] Token injection works in both server components and client components
- [ ] Interceptors can modify request headers, URL, body, and fetch options before request execution
- [ ] Interceptor errors are properly handled and propagated with context
- [ ] Unit tests achieve ≥80% coverage for interceptor functionality
- [ ] Integration tests verify token injection with `@repo/auth` package

## Technical Requirements

### Files to Create

| Path                                                     | Purpose                                    |
| -------------------------------------------------------- | ------------------------------------------ |
| `packages/api-client/src/interceptors/types.ts`          | Interceptor type definitions               |
| `packages/api-client/src/interceptors/request.ts`        | Request interceptor chain implementation   |
| `packages/api-client/src/interceptors/auth.ts`           | Authentication token injection interceptor |
| `packages/api-client/tests/interceptors/request.test.ts` | Unit tests for request interceptor chain   |
| `packages/api-client/tests/interceptors/auth.test.ts`    | Unit tests for auth interceptor            |
| `packages/api-client/tests/integration/auth.test.ts`     | Integration tests with @repo/auth          |

### Files to Modify

| Path                                | Changes                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `packages/api-client/src/client.ts` | Add interceptor registration and execution to base client  |
| `packages/api-client/src/config.ts` | Add `interceptors` and `requireAuth` configuration options |
| `packages/api-client/src/index.ts`  | Export interceptor types and auth interceptor              |
| `packages/api-client/package.json`  | Add `@repo/auth` workspace dependency                      |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Workspace dependencies
pnpm add @repo/auth --filter @repo/api-client --workspace
```

**Updated dependencies:**

```json
{
  "dependencies": {
    "@repo/auth": "workspace:*",
    "@repo/validation": "workspace:*",
    "zod": "^3.22.0"
  }
}
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting           | Requirement                                                                | TAD Reference                                                                     |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `interceptors`    | Optional array of request interceptor functions                            | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `requireAuth`     | Boolean flag to enable automatic token injection (default: true)           | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `authTokenGetter` | Optional custom function to retrieve auth token (default: uses @repo/auth) | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |

**Configuration Rationale**:

- Interceptors array enables extensible request modification (logging, headers, transformation)
- `requireAuth` flag allows opt-in/opt-out authentication per client instance
- Custom `authTokenGetter` enables testing with mocked tokens and alternative auth providers
- Interceptor chain executes in array order, allowing precise control over modification sequence

For complete configuration templates, see: [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

## Test Requirements

### Manual Verification

- [ ] **Server Component Auth**: Create a server component that uses the client with `requireAuth: true` and verify Authorization header is added
- [ ] **Client Component Auth**: Create a client component that uses the client with `requireAuth: true` and verify Authorization header is added
- [ ] **Unauthenticated Requests**: Create client with `requireAuth: false` and verify no Authorization header is added
- [ ] **Custom Interceptor**: Register a custom interceptor that adds a custom header and verify it's present in requests

### Automated Tests

- [ ] Unit: `request.test.ts` - Test interceptor chain executes interceptors in registration order
- [ ] Unit: `request.test.ts` - Test interceptor can modify request headers
- [ ] Unit: `request.test.ts` - Test interceptor can modify request URL
- [ ] Unit: `request.test.ts` - Test interceptor can modify request body
- [ ] Unit: `request.test.ts` - Test interceptor error is caught and wrapped with context
- [ ] Unit: `auth.test.ts` - Test auth interceptor retrieves token from @repo/auth
- [ ] Unit: `auth.test.ts` - Test auth interceptor adds Authorization header with Bearer token
- [ ] Unit: `auth.test.ts` - Test auth interceptor skips when requireAuth is false
- [ ] Unit: `auth.test.ts` - Test auth interceptor throws when token is unavailable and requireAuth is true
- [ ] Integration: `auth.test.ts` - Test real @repo/auth integration returns valid token
- [ ] Integration: `auth.test.ts` - Test token is properly formatted (Bearer {token})

### Integration Tests

- [ ] Verify auth interceptor correctly calls `@repo/auth` token getter (e.g., `auth()` from `@clerk/nextjs/server`)
- [ ] Verify server component requests include valid Clerk session token
- [ ] Verify client component requests include valid Clerk session token
- [ ] Verify unauthenticated requests (requireAuth: false) do not call @repo/auth

### Verification Commands

```bash
# Run unit tests
pnpm --filter @repo/api-client test

# Run tests with coverage
pnpm --filter @repo/api-client test:coverage

# Run integration tests specifically
pnpm --filter @repo/api-client test:integration

# Type check
pnpm --filter @repo/api-client type-check

# Test in consuming app (routing)
pnpm --filter @repo/routing dev
# Then test authenticated API calls in browser
```

## Implementation Notes

### Implementation Sequence

1. **Define Interceptor Types**
   - Create `types.ts` with `RequestInterceptor` function type
   - Define `InterceptorContext` interface with request metadata
   - Define `InterceptorError` class for wrapping interceptor failures

2. **Implement Interceptor Chain**
   - Create `request.ts` with `executeInterceptors` function
   - Implement sequential execution of interceptor array
   - Add error handling that wraps interceptor errors with context
   - Return modified request configuration

3. **Implement Auth Interceptor**
   - Create `auth.ts` with `createAuthInterceptor` factory function
   - Integrate with `@repo/auth` to retrieve session token
   - Add logic to inject token into Authorization header
   - Handle missing token scenarios (throw error if required, skip if optional)

4. **Integrate with Base Client**
   - Modify `client.ts` constructor to accept `interceptors` and `requireAuth` config
   - Add auth interceptor to interceptor chain when `requireAuth` is true
   - Call `executeInterceptors` before each fetch call
   - Pass modified request config to fetch

5. **Update Configuration**
   - Add `interceptors`, `requireAuth`, and `authTokenGetter` to `APIClientConfig` interface
   - Set default values (requireAuth: true, interceptors: [])
   - Export configuration types

6. **Write Tests**
   - Mock `@repo/auth` in tests
   - Test interceptor chain with multiple interceptors
   - Test auth interceptor in isolation
   - Test integration with real @repo/auth package
   - Verify error handling and propagation

### Key Concepts

- **Interceptor Pattern**: Interceptors are functions that modify requests before execution, enabling cross-cutting concerns (auth, logging, headers) without modifying core client logic
- **Chain of Responsibility**: Interceptors execute in sequence, each receiving the output of the previous interceptor, allowing composition of modifications
- **Dependency Injection**: Auth token getter is injected via configuration, enabling testing with mock tokens and flexibility for different auth providers
- **Opt-in Authentication**: `requireAuth` flag allows client instances to be created with or without automatic authentication, supporting public API endpoints

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: API Client Structure](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)
- [TAD: Clerk Authentication Integration](/docs/2-technical/2-tad.md#authentication)
- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)

Key pattern notes for this story:

- Use factory function pattern for `createAuthInterceptor` to close over configuration (requireAuth, authTokenGetter)
- Interceptor functions should be pure (no side effects except request modification) to enable testing and composability
- Execute interceptors sequentially using async/await, not Promise.all, to ensure order and allow each interceptor to see previous modifications
- Use spread operator to avoid mutating original request config: `{ ...config, headers: { ...config.headers, Authorization: ... } }`

### Troubleshooting

| Issue                                            | Cause                                                   | Solution                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| "Cannot read property 'getToken' from undefined" | @repo/auth not properly imported or mocked              | Ensure @repo/auth is installed as workspace dependency and properly mocked in tests                       |
| Authorization header not present in requests     | requireAuth is false or auth interceptor not registered | Verify client is instantiated with `requireAuth: true`                                                    |
| Token is null or undefined                       | User not authenticated in Clerk                         | Check Clerk session state; ensure user is signed in before making authenticated requests                  |
| Interceptor order incorrect                      | Interceptors registered in wrong order                  | Review interceptor array order in config; auth interceptor should typically run early                     |
| Type errors on interceptor function              | Incorrect interceptor signature                         | Ensure interceptor matches `RequestInterceptor` type: `(config: RequestConfig) => Promise<RequestConfig>` |

### Reference Materials

- [Clerk Authentication - Server-side](https://clerk.com/docs/references/nextjs/auth)
- [Clerk Authentication - Client-side](https://clerk.com/docs/references/react/use-auth)
- [Interceptor Pattern - Martin Fowler](https://martinfowler.com/bliki/InterceptingFilter.html)
- [Chain of Responsibility - Refactoring Guru](https://refactoring.guru/design-patterns/chain-of-responsibility)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Interceptor types and chain implementation: 1.5h
- Auth interceptor implementation: 1.5h
- Base client integration: 1h
- Unit tests: 1.5h
- Integration tests and verification: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Use Clerk as authentication provider
- [TAD: API Client Auth Integration](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) - Token injection via @repo/auth
- [AD-2A.8.S1.1: Base Client as Class](/docs/3-epics/2A.8-api-client/S1-package-setup.md#ad-2a8s11-base-client-as-class-vs-factory-function) - Client instance pattern enables per-instance interceptor configuration

### Story-Specific Decisions

#### AD-2A.8.S2.1: Interceptor Execution Order (Sequential vs Parallel)

**Scope**: Story-specific (does not affect other stories)

**Decision**: Execute interceptors sequentially in array order using async/await, not in parallel with Promise.all.

**Rationale**:

- **Order Guarantee**: Each interceptor sees the modifications made by previous interceptors, enabling composition (e.g., auth interceptor adds token, logging interceptor logs token presence)
- **Debugging**: Sequential execution provides predictable behavior and easier debugging than parallel execution
- **Error Handling**: Sequential execution allows early termination if an interceptor fails, preventing unnecessary work
- **Performance**: Interceptors are typically fast (header modification, token retrieval); sequential overhead is negligible

**Consequences**:

- Interceptor chain has predictable, deterministic behavior
- Interceptors can depend on modifications from earlier interceptors
- Total interceptor execution time is sum of individual times (not parallelized)
- Interceptor registration order matters (document clearly)

**Alternatives Considered**:

- **Parallel Execution**: `Promise.all(interceptors.map(...))` - Rejected because it prevents composition and makes debugging harder
- **Named Interceptors with Dependency Graph**: Register interceptors with dependencies, execute based on graph - Rejected as over-engineered for current needs

#### AD-2A.8.S2.2: Auth Interceptor as Default vs Explicit

**Scope**: Story-specific (does not affect other stories)

**Decision**: Automatically register auth interceptor when `requireAuth: true`, rather than requiring explicit registration in `interceptors` array.

**Rationale**:

- **Developer Experience**: Default behavior makes authentication "just work" without manual interceptor registration
- **Consistency**: All authenticated clients get the same auth behavior without potential for misconfiguration
- **Error Prevention**: Prevents forgetting to add auth interceptor to interceptors array
- **Flexibility**: Can still disable auth via `requireAuth: false` or customize via `authTokenGetter`

**Consequences**:

- Auth interceptor always executes first (before custom interceptors) when enabled
- Developers cannot control auth interceptor position in chain (acceptable for security)
- Client configuration is simpler: `new APIClient({ requireAuth: true })` vs `new APIClient({ interceptors: [authInterceptor, ...] })`

**Alternatives Considered**:

- **Explicit Registration**: Require auth interceptor in `interceptors` array - Rejected because it increases boilerplate and error potential
- **Auth as Separate Method**: `client.withAuth()` method - Rejected because it requires wrapper client pattern and complicates type inference

## Out of Scope

The following items are explicitly NOT part of this story:

- **Token Refresh Logic** - Handled by `@repo/auth` package internally (Clerk manages refresh)
- **Response Interceptors** - Handled in S3 (Response Interceptors and Error Handling)
- **Retry Logic** - Handled in S4 (Retry Logic with Exponential Backoff)
- **Request Caching** - Handled in S5 (Request Caching Utilities)
- **Logging Interceptor** - Deferred to future enhancement; can be added by consumers via custom interceptor
- **Request Transformation** - Beyond auth token injection, deferred to consumer-defined interceptors
- **Multi-tenant Org Context** - Organization header injection deferred to @repo/org integration (post-MVP)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: [Package Setup and Base Client](./S1-package-setup.md) - Requires base client class and fetch wrapper to add interceptor hooks

### Enables (Unblocks These Stories)

- **S7**: [Integration Tests and Documentation](./S7-integration-tests.md) - Authenticated request functionality needed for comprehensive integration tests

## References

### Epic & TAD References

- [EPIC.md: API Client Package](./EPIC.md)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)
- [TAD: Authentication](/docs/2-technical/2-tad.md#authentication)

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md)

### External Documentation

- [Clerk Server-side Auth](https://clerk.com/docs/references/nextjs/auth)
- [Clerk useAuth Hook](https://clerk.com/docs/references/react/use-auth)
- [Fetch API Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- [Authorization Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Base Client) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] @repo/auth package available and configured with Clerk

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥80% for new code (`pnpm test:coverage`)

### Documentation

- [ ] Code comments where logic isn't self-evident
- [ ] JSDoc comments on all public interceptor types and functions
- [ ] Architecture decisions documented (AD-2A.8.S2.1 and AD-2A.8.S2.2)
- [ ] README updated with interceptor usage examples

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(api-client): add request interceptors and auth integration")
- [ ] No unrelated changes included
- [ ] PR description references story and epic

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
