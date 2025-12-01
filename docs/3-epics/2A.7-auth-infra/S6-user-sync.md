# Story 2A.7.S6: User Database Sync

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Auth Infrastructure](./EPIC.md)
- **Depends On**: [S5: Webhook Handler Framework](./S5-webhook-handler.md)
- **Blocks**: [S7: Auth Error Boundary](./S7-error-boundary.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** user authentication data automatically synchronized from Clerk to our database
**So that** we can query user data efficiently and maintain a local copy for application features without making external API calls

## Acceptance Criteria

- [ ] User creation in Clerk triggers database insert with clerkId, email, name, and avatarUrl
- [ ] User updates in Clerk trigger database update with changed fields
- [ ] User deletion in Clerk triggers soft delete in database (sets deletedAt timestamp)
- [ ] Webhook handlers are idempotent - replayed events don't create duplicates or errors
- [ ] Database unique constraint on clerkId prevents duplicate user records
- [ ] All webhook operations are wrapped in database transactions
- [ ] Failed user sync operations are logged with sufficient context for debugging and retry
- [ ] Webhook handler returns 200 OK for unhandled event types to prevent retry storms

## Technical Requirements

### Files to Create

| Path                                                      | Purpose                                         |
| --------------------------------------------------------- | ----------------------------------------------- |
| `packages/database/src/schema/users.ts`                   | User table schema definition                    |
| `packages/database/src/queries/user-sync.ts`              | User sync database queries                      |
| `packages/auth/src/webhooks/handlers/user-events.ts`      | User event handlers (created, updated, deleted) |
| `packages/auth/src/webhooks/handlers/index.ts`            | Handler registry exports                        |
| `packages/database/migrations/0001_create_users.sql`      | User table migration                            |
| `packages/auth/src/webhooks/handlers/user-events.test.ts` | Unit tests for user event handlers              |

### Files to Modify

| Path                                       | Changes                                           |
| ------------------------------------------ | ------------------------------------------------- |
| `packages/auth/src/webhooks/handler.ts`    | Wire up user event handlers to webhook dispatcher |
| `packages/database/src/schema/index.ts`    | Export users schema                               |
| `packages/database/src/queries/index.ts`   | Export user sync queries                          |
| `apps/web/app/api/webhooks/clerk/route.ts` | Import and call user event handlers               |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

User sync implementation uses existing dependencies from S5 (Webhook Handler Framework). No new packages required.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting              | Requirement                                    | TAD Reference                                                                                    |
| -------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Database schema      | User table with clerkId unique constraint      | [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)    |
| Transaction handling | All sync operations in database transactions   | [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md)                                 |
| Idempotency pattern  | Upsert pattern for user.created/updated events | [ADR-006: Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)    |
| Soft delete strategy | Set deletedAt timestamp instead of hard delete | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#right-to-deletion) |

**Configuration Rationale**:

User sync requires idempotent handlers because Clerk webhooks may be delivered multiple times. The upsert pattern (insert with onConflictDoUpdate) ensures replayed events don't fail or create duplicates. Soft delete with deletedAt timestamp preserves data integrity for 30-day grace period per GDPR requirements before hard deletion occurs via scheduled job.

For complete webhook sync implementation patterns, see: [ADR-006: Clerk Authentication - Webhook Handler](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)

## Test Requirements

### Manual Verification

- [ ] **User Creation**: Sign up new user in Clerk dashboard - verify user record created in database with correct fields
- [ ] **User Update**: Update user profile in Clerk - verify database record updates with new values
- [ ] **User Deletion**: Delete user in Clerk - verify deletedAt timestamp set in database (not hard deleted)
- [ ] **Idempotency**: Send same user.created webhook twice - verify only one user record exists
- [ ] **Duplicate Prevention**: Attempt to insert user with existing clerkId - verify unique constraint prevents duplicate

### Automated Tests

- [ ] Unit: `user-events.test.ts` - handleUserCreated creates user with all fields
- [ ] Unit: `user-events.test.ts` - handleUserUpdated updates existing user
- [ ] Unit: `user-events.test.ts` - handleUserUpdated is idempotent (safe to replay)
- [ ] Unit: `user-events.test.ts` - handleUserDeleted sets deletedAt timestamp
- [ ] Unit: `user-events.test.ts` - handleUserDeleted does not hard delete user record
- [ ] Integration: `route.test.ts` - user.created webhook creates database record
- [ ] Integration: `route.test.ts` - user.updated webhook updates database record
- [ ] Integration: `route.test.ts` - Concurrent webhooks don't create race conditions

### Integration Tests

- [ ] User creation webhook successfully syncs all user fields to database
- [ ] User update webhook correctly updates only changed fields
- [ ] User deletion webhook sets deletedAt without removing record
- [ ] Replayed webhook events are handled idempotently without errors
- [ ] Webhook processing failure rolls back transaction and logs error
- [ ] Database unique constraint on clerkId prevents duplicate users
- [ ] User sync queries correctly exclude soft-deleted users (WHERE deletedAt IS NULL)

### Verification Commands

```bash
# Run unit tests for user event handlers
pnpm test packages/auth/src/webhooks/handlers/user-events.test.ts

# Run integration tests for webhook endpoint
pnpm test apps/web/app/api/webhooks/clerk

# Type check database schema
pnpm turbo run type-check --filter=@repo/database

# Generate and apply migration
pnpm --filter=@repo/database db:generate
pnpm --filter=@repo/database db:migrate

# Verify user table created correctly
psql $DATABASE_URL -c "\d users"

# Test webhook with user.created event
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "svix-id: msg_test_123" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,test_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_test123",
      "email_addresses": [{"email_address": "test@example.com"}],
      "first_name": "Test",
      "last_name": "User",
      "image_url": "https://example.com/avatar.jpg"
    }
  }'

# Query synced users
psql $DATABASE_URL -c "SELECT * FROM users WHERE deleted_at IS NULL;"
```

## Implementation Notes

### Implementation Sequence

1. **Create User Schema**
   - Define users table with id, clerkId, email, name, avatarUrl, createdAt, updatedAt, deletedAt
   - Add unique constraint on clerkId
   - Add index on email for efficient lookups
   - Generate migration file

2. **Implement User Sync Queries**
   - Create upsert query for user creation/update (insert with onConflictDoUpdate)
   - Create soft delete query (update deletedAt timestamp)
   - Create query to find user by clerkId
   - Wrap all queries in transaction support

3. **Create User Event Handlers**
   - Implement handleUserCreated with upsert pattern
   - Implement handleUserUpdated with upsert pattern (same as created for idempotency)
   - Implement handleUserDeleted with soft delete
   - Extract user data from Clerk webhook payload
   - Add error handling and logging

4. **Wire Up Handlers**
   - Register user event handlers in webhook dispatcher
   - Update webhook route to call appropriate handler based on event type
   - Add logging for successful sync operations
   - Return 200 OK for all processed events

5. **Add Tests**
   - Unit tests for each event handler
   - Test idempotency by calling handlers multiple times
   - Integration tests with real database transactions
   - Test error cases (missing fields, invalid data)

### Key Concepts

- **Idempotency**: Webhook handlers can be called multiple times with same event - must produce same result without errors or duplicates
- **Upsert Pattern**: INSERT ... ON CONFLICT DO UPDATE allows both create and update to use same logic, simplifying idempotency
- **Soft Delete**: Set deletedAt timestamp instead of removing record, enables 30-day grace period for data recovery
- **Transaction Safety**: All database operations in transaction - rollback on error prevents partial sync state
- **Unique Constraints**: Database-level constraint on clerkId prevents duplicate users even under concurrent webhook delivery

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for user sync implementation patterns:

- [ADR-006: Clerk Webhook Handler Example](/docs/2-technical/adr/006-clerk-authentication.md#webhook-handler)
- [TAD: Security Architecture - User Deletion Flow](/docs/2-technical/2-tad-security-architecture.md#right-to-deletion)

Key pattern notes for this story:

- Use Drizzle's `.onConflictDoUpdate()` for upsert pattern - handles both insert and update in single query
- Extract Clerk user data with null safety: `evt.data.email_addresses[0]?.email_address` to handle missing fields
- Construct full name with `.trim()` to handle cases where first_name or last_name is missing
- Always return 200 OK after successful processing to prevent Clerk retry storms
- Log sync operations at info level, errors at error level with full context (clerkId, event type)

### Troubleshooting

| Issue                                     | Cause                                     | Solution                                                        |
| ----------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Duplicate user error on webhook replay    | Not using upsert pattern                  | Use `.onConflictDoUpdate()` instead of `.insert()`              |
| User not found after creation             | Query not filtering out soft deletes      | Add `WHERE deleted_at IS NULL` to all user queries              |
| Webhook timeouts on user sync             | Slow database connection or missing index | Ensure clerkId has unique index, optimize query                 |
| Transaction deadlocks on concurrent syncs | Multiple webhooks processing same user    | Drizzle handles row-level locking; verify transaction isolation |
| Missing user fields in database           | Clerk payload structure changed           | Add null checks when extracting fields from webhook payload     |
| Hard delete instead of soft delete        | Using DELETE instead of UPDATE            | User `.update().set({ deletedAt: new Date() })` pattern         |

### Reference Materials

- [Clerk User Object Schema](https://clerk.com/docs/references/backend/types/user)
- [Clerk Webhook Events - User](https://clerk.com/docs/integrations/webhooks/overview#user-events)
- [Drizzle ORM - Insert with Conflict](https://orm.drizzle.team/docs/insert#on-conflict-do-update)
- [PostgreSQL Unique Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- User schema definition and migration: 1h
- User sync queries implementation: 1.5h
- User event handlers (created, updated, deleted): 2h
- Webhook handler integration: 0.5h
- Tests and verification: 1h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](../../0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Covers webhook event types, user data schema, and sync patterns
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Defines database interaction patterns and transaction handling
- [TAD: Security Architecture - User Deletion](/docs/2-technical/2-tad-security-architecture.md#right-to-deletion) - Defines soft delete strategy and 30-day grace period

### Story-Specific Decisions

#### AD-2A.7.S6.1: Generic User Table Schema

**Scope**: Story-specific (does not affect other stories)

**Decision**: User table contains only generic authentication fields (clerkId, email, name, avatarUrl) with no product-specific fields or role information.

**Rationale**:

- Separation of concerns - authentication package should not know about product-specific user attributes
- Product-specific fields (e.g., organization preferences, billing info) will be added in Epic 2B.1 (Product Data Models)
- Role and permission data will be added in Epic 2B.7 (Product Auth Roles & Permissions)
- Keeps @repo/auth package focused on generic authentication concerns
- Allows auth package to be reused across different product contexts

**Consequences**:

- User table will require extension in future epics for product features
- Join queries will be needed to combine auth user data with product user data
- Clear separation makes testing and maintenance easier
- Auth package remains portable and reusable

**Alternatives Considered**:

- **Option 1**: Include product-specific fields in auth user table - Rejected because it couples auth package to product logic and violates separation of concerns
- **Option 2**: Create separate auth_users and product_users tables - Rejected as unnecessarily complex for initial implementation; single users table extended in future epics is simpler

## Out of Scope

The following items are explicitly NOT part of this story:

- **Organization webhook sync** (organization.created, organizationMembership.created) - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **Product-specific user fields** (preferences, settings, billing info) - Deferred to Epic 2B.1 (Product Data Models)
- **Role assignment and permissions** - Deferred to Epic 2B.7 (Product Auth Roles & Permissions)
- **User profile image upload/storage** - Using Clerk-hosted avatarUrl only; custom uploads deferred to future enhancement
- **Email verification status sync** - Clerk handles verification; sync of verification status deferred to future enhancement if needed
- **User merge functionality** - Handling duplicate accounts deferred to future enhancement
- **Background queue for webhook processing** - Initial implementation processes synchronously; queue optimization deferred to future performance epic
- **Hard deletion cron job** - Scheduled deletion after 30-day grace period deferred to Epic 2A.3 (Observability) which includes cron infrastructure

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S5: Webhook Handler Framework** - Provides webhook signature verification, event routing, and API endpoint structure

### Enables (Unblocks These Stories)

- **S7: Auth Error Boundary** - User sync provides user context that error boundary needs for user-specific error handling
- **Epic 2B.7 (Future)**: Product Auth Roles & Permissions - Generic user table is foundation for role assignments
- **Epic 2B.1 (Future)**: Product Data Models - Generic user table will be extended with product-specific fields

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview) - User sync to database listed as key deliverable
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints) - Generic user table only, no product-specific fields
- [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md) - User deletion flow and soft delete strategy

### ADR References

- [ADR-006: Clerk for Authentication](/docs/2-technical/adr/006-clerk-authentication.md) - Primary reference for webhook sync implementation
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Database schema definition and query patterns
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md) - Future organization relationship context

### External Documentation

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Clerk User Object Reference](https://clerk.com/docs/references/backend/types/user)
- [Drizzle ORM Insert Documentation](https://orm.drizzle.team/docs/insert)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (S5)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Database connection configured and accessible
- [ ] Clerk development instance configured with webhook endpoint

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage > 80% for user sync logic
- [ ] Database migration runs successfully

### Documentation

- [ ] Code comments explain idempotency and soft delete patterns
- [ ] JSDoc comments on public user sync functions
- [ ] Database schema documented with inline comments
- [ ] Architecture decisions documented (or confirmed as N/A)

### Git Hygiene

- [ ] Conventional commit message used (`feat(auth): implement user database sync`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.7 and Story S6

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
