# Story 2A.2.S6: Implement Generic Utility Functions

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: [S3: Implement Connection Utilities](./S3-connection-utilities.md), [S4: Set Up Migration Infrastructure](./S4-migration-infrastructure.md), [S5: Create Seed Script Framework](./S5-seed-framework.md)
- **Blocks**: [S7: Write Tests for Database Package](./S7-tests.md), [S8: Create Documentation and Examples](./S8-documentation.md)
- **Runs in Parallel With**: None

## User Story

**As a** Backend Developer
**I want** generic database utility functions for common patterns
**So that** I can consistently implement ID generation, timestamps, soft deletes, and organization-scoped queries across all database schemas

## Acceptance Criteria

- [ ] `createId()` generates globally unique, URL-safe identifiers using cuid2
- [ ] `timestamps()` helper provides consistent createdAt/updatedAt column definitions
- [ ] `softDelete()` helper provides deletedAt column with related query utilities
- [ ] `withOrgContext()` helper enables organization-scoped query filtering
- [ ] Query helper functions (`isNotDeleted()`, `isDeleted()`) work with soft delete pattern
- [ ] All utilities are type-safe and work with Drizzle's type inference
- [ ] Utilities are exported from package entry point for use in product schemas (Epic 2B.1)
- [ ] Helper functions work correctly in both Node.js and Edge runtimes

## Technical Requirements

### Files to Create

| Path                                         | Purpose                                          |
| -------------------------------------------- | ------------------------------------------------ |
| `packages/database/src/utils/ids.ts`         | ID generation utilities using cuid2              |
| `packages/database/src/utils/timestamps.ts`  | Timestamp column helpers for createdAt/updatedAt |
| `packages/database/src/utils/soft-delete.ts` | Soft delete column and query helpers             |
| `packages/database/src/utils/org-context.ts` | Organization-scoped query utilities              |
| `packages/database/src/utils/index.ts`       | Exports all utility functions                    |

### Files to Modify

| Path                             | Changes                              |
| -------------------------------- | ------------------------------------ |
| `packages/database/src/index.ts` | Export utility functions from utils/ |
| `packages/database/package.json` | Add cuid2 dependency                 |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Add cuid2 for ID generation
pnpm add @paralleldrive/cuid2 --filter @repo/database
```

### Configuration Details

| Setting                | Requirement                                        | Notes                                                                                        |
| ---------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ID format              | cuid2 format (URL-safe, sortable, globally unique) | Use `@paralleldrive/cuid2` per [ADR-005](/docs/2-technical/adr/005-drizzle-orm.md)           |
| Timestamp precision    | Millisecond precision with `defaultNow()`          | Use Drizzle's `timestamp()` with `.defaultNow().notNull()`                                   |
| Soft delete column     | `deletedAt` timestamp (nullable)                   | NULL = not deleted, timestamp = deleted at that time                                         |
| Organization filtering | Filter by `organizationId` or `orgId` column       | Support multi-tenant patterns per [ADR-007](/docs/2-technical/adr/007-multi-tenant-model.md) |

**Configuration Rationale**:

These utilities provide consistent patterns across all database schemas, reducing code duplication and ensuring best practices. The cuid2 format provides collision-resistant IDs without coordination. Soft deletes enable data recovery and audit trails. Organization context helpers enforce multi-tenant data isolation per ADR-007.

## Test Requirements

### Manual Verification

- [ ] **ID Generation**: Generate 1000 IDs - verify all unique and URL-safe (no special characters)
- [ ] **Timestamp Columns**: Create schema with timestamps() - verify createdAt/updatedAt auto-populate
- [ ] **Soft Delete**: Mark record as deleted - verify query helpers correctly filter results
- [ ] **Organization Context**: Query with org filter - verify only org-scoped records returned

### Automated Tests

- [ ] Unit: `utils/ids.test.ts` - Verify createId() generates valid cuid2 format
- [ ] Unit: `utils/ids.test.ts` - Verify generated IDs are unique across 10,000 iterations
- [ ] Unit: `utils/timestamps.test.ts` - Verify timestamp column definitions include createdAt and updatedAt
- [ ] Unit: `utils/soft-delete.test.ts` - Verify isNotDeleted() filters records with null deletedAt
- [ ] Unit: `utils/soft-delete.test.ts` - Verify isDeleted() filters records with non-null deletedAt
- [ ] Unit: `utils/org-context.test.ts` - Verify withOrgContext() applies organization filter

### Integration Tests

- [ ] Verify createId() works as primary key default value in schema definition
- [ ] Verify timestamps() columns auto-populate on insert and update operations
- [ ] Verify soft delete pattern allows "deleted" records to be queried separately from active records
- [ ] Verify organization context filtering prevents cross-organization data access

### Verification Commands

```bash
# Run unit tests for utility functions
cd packages/database && pnpm test src/utils

