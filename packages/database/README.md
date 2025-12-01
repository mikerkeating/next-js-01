# @repo/database

Database schema, client, and utilities for the monorepo using Drizzle ORM with PostgreSQL (Neon serverless).

## Installation

This package is part of the monorepo and is automatically linked via pnpm workspaces.

```bash
# From monorepo root
pnpm install
```

## Usage

```typescript
import { db, checkDatabaseHealth, runMigrations } from "@repo/database";
import { users } from "@repo/database/schema";

// Query example
const allUsers = await db.query.users.findMany();

// Health check
const health = await checkDatabaseHealth();
console.log(`Database status: ${health.status}, latency: ${health.latencyMs}ms`);

// Run migrations programmatically
const result = await runMigrations({ verbose: true });
if (result.success) {
  console.log(`Migrations completed in ${result.durationMs}ms`);
}
```

## Package Structure

```
packages/database/
├── src/
│   ├── index.ts          # Package entry point
│   ├── client.ts         # Drizzle client configuration
│   ├── connection.ts     # Connection utilities (health check, retry)
│   ├── migrate.ts        # Programmatic migration runner
│   ├── schema/
│   │   └── index.ts      # Schema barrel export
│   └── migrations/       # Generated SQL migration files
├── scripts/
│   ├── apply-migrations.ts   # Apply migrations CLI
│   ├── generate-migration.ts # Generate migrations CLI
│   ├── rollback-migration.ts # Rollback guidance CLI
│   └── reset-database.ts     # Database reset CLI (dev only)
├── drizzle.config.ts     # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script                     | Description                                 |
| -------------------------- | ------------------------------------------- |
| `pnpm build`               | Compile TypeScript to JavaScript            |
| `pnpm type-check`          | Run TypeScript type checking                |
| `pnpm test`                | Run unit tests                              |
| `pnpm db:generate`         | Generate migrations from schema changes     |
| `pnpm db:migrate`          | Apply migrations using Drizzle Kit          |
| `pnpm db:apply-migrations` | Apply migrations programmatically           |
| `pnpm db:rollback`         | Show rollback guidance                      |
| `pnpm db:reset`            | Reset database (dev/test only)              |
| `pnpm db:push`             | Push schema changes directly (dev only)     |
| `pnpm db:studio`           | Open Drizzle Studio (visual database admin) |

## Migration Workflow

### Overview

Migrations are the recommended way to manage database schema changes. They provide:

- **Version Control**: Schema changes are tracked in SQL files
- **Reproducibility**: Same schema can be created on any environment
- **Auditability**: Clear history of what changed and when
- **Safety**: Review generated SQL before applying to production

### 1. Making Schema Changes

First, modify your schema files in `src/schema/`:

```typescript
// src/schema/users.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 2. Generating Migrations

After modifying your schema, generate a migration:

```bash
cd packages/database

# Generate migration (auto-named with timestamp)
pnpm run db:generate

# Generate migration with custom name
pnpm run db:generate --name add_users_table
```

This creates a SQL file in `src/migrations/`:

```sql
-- Example: 0001_add_users_table.sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
```

### 3. Reviewing Migrations

**Always review generated migrations before applying!**

Check for:

- Correct table/column definitions
- Proper constraints and indexes
- No unintended data destructive operations
- Appropriate NULL handling

### 4. Applying Migrations

```bash
# Using Drizzle Kit (recommended for development)
pnpm run db:migrate

# Using programmatic migrator (for scripts/CI)
pnpm run db:apply-migrations

# With verbose logging
pnpm run db:apply-migrations --verbose
```

### 5. Verifying Migrations

After applying migrations:

```bash
# Open Drizzle Studio to inspect the database
pnpm run db:studio

# Check the __drizzle_migrations table for applied migrations
```

### 6. Rollback (When Needed)

Drizzle ORM migrations are designed to be forward-only. To rollback:

```bash
# Show rollback guidance
pnpm run db:rollback
```

Options for rollback:

1. **Create a new migration** that reverses the changes
2. **Restore from backup** (recommended for production issues)
3. **Manual SQL** to undo specific changes

