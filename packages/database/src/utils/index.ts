/**
 * Database Utility Functions
 *
 * This module exports generic utility functions for common database patterns:
 * - ID generation using cuid2
 * - Timestamp column helpers
 * - Soft delete column and query helpers
 * - Organization-scoped query utilities
 *
 * These utilities are designed to be used with Drizzle ORM schemas and queries,
 * providing consistent patterns across all database tables.
 *
 * @example
 * ```typescript
 * import {
 *   createId,
 *   timestamps,
 *   softDelete,
 *   organizationId,
 *   isNotDeleted,
 *   withOrgFilter,
 * } from '@repo/database';
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 *
 * // Define a schema with all utilities
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey().$defaultFn(() => createId()),
 *   title: text("title").notNull(),
 *   organizationId: organizationId(),
 *   ...timestamps(),
 *   ...softDelete(),
 * });
 *
 * // Query with helpers
 * const activePosts = await db.select()
 *   .from(posts)
 *   .where(and(
 *     withOrgFilter(posts, currentOrgId),
 *     isNotDeleted(posts)
 *   ));
 * ```
 *
 * @packageDocumentation
 */

// ID generation utilities
export { createId, isValidId, ID_LENGTH, ID_PATTERN, type CuidId } from "./ids";

// Timestamp column helpers
export {
  timestamps,
  createdAt,
  updatedAt,
  TIMESTAMP_COLUMNS,
  type TimestampColumnName,
  type TimestampColumns,
} from "./timestamps";

// Soft delete utilities
export {
  softDelete,
  deletedAt,
  isNotDeleted,
  isDeleted,
  markAsDeleted,
  markAsRestored,
  SOFT_DELETE_COLUMN,
  type SoftDeleteColumnName,
  type SoftDeletable,
  type SoftDeleteColumns,
} from "./soft-delete";

// Organization context utilities
export {
  organizationId,
  orgId,
  withOrgFilter,
  withoutOrgChange,
  ORG_COLUMN_NAMES,
  type OrgColumnName,
  type OrgScopedTable,
  type OrganizationId,
} from "./org-context";
