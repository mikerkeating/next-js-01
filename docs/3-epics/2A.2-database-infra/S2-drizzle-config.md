# Story 2A.2.S2: Configure Drizzle ORM and Client

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: [S1: Create @repo/database Package Structure](./S1-package-structure.md)
- **Blocks**: [S3: Implement Connection Utilities](./S3-connection-utilities.md), [S4: Set Up Migration Infrastructure](./S4-migration-infrastructure.md), [S5: Create Seed Script Framework](./S5-seed-framework.md)
- **Runs in Parallel With**: None

## User Story

**As a** Backend Developer
**I want** Drizzle ORM configured with a database client
**So that** I can execute type-safe queries against PostgreSQL using the @repo/database package

## Acceptance Criteria

- [x] Drizzle ORM and Drizzle Kit are installed with correct versions from canonical-versions.md
- [x] `drizzle.config.ts` is created with proper PostgreSQL dialect configuration
- [x] Database client is implemented using Neon HTTP driver for edge compatibility
- [x] Connection string is sourced from environment variable with validation
- [x] Client exports the database instance and schema
- [x] Type inference works correctly for insert and select operations
- [x] Configuration supports both development and production environments
- [x] Package builds successfully and can be imported by other workspace packages

## Technical Requirements

### Files to Create

| Path                                    | Purpose                                        |
| --------------------------------------- | ---------------------------------------------- |
| `packages/database/drizzle.config.ts`   | Drizzle Kit configuration for migrations       |
| `packages/database/src/client.ts`       | Database client instance with Neon HTTP driver |
| `packages/database/src/schema/index.ts` | Schema barrel export (initially empty)         |
| `packages/database/src/index.ts`        | Package entry point with client and schema     |

### Files to Modify

