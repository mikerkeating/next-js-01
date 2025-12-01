# Story 2A.2.S4: Set Up Migration Infrastructure

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: [S2: Configure Drizzle ORM and Client](./S2-drizzle-config.md), [S3: Implement Connection Utilities](./S3-connection-utilities.md)
- **Blocks**: [S6: Implement Generic Utility Functions](./S6-utility-functions.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a reliable database migration infrastructure
**So that** I can version-control schema changes, apply them safely across environments, and rollback when needed

## Acceptance Criteria

- [ ] Migration generation creates SQL files in `packages/database/src/migrations/` directory
- [ ] Migrations can be applied programmatically and via CLI
- [ ] Rollback functionality works for reverting migrations
- [ ] Migration workflow is documented with examples
- [ ] Migration metadata tracks applied migrations in the database
- [ ] Generated migrations are human-readable and reviewable
- [ ] Migration commands work in development, staging, and production environments
- [ ] Test database can be reset and migrated from scratch

## Technical Requirements

### Files to Create

| Path                                              | Purpose                             |
| ------------------------------------------------- | ----------------------------------- |
| `packages/database/src/migrate.ts`                | Programmatic migration runner       |
| `packages/database/src/migrations/.gitkeep`       | Ensure migrations directory exists  |
| `packages/database/scripts/generate-migration.ts` | Script to generate new migrations   |
| `packages/database/scripts/apply-migrations.ts`   | Script to apply pending migrations  |
| `packages/database/scripts/rollback-migration.ts` | Script to rollback last migration   |
| `packages/database/scripts/reset-database.ts`     | Script to reset database (dev only) |
| `packages/database/README.md` (migration section) | Migration workflow documentation    |

### Files to Modify

| Path                                  | Changes                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `packages/database/package.json`      | Add migration-related scripts                         |
| `packages/database/drizzle.config.ts` | Verify migration output directory configuration       |
| `packages/database/src/index.ts`      | Export migration utilities                            |
| `.github/workflows/ci.yml`            | Add migration validation step (if CI workflow exists) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Already installed** (from S2):

- `drizzle-orm` (^0.29.0)
- `drizzle-kit` (^0.29.0)
- `@neondatabase/serverless`

**No additional packages required**

### Configuration Details

Key configuration requirements (see [ADR-005: Drizzle ORM](/docs/2-technical/adr/005-drizzle-orm.md#configuration) for complete templates):

- `drizzle.config.ts: out` must point to `./src/migrations` (keeps migrations in package)
- `drizzle.config.ts: verbose` and `strict` set to `true` (explicit schema change validation)
- Migration directory must be version-controlled in git

## Test Requirements

### Manual Verification

- [ ] **Generate Migration**: Run migration generation script and verify SQL file is created in migrations directory
- [ ] **Apply Migration**: Apply generated migration and verify schema changes in database
- [ ] **Rollback Migration**: Rollback applied migration and verify database returns to previous state
- [ ] **Migration Metadata**: Query `drizzle.__drizzle_migrations` table to verify migration tracking
- [ ] **Reset Database**: Run database reset script and verify clean slate with all migrations reapplied

### Automated Tests

- [ ] Unit: `migrate.test.ts` - Test programmatic migration runner
- [ ] Unit: `scripts/apply-migrations.test.ts` - Test migration application logic
- [ ] Integration: Test migration generation from schema changes
- [ ] Integration: Test migration rollback functionality

### Integration Tests

- [ ] Migration generation creates valid SQL files from schema changes
- [ ] Generated migrations include both up and down operations where applicable
- [ ] Migration application updates the database schema correctly
- [ ] Migration metadata table tracks applied migrations with timestamps
- [ ] Rollback functionality reverts database to previous migration state
- [ ] Migration scripts work with environment-based database URLs (dev, staging, production)
- [ ] Database reset clears all data and reapplies migrations from scratch (dev only)

### Verification Commands

```bash
# Generate a migration from schema changes
cd packages/database
pnpm run db:generate

# Verify migration file created
ls -la src/migrations/

# Apply migrations
pnpm run db:migrate

# Check applied migrations in database
pnpm run db:studio
# Navigate to drizzle.__drizzle_migrations table

# Rollback last migration (if script implemented)
pnpm run db:rollback

# Reset database (dev only)
pnpm run db:reset

# Run migration tests
pnpm test migrate.test.ts
```

## Implementation Notes

### Implementation Sequence

1. **Configure Migration Directory**
   - Ensure `drizzle.config.ts` points to `./src/migrations`
   - Create migrations directory with `.gitkeep`
   - Verify configuration with `drizzle-kit` CLI

2. **Create Programmatic Migration Runner**
   - Implement `migrate.ts` with migration application logic
   - Use `drizzle-orm/neon-http/migrator` for edge compatibility
   - Add error handling and logging
   - Export migration utilities from package index

3. **Create Migration Scripts**
   - Implement `generate-migration.ts` (wraps `drizzle-kit generate`)
   - Implement `apply-migrations.ts` (runs programmatic migrator)
   - Implement `rollback-migration.ts` (if Drizzle Kit supports)
   - Implement `reset-database.ts` (dev environment only, with safety checks)

4. **Add NPM Scripts**
   - Add `db:generate` for migration generation
   - Add `db:migrate` for applying migrations
   - Add `db:rollback` for rollback (if available)
   - Add `db:reset` for database reset (dev only)
   - Add `db:studio` for Drizzle Studio (visual DB browser)

5. **Document Migration Workflow**
   - Update README with migration workflow
   - Document common scenarios (adding table, modifying column, etc.)
   - Add troubleshooting guide for migration issues
   - Include examples of migration file review process

### Key Concepts

- **Migration Versioning**: Timestamp-based identifiers (e.g., `0000_initial_schema.sql`)
- **Migration Metadata**: Tracked in `__drizzle_migrations` table
- **Environment Safety**: Never auto-apply in production; require explicit approval
- **Rollback Limitations**: Some schema changes aren't reversible (e.g., dropping columns with data)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [ADR-005: Migration Workflow](/docs/2-technical/adr/005-drizzle-orm.md#migration-workflow)
- [ADR-005: Best Practices - Migrations](/docs/2-technical/adr/005-drizzle-orm.md#best-practices)

Key pattern notes for this story:

- **Migration Generation**: Use `drizzle-kit generate` to create migrations from schema changes
- **Programmatic Application**: Use `migrate()` function from `drizzle-orm/neon-http/migrator` for edge compatibility
- **Review Before Apply**: Always review generated SQL before applying to staging or production
- **Environment Checks**: Add safety guards to prevent accidental database resets in production

### Troubleshooting

| Issue                                      | Cause                                    | Solution                                                      |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------- |
| Migration generation fails                 | Invalid schema syntax or types           | Review schema files for TypeScript errors                     |
| "Migration already applied" error          | Migration metadata out of sync           | Check `__drizzle_migrations` table for inconsistencies        |
| Rollback not available for migration       | Migration doesn't support down operation | Manually write rollback SQL or restore from backup            |
| Migration applies in dev but fails in prod | Environment variable mismatch            | Verify `DATABASE_URL` is correct for target environment       |
| Migration conflicts between developers     | Concurrent schema changes                | Coordinate schema changes, regenerate migrations if conflicts |

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Migration directory setup and configuration: 0.5h
- Programmatic migration runner implementation: 1.5h
- Migration scripts (generate, apply, rollback, reset): 2h
- Testing (unit and integration tests): 2h
- Documentation and examples: 1h
- Environment validation: 1h

## Architecture Decisions

### Consolidated Decisions

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Migration tooling and workflow

### Story-Specific Decisions

#### AD-2A.2.S4.1: Migration Storage Location

**Decision**: Store migrations in `packages/database/src/migrations/` (not root-level)

**Rationale**: Co-locates with schema, includes in package distribution, follows Drizzle Kit convention

#### AD-2A.2.S4.2: Database Reset Script Safety

**Decision**: Database reset script only executes in development (`NODE_ENV !== 'production'`)

**Rationale**: Prevents accidental data loss while enabling rapid local development iteration

## Out of Scope

- **Product-specific schema migrations** - Deferred to Epic 2B.1
- **Automated migration in CI/CD** - Later deployment stories
- **Blue-green deployment coordination** - Not required for MVP
- **Database backup automation** - Handled by Neon/Supabase platform

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Configure Drizzle ORM and Client** - Migration infrastructure requires Drizzle ORM and Drizzle Kit to be installed and configured
- **S3: Implement Connection Utilities** - Migration runner needs database connection to apply migrations

### Enables (Unblocks These Stories)

- **S6: Implement Generic Utility Functions** - Utility functions may require schema changes that need migration infrastructure

## References

**Epic & TAD:**

- [EPIC.md: Database Infrastructure](./EPIC.md)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [TAD: Database & ORM](/docs/2-technical/2-tad.md#database--orm)

**External:**

- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle Migrations Guide](https://orm.drizzle.team/docs/migrations)

## Verification Checklist

- [ ] **Pre-Verification**: S2 and S3 completed, environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met, [coding standards](/docs/2-technical/references/coding-standards.md) followed, tests passing, coverage > 80%
- [ ] **Documentation**: Migration workflow documented, script examples provided, troubleshooting guide included
- [ ] **Git Hygiene**: Conventional commit message, no unrelated changes, PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
