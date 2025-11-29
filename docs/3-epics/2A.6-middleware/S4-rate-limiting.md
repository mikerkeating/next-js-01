# Story 2A.6.S4: Rate Limiting Middleware

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Epic 2A.6: Middleware Package (Generic)](./EPIC.md)
- **Depends On**: [S1: Package Setup and Middleware Composer](./S1-package-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Logging Middleware](./S2-logging-middleware.md), [S3: Security Headers Middleware](./S3-security-headers.md), [S5: CORS Middleware](./S5-cors-middleware.md), [S6: Route Matcher Utilities](./S6-route-matchers.md)

## User Story

**As a** platform operator
**I want** rate limiting middleware that prevents API abuse across different user types
**So that** the system remains stable and available for all users while preventing denial-of-service attacks

## Acceptance Criteria

- [ ] Rate limiting middleware enforces different thresholds for anonymous users (20/min), authenticated users (100/min), and Organizations (1000/min)
- [ ] Middleware uses Vercel KV for distributed rate limiting across edge functions
- [ ] Rate limit responses include standard headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After)
- [ ] System fails open (allows requests) when rate limit storage is unavailable
- [ ] Rate limiting can be configured per route with custom thresholds
- [ ] Middleware tracks rate limits by user ID, Organization ID, or IP address
- [ ] HTTP 429 responses are returned when limits are exceeded with appropriate retry information
- [ ] All code is edge runtime compatible (no Node.js APIs, Web APIs only)

## Technical Requirements

### Files to Create

| Path                                               | Purpose                                    |
| -------------------------------------------------- | ------------------------------------------ |
| `packages/middleware/src/rate-limit.ts`            | Rate limiting middleware implementation    |
| `packages/middleware/src/rate-limit-config.ts`     | Rate limit configuration and types         |
| `packages/middleware/src/rate-limit-storage.ts`    | Vercel KV storage interface for rate limit |
| `packages/middleware/tests/rate-limit.test.ts`     | Unit tests for rate limiting middleware    |
| `packages/middleware/tests/rate-limit.edge.test.ts`| Edge runtime compatibility tests           |

### Files to Modify

| Path                                    | Changes                                           |
| --------------------------------------- | ------------------------------------------------- |
| `packages/middleware/src/index.ts`      | Export rate limiting middleware and types         |
| `packages/middleware/package.json`      | Add @vercel/kv dependency                         |
| `packages/middleware/README.md`         | Add rate limiting middleware documentation        |
| `packages/middleware/tsconfig.json`     | Ensure lib includes Web APIs for edge runtime     |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
pnpm add @vercel/kv --filter @repo/middleware
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                    | Requirement                                        | TAD Reference                                                                                               |
| -------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Rate limit thresholds      | Anonymous: 20/min, User: 100/min, Org: 1000/min    | [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)        |
| Time window                | 60 seconds (1 minute)                              | [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)        |
| Storage backend            | Vercel KV for distributed rate limiting            | [TAD: Rate Limiting](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)                   |
| Failure mode               | Fail open (allow requests when storage fails)      | [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)        |
| Identifier priority        | 1) userId, 2) OrganizationId, 3) IP address        | [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)        |
| Response headers           | X-RateLimit-*, Retry-After                         | [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)        |

**Configuration Rationale**:
- Conservative anonymous limits (20/min) prevent abuse while allowing legitimate exploration
- Higher authenticated user limits (100/min) support typical application usage patterns
- Organization-level limits (1000/min) accommodate multi-user team workflows
- Fail-open strategy ensures availability during storage outages per [TAD: Technical Constraints](./EPIC.md:line120)
- Vercel KV provides edge-compatible, distributed state across global edge functions per [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)

For complete rate limiting implementation patterns, see: [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)

## Test Requirements

### Manual Verification

- [ ] **Rate Limit Enforcement**: Trigger rate limit by making rapid requests and verify 429 response is returned with correct headers
- [ ] **Distributed Limiting**: Verify rate limits apply across multiple edge regions by testing from different geographic locations
- [ ] **Fail-Open Behavior**: Simulate KV unavailability and verify requests are allowed through with warning logs
- [ ] **Different User Types**: Verify different rate limits apply correctly for anonymous, authenticated, and Organization contexts

### Automated Tests