| Path                             | Changes                                         |
| -------------------------------- | ----------------------------------------------- |
| `packages/database/package.json` | Add Drizzle ORM, Drizzle Kit, Neon dependencies |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/database directory
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting              | Requirement                                             | TAD Reference                                                              |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| Database dialect     | `postgresql` with Neon HTTP driver                      | [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md)           |
| Schema location      | `./src/schema/index.ts`                                 | [ADR-005: Configuration](/docs/2-technical/adr/005-drizzle-orm.md)         |
| Migration output     | `./src/migrations`                                      | [ADR-005: Configuration](/docs/2-technical/adr/005-drizzle-orm.md)         |
| Connection pooling   | Neon serverless with fetch connection cache             | [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)            |
| Environment variable | `DATABASE_URL` with validation                          | [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)            |
| Edge compatibility   | Use `drizzle-orm/neon-http` for Vercel Edge runtime     | [ADR-005: Edge Runtime](/docs/2-technical/adr/005-drizzle-orm.md)          |
| Type inference       | Enable `$inferSelect` and `$inferInsert` type utilities | [ADR-005: Type Safety](/docs/2-technical/adr/005-drizzle-orm.md#rationale) |

**Configuration Rationale**: Drizzle ORM with Neon HTTP driver provides type-safe database access while maintaining edge runtime compatibility. The configuration enables automatic migration generation and supports both local development and production serverless environments per ADR-005.

## Test Requirements

### Manual Verification

- [ ] **Package Import**: Import `{ db }` from `@repo/database` in another workspace package - should resolve without TypeScript errors
- [ ] **Environment Variable**: Verify `DATABASE_URL` environment variable is required (build fails without it)
- [ ] **Type Safety**: Verify TypeScript autocomplete works when writing queries using the `db` instance

### Automated Tests

- [ ] Unit: Not required for this story - configuration validation only
- [ ] Integration: Deferred to S3 (Implement Connection Utilities) - actual connection testing

### Verification Commands

```bash
# Verify dependencies installed
cd packages/database && pnpm list drizzle-orm drizzle-kit @neondatabase/serverless

# Build the package
cd packages/database && pnpm build

# Verify exports
cd packages/database && node -e "console.log(require('./package.json').exports)"

# Check configuration file exists
ls -la packages/database/drizzle.config.ts

# Verify TypeScript compilation
cd packages/database && pnpm tsc --noEmit
```

## Implementation Notes

### Implementation Sequence

1. **Install Dependencies**
   - Add Drizzle ORM, Drizzle Kit, and Neon serverless driver
   - Verify versions match canonical-versions.md
   - Run `pnpm install` to update lockfile

2. **Create Drizzle Configuration**
   - Create `drizzle.config.ts` in package root
   - Configure PostgreSQL dialect
   - Set schema and migration paths
   - Enable verbose and strict modes for better developer experience

3. **Implement Database Client**
   - Create `src/client.ts` with Neon HTTP driver
   - Configure connection string from environment variable
   - Enable connection caching for production environment
   - Export database instance with schema reference

4. **Set Up Schema Barrel Export**
   - Create empty `src/schema/index.ts` for future schemas
   - Document that schemas will be added in S6 (Utility Functions)

5. **Update Package Entry Point**
   - Modify `src/index.ts` to export database client
   - Export schema types for use in applications
   - Ensure tree-shakeable exports

### Key Concepts & Patterns

> **Note**: For implementation code examples, reference [ADR-005: Drizzle Configuration](/docs/2-technical/adr/005-drizzle-orm.md#configuration)

**Key Concepts:**

- **Drizzle Kit**: CLI tool for migrations from schema changes
- **Neon HTTP Driver**: Serverless PostgreSQL driver for edge runtimes
- **Type Inference**: `$inferSelect` and `$inferInsert` generate TypeScript types from schema

**Implementation Requirements:**

- Use `drizzle-orm/neon-http` for edge compatibility
- Configure `fetchConnectionCache` in production only
- Pass schema object to `drizzle()` for relational query API
- Validate DATABASE_URL environment variable

### Troubleshooting

| Issue                              | Solution                                               |
| ---------------------------------- | ------------------------------------------------------ |
| "Cannot find module 'drizzle-orm'" | Run `pnpm install` in packages/database                |
| "DATABASE_URL is not defined"      | Add DATABASE_URL to .env.local                         |
| Edge runtime error                 | Use `drizzle-orm/neon-http` not `drizzle-orm/postgres` |
| TypeScript errors on db queries    | Add `{ schema }` parameter when calling drizzle()      |
| Migration commands not found       | Run `pnpm add -D drizzle-kit`                          |

## Estimated Effort

**Size**: M (4-8h)

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Defines Drizzle ORM selection, configuration patterns, and edge runtime requirements
- [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm) - Specifies Neon/Supabase serverless PostgreSQL requirements

### Story-Specific Decisions

#### AD-2A.2.S2.1: Neon HTTP Driver over WebSocket Driver

**Scope**: Story-specific (initial connection implementation)

**Decision**: Use Neon HTTP driver (`drizzle-orm/neon-http`) for universal edge compatibility and simpler serverless configuration

**Rationale**: HTTP driver provides universal compatibility, lower latency for single queries, and meets MVP performance requirements (<100ms). WebSocket driver adds complexity without current benefit.

**Consequences**: Optimized for serverless/edge; each query creates new HTTP connection (acceptable at current scale)

#### AD-2A.2.S2.2: Environment-Specific Connection Caching

**Scope**: Story-specific (client initialization)

**Decision**: Enable `fetchConnectionCache` only in production (`VERCEL_ENV === "production"`)

**Rationale**: Production benefits from caching for <100ms connections; development needs fresh connections for schema changes

**Consequences**: Production gets connection caching; local development avoids cache-related issues

## Out of Scope

- **Schema definitions, query helpers** - S6 (Implement Generic Utility Functions)
- **Migration execution** - S4 (Set Up Migration Infrastructure)
- **Connection pooling utilities** - S3 (Implement Connection Utilities)
- **Seed scripts** - S5 (Create Seed Script Framework)
- **Testing utilities** - S7 (Write Tests for Database Package)
- **Database connection validation** - Configuration only; deferred to S3

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Create @repo/database Package Structure - Requires package directory, TypeScript config, and package.json to exist before adding Drizzle dependencies

### Enables (Unblocks These Stories)

- **S3**: Implement Connection Utilities - Requires configured database client to build connection helpers
- **S4**: Set Up Migration Infrastructure - Requires drizzle.config.ts to exist for migration commands
- **S5**: Create Seed Script Framework - Requires database client to execute seed operations

## References

- [EPIC.md: Overview](./EPIC.md#overview)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)

## Verification Checklist

**Pre-Verification:**

- [x] S1 completed, environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md), DATABASE_URL available

**Implementation Quality:**

- [x] All acceptance criteria met, [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [x] No lint errors, types compile, package builds successfully
- [x] Database client importable by other packages, Drizzle Kit commands work

**Documentation & Git:**

- [x] Configuration comments in client.ts and drizzle.config.ts
- [x] Commit: `feat(2A.2.S2): configure drizzle orm and database client`

## Status

- **State**: Complete
- **PR**: -
- **Completed**: 2025-12-01

## Completion Notes

### Summary

Implemented Drizzle ORM configuration with Neon HTTP driver for edge-compatible, serverless PostgreSQL connections. The database client exports `db` instance and `Database` type, with environment-specific connection caching (production only) per AD-2A.2.S2.2. The schema barrel export is ready for schema definitions in S6.

### Test Results

| Test  | Command                                   | Result |
| ----- | ----------------------------------------- | ------ |
| Lint  | `pnpm --filter @repo/database lint`       | Pass   |
| Types | `pnpm --filter @repo/database type-check` | Pass   |
| Build | `pnpm --filter @repo/database build`      | Pass   |

### Files Changed

All files were created/modified as specified in the story:

- `packages/database/drizzle.config.ts` - Created with PostgreSQL dialect, schema/migration paths, verbose/strict modes
- `packages/database/src/client.ts` - Created with Neon HTTP driver, DATABASE_URL validation, environment-specific caching
- `packages/database/src/schema/index.ts` - Updated documentation for schema barrel export pattern
- `packages/database/src/index.ts` - Updated to export `db`, `Database` type, and re-export schemas
- `packages/database/eslint.config.js` - Added ignores for `*.config.ts` and `*.config.js` files

### Known Issues

- **Issue**: Type variance mismatch between `@neondatabase/serverless` NeonQueryFunction and `drizzle-orm/neon-http` expected types - **Status**: Resolved with explicit type annotation (`NeonQueryFunction<boolean, boolean>`) - **Tracking**: N/A (standard workaround for these package versions)

### Lessons Learned

- The `drizzle-orm/neon-http` driver in v0.29.x requires the result of `neon()` function, not a connection string directly
- ESLint with TypeScript parser requires config files (like `drizzle.config.ts`) to be either in the tsconfig project or explicitly ignored
- Import ordering for type-only imports follows: external packages → local imports → type-only imports from any source
