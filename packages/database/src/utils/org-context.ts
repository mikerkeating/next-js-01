/**
 * Organization Context Utilities
 *
 * Provides column definitions and query helpers for multi-tenant data isolation.
 * These utilities support organization-scoped queries to ensure data is properly
 * filtered by organization ID, preventing cross-tenant data access.
 *
 * Supports two column naming conventions:
 * - `organizationId` / `organization_id` (full name, recommended for clarity)
 * - `orgId` / `org_id` (short name, for brevity)
 *
 * @example
 * ```typescript
 * import { organizationId, withOrgFilter } from '@repo/database';
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 *
 * // Add organization scope to your schema
 * const content = pgTable("content", {
 *   id: text("id").primaryKey(),
 *   title: text("title"),
 *   organizationId: organizationId(), // Adds organization_id column
 * });
 *
 * // Query with organization filter
 * const orgContent = await db.select()
 *   .from(content)
 *   .where(withOrgFilter(content, currentOrgId));
 * ```
 *
 * @packageDocumentation
 */

import { eq, type Column, type SQL } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

/**
 * Supported column names for organization ID
 */
export const ORG_COLUMN_NAMES = ["organizationId", "orgId"] as const;

/**
 * Type for organization column names
 */
export type OrgColumnName = (typeof ORG_COLUMN_NAMES)[number];

/**
 * Interface for tables with organizationId column.
 * Uses generic Column type for forward compatibility with drizzle-orm versions.
 */
interface HasOrganizationId {
  organizationId: Column;
}

/**
 * Interface for tables with orgId column.
 * Uses generic Column type for forward compatibility with drizzle-orm versions.
 */
interface HasOrgId {
  orgId: Column;
}

/**
 * Type for tables that are organization-scoped.
 * Tables must have either organizationId or orgId column.
 */
export type OrgScopedTable = HasOrganizationId | HasOrgId;

/**
 * Type guard to check if table has organizationId column
 */
function hasOrganizationId(table: OrgScopedTable): table is HasOrganizationId {
  return "organizationId" in table;
}

/**
 * Type guard to check if table has orgId column
 */
function hasOrgId(table: OrgScopedTable): table is HasOrgId {
  return "orgId" in table;
}

/**
 * Creates an organizationId column for multi-tenant tables.
 *
 * Configuration:
 * - Column name: "organization_id" (snake_case in database)
 * - Type: PostgreSQL UUID
 * - Nullable: false (every record must belong to an organization)
 * - No default value (must be explicitly set)
 *
 * @returns A Drizzle UUID column definition
 *
 * @example
 * ```typescript
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey(),
 *   organizationId: organizationId(),
 *   title: text("title"),
 * });
 * ```
 */
export function organizationId() {
  return uuid("organization_id").notNull();
}

/**
 * Creates an orgId column (short form) for multi-tenant tables.
 *
 * Configuration:
 * - Column name: "org_id" (snake_case in database)
 * - Type: PostgreSQL UUID
 * - Nullable: false (every record must belong to an organization)
 * - No default value (must be explicitly set)
 *
 * Use this when you prefer shorter column names.
 *
 * @returns A Drizzle UUID column definition
 *
 * @example
 * ```typescript
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey(),
 *   orgId: orgId(),
 *   title: text("title"),
 * });
 * ```
 */
export function orgId() {
  return uuid("org_id").notNull();
}

/**
 * Creates a SQL condition for filtering records by organization.
 *
 * Supports tables with either `organizationId` or `orgId` column.
 * Use this in WHERE clauses to scope queries to a specific organization.
 *
 * @param table - A table with organizationId or orgId column
 * @param orgIdValue - The organization ID to filter by
 * @returns A Drizzle SQL condition: organizationId = :orgIdValue
 *
 * @example
 * ```typescript
 * // Get all posts for an organization
 * const orgPosts = await db.select()
 *   .from(posts)
 *   .where(withOrgFilter(posts, currentOrgId));
 *
 * // Combined with other conditions
 * const activeOrgPosts = await db.select()
 *   .from(posts)
 *   .where(and(
 *     withOrgFilter(posts, currentOrgId),
 *     isNotDeleted(posts)
 *   ));
 *
 * // Use in join queries
 * const userPosts = await db.select()
 *   .from(users)
 *   .innerJoin(posts, eq(users.id, posts.authorId))
 *   .where(withOrgFilter(posts, currentOrgId));
 * ```
 */
export function withOrgFilter<T extends OrgScopedTable>(table: T, orgIdValue: string): SQL {
  if (hasOrganizationId(table)) {
    return eq(table.organizationId, orgIdValue);
  }
  if (hasOrgId(table)) {
    return eq(table.orgId, orgIdValue);
  }
  // This should never happen due to OrgScopedTable type constraint
  throw new Error(
    "Table must have either organizationId or orgId column for organization filtering"
  );
}

/**
 * Helper to create organization-scoped update values.
 *
 * Ensures the organizationId cannot be changed during updates
 * by explicitly omitting it from the update payload.
 *
 * @param data - The update data
 * @returns The same data with organizationId/orgId fields removed
 *
 * @example
 * ```typescript
 * // Prevents accidentally changing organization during update
 * await db.update(posts)
 *   .set(withoutOrgChange({
 *     title: 'New Title',
 *     organizationId: 'hacker-org-id', // This will be stripped
 *   }))
 *   .where(eq(posts.id, postId));
 * ```
 */
export function withoutOrgChange<
  T extends Record<string, unknown> &
    Partial<{
      organizationId?: unknown;
      orgId?: unknown;
    }>,
>(data: T): Omit<T, "organizationId" | "orgId"> {
  const { organizationId: _orgId, orgId: _shortOrgId, ...rest } = data;
  return rest;
}

/**
 * Type for organization ID values (UUID string)
 */
export type OrganizationId = string;
