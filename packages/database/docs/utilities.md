# Utilities Guide

This guide covers the utility functions for consistent database patterns: ID generation, timestamps, soft delete, and organization context.

## Table of Contents

- [ID Generation](#id-generation)
- [Timestamps](#timestamps)
- [Soft Delete](#soft-delete)
- [Organization Context](#organization-context)
- [Combining Utilities](#combining-utilities)

## ID Generation

Generate collision-resistant, URL-safe identifiers using cuid2.

### createId()

Generates a unique 24-character lowercase alphanumeric string:

```typescript
import { createId } from "@repo/database";

const userId = createId();
// e.g., "clh3am1x70000qw39ugwx0abc"
```

### Properties

- **Collision-resistant**: < 0.001% collision probability
- **URL-safe**: Lowercase alphanumeric only
- **Sortable**: Contains timestamp prefix for chronological ordering
- **Compact**: 24 characters (shorter than UUID's 36)

### Usage in Schema

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@repo/database";

const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull(),
});
```

### isValidId()

Validate user-provided IDs before database lookups:

```typescript
import { isValidId } from "@repo/database";

const userInput = req.params.id;

if (!isValidId(userInput)) {
  return res.status(400).json({ error: "Invalid ID format" });
}

// Safe to use in query
const user = await db.query.users.findFirst({
  where: eq(users.id, userInput),
});
```

### ID Constants

```typescript
import { ID_LENGTH, ID_PATTERN } from "@repo/database";

ID_LENGTH; // 24
ID_PATTERN; // /^[a-z0-9]{24}$/
```

### CuidId Type

Type alias for better type safety:

```typescript
import type { CuidId } from "@repo/database";

function getUser(id: CuidId): Promise<User | null> {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}
```

## Timestamps

Add consistent `createdAt` and `updatedAt` columns to your tables.

### timestamps()

Spreads both timestamp columns into your table definition:

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "@repo/database";

const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ...timestamps(), // Adds createdAt and updatedAt
});
```

### Column Configuration

| Column      | Database Name | Type      | Default | Nullable |
| ----------- | ------------- | --------- | ------- | -------- |
| `createdAt` | `created_at`  | TIMESTAMP | `now()` | No       |
| `updatedAt` | `updated_at`  | TIMESTAMP | `now()` | No       |

### Individual Columns

Use `createdAt()` or `updatedAt()` separately if needed:

```typescript
import { createdAt } from "@repo/database";

const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  timestamp: createdAt(), // Just createdAt, no updatedAt
});
```

### Updating Timestamps

Set `updatedAt` manually when modifying records:

```typescript
import { eq } from "drizzle-orm";

await db
  .update(posts)
  .set({
    title: "New Title",
    updatedAt: new Date(), // Update the timestamp
  })
  .where(eq(posts.id, postId));
```

### Constants and Types

```typescript
import { TIMESTAMP_COLUMNS, type TimestampColumnName, type TimestampColumns } from "@repo/database";

TIMESTAMP_COLUMNS; // ['createdAt', 'updatedAt']
```

## Soft Delete

Implement soft delete pattern using a nullable `deletedAt` timestamp.

### softDelete()

Add the `deletedAt` column to your table:

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";
import { softDelete } from "@repo/database";

const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  ...softDelete(), // Adds deletedAt column
});
```

### Column Configuration

| Column      | Database Name | Type      | Default | Nullable |
| ----------- | ------------- | --------- | ------- | -------- |
| `deletedAt` | `deleted_at`  | TIMESTAMP | None    | Yes      |

### Query Helpers

#### isNotDeleted()

Filter active (non-deleted) records:

```typescript
import { isNotDeleted } from "@repo/database";

// Get all active posts
const activePosts = await db.select().from(posts).where(isNotDeleted(posts));

// Combined with other conditions
import { and, eq } from "drizzle-orm";

const activeUserPosts = await db
  .select()
  .from(posts)
  .where(and(isNotDeleted(posts), eq(posts.userId, userId)));
```

#### isDeleted()

Filter deleted records (for trash/recycle bin):

```typescript
import { isDeleted } from "@repo/database";

// Get all deleted posts
const trashedPosts = await db.select().from(posts).where(isDeleted(posts));

// Get posts deleted more than 30 days ago
import { and, lt } from "drizzle-orm";

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

const oldDeletedPosts = await db
  .select()
  .from(posts)
  .where(and(isDeleted(posts), lt(posts.deletedAt, thirtyDaysAgo)));
```

### Update Helpers

#### markAsDeleted()

Soft delete a record:

```typescript
import { markAsDeleted } from "@repo/database";
import { eq } from "drizzle-orm";

// Soft delete a post
await db.update(posts).set(markAsDeleted()).where(eq(posts.id, postId));

// With specific timestamp
await db
  .update(posts)
  .set(markAsDeleted(new Date("2024-01-15")))
  .where(eq(posts.id, postId));

// With additional updates
await db
  .update(posts)
  .set({
    ...markAsDeleted(),
    updatedAt: new Date(),
  })
  .where(eq(posts.id, postId));
```

#### markAsRestored()

Restore a soft-deleted record:

```typescript
import { markAsRestored } from "@repo/database";
import { eq } from "drizzle-orm";

// Restore a deleted post
await db.update(posts).set(markAsRestored()).where(eq(posts.id, postId));

// With additional updates
await db
  .update(posts)
  .set({
    ...markAsRestored(),
    updatedAt: new Date(),
  })
  .where(eq(posts.id, postId));
```

### Constants and Types

```typescript
import {
  SOFT_DELETE_COLUMN,
  type SoftDeleteColumnName,
  type SoftDeletable,
  type SoftDeleteColumns,
} from "@repo/database";

SOFT_DELETE_COLUMN; // 'deletedAt'
```

## Organization Context

Utilities for multi-tenant data isolation using organization IDs.

### organizationId() / orgId()

Add organization column to your table:

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";
import { organizationId, orgId } from "@repo/database";

// Full name (recommended)
const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  organizationId: organizationId(), // organization_id in DB
  title: text("title").notNull(),
});

// Short name
const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  orgId: orgId(), // org_id in DB
  content: text("content").notNull(),
});
```

### Column Configuration

| Column           | Database Name     | Type | Nullable |
| ---------------- | ----------------- | ---- | -------- |
| `organizationId` | `organization_id` | UUID | No       |
| `orgId`          | `org_id`          | UUID | No       |

### withOrgFilter()

Filter queries by organization:

```typescript
import { withOrgFilter } from "@repo/database";

// Get all posts for an organization
const orgPosts = await db.select().from(posts).where(withOrgFilter(posts, currentOrgId));

// Combined with other conditions
import { and } from "drizzle-orm";

const activeOrgPosts = await db
  .select()
  .from(posts)
  .where(and(withOrgFilter(posts, currentOrgId), isNotDeleted(posts)));

// In join queries
const userPosts = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId))
  .where(withOrgFilter(posts, currentOrgId));
```

### withoutOrgChange()

Prevent accidental organization changes in updates:

```typescript
import { withoutOrgChange } from "@repo/database";
import { eq } from "drizzle-orm";

// This strips organizationId from the update data
await db
  .update(posts)
  .set(
    withoutOrgChange({
      title: "New Title",
      organizationId: "hacker-org-id", // This is removed!
    })
  )
  .where(eq(posts.id, postId));
```

### Constants and Types

```typescript
import {
  ORG_COLUMN_NAMES,
  type OrgColumnName,
  type OrgScopedTable,
  type OrganizationId,
} from "@repo/database";

ORG_COLUMN_NAMES; // ['organizationId', 'orgId']
```

## Combining Utilities

### Complete Table Example

```typescript
import { pgTable, text } from "drizzle-orm/pg-core";
import { createId, timestamps, softDelete, organizationId } from "@repo/database";

const posts = pgTable("posts", {
  // Primary key with auto-generated ID
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Multi-tenant organization scoping
  organizationId: organizationId(),

  // Business fields
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id").notNull(),

  // Automatic timestamps
  ...timestamps(),

  // Soft delete support
  ...softDelete(),
});

// Export types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### Complete Query Example

```typescript
import { db, withOrgFilter, isNotDeleted, isValidId } from "@repo/database";
import { and, eq, desc } from "drizzle-orm";

async function getOrgPosts(orgId: string, options?: { includeDeleted?: boolean }): Promise<Post[]> {
  const conditions = [withOrgFilter(posts, orgId)];

  if (!options?.includeDeleted) {
    conditions.push(isNotDeleted(posts));
  }

  return db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt));
}

