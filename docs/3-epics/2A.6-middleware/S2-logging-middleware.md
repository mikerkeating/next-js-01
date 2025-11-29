# Story 2A.6.S2: Logging Middleware

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Middleware Package (Generic)](./EPIC.md)
- **Depends On**: [S1](./S1-package-setup.md)
- **Blocks**: [S7](./S7-integration-tests.md)
- **Runs in Parallel With**: [S3](./S3-security-headers.md), [S4](./S4-rate-limiting.md), [S5](./S5-cors-middleware.md), [S6](./S6-route-matchers.md)

## User Story

**As a** platform developer
**I want** structured request logging middleware
**So that** I can track all incoming requests with consistent JSON logs including request ID, method, path, timing, and IP address

## Acceptance Criteria

- [ ] Logging middleware produces structured JSON output with consistent fields (timestamp, level, message, service, data)
- [ ] Each request generates a unique request ID using crypto.randomUUID()
- [ ] Request ID is added to middleware context for use by downstream middleware
- [ ] Logs include request method, path, query parameters, user agent, and IP address
- [ ] Middleware completes in < 2ms (logging does not block request processing)
- [ ] Works within Vercel Edge runtime constraints (no Node.js APIs)
- [ ] Unit tests verify log format, request ID generation, and context enrichment
- [ ] Exported as `loggingMiddleware` constant for use in middleware chains

## Technical Requirements

### Files to Create

| Path                                           | Purpose                             |
| ---------------------------------------------- | ----------------------------------- |
| `packages/middleware/src/logging.ts`           | Logging middleware implementation   |
| `packages/middleware/tests/logging.test.ts`    | Unit tests for logging middleware   |

### Files to Modify

