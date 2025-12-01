# Story 2A.2.S9: Local Docker Database for Development

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Database Infrastructure](./EPIC.md)
- **Depends On**: [S2: Configure Drizzle ORM and Client](./S2-drizzle-config.md)
- **Blocks**: None
- **Runs in Parallel With**: [S3: Implement Connection Utilities](./S3-connection-utilities.md), [S4: Set Up Migration Infrastructure](./S4-migration-infrastructure.md), [S5: Create Seed Script Framework](./S5-seed-framework.md)

## User Story

**As a** Developer
**I want** a local database option using Docker
**So that** I can develop quickly and offline without requiring a Neon account or internet connection

## Acceptance Criteria

- [ ] Docker Compose configuration starts PostgreSQL 16 container with persistent volume
- [ ] Database client auto-detects local vs Neon based on `DATABASE_URL` format
- [ ] `pnpm run db:start` starts the local PostgreSQL container
- [ ] `pnpm run db:stop` stops and removes the container (preserves data volume)
- [ ] Local database uses same schema and migrations as Neon
- [ ] Connection works with both `postgres://` (local) and Neon HTTP URLs
- [ ] Documentation explains when to use local vs Neon database
- [ ] `.env.example` includes both local and Neon connection string examples

## Technical Requirements

### Files to Create

| Path                                      | Purpose                                     |
| ----------------------------------------- | ------------------------------------------- |
| `docker-compose.yml` (root)               | PostgreSQL container configuration          |
| `packages/database/src/client-local.ts`   | Local PostgreSQL client using node-postgres |
| `packages/database/src/client-factory.ts` | Factory to select appropriate client by URL |

### Files to Modify

| Path                              | Changes                                        |
| --------------------------------- | ---------------------------------------------- |
| `packages/database/package.json`  | Add postgres dependency, db:start/stop scripts |
| `packages/database/src/client.ts` | Refactor to use client factory                 |
| `packages/database/src/index.ts`  | Export unified client interface                |
| `.env.example` (root)             | Add DATABASE_URL examples for local and Neon   |
| `packages/database/README.md`     | Add local development setup instructions       |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Add node-postgres for local development
pnpm add postgres --filter @repo/database
```

### Configuration Details

| Setting             | Requirement                             | Notes                                                                           |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| PostgreSQL version  | 16 (match Neon)                         | Per [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) |
| Container name      | `next-js-01-postgres`                   | Unique per project                                                              |
| Default port        | 5432                                    | Standard PostgreSQL port                                                        |
| Data persistence    | Named volume `postgres-data`            | Survives container restarts                                                     |
| Default credentials | `postgres:postgres`                     | Local dev only; documented in .env.example                                      |
| URL detection       | Check for `neon.tech` or `@neon` in URL | Auto-select driver based on connection string                                   |

**Configuration Rationale**: Docker provides consistent PostgreSQL environment matching Neon's version. Auto-detection of URL format allows seamless switching between local and cloud databases without code changes.

## Test Requirements

### Manual Verification

- [ ] **Container Startup**: Run `pnpm run db:start` - PostgreSQL container starts and is accessible
- [ ] **Local Connection**: Set `DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres` and verify queries work
- [ ] **Neon Connection**: Set `DATABASE_URL` to Neon URL and verify queries still work
- [ ] **Data Persistence**: Stop container, restart, verify data persists
- [ ] **Offline Development**: Disconnect from internet, verify local database still works

### Automated Tests

- [ ] Unit: `client-factory.test.ts` - Verify correct client selected based on URL format
- [ ] Unit: `client-factory.test.ts` - Verify Neon URL patterns detected correctly
- [ ] Unit: `client-factory.test.ts` - Verify local postgres:// URLs use node-postgres

### Integration Tests

N/A - Client selection is tested via unit tests; actual database connectivity tested in S3/S7.

### Verification Commands

```bash
# Start local database
pnpm run db:start

# Verify container is running
docker ps | grep postgres

# Test connection with local URL
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
  pnpm --filter @repo/database exec tsx -e "
    import { db } from './src/index';
    const result = await db.execute('SELECT 1 as test');
    console.log('Connected:', result);
  "

# Stop database
pnpm run db:stop

