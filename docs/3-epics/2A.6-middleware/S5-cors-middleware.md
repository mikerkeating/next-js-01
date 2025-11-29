# Story 2A.6.S5: CORS Middleware

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Middleware Package (Generic)](./EPIC.md)
- **Depends On**: [S1](./S1-package-setup.md)
- **Blocks**: [S7](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2](./S2-logging-middleware.md), [S3](./S3-security-headers.md), [S4](./S4-rate-limiting.md), [S6](./S6-route-matchers.md)

## User Story

**As a** platform developer
**I want** configurable CORS middleware for cross-origin requests
**So that** I can securely allow specific origins, methods, and headers for API endpoints while blocking unauthorized cross-origin access

## Acceptance Criteria

- [ ] CORS middleware handles preflight OPTIONS requests with appropriate headers
- [ ] CORS middleware allows configurable allowed origins (string array or wildcard)
- [ ] CORS middleware allows configurable allowed methods (defaults to GET, POST, PUT, DELETE, PATCH)
- [ ] CORS middleware allows configurable allowed headers
- [ ] CORS middleware sets Access-Control-Allow-Credentials when credentials are enabled
- [ ] CORS middleware sets Access-Control-Max-Age for preflight caching
- [ ] CORS middleware applies to actual requests (not just preflight) with Access-Control-Allow-Origin
- [ ] CORS middleware supports wildcard origins (`*`) for public APIs
- [ ] CORS middleware validates origin against allowed list and rejects unauthorized origins
- [ ] Unit tests verify preflight handling, origin validation, and header setting

## Technical Requirements

### Files to Create

| Path                                        | Purpose                           |
| ------------------------------------------- | --------------------------------- |
| `packages/middleware/src/cors.ts`           | CORS middleware implementation    |
| `packages/middleware/tests/cors.test.ts`    | Unit tests for CORS middleware    |

### Files to Modify

| Path                                  | Changes                                  |
| ------------------------------------- | ---------------------------------------- |
| `packages/middleware/src/index.ts`    | Export CORS middleware and config types  |
| `packages/middleware/README.md`       | Add CORS middleware usage documentation  |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

All dependencies already installed in S1. No additional dependencies required.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                    | Requirement                                       | TAD Reference                                                           |
| -------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `allowedOrigins`           | String array or `"*"` wildcard                    | [TAD: CORS Configuration](/docs/2-technical/2-tad-edge-middleware.md)   |
| `allowedMethods`           | HTTP method array (GET, POST, PUT, DELETE, PATCH) | [TAD: CORS Configuration](/docs/2-technical/2-tad-edge-middleware.md)   |
| `allowedHeaders`           | Header name array or `"*"` wildcard               | [TAD: CORS Configuration](/docs/2-technical/2-tad-edge-middleware.md)   |
| `allowCredentials`         | Boolean (enables Access-Control-Allow-Credentials)| [TAD: CORS Configuration](/docs/2-technical/2-tad-edge-middleware.md)   |
| `maxAge`                   | Number in seconds (preflight cache duration)      | [TAD: CORS Configuration](/docs/2-technical/2-tad-edge-middleware.md)   |
| `exposeHeaders`            | Header name array (accessible to client)          | [TAD: CORS Configuration](/docs/2-technical/2-tad-edge-middleware.md)   |

**Configuration Rationale**: CORS middleware must be highly configurable to support different API security requirements. Public APIs may use wildcard origins, while authenticated APIs should restrict origins to known domains. Preflight caching (maxAge) reduces OPTIONS request overhead. The middleware follows CORS specification (RFC 6454) for cross-origin security.

## Test Requirements

### Manual Verification

- [ ] **Preflight Request**: Send OPTIONS request to API endpoint and verify Access-Control-* headers are present
- [ ] **Cross-Origin Request**: Make request from browser console on different origin and verify CORS headers allow access
- [ ] **Unauthorized Origin**: Make request from origin not in allowed list and verify CORS blocks access

### Automated Tests

- [ ] Unit: `cors.test.ts` - Preflight OPTIONS request returns 204 with CORS headers
- [ ] Unit: `cors.test.ts` - Allowed origin in list receives Access-Control-Allow-Origin header
- [ ] Unit: `cors.test.ts` - Unauthorized origin is rejected (no Access-Control-Allow-Origin header)
- [ ] Unit: `cors.test.ts` - Wildcard origin (`*`) allows any origin
- [ ] Unit: `cors.test.ts` - Allowed methods are set correctly in Access-Control-Allow-Methods
- [ ] Unit: `cors.test.ts` - Allowed headers are set correctly in Access-Control-Allow-Headers
- [ ] Unit: `cors.test.ts` - Credentials flag sets Access-Control-Allow-Credentials: true
- [ ] Unit: `cors.test.ts` - maxAge sets Access-Control-Max-Age header correctly
- [ ] Unit: `cors.test.ts` - exposeHeaders sets Access-Control-Expose-Headers correctly
- [ ] Unit: `cors.test.ts` - Non-OPTIONS requests get CORS headers on actual response

### Integration Tests

N/A - Integration testing deferred to S7 (Integration Tests and Documentation) which tests CORS middleware within complete middleware chain.

### Verification Commands

