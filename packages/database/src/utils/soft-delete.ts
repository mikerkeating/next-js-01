/**
 * Soft Delete Utilities
 *
 * Provides column definitions and query helpers for implementing soft delete pattern.
 * Soft deletes use a nullable `deletedAt` timestamp column:
 * - NULL = record is active (not deleted)
 * - Timestamp = record was deleted at that time
 *
 * @example
 * ```typescript
 * import { softDelete, isNotDeleted, isDeleted, markAsDeleted } from '@repo/database';
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 *
 * // Add soft delete to your schema
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey(),
 *   title: text("title"),
 *   ...softDelete(), // Adds deletedAt column
 * });
 *
 * // Query only active records
 * const activePosts = await db.select()
 *   .from(posts)
 *   .where(isNotDeleted(posts));
 *
 * // Query only deleted records
 * const deletedPosts = await db.select()
 *   .from(posts)
 *   .where(isDeleted(posts));
 *
 * // Soft delete a record
 * await db.update(posts)
 *   .set(markAsDeleted())
 *   .where(eq(posts.id, postId));
 * ```
 *
 * @packageDocumentation
 */

import { isNull, isNotNull, type Column, type SQL } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

/**
 * The column name for soft delete timestamp
 */
export const SOFT_DELETE_COLUMN = "deletedAt" as const;

/**
 * Type for the soft delete column name
 */
export type SoftDeleteColumnName = typeof SOFT_DELETE_COLUMN;

/**
 * Interface for tables that support soft delete.
 * Tables must have a deletedAt column that is a nullable timestamp.
 * Uses generic Column type for forward compatibility with drizzle-orm versions.
 */
export interface SoftDeletable {
  deletedAt: Column;
}

/**
 * Creates a deletedAt timestamp column for soft delete pattern.
 *
 * Configuration:
 * - Column name: "deleted_at" (snake_case in database)
 * - Type: PostgreSQL TIMESTAMP
 * - Nullable: true (NULL means not deleted)
 * - No default value (starts as NULL)
 *
 * @returns A Drizzle timestamp column definition
 *
 * @example
 * ```typescript
 * const logs = pgTable("logs", {
 *   id: text("id").primaryKey(),
 *   deletedAt: deletedAt(),
 * });
 * ```
 */
export function deletedAt() {
  return timestamp("deleted_at", { mode: "date" });
}

/**
 * Creates the deletedAt column for soft delete pattern.
 *
 * Returns an object that can be spread into your table definition.
 * The column is nullable - NULL means the record is active.
 *
 * @returns An object with deletedAt column definition
 *
 * @example
 * ```typescript
 * import { softDelete } from '@repo/database';
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 *
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey(),
 *   title: text("title").notNull(),
 *   ...softDelete(), // Adds deletedAt column
 * });
 * ```
 */
export function softDelete() {
  return {
    deletedAt: deletedAt(),
  };
}

/**
 * Creates a SQL condition for filtering active (non-deleted) records.
 *
 * Use this in WHERE clauses to exclude soft-deleted records from queries.
 *
 * @param table - A table with a deletedAt column
 * @returns A Drizzle SQL condition: deletedAt IS NULL
 *
 * @example
 * ```typescript
 * // Get all active posts
 * const activePosts = await db.select()
 *   .from(posts)
 *   .where(isNotDeleted(posts));
 *
 * // Combined with other conditions
 * const activeUserPosts = await db.select()
 *   .from(posts)
 *   .where(and(
 *     isNotDeleted(posts),
 *     eq(posts.userId, userId)
 *   ));
 * ```
 */
export function isNotDeleted<T extends SoftDeletable>(table: T): SQL {
  return isNull(table.deletedAt);
}

/**
 * Creates a SQL condition for filtering deleted records.
 *
 * Use this in WHERE clauses to query only soft-deleted records.
 * Useful for trash/recycle bin features or audit purposes.
 *
 * @param table - A table with a deletedAt column
 * @returns A Drizzle SQL condition: deletedAt IS NOT NULL
 *
 * @example
 * ```typescript
 * // Get all deleted posts (for trash bin)
 * const trashedPosts = await db.select()
 *   .from(posts)
 *   .where(isDeleted(posts));
 *
 * // Get posts deleted more than 30 days ago
 * const oldDeletedPosts = await db.select()
 *   .from(posts)
 *   .where(and(
 *     isDeleted(posts),
 *     lt(posts.deletedAt, thirtyDaysAgo)
 *   ));
 * ```
 */
export function isDeleted<T extends SoftDeletable>(table: T): SQL {
  return isNotNull(table.deletedAt);
}

/**
 * Creates an update object to mark a record as deleted.
 *
 * Sets deletedAt to the current timestamp (or provided timestamp).
 * Use this with db.update() to soft delete records.
 *
 * @param timestamp - Optional custom deletion timestamp (defaults to now)
 * @returns An object suitable for db.update().set()
 *
 * @example
 * ```typescript
 * // Soft delete a post
 * await db.update(posts)
 *   .set(markAsDeleted())
 *   .where(eq(posts.id, postId));
 *
 * // Soft delete with specific timestamp
 * await db.update(posts)
 *   .set(markAsDeleted(new Date('2024-01-15')))
 *   .where(eq(posts.id, postId));
 *
 * // Soft delete with additional field updates
 * await db.update(posts)
 *   .set({
 *     ...markAsDeleted(),
 *     updatedAt: new Date(),
 *     updatedBy: userId,
 *   })
 *   .where(eq(posts.id, postId));
 * ```
 */
export function markAsDeleted(timestamp?: Date): { deletedAt: Date } {
  return {
    deletedAt: timestamp ?? new Date(),
  };
}

/**
 * Creates an update object to restore a soft-deleted record.
 *
 * Sets deletedAt to null, effectively un-deleting the record.
 * Use this with db.update() to restore records from trash.
 *
 * @returns An object suitable for db.update().set()
 *
 * @example
 * ```typescript
 * // Restore a deleted post
 * await db.update(posts)
 *   .set(markAsRestored())
 *   .where(eq(posts.id, postId));
 *
 * // Restore with additional field updates
 * await db.update(posts)
 *   .set({
 *     ...markAsRestored(),
 *     updatedAt: new Date(),
 *     restoredBy: userId,
 *   })
 *   .where(eq(posts.id, postId));
 * ```
 */
export function markAsRestored(): { deletedAt: null } {
  return {
    deletedAt: null,
  };
}

/**
 * Type for the return value of softDelete()
 */
export type SoftDeleteColumns = ReturnType<typeof softDelete>;
