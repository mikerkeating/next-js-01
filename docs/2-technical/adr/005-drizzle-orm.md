# ADR-005: Drizzle as ORM

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to select an Object-Relational Mapping (ORM) tool for our PostgreSQL database that provides type safety, excellent developer experience, good performance, and integrates well with our TypeScript/Next.js stack. The ORM must support complex queries, migrations, and our multi-tenant architecture with row-level security.

### Key Requirements

1. **Type Safety**: Full TypeScript support with inferred types
2. **Performance**: Minimal overhead, efficient query generation
3. **Developer Experience**: Intuitive API, good error messages
4. **Schema Management**: Type-safe schema definition
5. **Migrations**: Reliable migration system
6. **Query Builder**: Flexible, powerful query building
7. **Relations**: Support for complex relationships
8. **PostgreSQL Features**: Full PostgreSQL support (JSON, arrays, CTEs, etc.)
9. **Edge Compatibility**: Works with edge runtimes
10. **Multi-tenancy**: Supports Organization-scoped queries

### Constraints

- Must work with PostgreSQL 16+
- Must support serverless databases (Neon/Supabase)
- Must work in Next.js Server Components
- Must integrate with our monorepo structure
- Team needs to be productive quickly

## Decision

We will use **Drizzle ORM** (latest version) as our database ORM, with **Drizzle Kit** for migrations.

### Configuration

**Database Package Structure**:

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── Organizations.ts
│   │   ├── content.ts
│   │   └── index.ts
│   ├── client.ts
│   ├── migrations/
│   └── index.ts
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

**drizzle.config.ts**:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

**Example Schema (packages/database/src/schema/users.ts)**:

