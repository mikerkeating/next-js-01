# ADR-007: Multi-tenant Data Model

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to design a multi-tenant data model that supports our SaaS platform with multiple organizations, each with their own users, content, and analytics. The data model must ensure complete data isolation between tenants, support flexible role-based access control, scale efficiently, and integrate seamlessly with our authentication provider (Clerk) and ORM (Drizzle).

### Key Requirements

1. **Data Isolation**: Complete separation of tenant data at the database level
2. **Flexible Roles**: Support for 4 distinct user roles (Internal, Product-Seller, Agency-Seller, Client)
3. **Organization Hierarchy**: Users can belong to multiple organizations with different roles
4. **Performance**: Efficient queries with proper indexing and partitioning strategies
5. **Security**: Row-Level Security (RLS) policies to enforce tenant isolation
6. **Clerk Integration**: Sync user and organization data from Clerk webhooks
7. **Audit Trail**: Track who created/updated resources and when
8. **Soft Deletes**: Support data recovery and GDPR compliance
9. **Scalability**: Handle growth from 10 to 10,000+ organizations
10. **Type Safety**: Full TypeScript type inference with Drizzle ORM

### Constraints

- Must work with PostgreSQL 16+
- Must integrate with Clerk's organization model
- Must support Drizzle ORM type inference
- Database queries must filter by organization_id by default
- RLS policies must be enforced at the database level
- Must support GDPR right to deletion with 30-day grace period

## Decision

We will implement a **shared database with discriminator column** multi-tenancy pattern using `organisation_id` as the tenant discriminator, enforced through Row-Level Security (RLS) policies and application-level middleware.

### Data Model Architecture

**Core Entities**:

```
users ← user_organisations → organisations
  ↓                              ↓
  └─────────── content ──────────┘
  └───────── analytics_events ───┘
```

**Tenancy Strategy**:

- All tenant-scoped tables include `organisation_id` foreign key
- RLS policies enforce organization context on every query
- Middleware injects organization context from Clerk session
- Soft deletes with `deleted_at` timestamp for data recovery

### Database Schema

#### Core Tables

**users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

**organisations**

```sql
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_organisations_clerk_org_id ON organisations(clerk_org_id);
CREATE INDEX idx_organisations_slug ON organisations(slug);
CREATE INDEX idx_organisations_deleted_at ON organisations(deleted_at) WHERE deleted_at IS NULL;
```

**user_organisations** (Junction Table)

```sql
CREATE TYPE user_role AS ENUM ('internal', 'product-seller', 'agency-seller', 'client');

CREATE TABLE user_organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  UNIQUE(user_id, organisation_id)
);

CREATE INDEX idx_user_organisations_user_id ON user_organisations(user_id);
CREATE INDEX idx_user_organisations_organisation_id ON user_organisations(organisation_id);
CREATE INDEX idx_user_organisations_role ON user_organisations(role);
```

**content** (Tenant-Scoped)

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP,

  UNIQUE(organisation_id, slug)
);

CREATE INDEX idx_content_organisation_id ON content(organisation_id);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_slug ON content(organisation_id, slug);
CREATE INDEX idx_content_created_by ON content(created_by);
CREATE INDEX idx_content_deleted_at ON content(deleted_at) WHERE deleted_at IS NULL;
```

**analytics_events** (Tenant-Scoped)

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_organisation_id ON analytics_events(organisation_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Partition by month for better query performance
CREATE TABLE analytics_events_y2025m11 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

### Drizzle Schema Definition

**packages/database/src/schema/users.ts**

```typescript
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clerkIdIdx: index("idx_users_clerk_id").on(table.clerkId),
    emailIdx: index("idx_users_email").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**packages/database/src/schema/organisations.ts**

```typescript
import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const organisations = pgTable(
  "organisations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    settings: jsonb("settings")
      .$type<{
        theme?: string;
        features?: string[];
        billing?: Record<string, unknown>;
      }>()
      .default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clerkOrgIdIdx: index("idx_organisations_clerk_org_id").on(table.clerkOrgId),
    slugIdx: index("idx_organisations_slug").on(table.slug),
  })
);

export type Organisation = typeof organisations.$inferSelect;
export type NewOrganisation = typeof organisations.$inferInsert;
```