- [ ] Unit: `rate-limit.test.ts` - Rate limit calculation logic
- [ ] Unit: `rate-limit.test.ts` - Identifier selection (userId > OrganizationId > IP)
- [ ] Unit: `rate-limit.test.ts` - Response header generation (X-RateLimit-*, Retry-After)
- [ ] Unit: `rate-limit.test.ts` - Fail-open behavior when storage throws error
- [ ] Unit: `rate-limit-config.test.ts` - Configuration validation and threshold selection
- [ ] Edge: `rate-limit.edge.test.ts` - Edge runtime compatibility (Web APIs only, no Node.js)
- [ ] Edge: `rate-limit.edge.test.ts` - Vercel KV integration in edge environment

### Integration Tests

- [ ] Rate limiting middleware integrates with middleware chain and receives correct context (userId, OrganizationId)
- [ ] Middleware short-circuits chain and returns 429 when limit exceeded
- [ ] Rate limit state persists across multiple requests within time window
- [ ] Different routes can have custom rate limit configurations via conditional middleware
- [ ] Rate limit resets correctly after time window expires
- [ ] Concurrent requests from same identifier are counted accurately

### Verification Commands

```bash
# Run unit tests
pnpm --filter @repo/middleware test rate-limit.test.ts

# Run edge runtime tests
pnpm --filter @repo/middleware test rate-limit.edge.test.ts

# Type check
pnpm --filter @repo/middleware typecheck

# Lint
pnpm --filter @repo/middleware lint

# Build package
pnpm --filter @repo/middleware build

# Test coverage
pnpm --filter @repo/middleware test:coverage
```

## Implementation Notes

### Implementation Sequence

1. **Define Rate Limit Configuration Types**
   - Create `RateLimitConfig` interface with windowMs and maxRequests
   - Define default limits for anonymous, user, and Organization tiers
   - Create helper functions for threshold selection based on context

2. **Implement Vercel KV Storage Interface**
   - Create async functions for incrementing request counts
   - Implement sliding window algorithm using KV expiration
   - Add error handling with fail-open fallback
   - Ensure all operations use Web APIs (no Node.js modules)

3. **Build Rate Limiting Middleware**
   - Implement `MiddlewareFunction` that extracts identifier from context
   - Call storage interface to check and increment rate limit
   - Return 429 response with appropriate headers when limit exceeded
   - Continue to next middleware when limit not exceeded

4. **Add Response Header Generation**
   - Calculate X-RateLimit-Limit from configuration
   - Calculate X-RateLimit-Remaining from storage result
   - Calculate X-RateLimit-Reset as window expiration timestamp
   - Calculate Retry-After as seconds until reset

5. **Create Configurable Rate Limiting**
   - Export factory function for custom rate limit configurations
   - Support per-route rate limiting via conditional middleware
   - Allow override of default thresholds for specific use cases

6. **Test Edge Runtime Compatibility**
   - Verify no Node.js APIs are used (crypto, fs, path, etc.)
   - Test in edge environment simulation
   - Validate cold start performance < 50ms
   - Ensure bundle size within 1MB limit

7. **Add Documentation and Examples**
   - Document rate limit configuration options
   - Provide examples of custom rate limiting per route
   - Document fail-open behavior and implications

### Key Concepts