```typescript
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**Database Client (packages/database/src/client.ts)**:

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// Configure for edge runtime if needed
if (process.env.VERCEL_ENV === "production") {
  neonConfig.fetchConnectionCache = true;
}

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

## Rationale

### Why Drizzle ORM?

1. **TypeScript-First Design**
   - Schema definitions are TypeScript code
   - Automatic type inference from schema
   - No code generation needed
   - Type-safe queries everywhere
   - Catches errors at compile time

2. **Excellent Performance**
   - Minimal runtime overhead
   - Generates efficient SQL
   - No lazy loading pitfalls
   - Direct SQL when needed
   - Smaller bundle size than alternatives

3. **Developer Experience**
   - Intuitive, chainable API
   - Clear error messages
   - Great autocomplete
   - Simple learning curve
   - Active development and community

4. **SQL-like Queries**
   - Feels like writing SQL
   - Not hiding complexity
   - Easy to understand generated queries
   - Power user friendly
   - Raw SQL escape hatch

5. **Edge Runtime Support**
   - Works with Vercel Edge Functions
   - Compatible with Neon serverless
   - Works with Supabase
   - Connection pooling support
   - WebSocket connections

6. **Migration System**
   - Drizzle Kit for migrations
   - Automatic migration generation
   - Version control friendly
   - Rollback support
   - Safe migration practices

7. **Relations & Joins**
   - Type-safe relations
   - Efficient joins
   - Nested queries
   - CTEs and subqueries
   - Complex query support

8. **PostgreSQL Excellence**
   - Full PostgreSQL feature support
   - JSON/JSONB operations
   - Array operations
   - Custom types
   - Indexes and constraints

9. **Monorepo Friendly**
   - Works in shared packages
   - No CLI dependencies in production
   - Tree-shakeable
   - Clean exports

10. **Growing Ecosystem**
    - Active development
    - Regular updates
    - Good documentation
    - Community plugins
    - Migration tools from other ORMs

### Alternatives Considered

#### Option 1: Prisma

**Pros:**

- Mature ecosystem
- Great documentation
- Visual database browser (Prisma Studio)
- Strong community
- Good migration system

**Cons:**

- ❌ Slower query performance
- ❌ Larger bundle size
- ❌ Code generation required
- ❌ Less intuitive for SQL users
- ❌ More abstraction overhead
- ❌ Edge runtime limitations
- ❌ Type generation can be slow

**Decision**: Rejected - Performance overhead and code generation complexity outweigh benefits.

#### Option 2: TypeORM

**Pros:**

- Mature and stable
- Decorator-based models
- Active Record and Data Mapper patterns
- Good documentation
- Large community

**Cons:**

- ❌ Decorator syntax feels outdated
- ❌ Less type-safe than modern alternatives
- ❌ Runtime reflection overhead
- ❌ Complex configuration
- ❌ Migrations can be tricky
- ❌ Not optimized for serverless

**Decision**: Rejected - Older design patterns, less type safety than Drizzle.

#### Option 3: Kysely

**Pros:**

- Excellent TypeScript support
- Very lightweight
- SQL-first approach
- Good performance
- Type-safe queries

**Cons:**

- ❌ More manual type definitions
- ❌ Less feature-rich than Drizzle
- ❌ No built-in migration tool
- ❌ Smaller ecosystem
- ❌ More boilerplate code
- ❌ Steeper learning curve

**Decision**: Rejected - More manual work required, less tooling than Drizzle.

#### Option 4: Sequelize

**Pros:**

- Very mature
- Large community
- Extensive documentation
- Supports many databases

**Cons:**

- ❌ Poor TypeScript support
- ❌ Old API design
- ❌ Performance issues
- ❌ Complex for simple operations
- ❌ Not serverless-optimized
- ❌ Less active development

**Decision**: Rejected - Outdated, poor TypeScript support.

#### Option 5: MikroORM

**Pros:**

- Good TypeScript support
- Unit of Work pattern
- Identity Map
- Active development

**Cons:**

- ❌ Steeper learning curve
- ❌ More complex than needed
- ❌ Larger bundle size
- ❌ Overkill for our use case
- ❌ Less intuitive API

**Decision**: Rejected - Too complex for our needs.

#### Option 6: Raw SQL (node-postgres)

**Pros:**

- Maximum performance
- Complete control
- No abstraction
- Minimal dependencies

**Cons:**

- ❌ No type safety
- ❌ Error-prone
- ❌ Manual query building
- ❌ No migration tooling
- ❌ More boilerplate
- ❌ Harder to maintain

**Decision**: Rejected - Too much manual work, no type safety.

## Consequences

### Positive

1. **Type Safety**: Compile-time errors prevent runtime database issues
2. **Fast Development**: Intuitive API accelerates feature development
3. **Great Performance**: Minimal overhead, efficient queries
4. **SQL Knowledge Transfers**: SQL experience directly applicable
5. **Edge Compatible**: Works in all our deployment environments
6. **Small Bundle Size**: Lightweight, tree-shakeable
7. **Easy Debugging**: Generated SQL is readable
8. **Flexible**: Can drop to raw SQL when needed
9. **Future Proof**: Active development, modern architecture
10. **Great DX**: Autocomplete and type inference save time

### Negative

1. **Newer Tool**: Less mature than Prisma or TypeORM
2. **Smaller Community**: Fewer tutorials and examples
3. **Migration Limitations**: Some advanced migrations need raw SQL
4. **Learning Curve**: Team needs to learn Drizzle patterns
5. **Documentation Gaps**: Some features less documented than alternatives

### Mitigation Strategies

1. **Documentation**:
   - Create internal Drizzle usage guide
   - Document common patterns
   - Share code examples across team
   - Reference schema as examples

2. **Team Training**:
   - Run workshop on Drizzle basics
   - Pair programming for first schemas
   - Code review for query patterns
   - Build shared query utilities

3. **Migration Safety**:
   - Always review generated migrations
   - Test migrations in staging first
   - Keep migration backups
   - Document complex migrations

4. **Community Engagement**:
   - Monitor Drizzle Discord/GitHub
   - Contribute back when possible
   - Share learnings with community
   - Stay updated on releases

## Implementation Plan

### Phase 1: Setup (Day 1)

- [x] Create `@repo/database` package
- [ ] Install Drizzle and dependencies
- [ ] Configure drizzle.config.ts
- [ ] Set up database client
- [ ] Connect to Neon/Supabase

### Phase 2: Schema Definition (Day 2-3)

- [ ] Define users schema
- [ ] Define Organizations schema
- [ ] Define user_Organizations schema
- [ ] Define content schema
- [ ] Define analytics_events schema
- [ ] Set up relations between tables

### Phase 3: Migrations (Day 3-4)

- [ ] Generate initial migration
- [ ] Test migration locally
- [ ] Apply to staging database
- [ ] Verify schema in production database
- [ ] Document migration workflow

### Phase 4: Query Patterns (Week 1)

- [ ] Create common query utilities
- [ ] Implement Organization scoping helpers
- [ ] Add transaction helpers
- [ ] Create seed scripts
- [ ] Write query examples

### Phase 5: Testing (Week 1-2)

- [ ] Set up test database
- [ ] Write schema tests
- [ ] Write query tests
- [ ] Test migrations
- [ ] Performance testing

## Validation

### Success Metrics

- [ ] All queries are type-safe
- [ ] Query performance < 100ms (p95) for simple queries
- [ ] Zero runtime type errors
- [ ] Migration generation < 5 seconds
- [ ] Team comfortable writing queries within 1 week
- [ ] Bundle size impact < 50KB
- [ ] 100% test coverage for database utilities

### Testing Checklist

1. **Schema Validation**:
   - [ ] All tables created correctly
   - [ ] Indexes applied properly
   - [ ] Foreign keys enforced
   - [ ] Constraints work as expected

2. **Type Safety**:
   - [ ] Insert types prevent invalid data
   - [ ] Select types match schema
   - [ ] Relations typed correctly
   - [ ] Query results properly typed

3. **Queries**:
   - [ ] Simple CRUD operations work
   - [ ] Complex joins execute correctly
   - [ ] Transactions work properly
   - [ ] Edge cases handled

4. **Migrations**:
   - [ ] Migrations run successfully
   - [ ] Rollback works when needed
   - [ ] No data loss on migration
   - [ ] Schema stays in sync

5. **Performance**:
   - [ ] Query times meet targets
   - [ ] Connection pooling works
   - [ ] No N+1 query problems
   - [ ] Indexes used correctly

## Schema Examples

### Basic CRUD Operations

```typescript
import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { eq } from "drizzle-orm";

