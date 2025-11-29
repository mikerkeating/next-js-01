# Story 2A.7.S5: Webhook Handler Framework

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Auth Infrastructure](./EPIC.md)
- **Depends On**: [S1: Package Setup](./S1-package-setup.md), [S3: Auth Hooks](./S3-auth-hooks.md)
- **Blocks**: [S6: User Database Sync](./S6-user-sync.md), [S7: Auth Error Boundary](./S7-error-boundary.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a secure webhook handler framework that validates Clerk webhook signatures
**So that** I can reliably sync authentication events to our database while preventing unauthorized webhook calls

## Acceptance Criteria

- [ ] Webhook endpoint validates Svix signatures before processing events
- [ ] Invalid webhook signatures return 400 Bad Request with appropriate error message
- [ ] Missing Svix headers return 400 Bad Request
- [ ] Webhook handler extracts event type and payload correctly
- [ ] Framework provides type-safe event handling structure for user sync implementation
- [ ] Webhook endpoint is excluded from Clerk auth middleware (publicly accessible)
- [ ] All webhook processing errors are logged with sufficient context for debugging
- [ ] Webhook handlers are idempotent (safe to replay events)

## Technical Requirements

### Files to Create

| Path                                                | Purpose                                       |
| --------------------------------------------------- | --------------------------------------------- |
| `packages/auth/src/webhooks/types.ts`               | TypeScript types for Clerk webhook events     |
| `packages/auth/src/webhooks/handler.ts`             | Core webhook handler with signature validation|
| `packages/auth/src/webhooks/index.ts`               | Public exports for webhook functionality      |
| `apps/web/app/api/webhooks/clerk/route.ts`          | Next.js API route for Clerk webhooks          |
| `packages/auth/src/webhooks/handler.test.ts`        | Unit tests for webhook validation logic       |
| `apps/web/app/api/webhooks/clerk/route.test.ts`     | Integration tests for webhook endpoint        |

### Files to Modify

| Path                               | Changes                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `packages/auth/package.json`       | Add `svix` dependency for webhook signature verification               |
| `apps/web/middleware.ts`           | Add `/api/webhooks/clerk` to ignored routes (public access required)   |
| `.env.example`                     | Add `CLERK_WEBHOOK_SECRET` environment variable                         |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/auth
pnpm add svix

# In apps/web (if needed for testing)
pnpm add -D @clerk/testing
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                 | Requirement                                              | TAD Reference                                                                                     |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `CLERK_WEBHOOK_SECRET`  | Svix signing secret from Clerk dashboard                 | [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)    |
| `publicRoutes`          | Must include `/api/webhooks/clerk` for webhook delivery  | [ADR-006: Middleware](/docs/2-technical/adr/006-clerk-authentication.md)                         |
| Signature verification  | Use Svix SDK to verify webhook signatures                | [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)    |
| Event types             | Support `user.created`, `user.updated`, `user.deleted`   | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md)                   |

**Configuration Rationale**:

Webhook signature verification is critical for security - it prevents unauthorized parties from triggering database mutations by forging webhook events. The Svix SDK handles the cryptographic verification according to industry standards. Making the webhook endpoint public (excluded from auth middleware) is required for Clerk to deliver webhooks, but signature verification ensures only legitimate Clerk events are processed.

For complete webhook handler implementation patterns, see: [ADR-006: Clerk Authentication - Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)

## Test Requirements

### Manual Verification

- [ ] **Signature Validation**: Send webhook with invalid signature via curl - returns 400 with "Invalid signature" error
- [ ] **Missing Headers**: Send webhook without Svix headers - returns 400 with "Missing svix headers" error
- [ ] **Valid Webhook**: Use Clerk dashboard "Send Test Event" - webhook processes successfully and returns 200
- [ ] **Middleware Exclusion**: Verify webhook endpoint is accessible without authentication token

### Automated Tests

- [ ] Unit: `handler.test.ts` - Signature verification rejects invalid signatures
- [ ] Unit: `handler.test.ts` - Signature verification accepts valid Svix signatures
- [ ] Unit: `handler.test.ts` - Handler rejects requests with missing Svix headers
- [ ] Unit: `handler.test.ts` - Event type extraction works correctly
- [ ] Integration: `route.test.ts` - Webhook endpoint returns 400 for invalid signature
- [ ] Integration: `route.test.ts` - Webhook endpoint returns 200 for valid event
- [ ] Integration: `route.test.ts` - Webhook endpoint handles malformed JSON payload

### Integration Tests

- [ ] Webhook endpoint correctly validates Svix signatures using test secret
- [ ] Webhook handler parses `user.created` event and extracts user data
- [ ] Webhook handler parses `user.updated` event and extracts updated fields
- [ ] Webhook endpoint logs errors with request context (event type, timestamp)
- [ ] Multiple rapid webhook deliveries are handled without race conditions

### Verification Commands

```bash
# Run unit tests for webhook handler
pnpm test packages/auth/src/webhooks

# Run integration tests for webhook endpoint
pnpm test apps/web/app/api/webhooks/clerk

# Type check webhook types
pnpm turbo run type-check --filter=@repo/auth

# Test webhook endpoint locally with test payload
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "svix-id: msg_test" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,invalid_signature" \
  -H "Content-Type: application/json" \
  -d '{"type":"user.created","data":{"id":"user_123"}}'

# Verify middleware excludes webhook route
grep -A 5 "publicRoutes\|ignoredRoutes" apps/web/middleware.ts
```

