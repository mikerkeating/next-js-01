# Story 2A.8.S1: Package Setup and Base Client

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: None (first story in epic)
- **Blocks**: [S2](./S2-request-interceptors.md), [S3](./S3-response-interceptors.md), [S4](./S4-retry-logic.md), [S5](./S5-request-caching.md), [S6](./S6-file-upload.md)
- **Runs in Parallel With**: None (foundational story)

## User Story

**As a** developer building Next.js applications
**I want** a foundational API client package that wraps native fetch with TypeScript generics
**So that** I can make type-safe HTTP requests with consistent configuration and error handling

## Acceptance Criteria

- [ ] `@repo/api-client` package is created with proper monorepo structure
- [ ] Base `APIClient` class wraps native `fetch` with TypeScript generics for type-safe request/response handling
- [ ] Client supports all standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- [ ] Configurable base URL and default headers are supported
- [ ] Client works in both server components and client components
- [ ] Request and response types are properly exported for consuming applications
- [ ] Package builds successfully and can be imported by other monorepo packages
- [ ] Unit tests achieve ≥80% coverage for base client functionality

## Technical Requirements

### Files to Create

| Path                                       | Purpose                                 |
| ------------------------------------------ | --------------------------------------- |
| `packages/api-client/package.json`         | Package metadata and dependencies       |
| `packages/api-client/tsconfig.json`        | TypeScript configuration                |
| `packages/api-client/src/index.ts`         | Public API exports                      |
| `packages/api-client/src/client.ts`        | Base API client implementation          |
| `packages/api-client/src/types.ts`         | Type definitions for requests/responses |
| `packages/api-client/src/errors.ts`        | Error classes for API exceptions        |
| `packages/api-client/src/config.ts`        | Client configuration interface          |
| `packages/api-client/tests/client.test.ts` | Unit tests for base client              |
| `packages/api-client/README.md`            | Package documentation                   |

### Files to Modify

| Path                  | Changes                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `pnpm-workspace.yaml` | Add `packages/api-client` to workspace (if not already included via glob) |
| `turbo.json`          | Add `@repo/api-client#build` task configuration                           |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Core dependencies
pnpm add zod --filter @repo/api-client

# Dev dependencies
pnpm add -D typescript vitest @vitest/coverage-v8 --filter @repo/api-client
```

**Workspace dependencies:**

```json
{
  "dependencies": {
    "@repo/validation": "workspace:*",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0"
  }
}
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting   | Requirement                                                          | TAD Reference                                                                     |
| --------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `baseURL` | Configurable API base URL (default: process.env.NEXT_PUBLIC_API_URL) | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `headers` | Default headers including Content-Type (default: application/json)   | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `timeout` | Optional request timeout in milliseconds (default: 30000)            | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `fetch`   | Configurable fetch implementation (default: global fetch)            | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |

**Configuration Rationale**:

- Base URL and headers enable environment-specific configuration (dev/staging/prod)
- Timeout prevents hung requests in production
- Configurable fetch enables testing with mocked implementations
- TypeScript generics provide compile-time type safety for request/response data