# Verify data volume exists
docker volume ls | grep postgres-data
```

## Implementation Notes

### Implementation Sequence

1. **Create Docker Compose Configuration**
   - Define PostgreSQL 16 service
   - Configure persistent named volume
   - Set default credentials for local dev
   - Expose port 5432

2. **Add Local PostgreSQL Driver**
   - Install `postgres` package (postgres.js)
   - Create `client-local.ts` with node-postgres driver
   - Match API surface with Neon client

3. **Implement Client Factory**
   - Create `client-factory.ts` with URL detection logic
   - Check for Neon-specific URL patterns
   - Return appropriate client based on URL
   - Export unified `db` interface

4. **Refactor Existing Client**
   - Update `client.ts` to use factory pattern
   - Maintain backward compatibility
   - Ensure type exports remain consistent

5. **Add NPM Scripts**
   - Add `db:start` script to start Docker container
   - Add `db:stop` script to stop container
   - Document scripts in README

6. **Update Documentation**
   - Add local setup instructions to README
   - Update `.env.example` with both URL formats
   - Document when to use local vs Neon

### Key Concepts

- **Driver Abstraction**: Both Neon HTTP and node-postgres expose similar Drizzle interfaces
- **URL-Based Detection**: Connection string format determines which driver to use
- **Volume Persistence**: Docker named volumes survive container recreation
- **Parity**: Local PostgreSQL version matches Neon for consistent behavior

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference patterns:

- [Drizzle with node-postgres](https://orm.drizzle.team/docs/get-started-postgresql#node-postgres)
- [Docker Compose for PostgreSQL](https://hub.docker.com/_/postgres)

Key pattern notes:

- Use `postgres` (postgres.js) for local as it's lighter than `pg`
- Client factory should be synchronous for simple imports
- Environment detection happens at module load time

### Troubleshooting

| Issue                       | Cause                    | Solution                                       |
| --------------------------- | ------------------------ | ---------------------------------------------- |
| Container won't start       | Port 5432 already in use | Stop other PostgreSQL instances or change port |
| Connection refused          | Container not running    | Run `pnpm run db:start` first                  |
| Wrong driver selected       | URL format not detected  | Verify DATABASE_URL contains expected patterns |
| Data lost after restart     | Using container storage  | Ensure docker-compose uses named volume        |
| Permission denied on volume | Docker volume ownership  | Run `docker volume rm postgres-data` and retry |

### Reference Materials

- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Drizzle with node-postgres](https://orm.drizzle.team/docs/get-started-postgresql#node-postgres)
- [postgres.js Documentation](https://github.com/porsager/postgres)

## Estimated Effort

**Size**: S (3-4h)

**Breakdown**:

- Docker Compose setup: 0.5h
- Client factory implementation: 1.5h
- Refactor existing client: 0.5h
- Scripts and documentation: 0.5h
- Testing: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md) - Drizzle supports multiple PostgreSQL drivers

### Story-Specific Decisions

#### AD-2A.2.S9.1: URL-Based Driver Selection

**Scope**: Story-specific (client factory implementation)

**Decision**: Auto-detect database driver based on `DATABASE_URL` format rather than requiring a separate environment variable.

**Rationale**:

- Simpler configuration - single DATABASE_URL variable
- No risk of mismatched driver/URL combinations
- Neon URLs are easily identifiable (contain `neon.tech` or use `@neon` driver prefix)
- Matches developer expectations from other frameworks

**Consequences**:

- Developers only need to change DATABASE_URL to switch environments
- Client factory adds small runtime overhead (URL parsing)
- Future database providers may need pattern updates

**Alternatives Considered**:

- **Separate DB_DRIVER env var**: Rejected - adds configuration complexity and risk of mismatch
- **Build-time selection**: Rejected - prevents runtime environment switching

#### AD-2A.2.S9.2: postgres.js over node-postgres (pg)

**Scope**: Story-specific (local driver selection)

**Decision**: Use `postgres` (postgres.js) instead of `pg` (node-postgres) for local development.

**Rationale**:

- Smaller bundle size (~50KB vs ~200KB)
- Modern ESM-first design
- Excellent TypeScript support
- Simpler connection API
- Active maintenance

**Consequences**:

- Slightly different low-level API than pg (abstracted by Drizzle)
- postgres.js is newer with smaller ecosystem
- Both are well-supported by Drizzle ORM

**Alternatives Considered**:

- **pg (node-postgres)**: Rejected - larger, older API design
- **Same Neon driver locally**: Rejected - requires internet, defeats purpose

## Out of Scope

- **Production Docker deployment** - Local development only; production uses Neon
- **Database GUI tools** - Developers can use their preferred tools (pgAdmin, DBeaver, etc.)
- **Multiple database instances** - Single local instance sufficient for development
- **Database clustering/replication** - Over-engineered for local development
- **CI/CD Docker database** - CI uses Neon or GitHub Actions PostgreSQL service

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Configure Drizzle ORM and Client** - Requires Drizzle configuration and initial client to refactor

### Enables (Unblocks These Stories)

None - This is an optional enhancement for developer experience.

### Can Run in Parallel With

- **S3**: Connection utilities work with both local and Neon
- **S4**: Migrations work identically on local and Neon
- **S5**: Seed scripts work with local database

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

### External Documentation

- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Drizzle with node-postgres](https://orm.drizzle.team/docs/get-started-postgresql#node-postgres)
- [postgres.js GitHub](https://github.com/porsager/postgres)

## Verification Checklist

**Pre-Verification:**

- [ ] S2 completed and Drizzle client working with Neon
- [ ] Docker installed and running locally
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

**Implementation Quality:**

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors, types compile successfully
- [ ] Client factory tests passing
- [ ] Both local and Neon connections verified working

**Documentation:**

- [ ] README updated with local setup instructions
- [ ] `.env.example` includes both connection string formats
- [ ] docker-compose.yml has inline comments

**Git Hygiene:**

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] Commit: `feat(2A.2.S9): add local docker database for development`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