## Implementation Notes

### Implementation Sequence

1. **Create Webhook Types**
   - Define TypeScript interfaces for Clerk webhook event types
   - Create discriminated union type for event handling
   - Add type guards for runtime validation

2. **Implement Core Handler**
   - Create webhook handler with Svix signature verification
   - Implement error handling for invalid signatures and missing headers
   - Add event type extraction and payload parsing
   - Create handler registry structure for event-specific logic (to be populated in S6)

3. **Create API Route**
   - Implement Next.js API route at `/api/webhooks/clerk`
   - Wire up core handler
   - Add error logging with Sentry integration (if available)
   - Return appropriate HTTP status codes

4. **Update Middleware**
   - Add webhook endpoint to public/ignored routes
   - Verify middleware configuration doesn't block webhook delivery

5. **Add Tests**
   - Unit tests for signature verification
   - Integration tests for API route
   - Test error cases (invalid signature, missing headers, malformed JSON)

### Key Concepts

- **Webhook Signatures**: Svix signs webhook payloads using HMAC-SHA256 with a secret key - recipients verify signatures to ensure authenticity
- **Idempotency**: Webhooks may be delivered multiple times; handlers should be safe to replay without creating duplicate records
- **Event Types**: Clerk uses dot-notation event types (e.g., `user.created`, `user.updated`) - use discriminated unions for type safety
- **Svix Headers**: Three headers required for verification: `svix-id` (message ID), `svix-timestamp` (Unix timestamp), `svix-signature` (HMAC signature)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for webhook implementation patterns:

- [ADR-006: Clerk Webhook Handler Example](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)
- [TAD: Security Architecture - Webhook Validation](/docs/2-technical/2-tad-security-architecture.md)

Key pattern notes for this story:

- Use Svix SDK's `verify()` method for signature validation - don't implement custom cryptographic verification
- Structure event handlers as a registry/map pattern to enable easy addition of new event types in S6
- Make webhook endpoint async to support database operations added in S6
- Return 200 OK even for events you don't handle yet (prevents Clerk retry storms)

### Troubleshooting

| Issue                                          | Cause                                          | Solution                                                |
| ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| "Missing CLERK_WEBHOOK_SECRET" error           | Environment variable not set                   | Add secret from Clerk dashboard to `.env.local`         |
| "Invalid signature" for valid webhooks         | Wrong webhook secret or timestamp tolerance    | Verify secret matches Clerk dashboard; check server time|
| Webhooks blocked with 401 Unauthorized         | Middleware not excluding webhook endpoint      | Add `/api/webhooks/clerk` to `ignoredRoutes`            |
| Duplicate user records created                 | Webhook replayed after failure                 | Use database unique constraints on `clerkId` (added S6) |
| Webhook endpoint timeout                       | Synchronous processing of slow operations      | Move heavy processing to background queue (future)      |

### Reference Materials

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Webhook Verification Guide](https://docs.svix.com/receiving/verifying-payloads/how)
- [Svix Node.js SDK](https://github.com/svix/svix-webhooks/tree/main/javascript)
- [Clerk Webhook Event Types](https://clerk.com/docs/integrations/webhooks/overview#supported-events)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Webhook types definition: 1h
- Core handler with signature verification: 2h
- API route implementation: 1h
- Middleware update and environment config: 0.5h
- Tests and verification: 1.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](../../0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Covers webhook signature verification requirement, Svix as verification library, and webhook event handling patterns
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md) - Defines security requirements for external API endpoints including webhooks

### Story-Specific Decisions

No story-specific architectural decisions required - all webhook-related decisions are documented in ADR-006 as they apply to all webhook handlers in the system.

## Out of Scope

The following items are explicitly NOT part of this story:

- **User database sync logic** - Deferred to S6 (User Database Sync); this story only creates the framework
- **Organization webhook events** (`organization.created`, `organizationMembership.created`) - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Webhook retry logic** - Clerk handles retries; we only need idempotent handlers
- **Webhook event queuing** - Initial implementation processes synchronously; background queue deferred to future optimization
- **Webhook delivery monitoring dashboard** - Not required for MVP; can be added later
- **Custom webhook transformation logic** - Process Clerk events as-is; no custom event transformation needed

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup** - Requires `@repo/auth` package structure and dependencies to exist
- **S3: Auth Hooks** - Webhook types should be compatible with auth context types defined in S3

### Enables (Unblocks These Stories)

- **S6: User Database Sync** - Webhook framework provides the foundation for implementing user sync handlers
- **S7: Auth Error Boundary** - Error handling patterns from webhook validation inform error boundary implementation

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview) - Webhook handler framework listed as key deliverable
- [EPIC.md: Technology Decisions](./EPIC.md#technology-decisions) - Svix for webhook verification
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md) - Security requirements for webhooks

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Primary reference for webhook implementation
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Database operations added in S6 will use Drizzle

### External Documentation

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [Svix Node.js SDK Documentation](https://github.com/svix/svix-webhooks/tree/main/javascript)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (S1, S3)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Clerk development instance configured with webhook secret available

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage > 80% for webhook handler logic

### Documentation

- [ ] Code comments explain signature verification process
- [ ] JSDoc comments on public webhook handler functions
- [ ] Environment variable documented in `.env.example`
- [ ] Architecture decisions documented (or confirmed as N/A)

### Git Hygiene

- [ ] Conventional commit message used (`feat(auth): implement webhook handler framework`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.7 and Story S5

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