For complete configuration templates, see: [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

## Test Requirements

### Manual Verification

- [ ] **Package Import**: Import `@repo/api-client` in a Next.js application and verify no build errors
- [ ] **Server Component Usage**: Use client in a server component (async function component) and verify successful requests
- [ ] **Client Component Usage**: Use client in a client component with 'use client' directive and verify successful requests
- [ ] **Build Output**: Run `pnpm build` and verify dist folder contains properly typed exports

### Automated Tests

- [ ] Unit: `client.test.ts` - Test GET request with TypeScript generics returns correctly typed response
- [ ] Unit: `client.test.ts` - Test POST request with request body type validation
- [ ] Unit: `client.test.ts` - Test PUT, PATCH, DELETE HTTP methods work correctly
- [ ] Unit: `client.test.ts` - Test base URL configuration is properly applied to requests
- [ ] Unit: `client.test.ts` - Test default headers are merged with request-specific headers
- [ ] Unit: `client.test.ts` - Test custom headers override default headers
- [ ] Unit: `client.test.ts` - Test fetch wrapper properly forwards all fetch options
- [ ] Unit: `errors.test.ts` - Test error classes properly extend Error with custom properties

### Integration Tests

N/A - Integration with auth, retry, and caching deferred to subsequent stories (S2-S6). Integration testing consolidated in S7.

### Verification Commands

```bash
# Build the package
pnpm --filter @repo/api-client build

# Run unit tests
pnpm --filter @repo/api-client test

# Run tests with coverage
pnpm --filter @repo/api-client test:coverage

# Type check
pnpm --filter @repo/api-client type-check

# Verify package can be imported
pnpm --filter @repo/routing dev
# Then in routing app code:
# import { APIClient } from '@repo/api-client'
```

## Implementation Notes

### Implementation Sequence

1. **Create Package Structure**
   - Create `packages/api-client` directory
   - Add `package.json` with dependencies
   - Add TypeScript configuration extending `@repo/config/typescript/base`
   - Add build script using `tsup` for bundling

2. **Define Types and Interfaces**
   - Create `types.ts` with generic request/response types
   - Create `config.ts` with `APIClientConfig` interface
   - Create `errors.ts` with custom error classes (APIError, NetworkError, etc.)

3. **Implement Base Client**
   - Create `client.ts` with `APIClient` class
   - Implement constructor accepting `APIClientConfig`
   - Implement private `fetch` wrapper method with generics
   - Implement public HTTP methods (get, post, put, patch, delete)
   - Add URL construction logic (baseURL + endpoint)
   - Add header merging logic (defaults + request-specific)

4. **Export Public API**
   - Create `index.ts` re-exporting all public types and classes
   - Ensure clean API surface with no internal implementation leaks

5. **Write Tests**
   - Mock global fetch in test setup
   - Test each HTTP method independently
   - Test configuration options (baseURL, headers, timeout)
   - Test error handling for network failures
   - Verify TypeScript generics provide correct type inference

6. **Document Package**
   - Create README with installation, usage examples, and API reference
   - Add JSDoc comments to all public methods and types
   - Document configuration options with examples

### Key Concepts

- **Native Fetch Wrapper**: The client wraps native `fetch` rather than using external libraries (axios, ky) to ensure maximum compatibility with Next.js server and client components, including Edge runtime
- **TypeScript Generics**: All request methods use generics (`<TResponse, TRequest = unknown>`) to provide compile-time type safety without runtime overhead
- **Immutable Configuration**: Once created, the client's base configuration (baseURL, default headers) is immutable; per-request options are merged without mutating the base config
- **Error Hierarchy**: Custom error classes extend `Error` to provide structured error information (status code, response body, original error)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: API Client Structure](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)
- [TAD: TypeScript Generics for API Calls](/docs/2-technical/2-tad.md#api-design)
- [TAD: Monorepo Package Setup](/docs/2-technical/2-tad-package-architecture.md)

Key pattern notes for this story:

- Use TypeScript generics on all HTTP methods to enable type inference: `client.get<User>('/users/123')` should infer return type as `Promise<User>`
- Merge headers using spread operator to avoid mutating default configuration
- Construct URLs by joining baseURL and endpoint, handling trailing/leading slashes correctly
- Wrap fetch errors in custom error classes to provide consistent error interface across the application

### Troubleshooting

| Issue                                   | Cause                                         | Solution                                                                                            |
| --------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| "Cannot find module '@repo/api-client'" | Package not built or not in pnpm workspace    | Run `pnpm install` at root to link workspace packages, then `pnpm build --filter @repo/api-client`  |
| Type inference not working for response | Generic type not specified or inferred        | Explicitly specify response type: `client.get<UserResponse>('/users')`                              |
| Headers not being applied               | Header merging order incorrect                | Ensure request headers are spread after default headers: `{ ...defaultHeaders, ...requestHeaders }` |
| Timeout not working                     | Native fetch doesn't support timeout directly | Will be implemented via AbortController in future enhancement; for now, document limitation         |
| Client not working in Edge runtime      | Using Node.js-specific APIs                   | Ensure only Web APIs are used (fetch, Headers, URL, AbortController)                                |

### Reference Materials

- [Fetch API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TypeScript Generics Handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Next.js Data Fetching - Server vs Client](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Vercel Edge Runtime APIs](https://edge-runtime.vercel.app/features/available-apis)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Package setup and configuration: 1h
- Type definitions and error classes: 1h
- Base client implementation: 2h
- Unit tests: 1.5h
- Documentation and verification: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Native Fetch over HTTP Libraries](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) - Use native fetch API for server/client/edge compatibility
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Package naming and workspace setup
- [TAD: TypeScript Generics for Type Safety](/docs/2-technical/2-tad.md#api-design) - Use generics for request/response typing

### Story-Specific Decisions

#### AD-2A.8.S1.1: Base Client as Class vs Factory Function

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement the API client as a class (`APIClient`) rather than a factory function or singleton.

**Rationale**:

- **Instance Configuration**: Class instances allow multiple clients with different configurations (e.g., different base URLs for different API services)
- **Inheritance Support**: Future stories may need to extend the base client with additional functionality (interceptors, caching); classes provide clean inheritance
- **State Encapsulation**: Private properties and methods provide clear boundaries between public API and internal implementation
- **TypeScript Alignment**: Class syntax provides better IDE autocomplete and type inference than factory functions

**Consequences**:

- Consuming applications must instantiate the client: `const api = new APIClient(config)` rather than `const api = createAPIClient(config)`
- Multiple client instances may exist in the same application (acceptable for multi-service architectures)
- Memory overhead is minimal (configuration object only)

**Alternatives Considered**:

- **Factory Function**: `createAPIClient(config)` - Rejected because it provides no advantage over class instantiation and loses IDE support for instance methods
- **Singleton Pattern**: Single shared instance - Rejected because it prevents multi-service API clients and makes testing more difficult

#### AD-2A.8.S1.2: Error Class Hierarchy

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create a base `APIError` class with specialized subclasses for different error types (NetworkError, ValidationError, AuthenticationError, NotFoundError).

**Rationale**:

- **Granular Error Handling**: Consuming code can catch specific error types: `catch (error) { if (error instanceof AuthenticationError) { ... } }`
- **Structured Error Data**: Each error class carries relevant context (status code, response body, request URL)
- **TypeScript Discrimination**: Union types and instanceof checks enable type-safe error handling
- **Extensibility**: Future stories can add new error types without modifying existing code

**Consequences**:

- Error handling code can be more specific and actionable
- Error classes must be exported from the package for consumers to use in instanceof checks
- All HTTP errors will be converted to typed error instances (never raw Response objects)

**Alternatives Considered**:

- **Single Error Class**: All errors as `APIError` with a `type` property - Rejected because it loses TypeScript type narrowing benefits
- **Plain Objects**: Return `{ error: true, message: string }` - Rejected because it doesn't integrate with JavaScript error handling (try/catch)

## Out of Scope

The following items are explicitly NOT part of this story:

- **Authentication Token Injection** - Handled in S2 (Request Interceptors and Auth Integration)
- **Response Error Handling (401, 403, 500)** - Handled in S3 (Response Interceptors and Error Handling)
- **Retry Logic** - Handled in S4 (Retry Logic with Exponential Backoff)
- **Request Caching** - Handled in S5 (Request Caching Utilities)
- **File Upload Support** - Handled in S6 (File Upload Support)
- **Timeout Implementation** - Deferred to future enhancement; native fetch timeout requires AbortController integration
- **Request Queuing** - Not required for MVP; may be added in future if needed
- **GraphQL Support** - Out of scope for entire epic; REST-only
- **WebSocket/Real-time** - Out of scope for entire epic; deferred to Epic 3B.6

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - This is the foundational story for the API Client package.

### Enables (Unblocks These Stories)

- **S2**: [Request Interceptors and Auth Integration](./S2-request-interceptors.md) - Requires base client to add interceptor hooks
- **S3**: [Response Interceptors and Error Handling](./S3-response-interceptors.md) - Requires base client to add response processing
- **S4**: [Retry Logic with Exponential Backoff](./S4-retry-logic.md) - Requires base client to wrap with retry mechanism
- **S5**: [Request Caching Utilities](./S5-request-caching.md) - Requires base client to add caching layer
- **S6**: [File Upload Support](./S6-file-upload.md) - Requires base client to extend with multipart/form-data support

## References

### Epic & TAD References

- [EPIC.md: API Client Package](./EPIC.md)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)
- [TAD: API Design](/docs/2-technical/2-tad.md#api-design)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Fetch API Specification](https://fetch.spec.whatwg.org/)
- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Next.js: Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
- [Vercel Edge Runtime](https://edge-runtime.vercel.app/)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (N/A - no dependencies)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Monorepo setup complete (pnpm, Turborepo)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥80% for new code (`pnpm test:coverage`)

### Documentation

- [ ] Code comments where logic isn't self-evident
- [ ] README.md includes installation, usage examples, and API reference
- [ ] All public methods and types have JSDoc comments
- [ ] Architecture decisions documented (AD-2A.8.S1.1 and AD-2A.8.S1.2)

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(api-client): add base client package")
- [ ] No unrelated changes included
- [ ] PR description references story and epic

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