| Path                                   | Changes                                  |
| -------------------------------------- | ---------------------------------------- |
| `packages/middleware/src/index.ts`     | Export `loggingMiddleware`               |
| `packages/middleware/README.md`        | Add logging middleware documentation     |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required beyond those installed in S1 (Next.js types are already available).

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
| ------- | ----------- | ------------- |
| Log format | Structured JSON with timestamp, level, message, service, data fields | [TAD: Observability Architecture](/docs/2-technical/2-tad-observability.md) |
| Request ID generation | Use Web Crypto API `crypto.randomUUID()` (edge-compatible) | [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md#logging-middleware) |
| Context enrichment | Add requestId to `context.metadata.requestId` | [TAD: Middleware Chain Composition](/docs/2-technical/2-tad-edge-middleware.md#middleware-chain-composition) |

**Configuration Rationale**: Structured JSON logs enable log aggregation and analysis in Vercel logs. Using crypto.randomUUID() ensures edge runtime compatibility (no Node.js crypto dependency). Storing requestId in context allows downstream middleware and application code to correlate logs.

For complete implementation patterns, see: [TAD: Logging Middleware](/docs/2-technical/2-tad-edge-middleware.md#logging-middleware)

## Test Requirements

### Manual Verification

- [ ] **Log Output**: Run middleware and verify console output is valid JSON with all required fields
- [ ] **Request ID Uniqueness**: Generate multiple logs and verify each request ID is unique

### Automated Tests

- [ ] Unit: `logging.test.ts` - Logs are structured JSON with all required fields
- [ ] Unit: `logging.test.ts` - Request ID is generated using crypto.randomUUID()
- [ ] Unit: `logging.test.ts` - Request ID is added to context.metadata.requestId
- [ ] Unit: `logging.test.ts` - Logs include method, path, query parameters
- [ ] Unit: `logging.test.ts` - Logs include user agent and IP address from headers
- [ ] Unit: `logging.test.ts` - Middleware returns undefined (continues chain)

### Integration Tests

N/A - Integration testing deferred to S7 (Integration Tests and Documentation) which tests complete middleware chain.

### Verification Commands

```bash
# Run tests
cd packages/middleware
pnpm test logging

# Type check
pnpm type-check

# Lint
pnpm lint

# Build and verify exports
pnpm build
node -e "const { loggingMiddleware } = require('./dist/index.js'); console.log(typeof loggingMiddleware)"
```

## Implementation Notes

### Implementation Sequence

1. **Create Logging Function**
   - Implement `loggingMiddleware` as MiddlewareFunction
   - Generate request ID using crypto.randomUUID()
   - Extract request metadata (method, path, query, headers)
   - Output structured JSON log to console.log

2. **Context Enrichment**
   - Add requestId to context.metadata.requestId
   - Ensure context object is mutated (not replaced)

3. **IP Address Extraction**
   - Check request.ip first (Vercel Edge provides this)
   - Fall back to x-forwarded-for header if request.ip unavailable
   - Handle multiple IPs in x-forwarded-for (use first IP)

4. **Testing**
   - Write unit tests for all log fields
   - Verify request ID uniqueness
   - Test IP extraction logic
   - Achieve ≥80% code coverage

5. **Documentation**
   - Add JSDoc comments explaining structured log format
   - Update README with usage example
   - Document requestId context enrichment

### Key Concepts

- **Structured Logging**: JSON format with consistent schema enables log parsing and analysis
- **Request Correlation**: Request ID allows tracing a single request through multiple services
- **Edge Runtime Compatibility**: Using Web Crypto API instead of Node.js crypto module
- **Non-blocking Logging**: Middleware returns immediately after logging (no await on console.log)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Logging Middleware](/docs/2-technical/2-tad-edge-middleware.md#logging-middleware)
- [TAD: Structured Logging Format](/docs/2-technical/2-tad-observability.md#structured-logging)

Key pattern notes for this story:

- Always use `console.log(JSON.stringify({...}))` not `console.log({...})` to ensure proper JSON output
- Use `request.ip || request.headers.get("x-forwarded-for")` pattern for IP extraction
- Store requestId in metadata, not as top-level context field (userId, organizationId, role are top-level)
- Return undefined (or nothing) to continue middleware chain

### Troubleshooting

| Issue | Cause | Solution |
| ----- | ----- | -------- |
| "crypto is not defined" | Using Node.js crypto instead of Web Crypto | Use global `crypto.randomUUID()` not `require('crypto')` |
| Request ID not available in downstream middleware | Not adding to context.metadata | Ensure `context.metadata.requestId = requestId` is set |
| Logs not appearing in Vercel | Using console.error or other log level | Use `console.log()` for edge middleware (Vercel captures stdout) |
| IP address always null | Wrong header name or missing header | Check both `request.ip` and `x-forwarded-for` header |

### Reference Materials

- [Web Crypto API - randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)
- [Vercel Edge Functions Logging](https://vercel.com/docs/functions/edge-functions/edge-functions-api#logging)
- [Structured Logging Best Practices](https://www.loggly.com/blog/structured-logging-best-practices/)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Logging middleware implementation: 1h
- Context enrichment and IP extraction: 0.5h
- Unit tests: 1h
- Documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Structured Logging Format](/docs/2-technical/2-tad-observability.md#structured-logging) - JSON schema with timestamp, level, message, service, data fields
- [TAD: Edge Runtime Constraints](/docs/2-technical/2-tad-edge-middleware.md) - Web APIs only, no Node.js crypto

### Story-Specific Decisions

#### AD-2A.6.S2.1: Request ID Storage Location

**Scope**: Story-specific (affects logging middleware only)

**Decision**: Store requestId in `context.metadata.requestId` rather than as a top-level context field.

**Rationale**:

- Maintains consistency with context structure defined in S1 (userId, organizationId, role are top-level)
- Request ID is metadata about the request, not authentication/authorization data
- Prevents namespace pollution of top-level context fields
- Allows flexibility for additional request metadata in the future

**Consequences**:

- Downstream middleware accesses requestId via `context.metadata.requestId`
- Slightly more verbose access pattern (extra `.metadata` level)
- Clear separation between auth context and request metadata

**Alternatives Considered**:

- **Top-level context.requestId** - Rejected to maintain separation between auth fields and request metadata
- **Custom header instead of context** - Rejected because headers are for application code, context is for middleware-to-middleware communication

## Out of Scope

The following items are explicitly NOT part of this story:

- **Response Time Logging** - Deferred to future enhancement (requires wrapping response)
- **Log Level Configuration** - All logs use "info" level; dynamic levels deferred
- **Log Sampling** - All requests logged; sampling for high-volume routes deferred
- **Error Logging** - Error handling is in S1 (withErrorHandling wrapper)
- **Structured Logger Class** - Using simple JSON.stringify; logger abstraction deferred to Epic 2A.3 (Observability Package)
- **Log Aggregation Integration** - Vercel automatically captures console.log; external integrations (Datadog, New Relic) deferred

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package Setup and Middleware Composer - Provides MiddlewareFunction type and MiddlewareContext interface

### Enables (Unblocks These Stories)

- **S7**: Integration Tests and Documentation - Requires logging middleware for complete chain testing

## References

- [EPIC.md: Middleware Package Overview](./EPIC.md#overview)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)
- [TAD: Logging Middleware](/docs/2-technical/2-tad-edge-middleware.md#logging-middleware)
- [TAD: Structured Logging](/docs/2-technical/2-tad-observability.md#structured-logging)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Middleware Composer) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code

### Documentation

- [ ] JSDoc comments on exported loggingMiddleware function
- [ ] README.md includes logging middleware usage example
- [ ] Log schema documented in JSDoc

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(middleware): add logging middleware`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.6 and Story S2

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