**packages/database/src/schema/user-organisations.ts**

```typescript
import { pgTable, uuid, timestamp, pgEnum, index, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organisations } from "./organisations";

export const userRoleEnum = pgEnum("user_role", [
  "internal",
  "product-seller",
  "agency-seller",
  "client",
]);

export const userOrganisations = pgTable(
  "user_organisations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull().default("client"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_user_organisations_user_id").on(table.userId),
    organisationIdIdx: index("idx_user_organisations_organisation_id").on(table.organisationId),
    roleIdx: index("idx_user_organisations_role").on(table.role),
    userOrgUnique: unique("user_organisations_user_id_organisation_id_unique").on(
      table.userId,
      table.organisationId
    ),
  })
);

export type UserOrganisation = typeof userOrganisations.$inferSelect;
export type NewUserOrganisation = typeof userOrganisations.$inferInsert;
```

**packages/database/src/schema/content.ts**

```typescript
import { pgTable, uuid, text, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";

export const content = pgTable(
  "content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().default({}),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    organisationIdIdx: index("idx_content_organisation_id").on(table.organisationId),
    typeIdx: index("idx_content_type").on(table.type),
    slugIdx: index("idx_content_slug").on(table.organisationId, table.slug),
    createdByIdx: index("idx_content_created_by").on(table.createdBy),
    orgSlugUnique: unique("content_organisation_id_slug_unique").on(
      table.organisationId,
      table.slug
    ),
  })
);

export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
```

### Row-Level Security (RLS) Policies

**Enable RLS on Tenant-Scoped Tables**

```sql
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Set default to deny all access
ALTER TABLE content FORCE ROW LEVEL SECURITY;
ALTER TABLE analytics_events FORCE ROW LEVEL SECURITY;
```

**RLS Policy for Content**

```sql
-- Policy for organization isolation
CREATE POLICY org_isolation_content ON content
  USING (
    organisation_id = current_setting('app.current_org_id', true)::uuid
  )
  WITH CHECK (
    organisation_id = current_setting('app.current_org_id', true)::uuid
  );

-- Policy for soft deletes (exclude deleted content)
CREATE POLICY soft_delete_content ON content
  USING (deleted_at IS NULL);
```

**RLS Policy for Analytics Events**

```sql
CREATE POLICY org_isolation_analytics_events ON analytics_events
  USING (
    organisation_id = current_setting('app.current_org_id', true)::uuid
  )
  WITH CHECK (
    organisation_id = current_setting('app.current_org_id', true)::uuid
  );
```

### Organization Context Middleware

**packages/middleware/src/org-context.ts**

```typescript
import { auth } from "@clerk/nextjs/server";
import { db } from "@repo/database";
import { sql } from "drizzle-orm";

export async function withOrgContext<T>(callback: () => Promise<T>): Promise<T> {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No organization context");
  }

  // Set PostgreSQL session variable for RLS
  await db.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);

  try {
    return await callback();
  } finally {
    // Reset session variable
    await db.execute(sql`RESET app.current_org_id`);
  }
}
```

### Query Patterns

**Basic Queries with Organization Context**

```typescript
import { db } from "@repo/database";
import { content } from "@repo/database/schema";
import { withOrgContext } from "@repo/middleware";
import { eq } from "drizzle-orm";

// All queries automatically filtered by organisation_id via RLS
export async function getContent(id: string) {
  return withOrgContext(async () => {
    return db.query.content.findFirst({
      where: eq(content.id, id),
      with: {
        createdBy: true,
      },
    });
  });
}

export async function listContent() {
  return withOrgContext(async () => {
    return db.query.content.findMany({
      where: eq(content.deletedAt, null), // Exclude soft deletes
      orderBy: (content, { desc }) => [desc(content.createdAt)],
    });
  });
}
```

**Multi-Organization Queries (Internal Users Only)**