```bash
# Run tests
cd packages/middleware
pnpm test cors

# Type check
pnpm type-check

# Lint
pnpm lint

# Test preflight request manually (after middleware deployed)
curl -X OPTIONS https://example.com/api/test \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## Implementation Notes

### Key Concepts

- **Preflight Request**: OPTIONS request sent by browser before actual request to check CORS permissions
- **Access-Control-Allow-Origin**: Header indicating which origin(s) are allowed to access the resource
- **Access-Control-Allow-Credentials**: Enables cross-origin requests with cookies/auth headers
- **Access-Control-Max-Age**: Duration (seconds) that preflight response can be cached by browser
- **Simple vs Preflighted Requests**: Simple requests (GET, POST with simple headers) don't trigger preflight; complex requests do

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: CORS Middleware Pattern](/docs/2-technical/2-tad-edge-middleware.md) - CORS implementation is not currently in TAD; this story establishes the pattern

Key pattern notes for this story:

- Handle OPTIONS preflight requests separately from actual requests with early return
- Always validate origin against allowed list before setting Access-Control-Allow-Origin (unless wildcard)
- Use `NextResponse` constructor for OPTIONS responses with 204 status
- Set CORS headers on both preflight and actual responses
- When credentials are enabled, cannot use wildcard origin (security requirement)

### Troubleshooting

| Issue                                  | Cause                                     | Solution                                                     |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Browser blocks cross-origin request    | Origin not in allowed list                | Add origin to `allowedOrigins` configuration                 |
| Preflight request fails                | Missing Access-Control-Allow-* headers    | Ensure OPTIONS handler returns CORS headers                  |
| Credentials not sent with request      | Missing Access-Control-Allow-Credentials  | Set `allowCredentials: true` in configuration                |
| Custom headers blocked                 | Header not in allowed list                | Add header to `allowedHeaders` configuration                 |
| CORS with credentials + wildcard fails | Spec prohibits wildcard with credentials  | Specify explicit origins instead of `*` when using credentials |
| Preflight cache not working            | maxAge not set or too low                 | Set `maxAge` to 3600 or higher (1 hour+)                     |

### Reference Materials

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [W3C CORS Specification](https://www.w3.org/TR/cors/)
- [Vercel Edge Middleware CORS](https://vercel.com/guides/how-to-enable-cors)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- CORS middleware implementation: 1.5h
- Unit tests and coverage: 1h
- Documentation and verification: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md) - Edge runtime constraints and middleware patterns
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints) - Edge runtime constraints and execution time limits

### Story-Specific Decisions

#### AD-2A.6.S5.1: CORS Configuration Interface

**Scope**: Story-specific (defines CORS config for this middleware only)

**Decision**: Use a `CORSConfig` interface with optional fields and sensible defaults rather than requiring all fields or using builder pattern.

**Rationale**:

- Most use cases only need to specify `allowedOrigins`, other fields have reasonable defaults
- Optional fields reduce configuration verbosity for common cases
- Explicit interface provides type safety and autocomplete
- Defaults align with secure-by-default principle (no wildcard, no credentials)

**Consequences**:

- Simple use cases require minimal configuration (`{ allowedOrigins: [...] }`)
- Type safety prevents configuration errors
- Defaults must be well-documented to avoid confusion
- Changing defaults in future is a breaking change

**Alternatives Considered**:

- **Builder pattern** - Rejected due to verbosity and overhead for simple use cases
- **Required fields for all options** - Rejected as it forces users to specify values they don't care about
- **Separate functions for different CORS modes** - Rejected as it creates API fragmentation

#### AD-2A.6.S5.2: Origin Validation Strategy

**Scope**: Story-specific (applies to CORS middleware only)

**Decision**: Validate origin by exact string match (not regex or subdomain wildcard) unless origin is `"*"` wildcard.

**Rationale**:

- Exact string match is simplest and most predictable
- Regex patterns increase complexity and potential for security bugs
- Subdomain wildcards (e.g., `*.example.com`) require careful implementation to avoid bypass
- Applications can use multiple entries in `allowedOrigins` array for different domains
- Performance: string comparison is faster than regex matching at edge

**Consequences**:

- Each subdomain must be explicitly listed in `allowedOrigins` array
- No accidental origin bypass from regex errors
- Configuration may be verbose for apps with many subdomains
- Clear security boundary (no ambiguity about what origins are allowed)

**Alternatives Considered**:

- **Regex pattern matching** - Rejected due to security risk and complexity
- **Subdomain wildcard support** - Deferred to future enhancement if needed

## Out of Scope

The following items are explicitly NOT part of this story:

- **Regex Pattern Matching for Origins** - Only exact string match or wildcard supported
- **Dynamic Origin Validation via Database** - Origins must be configured statically; dynamic validation deferred
- **CORS Vary Header Management** - Vary header handling deferred to future enhancement
- **CORS Error Responses** - Unauthorized origins receive no CORS headers (per spec); custom error messages not included
- **Per-Route CORS Configuration** - Single global CORS config; route-specific config deferred to S6 (Route Matchers)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package Setup and Middleware Composer - Requires middleware types and composer pattern

### Enables (Unblocks These Stories)

- **S7**: Integration Tests and Documentation - Requires CORS middleware for complete middleware chain testing

## References

### Epic & TAD References

- [EPIC.md: Middleware Package Overview](./EPIC.md#overview)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)

### External Documentation

- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [W3C CORS Specification](https://www.w3.org/TR/cors/)
- [Next.js Middleware CORS Example](https://nextjs.org/docs/app/building-your-application/routing/middleware#cors)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup) completed and middleware composer available
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code

### Documentation

- [ ] JSDoc comments on exported CORS functions and types
- [ ] README.md updated with CORS middleware usage examples
- [ ] Inline comments explain CORS specification compliance

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(middleware): add CORS middleware`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.6 and Story S5

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
