# Troubleshooting Guide

This guide covers common issues and solutions for the @repo/database package.

## Table of Contents

- [Connection Issues](#connection-issues)
- [Migration Issues](#migration-issues)
- [Query Issues](#query-issues)
- [Edge Runtime Issues](#edge-runtime-issues)
- [Type Errors](#type-errors)
- [Seed Issues](#seed-issues)
- [Local Development Issues](#local-development-issues)

## Connection Issues

### Error: DATABASE_URL environment variable is required

**Symptom**: Application fails to start with missing DATABASE_URL error.

**Cause**: The DATABASE_URL environment variable is not set.

**Solution**:

Create `.env.local` in the monorepo root:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
```

For Vercel deployments, add to project settings:

- Go to Project Settings > Environment Variables
- Add `DATABASE_URL` with your Neon connection string

For CI/CD, add as secret:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Error: Connection timeout

**Symptom**: Database operations time out without completing.

**Cause**: Network issues, database server unavailable, or firewall blocking.

**Solution**:

Verify the DATABASE_URL is correct:

```bash
echo $DATABASE_URL
```

Test direct connection:

```bash
# For local PostgreSQL
psql $DATABASE_URL -c "SELECT 1"
```

Check Neon dashboard for connection status.

Use health check to diagnose:

```typescript
const health = await checkDatabaseHealth({ timeoutMs: 10000 });
console.log(health);
```

### Error: Connection refused

**Symptom**: `ECONNREFUSED` error when connecting to database.

**Cause**: Database server is not running or wrong port.

**Solution**:

For local Docker PostgreSQL:

```bash
# Start the database
pnpm run db:start

# Verify it's running
docker ps | grep postgres

# Check logs for errors
docker logs next-js-01-postgres
```

### Error: SSL certificate error

**Symptom**: SSL/TLS handshake failures with Neon.

**Cause**: Missing `sslmode=require` in connection string.

**Solution**:

Add `?sslmode=require` to your Neon URL:

```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

### Error: Too many connections

**Symptom**: Database rejects new connections.

**Cause**: Connection pool exhausted or connection leaks.

**Solution**:

For Neon, connection pooling is handled automatically.

For local development, ensure you're using the singleton `db`:

```typescript
// Correct - use singleton
import { db } from '@repo/database';

// Incorrect - don't create multiple clients
const newDb = drizzle(...);
```

Check for connection leaks in long-running processes.

## Migration Issues

### Error: No schema changes detected

**Symptom**: `pnpm run db:generate` produces no migration file.

**Cause**: Schema files match current database state.

**Solution**:

Verify you've saved your schema file changes.

Check the schema is properly exported:

```typescript
// src/schema/index.ts
export * from "./users";
```

Verify drizzle.config.ts points to correct schema:

```typescript
export default {
  schema: "./src/schema/*.ts",
  // ...
};
```

### Error: Migration already applied

**Symptom**: Migration fails with "already applied" error.

**Cause**: Migration tracking table shows migration was run.

**Solution**:

Check applied migrations:

```sql
SELECT * FROM drizzle.__drizzle_migrations;
```

If migration needs to be rerun (dev only):

```sql
DELETE FROM drizzle.__drizzle_migrations
WHERE hash = 'your-migration-hash';
```

Never delete migration records in production.

### Error: Migration failed with syntax error

**Symptom**: Migration SQL has invalid syntax.

**Cause**: Generated SQL has issues or schema definition errors.

**Solution**:

Review the generated migration file.

Check for TypeScript errors in schema:

```bash
pnpm run type-check
```

Validate schema syntax:

```typescript
// Correct
export const users = pgTable("users", {
  id: text("id").primaryKey(),
});

// Incorrect - missing quotes
export const users = pgTable(users, { ... });
```

### Error: Cannot find migrations folder

**Symptom**: Migration runner cannot locate migration files.

**Cause**: Incorrect migrations path or files not generated.

**Solution**:

Check migrations folder exists:

```bash
ls packages/database/src/migrations/
```

Generate migrations if missing:

```bash
pnpm run db:generate
```

Verify path in drizzle.config.ts:

```typescript
export default {
  out: "./src/migrations",
  // ...
};
```

## Query Issues

### Error: Column does not exist

**Symptom**: Runtime error about missing column.

**Cause**: Schema doesn't match database, or migration not applied.

**Solution**:

Apply pending migrations:

```bash
pnpm run db:migrate
```

Verify column exists:

```bash
pnpm run db:studio
```

Compare schema with database.

### Error: Invalid input syntax for type uuid

**Symptom**: UUID-related error when querying.

**Cause**: Passing invalid string where UUID expected.

**Solution**:

Validate IDs before querying:

```typescript
import { isValidId } from "@repo/database";

if (!isValidId(userInput)) {
  throw new Error("Invalid ID");
}
```

Ensure organization IDs are valid UUIDs.

### Error: Relation does not exist

**Symptom**: Table not found during query.

**Cause**: Table doesn't exist in database or wrong schema.

**Solution**:

Run migrations:

```bash
pnpm run db:migrate
```

Check table exists:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Verify schema is exported correctly.

## Edge Runtime Issues

### Error: Dynamic require not supported

**Symptom**: Edge function fails with require() error.

**Cause**: Using Node.js-specific APIs in edge runtime.

**Solution**:

Use Neon HTTP driver (auto-selected for Neon URLs).

Don't use postgres.js in edge functions:

```typescript
// Correct - Neon HTTP works in edge
DATABASE_URL=postgresql://...@host.neon.tech/db?sslmode=require

// Incorrect for edge - postgres.js requires Node.js
DATABASE_URL=postgres://localhost:5432/db
```

Check edge compatibility of dependencies.

### Error: Crypto not available

**Symptom**: ID generation fails in edge runtime.

**Cause**: cuid2 uses crypto which may not be available.

**Solution**:

cuid2 is edge-compatible, but if issues occur:

Verify you're using the latest cuid2 version.

Pre-generate IDs if needed:

```typescript
// Generate ID before entering edge context
const id = createId();
```

### Error: Slow cold starts

**Symptom**: First request to edge function is slow.

**Cause**: Driver initialization, connection establishment.

**Solution**:

Enable connection caching:

```typescript
// Automatic in production, or set manually:
neonConfig.fetchConnectionCache = true;
```

Use smaller bundle sizes.

Pre-warm functions with scheduled pings.

## Type Errors

### Error: Types don't match schema

**Symptom**: TypeScript errors when using inferred types.

**Cause**: Schema definition doesn't match usage.

**Solution**:

Use correct type exports:

```typescript
const users = pgTable("users", { ... });

// Select type (what you get from queries)
type User = typeof users.$inferSelect;

// Insert type (what you provide for inserts)
type NewUser = typeof users.$inferInsert;
```

Regenerate types after schema changes:

```bash
pnpm run build
```

### Error: Cannot find module '@repo/database'

**Symptom**: Import errors in consuming packages.

**Cause**: Package not built or linked correctly.

**Solution**:

Build the package:

```bash
cd packages/database
pnpm run build
```

Verify exports in package.json:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

Reinstall dependencies:

```bash
pnpm install
```

## Seed Issues

### Error: Seed failed - foreign key constraint

**Symptom**: Seed fails with constraint violation.

**Cause**: Seeding in wrong order or missing related data.

**Solution**:

Seed in correct order (parents before children):

```typescript
const seeds = [
  { name: "organizations", seed: seedOrgs }, // First
  { name: "users", seed: seedUsers }, // Second
  { name: "posts", seed: seedPosts }, // Third (has FK to users)
];
```

Clear existing data before seeding:

```bash
pnpm run db:reset
```

### Error: Duplicate key value

**Symptom**: Seed fails with unique constraint violation.

**Cause**: Re-running seed without clearing data.

**Solution**:

Reset database before seeding:

```bash
NODE_ENV=development pnpm run db:reset
```

Or use upsert logic in seeds:

```typescript
await db
  .insert(users)
  .values(userData)
  .onConflictDoUpdate({
    target: users.email,
    set: { updatedAt: new Date() },
  });
```

### Error: Faker seed not producing consistent data

**Symptom**: Data varies between runs despite setting seed.

**Cause**: Seed set after data generation or in wrong scope.

**Solution**:

Set seed immediately before generating data:

```typescript
import { setFakerSeed, createUserData } from "@repo/database";

// Set seed first
setFakerSeed(12345);

// Then generate data
const user = createUserData();
```

## Local Development Issues

### Error: Docker container not starting

**Symptom**: `pnpm run db:start` fails.

**Cause**: Docker not running or port conflict.

**Solution**:

Start Docker Desktop.

Check for port conflicts:

```bash
lsof -i :5432
```

Stop conflicting service:

```bash
# On macOS
brew services stop postgresql

# Or kill process
kill -9 <PID>
```

Check Docker logs:

```bash
docker logs next-js-01-postgres
```

### Error: Data disappeared after restart

**Symptom**: Database is empty after machine restart.

**Cause**: Volume not persisting or wrong container.

**Solution**:

Check volume exists:

```bash
docker volume ls | grep postgres
```

Verify container uses volume:

```yaml
# docker-compose.yml
volumes:
  - postgres-data:/var/lib/postgresql/data
```

Re-run migrations after starting:

```bash
pnpm run db:start
pnpm run db:migrate
```

### Error: Reset blocked in production

**Symptom**: `db:reset` refuses to run.

**Cause**: Safety guard preventing data loss.

**Solution**:

This is intentional! For production rollback:

- Create a reversal migration
- Or restore from backup

For development:

```bash
NODE_ENV=development pnpm run db:reset
```

## Getting Help

If your issue isn't covered here:

1. Check the [Drizzle ORM documentation](https://orm.drizzle.team/)
1. Check the [Neon documentation](https://neon.tech/docs)
1. Search for similar issues in the repository
1. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (local/Neon, Node version)
   - Relevant code snippets

## Related Documentation

- [README](../README.md) - Package overview
- [Connections Guide](./connections.md) - Connection setup
- [Migrations Guide](./migrations.md) - Schema changes
- [Utilities Guide](./utilities.md) - Helper functions
- [Seeding Guide](./seeding.md) - Test data
