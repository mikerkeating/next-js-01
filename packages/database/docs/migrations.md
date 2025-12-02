# Migration Guide

This guide covers the complete migration workflow for managing database schema changes.

## Table of Contents

- [Overview](#overview)
- [Migration Commands](#migration-commands)
- [Generating Migrations](#generating-migrations)
- [Applying Migrations](#applying-migrations)
- [Reviewing Migrations](#reviewing-migrations)
- [Rollback Strategies](#rollback-strategies)
- [Programmatic Usage](#programmatic-usage)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

Migrations provide version-controlled database schema changes with:

- **Reproducibility**: Same schema on any environment
- **Auditability**: Clear history of changes
- **Safety**: Review SQL before applying
- **Collaboration**: Team members share schema changes

### Migration Flow

```
Schema Change → Generate Migration → Review SQL → Apply Migration → Verify
```

## Migration Commands

| Command                        | Description                            |
| ------------------------------ | -------------------------------------- |
| `pnpm run db:generate`         | Generate migration from schema changes |
| `pnpm run db:migrate`          | Apply migrations using Drizzle Kit     |
| `pnpm run db:apply-migrations` | Apply migrations programmatically      |
| `pnpm run db:rollback`         | Show rollback guidance                 |
| `pnpm run db:push`             | Push schema directly (dev only)        |
| `pnpm run db:studio`           | Open visual database admin             |

## Generating Migrations

### 1. Modify Schema Files

Edit your schema definitions in `src/schema/`:

```typescript
// src/schema/users.ts
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createId, timestamps } from "@repo/database";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name"),
  ...timestamps(),
});

// Export types for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 2. Generate Migration

```bash
cd packages/database

# Auto-named with timestamp
pnpm run db:generate

# With custom name
pnpm run db:generate --name add_users_table
```

### 3. Review Generated SQL

The migration file is created in `src/migrations/`:

```sql
-- 0001_add_users_table.sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
```

## Applying Migrations

### Using Drizzle Kit (Development)

```bash
# Apply all pending migrations
pnpm run db:migrate
```

### Using Programmatic Migrator (Scripts/CI)

```bash
# Basic
pnpm run db:apply-migrations

# With verbose logging
pnpm run db:apply-migrations --verbose
```

### Programmatic API

```typescript
import { runMigrations } from "@repo/database";

const result = await runMigrations({ verbose: true });

if (result.success) {
  console.log(`Migrations completed in ${result.durationMs}ms`);
} else {
  throw new Error(`Migration failed: ${result.error}`);
}
```

## Reviewing Migrations

### Pre-Apply Checklist

Before applying any migration, verify:

- [ ] Table and column names are correct
- [ ] Constraints are appropriate (NOT NULL, UNIQUE, CHECK)
- [ ] Indexes are defined for query patterns
- [ ] No unintended destructive operations (DROP TABLE, DROP COLUMN)
- [ ] Default values are sensible
- [ ] NULL handling is correct

### Using Drizzle Studio

Inspect your database visually:

```bash
pnpm run db:studio
```

Opens a browser-based admin interface to:

- Browse table data
- Run ad-hoc queries
- Verify schema changes

### Checking Migration History

Query the migrations table to see what's been applied:

```sql
SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC;
```

## Rollback Strategies

Drizzle ORM migrations are **forward-only by design**. Here are your rollback options:

### Option 1: Create Reversal Migration (Recommended)

Write a new migration that undoes the changes:

```bash
pnpm run db:generate --name revert_add_users_table
```

```sql
-- Manual: revert_add_users_table.sql
DROP TABLE IF EXISTS "users";
```

### Option 2: Restore from Backup

For production issues:

1. Stop the application
2. Restore database from backup
3. Revert code to matching version
4. Restart application

### Option 3: Manual SQL Rollback

For development environments:

```bash
pnpm run db:rollback
```

This shows:

- Currently applied migrations
- Manual rollback instructions
- SQL to remove migration record

### Manual Rollback Steps

1. Identify the migration to rollback
2. Write and execute inverse SQL
3. Remove the migration record:

```sql
DELETE FROM drizzle.__drizzle_migrations WHERE id = [migration_id];
```

## Programmatic Usage

### Running Migrations in Code

```typescript
import { runMigrations, getMigrationsPath, MigrationError } from "@repo/database";

async function applyMigrations(): Promise<void> {
  const result = await runMigrations({
    verbose: true,
    migrationsFolder: getMigrationsPath(), // Optional: custom path
  });

  if (!result.success) {
    throw new MigrationError(`Migration failed: ${result.error}`, "MIGRATION_FAILED");
  }

  console.log(`Applied in ${result.durationMs}ms from ${result.migrationsPath}`);
}
```

### Migration Result Interface

```typescript
interface MigrationResult {
  success: boolean;
  durationMs: number;
  migrationsPath: string;
  error?: string;
}
```

### Error Handling

```typescript
import { runMigrations, MigrationError } from "@repo/database";

try {
  const result = await runMigrations();

  if (!result.success) {
    // Handle migration failure
    console.error(`Migration failed: ${result.error}`);
  }
} catch (error) {
  if (error instanceof MigrationError) {
    switch (error.code) {
      case "CONNECTION_ERROR":
        console.error("Cannot connect to database");
        break;
      case "INVALID_PATH":
        console.error("Migrations folder not found");
        break;
      default:
        console.error(`Migration error: ${error.message}`);
    }
  }
}
```

## Best Practices

### Schema Design

**Use consistent ID patterns**:

```typescript
id: text("id")
  .primaryKey()
  .$defaultFn(() => createId());
```

**Always include timestamps**:

```typescript
...timestamps() // Adds createdAt and updatedAt
```

**Add soft delete when needed**:

```typescript
...softDelete() // Adds deletedAt column
```

**Define indexes for queries**:

```typescript
export const usersEmailIdx = index("users_email_idx").on(users.email);
```

### Migration Practices

**One logical change per migration**:

- Don't mix unrelated schema changes
- Easier to review and rollback

**Test locally before staging**:

```bash
pnpm run db:start
pnpm run db:migrate
# Verify changes
pnpm run db:studio
```

**Never edit applied migrations**:

- Create new migrations instead
- Existing deployments have already run the original

**Backup before risky migrations**:

- Especially for data migrations
- Keep production backups current

**Review generated SQL**:

- Drizzle Kit generates SQL automatically
- Always verify it matches your intent

### Naming Conventions

```bash
# Good migration names
pnpm run db:generate --name create_users_table
pnpm run db:generate --name add_email_index_to_users
pnpm run db:generate --name add_deleted_at_to_posts

# Avoid
pnpm run db:generate --name update1
pnpm run db:generate --name fix
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/migrate.yml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - "packages/database/src/schema/**"
      - "packages/database/src/migrations/**"

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "pnpm"

      - run: pnpm install

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd packages/database
          pnpm run db:apply-migrations --verbose
```

### Validation in CI

```yaml
# Validate schema can generate migrations
- name: Validate schema
  run: |
    cd packages/database
    pnpm run db:generate --name ci_validation
    # Should succeed without errors
    rm -rf src/migrations/ci_validation.sql
```

## Database Reset (Development Only)

For development environments, reset the entire database:

```bash
# With confirmation prompt
NODE_ENV=development pnpm run db:reset

# Force reset (CI/CD)
NODE_ENV=test pnpm run db:reset --force
```

**Warning**: This deletes ALL data and reapplies migrations.

## Troubleshooting

| Issue                        | Cause                     | Solution                           |
| ---------------------------- | ------------------------- | ---------------------------------- |
| "No schema changes detected" | Schema already matches DB | Verify your schema changes         |
| "Migration already applied"  | Migration ran previously  | Check `__drizzle_migrations` table |
| "Cannot find migrations"     | Wrong path                | Verify `migrationsFolder` setting  |
| Generation errors            | Invalid schema syntax     | Check TypeScript errors            |

See [Troubleshooting Guide](./troubleshooting.md) for more solutions.

## Related Documentation

- [README](../README.md) - Package overview
- [Connections Guide](./connections.md) - Database setup
- [Utilities Guide](./utilities.md) - Schema helpers
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview) - Official migration docs