async function getPost(id: string, orgId: string): Promise<Post | null> {
  if (!isValidId(id)) {
    throw new Error("Invalid post ID");
  }

  const results = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), withOrgFilter(posts, orgId), isNotDeleted(posts)))
    .limit(1);

  return results[0] ?? null;
}
```

### Complete Insert Example

```typescript
import { db, createId } from "@repo/database";

async function createPost(data: {
  orgId: string;
  title: string;
  content?: string;
  authorId: string;
}): Promise<Post> {
  const [post] = await db
    .insert(posts)
    .values({
      id: createId(), // Or let $defaultFn handle it
      organizationId: data.orgId,
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      // createdAt and updatedAt are auto-set
      // deletedAt defaults to null
    })
    .returning();

  return post;
}
```

### Complete Update Example

```typescript
import { db, withoutOrgChange, markAsDeleted } from "@repo/database";
import { eq, and } from "drizzle-orm";

async function updatePost(
  id: string,
  orgId: string,
  data: Partial<Pick<Post, "title" | "content">>
): Promise<Post> {
  const [updated] = await db
    .update(posts)
    .set(
      withoutOrgChange({
        ...data,
        updatedAt: new Date(),
      })
    )
    .where(and(eq(posts.id, id), withOrgFilter(posts, orgId)))
    .returning();

  return updated;
}

async function deletePost(id: string, orgId: string): Promise<void> {
  await db
    .update(posts)
    .set({
      ...markAsDeleted(),
      updatedAt: new Date(),
    })
    .where(and(eq(posts.id, id), withOrgFilter(posts, orgId)));
}
```

## Related Documentation

- [README](../README.md) - Package overview
- [Connections Guide](./connections.md) - Database setup
- [Migrations Guide](./migrations.md) - Schema changes
- [Seeding Guide](./seeding.md) - Test data generation