```typescript
import { db } from "@repo/database";
import { content, userOrganisations } from "@repo/database/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function listContentAcrossOrgs() {
  const { userId } = auth();

  // Get user's role
  const userRole = await db.query.userOrganisations.findFirst({
    where: eq(userOrganisations.userId, userId),
  });

  if (userRole?.role !== "internal") {
    throw new Error("Unauthorized: Internal access only");
  }

  // Bypass RLS by disabling it for this query (use with caution)
  return db.execute(sql`
    SET LOCAL row_security = off;
    SELECT * FROM content WHERE deleted_at IS NULL;
    SET LOCAL row_security = on;
  `);
}
```

**Permission Checks**

```typescript
import { db } from "@repo/database";
import { userOrganisations } from "@repo/database/schema";
import { and, eq } from "drizzle-orm";

export async function checkPermission(
  userId: string,
  orgId: string,
  requiredRole: "internal" | "product-seller" | "agency-seller" | "client"
) {
  const membership = await db.query.userOrganisations.findFirst({
    where: and(eq(userOrganisations.userId, userId), eq(userOrganisations.organisationId, orgId)),
  });

  if (!membership) {
    return false;
  }

  const roleHierarchy = {
    internal: 4,
    "product-seller": 3,
    "agency-seller": 2,
    client: 1,
  };

  return roleHierarchy[membership.role] >= roleHierarchy[requiredRole];
}
```

## Rationale

### Why Shared Database with Discriminator Column?

1. **Operational Simplicity**
   - Single database to manage, backup, and monitor
   - Unified schema migrations across all tenants
   - Simpler connection pooling and caching strategies
   - Lower infrastructure costs compared to database-per-tenant

2. **Performance at Scale**
   - Efficient joins between tenant data and global data
   - Better resource utilization with shared connection pools
   - Horizontal scaling through read replicas
   - Query optimization benefits from unified statistics

3. **Development Velocity**
   - Single codebase without tenant-specific logic
   - Easier testing with shared test database
   - Simplified local development environment
   - Type-safe queries with Drizzle ORM

4. **Cost Efficiency**
   - Single database instance serves all tenants
   - No per-tenant database provisioning overhead
   - Shared resources (connections, memory, CPU)
   - PostgreSQL handles thousands of organizations efficiently

5. **Row-Level Security Benefits**
   - Database-enforced tenant isolation
   - Impossible to accidentally query wrong tenant's data
   - Performance-optimized with proper indexing
   - Transparent to application code

6. **Flexible Data Model**
   - Easy to add global tables (e.g., feature flags)
   - Support for cross-tenant analytics (internal users)
   - JSONB fields for tenant-specific customization
   - Audit trails across all tenants

7. **Clerk Integration**
   - Natural mapping: Clerk organizations → database organizations
   - Webhook sync keeps data in sync
   - User can belong to multiple organizations
   - Organization context from JWT token

8. **Compliance & Security**
   - GDPR right to deletion: soft delete with grace period
   - Audit trail: created_by, updated_by, timestamps
   - Data isolation enforced at database level
   - Encryption at rest and in transit

9. **Scalability Path**
   - Start with single database
   - Add read replicas as traffic grows
   - Partition large tables (analytics_events) by month
   - Future option: shard by organisation_id if needed

10. **Developer Experience**
    - Type-safe queries with full IntelliSense
    - Automatic organization filtering via RLS
    - Clear mental model: one database, filtered queries
    - Easy to reason about and debug

### Alternatives Considered

#### Option 1: Separate Database Per Tenant

**Pros:**

- Maximum isolation between tenants
- Independent scaling per tenant
- Easier to migrate specific tenants
- Custom schema per tenant possible

**Cons:**

- ❌ Massive operational overhead (1000s of databases)
- ❌ Complex connection pooling
- ❌ Difficult cross-tenant analytics
- ❌ Migration management nightmare
- ❌ Higher infrastructure costs
- ❌ Slower development iteration
- ❌ Complex backup and monitoring

**Decision**: Rejected - Operational complexity outweighs isolation benefits for our scale.

#### Option 2: Separate Schema Per Tenant

**Pros:**

- Good isolation within single database
- Easier than separate databases
- Standard PostgreSQL feature

**Cons:**

- ❌ Still complex with many tenants
- ❌ PostgreSQL performance degrades with 1000s of schemas
- ❌ Migration management complexity
- ❌ Connection management per schema
- ❌ Cross-tenant queries difficult
- ❌ Poor developer experience