### 7. Database Reset (Development Only)

For development environments, you can reset the database:

```bash
# With confirmation prompt
NODE_ENV=development pnpm run db:reset

# Force reset without confirmation (CI/CD)
NODE_ENV=test pnpm run db:reset --force
```

**This will delete ALL data and reapply all migrations.**

## Environment Variables

| Variable       | Required | Description                               |
| -------------- | -------- | ----------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string              |
| `NODE_ENV`     | No       | Environment (production blocks db:reset)  |
| `VERCEL_ENV`   | No       | Vercel environment for connection caching |

## Programmatic Usage

### Running Migrations in Code

```typescript
import { runMigrations, type MigrationResult } from "@repo/database";

async function applyMigrations(): Promise<void> {
  const result: MigrationResult = await runMigrations({
    verbose: true,
    // Optional: custom migrations folder
    // migrationsFolder: '/custom/path'
  });

  if (!result.success) {
    throw new Error(`Migration failed: ${result.error}`);
  }

  console.log(`Migrations completed in ${result.durationMs}ms`);
}
```

### Health Check

```typescript
import { checkDatabaseHealth } from "@repo/database";

const health = await checkDatabaseHealth({ timeoutMs: 5000 });

if (health.status === "healthy") {
  console.log(`Connected! Latency: ${health.latencyMs}ms`);
} else {
  console.error(`Database unhealthy: ${health.error}`);
}
```

### Retry Wrapper

```typescript
import { withRetry } from "@repo/database";

const result = await withRetry(() => db.query.users.findFirst({ where: eq(users.id, userId) }), {
  maxAttempts: 3,
  baseDelayMs: 100,
  onRetry: (error, attempt) => {
    console.warn(`Retry ${attempt}: ${error.message}`);
  },
});
```

## Best Practices

### Schema Design

1. **Use UUIDs** for primary keys with `defaultRandom()`
2. **Add timestamps** (`created_at`, `updated_at`) to all tables
3. **Define indexes** for frequently queried columns
4. **Use appropriate constraints** (NOT NULL, UNIQUE, CHECK)
5. **Document complex fields** with comments

### Migrations

1. **Review before applying** - Always inspect generated SQL
2. **Test locally first** - Apply to dev database before staging
3. **Keep migrations small** - One logical change per migration
4. **Never edit applied migrations** - Create new ones instead
5. **Backup before risky migrations** - Especially in production

### Connection Management

1. **Use health checks** in startup and monitoring
2. **Implement retry logic** for transient failures
3. **Monitor connection pool** usage in production

## Troubleshooting

| Issue                             | Cause                        | Solution                                     |
| --------------------------------- | ---------------------------- | -------------------------------------------- |
| Migration generation fails        | Invalid schema syntax        | Check TypeScript errors in schema files      |
| "Migration already applied" error | Metadata out of sync         | Check `__drizzle_migrations` table           |
| Connection timeout                | Network or DB server issue   | Verify DATABASE_URL and network connectivity |
| "DATABASE_URL required" error     | Missing environment variable | Set DATABASE_URL in `.env.local` or env      |
| Reset blocked in production       | Safety guard triggered       | Use NODE_ENV=development or create migration |

## Dependencies

- **drizzle-orm** - Type-safe ORM for PostgreSQL
- **drizzle-kit** - Migration and schema tooling (dev)
- **@neondatabase/serverless** - Neon serverless driver
- **tsx** - TypeScript execution for scripts (dev)

## Related Documentation

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [ADR-001: Monorepo Structure](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)

## Implementation Status

This package is being built incrementally across multiple stories:

- **S1**: Package structure - Basic setup and configuration
- **S2**: Configure Drizzle ORM and Client - Database client setup
- **S3**: Implement Connection Utilities - Health check and retry logic
- **S4**: Set Up Migration Infrastructure - Migration workflow (current)
- **S5-S6**: Schema definitions and utilities
- **S7**: Comprehensive testing

## License

Private - Internal use only
