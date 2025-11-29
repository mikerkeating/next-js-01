# Story 2A.8.S3: Response Interceptors and Error Handling

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: [S1: Package Setup and Base Client](./S1-package-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Request Interceptors](./S2-request-interceptors.md), [S4: Retry Logic](./S4-retry-logic.md), [S5: Request Caching](./S5-request-caching.md), [S6: File Upload Support](./S6-file-upload.md)

## User Story

**As a** developer consuming the API client
**I want** automatic error handling and structured error responses for common HTTP error codes
**So that** I can handle API failures gracefully without writing repetitive error handling code for each request

## Acceptance Criteria

- [ ] Response interceptor processes all fetch responses before returning to caller
- [ ] 401 Unauthorized errors trigger sign-in redirect in client components and return structured error in server components
- [ ] 403 Forbidden errors return structured error with appropriate error code
- [ ] 404 Not Found errors return structured error with resource-specific context
- [ ] 5xx Server errors return structured error with retry indicator
- [ ] All error responses follow consistent `APIError` structure with status code, message, and error code
- [ ] Error responses include original HTTP status for client handling
- [ ] Response interceptor works in both server and client components
- [ ] Successful responses (2xx) pass through without modification
- [ ] Custom error handlers can be registered for specific status codes

## Technical Requirements

### Files to Create

| Path                                              | Purpose                               |
| ------------------------------------------------- | ------------------------------------- |
| `packages/api-client/src/interceptors/response.ts` | Response interceptor implementation   |
| `packages/api-client/src/errors.ts`               | Error class definitions               |
| `packages/api-client/src/types/error.ts`          | Error type definitions                |
| `packages/api-client/tests/interceptors/response.test.ts` | Response interceptor unit tests |
| `packages/api-client/tests/errors.test.ts`        | Error class unit tests                |

### Files to Modify