**Decision**: Rejected - Middle ground that doesn't justify the complexity.

#### Option 3: No Explicit Multi-Tenancy (Application-Level Only)

**Pros:**

- Simple application code
- No database-level policies
- Easy to implement initially

**Cons:**

- ❌ No database-level isolation guarantee
- ❌ Easy to accidentally leak tenant data
- ❌ Security vulnerability if middleware fails
- ❌ No defense-in-depth
- ❌ Difficult to audit access
- ❌ Fails secure-by-default principle

**Decision**: Rejected - Unacceptable security risk for multi-tenant SaaS.

#### Option 4: MongoDB with Document Embedding

**Pros:**

- Flexible schema per tenant
- Natural document isolation
- Good for hierarchical data

**Cons:**

- ❌ Requires abandoning PostgreSQL (rejected in ADR-005)
- ❌ No strong consistency guarantees
- ❌ Limited query capabilities vs. SQL
- ❌ Poor support for relational data
- ❌ Team lacks MongoDB expertise
- ❌ Breaks compatibility with Drizzle

**Decision**: Rejected - Inconsistent with database and ORM choices.

#### Option 5: Hybrid (Shared + Dedicated Databases)

**Pros:**

- Flexibility for special cases
- Can isolate large tenants
- Good for tiered pricing

**Cons:**

- ❌ Complex application logic
- ❌ Two deployment paths to maintain
- ❌ Inconsistent query patterns
- ❌ Premature optimization
- ❌ Difficult to migrate tenants between tiers
- ❌ Over-engineering for current scale

**Decision**: Rejected - Unnecessary complexity for MVP. Can revisit if needed at scale.

## Consequences

### Positive

1. **Strong Isolation**: RLS policies prevent tenant data leakage at database level
2. **Simple Operations**: Single database simplifies backups, monitoring, and maintenance
3. **Type Safety**: Full TypeScript inference with Drizzle schema
4. **Development Speed**: Unified schema accelerates feature development
5. **Cost Efficiency**: Shared resources reduce infrastructure costs
6. **Clerk Integration**: Natural mapping to Clerk's organization model
7. **Compliance Ready**: Soft deletes and audit trails support GDPR
8. **Performance**: Proper indexing ensures fast queries even at scale
9. **Flexibility**: JSONB fields allow tenant-specific customization
10. **Scalability**: Can handle 10,000+ organizations on single database

### Negative

1. **Shared Resources**: Noisy neighbor problem if one tenant has high load
2. **Migration Complexity**: Schema changes affect all tenants simultaneously
3. **Limited Customization**: Cannot easily customize schema per tenant
4. **RLS Overhead**: Small query performance overhead from RLS policies
5. **Backup Granularity**: Cannot restore individual tenant without full restore
6. **Testing Complexity**: Must carefully test organization context in all queries

### Mitigation Strategies

1. **Noisy Neighbor Mitigation**:
   - Monitor query performance per organization
   - Set statement timeout limits (5s for web, 30s for background)
   - Implement rate limiting per organization
   - Add read replicas for high-traffic organizations
   - Use connection pooling (PgBouncer) to manage connections

2. **Migration Safety**:
   - Test migrations on staging with production-like data
   - Use Drizzle Kit's migration preview
   - Implement gradual rollout with feature flags
   - Maintain backwards compatibility for 1 sprint
   - Schedule migrations during low-traffic windows

3. **RLS Performance**:
   - Create compound indexes including `organisation_id`
   - Monitor query plans with EXPLAIN ANALYZE
   - Cache organization context in request lifecycle
   - Use materialized views for complex cross-tenant analytics
   - Consider disabling RLS for internal admin queries

4. **Backup Strategy**:
   - Daily full backups via Neon/Supabase
   - Point-in-time recovery (7 days)
   - Export tenant data on-demand for portability
   - Test restore procedures monthly
   - Document recovery procedures

5. **Testing Best Practices**:
   - Use separate test database per developer
   - Factory functions that auto-create organization context
   - Integration tests with multiple tenants
   - RLS policy tests to verify isolation
   - Load testing with realistic multi-tenant scenarios

## Implementation Plan

### Phase 1: Foundation (Week 1)