# Run tests with coverage
cd packages/database && pnpm test src/utils --coverage

# Test ID generation manually
cd packages/database && pnpm tsx -e "
import { createId } from './src/utils/ids';
const ids = Array.from({ length: 100 }, () => createId());
console.log('Generated IDs:', ids);
console.log('All unique:', ids.length === new Set(ids).size);
"

# Verify exports
cd packages/database && node -e "
const db = require('./dist/index.js');
console.log('Utils:', Object.keys(db).filter(k => k.includes('create') || k.includes('timestamp') || k.includes('delete')));
"

# Type-check utilities
cd packages/database && pnpm tsc --noEmit
```

## Implementation Notes

### Implementation Sequence

1. **Create ID Generation Utilities**
   - Install cuid2 dependency
   - Implement `createId()` wrapper function
   - Add type exports for ID type
   - Test ID uniqueness and format

2. **Implement Timestamp Helpers**
   - Create `timestamps()` function returning column definitions
   - Support both createdAt and updatedAt patterns
   - Ensure compatibility with Drizzle's column types
   - Verify auto-population on insert

3. **Build Soft Delete Utilities**
   - Create `softDelete()` function for deletedAt column
   - Implement `isNotDeleted()` query helper
   - Implement `isDeleted()` query helper
   - Test filtering behavior with seed data

4. **Add Organization Context Helpers**
   - Create `withOrgContext()` query wrapper
   - Support both `organizationId` and `orgId` column names
   - Type-safe organization ID parameter
   - Test multi-tenant filtering

5. **Write Comprehensive Tests**
   - Unit tests for each utility function
   - Integration tests with actual schema definitions
   - Edge case testing (null values, empty results)
   - Performance testing for ID generation

6. **Export Utilities**
   - Export all functions from utils/index.ts
   - Re-export from package entry point
   - Verify tree-shakeable exports
   - Update package documentation

### Key Concepts

- **cuid2**: Collision-resistant unique identifiers, URL-safe and sortable by creation time
- **Timestamp Pattern**: Automatic tracking of record creation and modification times
- **Soft Delete**: Logical deletion using timestamp instead of physical record removal
- **Multi-tenancy**: Organization-scoped queries to ensure data isolation between tenants
- **Type Inference**: Drizzle's type system infers TypeScript types from schema definitions

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Schema definition patterns
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md) - Organization-scoped queries

Key pattern notes for this story:

- ID generation should be called as default value in schema: `id: text("id").primaryKey().$defaultFn(() => createId())`
- Timestamp columns can be spread into schema: `...timestamps()`
- Soft delete requires both column definition and query helpers to be effective
- Organization context filtering should be applied at query time, not schema level (enables flexibility)

**Example usage patterns** (actual implementation in TAD):

```typescript
// ID generation in schema
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  // ...
});

// Timestamps in schema
export const content = pgTable("content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  // ... other columns
  ...timestamps(),
});

// Soft delete in schema
export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  // ... other columns
  ...timestamps(),
  ...softDelete(),
});

// Query with organization context
const orgContent = await withOrgContext(db, orgId)
  .select()
  .from(content)
  .where(isNotDeleted(content));