- **Distributed Rate Limiting**: State must be shared across edge functions globally via Vercel KV
- **Sliding Window Algorithm**: Tracks requests within rolling time windows for smoother rate limiting
- **Fail-Open Strategy**: Availability prioritized over strict rate limiting during outages
- **Identifier Hierarchy**: User ID (most specific) > Organization ID > IP address (least specific)
- **Edge Runtime Constraints**: Web APIs only, no Node.js modules, limited to 30s execution time

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)
- [TAD: Middleware Chain Composition](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition)
- [TAD: Edge Runtime Constraints](/docs/2-technical/2-tad-edge-middleware.md#edge-runtime-constraints)

Key pattern notes for this story:

- Use `Promise.race()` with timeout for KV operations to prevent long waits
- Implement exponential backoff for retry logic if needed
- Use context.userId and context.OrganizationId from auth/org middleware
- Return HTTP 429 with JSON error response matching standard error format
- Set all four rate limit headers (Limit, Remaining, Reset, Retry-After) per HTTP standards

### Troubleshooting

| Issue                                       | Cause                                      | Solution                                                  |
| ------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Rate limit not working across edge regions  | KV not configured or replication lag       | Verify VERCEL_KV_URL environment variable is set          |
| All requests getting rate limited           | Identifier extraction failing              | Check context.userId/OrganizationId are set by auth middleware |
| Cold start times exceed 50ms                | Too many dependencies imported at top      | Use dynamic imports for non-critical paths                |
| Tests fail with "Node.js API not available" | Using Node.js crypto or other modules      | Switch to Web Crypto API and other Web standard APIs     |
| Rate limit headers showing incorrect values | Timestamp calculation using Date.now()     | Ensure all timestamps use milliseconds consistently       |

### Reference Materials

- [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [RateLimit Header Fields for HTTP](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Edge Functions Runtime](https://vercel.com/docs/functions/edge-functions/edge-runtime)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Configuration types and defaults: 0.5h
- Vercel KV storage interface: 1.5h
- Rate limiting middleware core logic: 1.5h
- Response header generation: 0.5h
- Unit tests and edge tests: 1.5h
- Documentation and examples: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](/docs/0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Rate Limit Storage Backend - Vercel KV](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware) - Using Vercel KV for distributed edge-compatible state
- [TAD: Default Rate Limits](./EPIC.md:line139) - 20/min anonymous, 100/min user, 1000/min Organization
- [TAD: Fail-Open Strategy](./EPIC.md:line119) - Allow requests when storage unavailable to prioritize availability
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Edge Functions and KV infrastructure decisions

### Story-Specific Decisions

#### AD-2A.6.S4.1: Sliding Window vs Fixed Window Rate Limiting

**Scope**: Story-specific (isolated to rate limiting middleware implementation)

**Decision**: Use sliding window algorithm instead of fixed window for rate limiting

**Rationale**:
- Sliding window provides smoother rate limiting without burst allowances at window boundaries
- Fixed window allows 2x burst rate (e.g., 20 requests at end of minute 1, 20 at start of minute 2 = 40 in 1 second)
- Sliding window complexity is minimal with KV expiration handling most logic
- Better user experience with more predictable rate limiting behavior

**Consequences**:
- Slightly more complex implementation requiring timestamp tracking
- More accurate rate limiting without burst edge cases
- Better protection against abuse patterns

**Alternatives Considered**:
- **Fixed Window**: Simpler to implement but allows burst attacks at window boundaries - Rejected due to security concerns
- **Token Bucket**: More flexible but significantly more complex for edge runtime - Rejected due to implementation complexity

## Out of Scope

The following items are explicitly NOT part of this story:

- **Custom Rate Limit UI/Dashboard** - Deferred to future observability epic (not in current roadmap)
- **Per-Endpoint Rate Limit Configuration** - Handled in application-level middleware composition in Epic 2B.6 (Product Middleware)
- **Rate Limit Bypass for Internal Services** - Deferred to Epic 2A.7 (Auth Infrastructure) which handles service authentication
- **Redis or Alternative Storage Backends** - Using Vercel KV only per ADR-004; other backends not supported
- **Distributed Rate Limit Synchronization Testing** - End-to-end distributed testing deferred to S7 (Integration Tests)
- **Rate Limit Analytics and Monitoring** - Deferred to Epic 2A.3 (Observability) integration work

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup and Middleware Composer**: Provides `MiddlewareFunction` type and `MiddlewareContext` interface that rate limiting middleware must implement

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation**: Requires rate limiting middleware to be complete for comprehensive middleware chain testing

## References

### Epic & TAD References

- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [EPIC.md: Rate Limit Storage Backend Decision](./EPIC.md#actions-or-decisions-required)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad.md#edge-middleware-architecture)
- [TAD: Rate Limiting Middleware](/docs/2-technical/2-tad-edge-middleware.md#rate-limiting-middleware)
- [TAD: Edge Runtime Constraints](/docs/2-technical/2-tad-edge-middleware.md#edge-runtime-constraints)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [RateLimit Header Fields for HTTP](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Middleware Composer) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Vercel KV credentials available for testing (or mock setup for local dev)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm typecheck`)
- [ ] All tests passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code
- [ ] Edge runtime compatibility verified (no Node.js APIs)
- [ ] Cold start time < 50ms (verified in edge tests)

### Documentation

- [ ] JSDoc comments on all exported functions
- [ ] README updated with rate limiting middleware usage examples
- [ ] Configuration options documented
- [ ] Fail-open behavior clearly documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(middleware): add rate limiting middleware")
- [ ] No unrelated changes included
- [ ] PR description includes testing instructions

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