- [x] Define Drizzle schema for core tables (users, organisations, user_organisations)
- [ ] Create initial migration files with Drizzle Kit
- [ ] Set up RLS policies on tenant-scoped tables
- [ ] Implement organization context middleware
- [ ] Create base query utilities with org context
- [ ] Write unit tests for RLS policies

### Phase 2: Clerk Integration (Week 1-2)

- [ ] Implement Clerk webhook handlers (user.created, organization.created)
- [ ] Sync user and organization data to database
- [ ] Handle organization membership events
- [ ] Add role assignment logic
- [ ] Test webhook retry and failure handling
- [ ] Document webhook setup process

### Phase 3: Application Integration (Week 2)

- [ ] Create content table with organization context
- [ ] Implement CRUD operations with RLS
- [ ] Add soft delete functionality
- [ ] Create permission checking utilities
- [ ] Build organization switcher UI component
- [ ] Test multi-organization user flows

### Phase 4: Analytics & Monitoring (Week 3)

- [ ] Create analytics_events table with partitioning
- [ ] Set up RLS policies for analytics
- [ ] Implement event tracking utilities
- [ ] Create analytics dashboard queries
- [ ] Add monitoring for RLS policy violations
- [ ] Document query patterns

### Phase 5: Testing & Optimization (Week 3-4)

- [ ] Write integration tests for all tenant-scoped queries
- [ ] Load test with 1000+ organizations
- [ ] Optimize indexes based on query patterns
- [ ] Test soft delete and recovery flows
- [ ] Verify GDPR compliance (export, delete)
- [ ] Performance benchmark and tune

### Phase 6: Documentation & Training (Week 4)

- [ ] Document multi-tenant architecture
- [ ] Create developer guide for adding new tables
- [ ] Write troubleshooting guide for RLS issues
- [ ] Conduct team training on multi-tenant patterns
- [ ] Create example code for common scenarios
- [ ] Update onboarding documentation

## Validation

### Success Metrics

- [ ] 100% of tenant-scoped tables have RLS policies enabled
- [ ] Zero cross-tenant data leakage in security audit
- [ ] Query performance < 100ms for single-org queries
- [ ] Support 1000+ organizations on single database
- [ ] Clerk webhook sync completes in < 1 second
- [ ] All integration tests pass with multi-tenant scenarios
- [ ] GDPR data export completes in < 5 minutes

### Testing Checklist

1. **Isolation Testing**:
   - [ ] User A cannot query User B's organization data
   - [ ] RLS policies block unauthorized access attempts
   - [ ] Organization context correctly set in middleware
   - [ ] Soft deletes are excluded from queries

2. **Clerk Integration**:
   - [ ] User creation webhook syncs to database
   - [ ] Organization creation webhook syncs to database
   - [ ] Membership changes update user_organisations table
   - [ ] Role assignments work correctly

3. **Query Patterns**:
   - [ ] Basic CRUD operations respect organization context
   - [ ] List queries filter by organization
   - [ ] Related data (joins) respects organization boundaries
   - [ ] Cross-organization queries work for internal users only

4. **Performance**:
   - [ ] Queries use proper indexes (check EXPLAIN ANALYZE)
   - [ ] No N+1 query problems
   - [ ] Connection pooling works efficiently
   - [ ] Analytics queries perform well with partitioning

5. **Compliance**:
   - [ ] Soft delete marks records as deleted
   - [ ] Hard delete purges data after grace period
   - [ ] Data export includes all user/org data
   - [ ] Audit trail captures all modifications

## Best Practices

### When Adding New Tables

1. **Determine Scope**: Is this table global or tenant-scoped?
2. **Add Discriminator**: If tenant-scoped, add `organisation_id` column
3. **Enable RLS**: Create RLS policy for organization isolation
4. **Add Indexes**: Compound index on `(organisation_id, <lookup_field>)`
5. **Soft Deletes**: Add `deleted_at` timestamp if data needs recovery
6. **Audit Trail**: Add `created_by`, `updated_by`, `created_at`, `updated_at`

### Example: Adding a New Tenant-Scoped Table