// Insert
const newUser = await db
  .insert(users)
  .values({
    clerkId: "clerk_123",
    email: "user@example.com",
    name: "John Doe",
  })
  .returning();

// Select
const user = await db.query.users.findFirst({
  where: eq(users.email, "user@example.com"),
});

// Update
await db.update(users).set({ name: "Jane Doe" }).where(eq(users.id, userId));

// Delete
await db.delete(users).where(eq(users.id, userId));
```

### Relations & Joins

```typescript
import { db } from "@repo/database";
import { users, Organizations, userOrganizations } from "@repo/database/schema";

// Query with relations
const usersWithOrgs = await db.query.users.findMany({
  with: {
    userOrganizations: {
      with: {
        Organization: true,
      },
    },
  },
});

// Manual join
const result = await db
  .select({
    user: users,
    org: Organizations,
    role: userOrganizations.role,
  })
  .from(users)
  .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
  .innerJoin(Organizations, eq(userOrganizations.OrganizationId, Organizations.id))
  .where(eq(users.id, userId));
```

### Organization-Scoped Queries

```typescript
import { db } from "@repo/database";
import { content } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";

// Helper function for org-scoped queries
export function withOrgContext<T>(orgId: string, query: (db: typeof db) => Promise<T>): Promise<T> {
  // In practice, you might use RLS or query filters
  return query(db);
}

// Usage
export async function getOrgContent(orgId: string) {
  return db.query.content.findMany({
    where: eq(content.OrganizationId, orgId),
  });
}
```

### Transactions

```typescript
import { db } from "@repo/database";
import { users, Organizations, userOrganizations } from "@repo/database/schema";