| Path                                    | Changes                                    |
| --------------------------------------- | ------------------------------------------ |
| `packages/api-client/src/client.ts`     | Integrate response interceptor into client |
| `packages/api-client/src/index.ts`      | Export error classes and types             |
| `packages/api-client/src/types/index.ts` | Export error types                         |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**No additional dependencies required** - uses existing dependencies from S1:
- `zod` - For error response validation
- Built-in `fetch` API types

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
| --- | --- | --- |
| Error Structure | All errors must follow `APIError` class pattern with `statusCode`, `message`, `code`, and optional `details` | [TAD: API Design](/docs/2-technical/2-tad.md#api-design) |
| Status Code Mapping | Map HTTP status codes to error codes (401→UNAUTHORIZED, 403→FORBIDDEN, 404→NOT_FOUND, 5xx→SERVER_ERROR) | [TAD: API Design](/docs/2-technical/2-tad.md#error-format) |
| Environment Detection | Use `typeof window !== 'undefined'` to detect client vs server component context | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) |

**Configuration Rationale**: Consistent error structure enables predictable error handling across all API consumers. Environment detection ensures appropriate error handling in both server and client components (redirect vs error return).

For complete error response format, see: [TAD: API Design - Error Format](/docs/2-technical/2-tad.md#error-format)

## Test Requirements

### Manual Verification

- [ ] **Client Component 401 Redirect**: Trigger 401 error in client component, verify automatic redirect to Clerk sign-in page
- [ ] **Server Component 401 Error**: Trigger 401 error in server component, verify structured error returned without redirect
- [ ] **403 Error Display**: Trigger 403 error, verify error message displays appropriate "access denied" context
- [ ] **404 Error Display**: Trigger 404 error, verify error message includes resource identifier
- [ ] **500 Error Retry Indicator**: Trigger 500 error, verify error response suggests retry capability

### Automated Tests

- [ ] Unit: `response.test.ts` - Response interceptor handles 2xx success responses
- [ ] Unit: `response.test.ts` - Response interceptor converts 401 to APIError with UNAUTHORIZED code
- [ ] Unit: `response.test.ts` - Response interceptor converts 403 to APIError with FORBIDDEN code
- [ ] Unit: `response.test.ts` - Response interceptor converts 404 to APIError with NOT_FOUND code
- [ ] Unit: `response.test.ts` - Response interceptor converts 5xx to APIError with SERVER_ERROR code
- [ ] Unit: `response.test.ts` - Response interceptor preserves response body in error details
- [ ] Unit: `response.test.ts` - Custom error handlers are invoked for registered status codes
- [ ] Unit: `errors.test.ts` - APIError class correctly stores status, message, code, and details
- [ ] Unit: `errors.test.ts` - Error classes are properly typed for TypeScript inference

### Integration Tests

- [ ] Client component 401 triggers redirect (tested with mock router)
- [ ] Server component 401 returns error without redirect
- [ ] Response interceptor correctly parses JSON error responses from API
- [ ] Response interceptor handles non-JSON error responses gracefully

### Verification Commands

```bash
# Run unit tests with coverage
pnpm --filter @repo/api-client test

# Run type checking
pnpm --filter @repo/api-client type-check

# Run linting
pnpm --filter @repo/api-client lint

# Build package to verify exports
pnpm --filter @repo/api-client build

# Run integration tests (deferred to S7)
pnpm --filter @repo/api-client test:integration
```

## Implementation Notes

### Implementation Sequence

1. **Create Error Classes and Types**
   - Define `APIError` base class with `statusCode`, `message`, `code`, `details`
   - Define specific error subclasses: `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ServerError`
   - Create TypeScript types for error responses

2. **Implement Response Interceptor**
   - Create `processResponse` function that checks response status
   - Map status codes to appropriate error classes
   - Detect environment (client vs server) for 401 handling
   - Parse response body for error details
   - Preserve successful responses (2xx) without modification

3. **Integrate with Base Client**
   - Add response interceptor to fetch wrapper in `client.ts`
   - Chain interceptor after fetch but before retry logic
   - Ensure interceptor works with TypeScript generics

4. **Add Custom Error Handler Support**
   - Allow registration of custom handlers for specific status codes
   - Invoke custom handlers before default error handling
   - Provide API for error handler registration

### Key Concepts

- **Response Interceptor Pattern**: Middleware that processes all HTTP responses before returning to caller, enabling centralized error handling
- **Environment Detection**: Check `typeof window !== 'undefined'` to determine if running in browser (client component) vs Node.js (server component)
- **Error Hierarchy**: Base `APIError` class with specialized subclasses for common HTTP error categories
- **Structured Errors**: Consistent error shape with `success`, `error` object containing `code`, `message`, `details`

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: API Design - Error Format](/docs/2-technical/2-tad.md#error-format) - Standard error response structure
- [TAD: Observability - API Route Error Handling](/docs/2-technical/2-tad-observability.md#api-route-error-handling) - Error handling patterns

Key pattern notes for this story:

- Map HTTP status codes to application-specific error codes for semantic error handling
- Preserve original HTTP status code in error object for HTTP client consumers
- Include error details from API response body when available for debugging
- Use environment detection to provide appropriate UX (redirect vs error) for authentication failures

### Troubleshooting

| Issue | Cause | Solution |
| --- | --- | --- |
| 401 redirect not triggering in client component | Environment detection failing | Verify `typeof window !== 'undefined'` check executes before redirect |
| Error details not populated | Response body not parsed | Ensure response body is read and parsed before creating error object |
| TypeScript errors on error types | Error types not exported | Add error type exports to `src/types/index.ts` and `src/index.ts` |
| Custom error handlers not invoked | Handler registered after interceptor setup | Register custom handlers before making API calls |
| Server component triggering redirect | Environment detection incorrect | Check that server component has `window === undefined` |

### Reference Materials

- [Fetch API MDN - Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Clerk Authentication - Redirects](https://clerk.com/docs/references/nextjs/custom-redirects)
- [TypeScript Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Error classes and types: 1h
- Response interceptor implementation: 2h
- Client integration: 1h
- Unit tests: 1.5h
- Documentation and cleanup: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: API Design - Error Format](/docs/2-technical/2-tad.md#error-format) - Standard error response structure applies to all API client errors
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Environment detection pattern for server vs client components
- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Authentication redirect behavior for 401 errors

### Story-Specific Decisions

#### AD-2A.8.S3.1: Response Interceptor as Separate Module

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement response interceptor as a separate module (`src/interceptors/response.ts`) rather than inline in the base client

**Rationale**:
- Separation of concerns - keeps client.ts focused on core fetch logic
- Easier testing - response interceptor can be unit tested independently
- Reusability - response interceptor can be composed with other interceptors
- Maintainability - error handling logic is centralized in one module

**Consequences**:
- Positive: Cleaner code organization and easier maintenance
- Positive: Better testability with isolated unit tests
- Negative: Slight increase in module complexity (one additional file)

**Alternatives Considered**:
- **Inline in client.ts**: All logic in one file - Rejected because it would make the client file too complex and harder to test

#### AD-2A.8.S3.2: Error Class Hierarchy vs Error Codes Only

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use error class hierarchy (`UnauthorizedError`, `ForbiddenError`, etc.) in addition to error codes

**Rationale**:
- Type safety - TypeScript can narrow error types with `instanceof` checks
- Semantic meaning - Error class name provides immediate context
- Extensibility - Easy to add error-specific methods or properties later
- Developer experience - IDE autocomplete works better with classes

**Consequences**:
- Positive: Better TypeScript IntelliSense and type narrowing
- Positive: More semantic error handling code
- Negative: Slightly larger bundle size (minimal impact)

**Alternatives Considered**:
- **Error codes only**: Single error class with code property - Rejected because it provides less type safety and worse DX

## Out of Scope

The following items are explicitly NOT part of this story:

- **Retry Logic on Error Responses** - Retry logic is implemented in S4; this story only structures errors
- **Request Logging** - Deferred to S2 (Request Interceptors) which handles all request-side concerns
- **Network Error Handling** - Network failures (timeout, connection refused) are handled by retry logic in S4
- **Custom Error Recovery Strategies** - Beyond basic redirect/error return; consumers implement custom recovery
- **Sentry Error Reporting** - Error tracking integration deferred to observability package (Epic 2A.3)
- **Error Translation/i18n** - Error message localization not required for MVP

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup and Base Client** - Response interceptor requires base fetch wrapper and TypeScript configuration from S1

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Complete error handling enables comprehensive integration testing of the full client with all interceptors

## References

### Epic & TAD References

- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: API Design - Error Format](/docs/2-technical/2-tad.md#error-format)
- [TAD: Package Architecture - API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)
- [TAD: Observability - API Route Error Handling](/docs/2-technical/2-tad-observability.md#api-route-error-handling)

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Authentication redirect patterns

### External Documentation

- [Fetch API - Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [TypeScript Error Handling](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Base Client) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Base client fetch wrapper is functional

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage > 80% for new code

### Documentation

- [ ] JSDoc comments on all public error classes and methods
- [ ] Error codes documented in README or API documentation
- [ ] Examples of error handling patterns provided

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
