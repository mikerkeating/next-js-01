# Story 2A.8.S4: Retry Logic with Exponential Backoff

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: [S1: Package Setup and Base Client](./S1-package-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Request Interceptors](./S2-request-interceptors.md), [S3: Response Interceptors](./S3-response-interceptors.md), [S5: Request Caching](./S5-request-caching.md), [S6: File Upload Support](./S6-file-upload.md)

## User Story

**As a** developer using the API client
**I want** automatic retry logic with exponential backoff for failed requests
**So that** transient network errors and temporary service failures don't break my application

## Acceptance Criteria

- [ ] Failed requests automatically retry up to 3 times with exponential backoff (delays: 1s, 2s, 4s)
- [ ] Retry logic only applies to idempotent HTTP methods (GET, PUT, DELETE) by default
- [ ] Retry triggers on network errors and specific HTTP status codes (408, 429, 500, 502, 503, 504)
- [ ] Retry behavior is configurable per request (enable/disable, custom max retries)
- [ ] Non-retryable errors (4xx except 408/429) fail immediately without retry
- [ ] Retry attempts are logged for debugging and observability
- [ ] Jitter is added to backoff delays to prevent thundering herd

## Technical Requirements

### Files to Create

| Path                                                   | Purpose                                   |
| ------------------------------------------------------ | ----------------------------------------- |
| `packages/api-client/src/retry/retry-handler.ts`       | Core retry logic with exponential backoff |
| `packages/api-client/src/retry/retry-config.ts`        | Retry configuration types and defaults    |
| `packages/api-client/src/retry/backoff.ts`             | Backoff calculation with jitter           |
| `packages/api-client/src/retry/index.ts`               | Public exports for retry utilities        |
| `packages/api-client/tests/unit/retry-handler.test.ts` | Unit tests for retry logic                |
| `packages/api-client/tests/unit/backoff.test.ts`       | Unit tests for backoff calculations       |

### Files to Modify

| Path                                | Changes                                          |
| ----------------------------------- | ------------------------------------------------ |
| `packages/api-client/src/client.ts` | Integrate retry handler into request lifecycle   |
| `packages/api-client/src/types.ts`  | Add retry configuration to `RequestOptions` type |
| `packages/api-client/src/index.ts`  | Export retry configuration types                 |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new external dependencies required - built using native TypeScript and existing package dependencies.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting             | Requirement                               | TAD Reference                                                            |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `maxRetries`        | Default: 3 retries maximum                | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |
| `retryableStatuses` | Default: `[408, 429, 500, 502, 503, 504]` | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |
| `retryableMethods`  | Default: `['GET', 'PUT', 'DELETE']`       | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |
| `baseDelay`         | Default: 1000ms (1 second)                | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |
| `maxDelay`          | Default: 30000ms (30 seconds)             | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |
| `jitterFactor`      | Default: 0.1 (10% jitter)                 | [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points) |

**Configuration Rationale**:

- Maximum 3 retries balances reliability with request timeout constraints (prevents excessively long waits)
- Exponential backoff with jitter prevents thundering herd when many clients retry simultaneously
- Only idempotent methods retry by default to prevent duplicate side effects (POST excluded unless explicitly enabled)
- Retry on 5xx server errors and specific 4xx (408 timeout, 429 rate limit) as these are transient conditions