// Transaction example
await db.transaction(async (tx) => {
  // Create user
  const [user] = await tx
    .insert(users)
    .values({
      clerkId: "clerk_123",
      email: "user@example.com",
    })
    .returning();

  // Create Organization
  const [org] = await tx
    .insert(Organizations)
    .values({
      name: "Acme Corp",
      slug: "acme",
    })
    .returning();

  // Link user to org
  await tx.insert(userOrganizations).values({
    userId: user.id,
    OrganizationId: org.id,
    role: "product-seller",
  });
});
```

## Migration Workflow

### Generate Migration

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# The migration will be created in packages/database/src/migrations/
```

### Apply Migration

```bash
# Apply to database
pnpm drizzle-kit migrate

# Or use programmatic approach
import { migrate } from 'drizzle-orm/neon-http/migrator'
await migrate(db, { migrationsFolder: './src/migrations' })
```

### Migration File Example

```sql
-- Migration: 0000_initial_schema.sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clerk_id" text NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "avatar_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE INDEX IF NOT EXISTS "idx_users_clerk_id" ON "users" ("clerk_id");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
```

## Best Practices

1. **Schema Organization**
   - One file per table
   - Export types from schema files
   - Use consistent naming conventions
   - Document complex fields

2. **Query Patterns**
   - Use `db.query` for simple queries
   - Use builder for complex queries
   - Always filter by Organization
   - Use transactions for multi-step operations

3. **Type Safety**
   - Use inferred types (`$inferSelect`, `$inferInsert`)
   - Define custom types when needed
   - Avoid `any` types
   - Leverage TypeScript strict mode

4. **Performance**
   - Add indexes for frequently queried fields
   - Use `select` to limit returned fields
   - Paginate large result sets
   - Monitor query performance

5. **Migrations**
   - Review generated migrations
   - Test in staging first
   - Never edit applied migrations
   - Keep migrations small and focused

## Common Patterns

### Pagination

```typescript
import { db } from "@repo/database";
import { content } from "@repo/database/schema";
import { eq, desc } from "drizzle-orm";

export async function getPaginatedContent(orgId: string, page: number = 1, perPage: number = 20) {
  const offset = (page - 1) * perPage;

  const [items, [{ count }]] = await Promise.all([
    db.query.content.findMany({
      where: eq(content.OrganizationId, orgId),
      limit: perPage,
      offset,
      orderBy: desc(content.createdAt),
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(content)
      .where(eq(content.OrganizationId, orgId)),
  ]);

  return {
    items,
    meta: {
      page,
      perPage,
      total: count,
      pages: Math.ceil(count / perPage),
    },
  };
}
```

### Soft Deletes

```typescript
import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

export const content = pgTable("content", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ... other fields
  deletedAt: timestamp("deleted_at"),
  isDeleted: boolean("is_deleted").default(false),
});

// Query helper to exclude deleted
export function withoutDeleted<T>(query: T) {
  return query.where(eq(content.isDeleted, false));
}
```

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Drizzle with Supabase](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [PostgreSQL Column Types](https://orm.drizzle.team/docs/column-types/pg)

## Related ADRs

- [ADR-001: Monorepo with Turborepo](001-monorepo-turborepo.md) - Database package in monorepo
- [ADR-003: Next.js 16 as Framework](003-nextjs-framework.md) - Drizzle in Server Components
- [ADR-007: Multi-tenant Data Model](007-multi-tenant-model.md) - Organization-scoped queries

## Notes

Drizzle ORM's TypeScript-first approach and excellent performance make it the ideal choice for our Next.js monorepo. The learning curve is minimal for developers familiar with SQL, and the type safety catches errors at compile time rather than runtime.

While newer than Prisma, Drizzle's architecture is more aligned with modern TypeScript practices and serverless deployment patterns. The ability to work seamlessly in edge runtimes and with serverless databases like Neon makes it future-proof for our stack.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: Backend Lead, Database Administrator, Engineering Team
**Last Updated**: 2025-11-24