```

### Troubleshooting

| Issue                           | Cause                                 | Solution                                        |
| ------------------------------- | ------------------------------------- | ----------------------------------------------- |
| IDs not unique in tests         | Rapid sequential generation           | cuid2 handles this; verify using Set comparison |
| Timestamps not auto-populating  | Missing `.defaultNow()` in definition | Add `.defaultNow().notNull()` to column         |
| Soft delete returns all records | Query not using isNotDeleted() helper | Apply helper function in where clause           |
| Cross-org data leakage          | Missing withOrgContext() wrapper      | Always use org context for multi-tenant queries |
| Type errors with utilities      | Incorrect Drizzle imports             | Import from 'drizzle-orm/pg-core' for columns   |

### Reference Materials

- [cuid2 Documentation](https://github.com/paralleldrive/cuid2)
- [Drizzle Column Types - PostgreSQL](https://orm.drizzle.team/docs/column-types/pg)
- [Drizzle Schema Definition](https://orm.drizzle.team/docs/sql-schema-declaration)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- ID utilities and tests: 1h
- Timestamp helpers and tests: 1h
- Soft delete utilities and tests: 2h
- Organization context helpers and tests: 1.5h
- Integration testing and documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Type-safe schema patterns and column definitions
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md) - Organization-scoped query requirements

### Story-Specific Decisions

#### AD-2A.2.S6.1: Use cuid2 for ID Generation

**Scope**: Story-specific (ID generation utility implementation)

**Decision**: Use `@paralleldrive/cuid2` instead of UUID, nanoid, or other ID generation libraries.

**Rationale**:

- **Collision-resistant**: Cryptographically strong random generation with <0.001% collision probability
- **URL-safe**: No special characters, safe for URLs and filenames without encoding
- **Sortable**: IDs contain timestamp prefix, enabling chronological sorting
- **Compact**: Shorter than UUIDs (24 vs 36 characters) while maintaining uniqueness guarantees
- **Serverless-friendly**: No coordination required, works in distributed/edge environments

**Consequences**:

- All database IDs will use cuid2 format (consistent pattern across schemas)
- IDs are visible to users in URLs (use slug for user-facing identifiers when needed)
- Marginally slower than simple UUID v4 generation (~2-3x, but still <1ms)
- Newer library than UUID (less established, but well-maintained and tested)

**Alternatives Considered**:

- **UUID v4**: Standard but longer, not sortable, requires encoding for URLs
- **nanoid**: Similar benefits but less entropy, no built-in timestamp ordering
- **Database auto-increment**: Not suitable for distributed systems or offline-first patterns
- **ulid**: Similar benefits but less TypeScript-friendly, smaller ecosystem

#### AD-2A.2.S6.2: Soft Delete with Nullable Timestamp

**Scope**: Story-specific (soft delete utility implementation)

**Decision**: Implement soft delete using nullable `deletedAt` timestamp column rather than boolean `isDeleted` flag.

**Rationale**:

- **Audit trail**: Timestamp captures when deletion occurred, valuable for compliance and debugging
- **Storage efficiency**: NULL values in PostgreSQL consume minimal space (same as boolean)
- **Query flexibility**: Can filter by deletion date ranges, not just deleted/not-deleted
- **Restoration context**: Know when record was deleted aids in data recovery decisions
- **Industry standard**: Widely used pattern, familiar to developers

**Consequences**:

- Slightly more complex queries (IS NULL vs = false) but helper functions abstract this
- Enables future features like "restore if deleted within 30 days"
- Requires two query helpers instead of one (isDeleted vs isNotDeleted)

**Alternatives Considered**:

- **Boolean isDeleted**: Simpler queries but loses deletion timestamp information
- **Deleted status enum**: More complex, over-engineered for binary state
- **Separate archive table**: Added complexity, breaks foreign key relationships

## Out of Scope

The following items are explicitly NOT part of this story:

- **Product-specific utility functions** - Deferred to Epic 2B.1 (Product Database Schema)
- **Row-Level Security (RLS) policies** - Generic patterns only; product-specific policies in Epic 2B.1
- **Audit logging utilities** - Not required for MVP; deferred to future epic
- **Batch operation utilities** - Not required for initial implementation
- **Database transaction utilities** - Basic transactions handled by Drizzle; advanced patterns deferred
- **Performance monitoring helpers** - Covered by Epic 2A.3 (Observability Package)
- **Data validation utilities** - Handled by schema definitions and Zod (separate concern)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S3: Implement Connection Utilities** - Database client and connection patterns needed for query helpers
- **S4: Set Up Migration Infrastructure** - Migration framework needed to test utility functions in schemas
- **S5: Create Seed Script Framework** - Seed data needed for integration testing of query helpers

### Enables (Unblocks These Stories)

- **S7: Write Tests for Database Package** - Provides utilities that need comprehensive testing
- **S8: Create Documentation and Examples** - Provides utilities that need documentation and usage examples

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview) - Generic utility functions as key deliverable
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - Utility availability requirement
- [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Schema patterns and type safety
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md) - Organization-scoped queries

### ADR References

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Type-safe schema and query patterns
- [ADR-007: Multi-tenant Data Model](/docs/2-technical/adr/007-multi-tenant-model.md) - Organization isolation requirements

### External Documentation

- [cuid2 GitHub Repository](https://github.com/paralleldrive/cuid2)
- [Drizzle ORM - Column Types](https://orm.drizzle.team/docs/column-types/pg)
- [Drizzle ORM - Queries](https://orm.drizzle.team/docs/queries)
- [PostgreSQL Timestamp Documentation](https://www.postgresql.org/docs/current/datatype-datetime.html)

## Verification Checklist

### Pre-Verification

- [ ] S3 (Connection Utilities) completed and tested
- [ ] S4 (Migration Infrastructure) completed and functional
- [ ] S5 (Seed Framework) completed and available for test data
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] DATABASE_URL configured for test database

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm tsc --noEmit`)
- [ ] All tests passing (`pnpm test`)
- [ ] Coverage > 80% for utility functions (`pnpm test --coverage`)

### Documentation

- [ ] JSDoc comments on all exported functions
- [ ] Type definitions exported for utility return values
- [ ] Usage examples in code comments
- [ ] README updated with utility function overview (deferred to S8 for full docs)

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