For complete retry patterns, see: [TAD: Integration Points](/docs/2-technical/2-tad.md#integration-points)

## Test Requirements

### Manual Verification

- [ ] **Network Failure Retry**: Disconnect network during request - verify automatic retry with backoff delays
- [ ] **Rate Limit Handling**: Trigger 429 response - verify retry with exponential backoff
- [ ] **Non-Retryable Error**: Trigger 404 response - verify immediate failure without retry
- [ ] **Configurable Retries**: Set `maxRetries: 1` - verify only 1 retry attempt occurs

### Automated Tests

- [ ] Unit: `retry-handler.test.ts` - Retry attempts respect maxRetries configuration
- [ ] Unit: `retry-handler.test.ts` - Idempotent methods (GET, PUT, DELETE) retry by default
- [ ] Unit: `retry-handler.test.ts` - Non-idempotent methods (POST, PATCH) do not retry by default
- [ ] Unit: `retry-handler.test.ts` - Retryable status codes trigger retry (408, 429, 500, 502, 503, 504)
- [ ] Unit: `retry-handler.test.ts` - Non-retryable status codes (400, 401, 403, 404) fail immediately
- [ ] Unit: `backoff.test.ts` - Exponential backoff calculates correct delays (1s, 2s, 4s)
- [ ] Unit: `backoff.test.ts` - Jitter adds randomness to delay (±10% of calculated delay)
- [ ] Unit: `backoff.test.ts` - Max delay cap prevents unbounded waiting

### Integration Tests

- [ ] API client retries on network errors and eventually succeeds when network recovers
- [ ] Rate limit (429) responses trigger retry with backoff until success
- [ ] Custom retry configuration (per-request override) works correctly
- [ ] Retry attempts are logged for debugging (verify log output includes attempt count)

### Verification Commands

```bash
# Run unit tests for retry logic
pnpm --filter @repo/api-client test retry

# Run all API client tests
pnpm --filter @repo/api-client test

# Type check
pnpm --filter @repo/api-client type-check

# Build package
pnpm --filter @repo/api-client build
```

## Implementation Notes

### Implementation Sequence

1. **Create Backoff Calculator**
   - Implement exponential backoff formula: `delay = baseDelay * (2 ^ attemptNumber)`
   - Add jitter calculation: `jitter = delay * jitterFactor * randomBetween(-1, 1)`
   - Apply max delay cap

2. **Build Retry Configuration**
   - Define `RetryConfig` interface with defaults
   - Create `shouldRetry()` function checking method + status code
   - Export configuration types

3. **Implement Retry Handler**
   - Create retry loop with attempt counter
   - Call backoff calculator between attempts
   - Integrate shouldRetry() decision logic
   - Add logging for each attempt

4. **Integrate with Base Client**
   - Wrap fetch calls in retry handler
   - Pass retry config from request options
   - Preserve error context across retries

### Key Concepts

- **Exponential Backoff**: Delay increases exponentially (1s, 2s, 4s, 8s) to reduce server load during recovery
- **Jitter**: Random variation in delay prevents synchronized retries from multiple clients (thundering herd)
- **Idempotency**: Only safe-to-retry operations (GET, PUT, DELETE) retry by default; POST/PATCH can cause duplicate effects
- **Transient Failures**: Temporary conditions (network blips, rate limits, server restarts) that may resolve on retry

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for retry implementation patterns:

- [TAD: Integration Points - Retry Logic](/docs/2-technical/2-tad.md#integration-points)
- [External: Exponential Backoff Pattern](https://cloud.google.com/memorystore/docs/redis/exponential-backoff)

Key pattern notes for this story:

- Use `Promise.race()` with timeout to prevent infinite retry loops
- Preserve original error if all retries exhausted
- Clone request before each retry attempt (fetch consumes request body)

### Troubleshooting

| Issue                    | Cause                                     | Solution                                         |
| ------------------------ | ----------------------------------------- | ------------------------------------------------ |
| Retry delays too long    | Exponential backoff without max delay cap | Set `maxDelay` to reasonable limit (30s default) |
| Thundering herd on retry | No jitter in backoff calculation          | Add jitter to randomize retry timing             |
| POST requests duplicated | Retry enabled for non-idempotent methods  | Only retry GET/PUT/DELETE by default             |
| Request body consumed    | fetch() consumes body on first attempt    | Clone request before each retry                  |
| Infinite retry loop      | No max retry limit                        | Enforce maxRetries config (default: 3)           |

### Reference Materials

- [Exponential Backoff Pattern](https://cloud.google.com/memorystore/docs/redis/exponential-backoff)
- [Idempotency in HTTP](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Backoff calculator: 0.5h
- Retry configuration and decision logic: 0.5h
- Retry handler implementation: 1h
- Integration with base client: 0.5h
- Unit tests: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Integration Points - Retry Logic](/docs/2-technical/2-tad.md#integration-points) - Retry patterns with exponential backoff for third-party integrations
- [EPIC: Retry Trigger Conditions](./EPIC.md#actions-or-decisions-required) - Network errors and 5xx status codes trigger retry

### Story-Specific Decisions

#### AD-2A.8.S4.1: Clone Request Before Each Retry

**Scope**: Story-specific (isolated to retry handler implementation)

**Decision**: Clone the `Request` object before each retry attempt using `request.clone()`

**Rationale**:

- The `fetch()` API consumes the request body on the first attempt
- Retrying with the same request object fails because body is already read
- Cloning creates a fresh request with unconsumed body for each attempt

**Consequences**:

- Adds small memory overhead for cloned request objects
- Enables reliable retry behavior for POST/PUT requests with bodies
- Prevents "body already consumed" errors

**Alternatives Considered**:

- **Store body separately and reconstruct**: More complex, requires tracking body type (string, FormData, etc.) - Rejected due to complexity
- **Only support GET retries**: Too limiting, users need PUT retry for idempotent updates - Rejected as insufficient

#### AD-2A.8.S4.2: Exclude POST from Default Retryable Methods

**Scope**: Story-specific (isolated to retry configuration)

**Decision**: POST and PATCH are NOT retryable by default; require explicit opt-in via config

**Rationale**:

- POST typically creates new resources (non-idempotent) - retry may create duplicates
- PUT and DELETE are idempotent by HTTP spec - safe to retry
- GET has no side effects - always safe to retry
- Users can override if their POST endpoints are idempotent (e.g., using idempotency keys)

**Consequences**:

- Prevents accidental duplicate resource creation
- Requires developers to explicitly enable POST retry when safe
- Aligns with HTTP idempotency semantics

**Alternatives Considered**:

- **Retry all methods by default**: Dangerous, could cause duplicate charges, orders, etc. - Rejected for safety
- **Require idempotency key for POST retry**: Good pattern but adds complexity - Deferred to future enhancement

## Out of Scope

The following items are explicitly NOT part of this story:

- **Idempotency Key Support** - Mechanism to make POST requests safely retryable - Deferred to future enhancement
- **Circuit Breaker Pattern** - Preventing retries when service is known to be down - Different pattern, handled separately if needed
- **Retry Budget/Quota** - Limiting total retry attempts across all requests - Not required for MVP
- **Custom Retry Strategies** - Per-endpoint retry configuration - Deferred until specific use cases emerge
- **Retry Metrics/Telemetry** - Detailed retry analytics - Logging only in this story; metrics deferred to observability integration

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup and Base Client** - Provides base client infrastructure and request lifecycle where retry logic integrates

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Retry logic must be complete to test end-to-end client behavior

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Integration Points - Retry Logic](/docs/2-technical/2-tad.md#integration-points)

### External Documentation

- [Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [HTTP Idempotent Methods](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)
- [Fetch API - Request Clone](https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Base Client) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Package builds successfully

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage ≥80% for new code

### Documentation

- [ ] Code comments explain retry decision logic
- [ ] JSDoc added for public retry configuration types
- [ ] RetryConfig interface documented with usage examples

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(api-client): add retry logic with exponential backoff")
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.8 and Story S4

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