```typescript
// packages/database/src/schema/projects.ts
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    organisationIdIdx: index("idx_projects_organisation_id").on(table.organisationId),
    nameIdx: index("idx_projects_name").on(table.organisationId, table.name),
  })
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

```sql
-- Migration: Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_projects ON projects
  USING (organisation_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (organisation_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY soft_delete_projects ON projects
  USING (deleted_at IS NULL);
```

### Query Guidelines

1. **Always Use Organization Context**: Wrap queries in `withOrgContext()`
2. **Exclude Soft Deletes**: Filter `deleted_at IS NULL` in queries
3. **Check Permissions**: Verify user role before sensitive operations
4. **Use Type-Safe Queries**: Leverage Drizzle's type inference
5. **Handle Errors**: Catch and log RLS policy violations

### Security Guidelines

1. **Never Bypass RLS**: Except for internal admin operations with explicit checks
2. **Validate Org Context**: Always verify organization ID from Clerk session
3. **Audit Critical Operations**: Log all data modifications with user context
4. **Test Isolation**: Write tests that attempt cross-tenant access
5. **Monitor Violations**: Alert on RLS policy denial logs

## Common Patterns

### Soft Delete Implementation

```typescript
import { db } from "@repo/database";
import { content } from "@repo/database/schema";
import { withOrgContext } from "@repo/middleware";
import { eq } from "drizzle-orm";

export async function softDeleteContent(id: string) {
  return withOrgContext(async () => {
    return db.update(content).set({ deletedAt: new Date() }).where(eq(content.id, id)).returning();
  });
}

export async function restoreContent(id: string) {
  return withOrgContext(async () => {
    return db.update(content).set({ deletedAt: null }).where(eq(content.id, id)).returning();
  });
}

export async function hardDeleteContent(id: string) {
  return withOrgContext(async () => {
    // Only delete if soft deleted > 30 days ago
    return db
      .delete(content)
      .where(
        and(
          eq(content.id, id),
          lt(content.deletedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
      );
  });
}
```

### Role-Based Access Control

```typescript
import { checkPermission } from "@repo/middleware";
import { auth } from "@clerk/nextjs/server";

export async function updateContent(id: string, data: UpdateContentInput) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if user has product-seller or higher role
  const hasPermission = await checkPermission(userId, orgId, "product-seller");

  if (!hasPermission) {
    throw new Error("Insufficient permissions");
  }

  return withOrgContext(async () => {
    return db
      .update(content)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(content.id, id))
      .returning();
  });
}
```

### Pagination with Organization Context

```typescript
import { db } from "@repo/database";
import { content } from "@repo/database/schema";
import { withOrgContext } from "@repo/middleware";
import { desc, eq } from "drizzle-orm";

export async function paginateContent(page = 1, pageSize = 20) {
  return withOrgContext(async () => {
    const offset = (page - 1) * pageSize;

    const [items, [{ count }]] = await Promise.all([
      db.query.content.findMany({
        where: eq(content.deletedAt, null),
        orderBy: [desc(content.createdAt)],
        limit: pageSize,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(content)
        .where(eq(content.deletedAt, null)),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  });
}
```

## References

- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Clerk Organizations](https://clerk.com/docs/organizations/overview)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [GDPR Compliance](https://gdpr.eu/)
- [PostgreSQL Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)

## Related ADRs

- [ADR-005: Drizzle as ORM](005-drizzle-orm.md) - ORM used for type-safe queries
- [ADR-006: Clerk for Authentication](006-clerk-authentication.md) - Authentication and organization management
- [ADR-004: Vercel as Hosting Platform](004-vercel-hosting.md) - Hosting infrastructure

## Notes

The shared database with RLS approach provides the best balance of operational simplicity, security, and developer experience for our multi-tenant SaaS platform. By enforcing tenant isolation at the database level through Row-Level Security policies, we create a defense-in-depth security model that prevents accidental data leakage even if application code has bugs.

The integration with Clerk's organization model is natural and seamless, with webhook handlers keeping our database synchronized. The use of Drizzle ORM provides full type safety while the RLS policies work transparently in the background.

This architecture supports our growth from MVP to thousands of organizations while maintaining simplicity and security. If we eventually need to scale beyond a single database, we have clear paths forward: read replicas, table partitioning, or tenant sharding.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: Backend Lead, Security Lead, Database Architect
**Last Updated**: 2025-11-24
