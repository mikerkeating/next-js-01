/**
 * Timestamp Column Helper Utilities
 *
 * Provides consistent timestamp column definitions for createdAt and updatedAt fields.
 * These helpers ensure all tables follow the same timestamp pattern with automatic
 * default values and proper PostgreSQL timestamp precision.
 *
 * @example
 * ```typescript
 * import { timestamps, createdAt } from '@repo/database';
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 *
 * // Spread both columns into your schema
 * const users = pgTable("users", {
 *   id: text("id").primaryKey(),
 *   name: text("name"),
 *   ...timestamps(), // Adds createdAt and updatedAt
 * });
 *
 * // Or use individual columns if you only need one
 * const auditLogs = pgTable("audit_logs", {
 *   id: text("id").primaryKey(),
 *   action: text("action"),
 *   timestamp: createdAt(), // Just createdAt, no updatedAt
 * });
 * ```
 *
 * @packageDocumentation
 */

import { timestamp } from "drizzle-orm/pg-core";

/**
 * Column names for timestamp fields
 */
export const TIMESTAMP_COLUMNS = ["createdAt", "updatedAt"] as const;

/**
 * Type for timestamp column names
 */
export type TimestampColumnName = (typeof TIMESTAMP_COLUMNS)[number];

/**
 * Creates a createdAt timestamp column with automatic default value.
 *
 * Configuration:
 * - Column name: "created_at" (snake_case in database)
 * - Type: PostgreSQL TIMESTAMP
 * - Default: Current timestamp (`now()`)
 * - Nullable: false
 *
 * @returns A Drizzle timestamp column definition
 *
 * @example
 * ```typescript
 * const logs = pgTable("logs", {
 *   id: text("id").primaryKey(),
 *   createdAt: createdAt(),
 * });
 * ```
 */
export function createdAt() {
  return timestamp("created_at", { mode: "date" }).defaultNow().notNull();
}

/**
 * Creates an updatedAt timestamp column with automatic default value.
 *
 * Configuration:
 * - Column name: "updated_at" (snake_case in database)
 * - Type: PostgreSQL TIMESTAMP
 * - Default: Current timestamp (`now()`)
 * - Nullable: false
 *
 * Note: This sets the default value on insert. For automatic updates on
 * row modification, you would need to use a database trigger or handle
 * this in your application logic.
 *
 * @returns A Drizzle timestamp column definition
 *
 * @example
 * ```typescript
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey(),
 *   title: text("title"),
 *   updatedAt: updatedAt(),
 * });
 *
 * // Update the timestamp when modifying records
 * await db.update(posts)
 *   .set({ title: 'New Title', updatedAt: new Date() })
 *   .where(eq(posts.id, postId));
 * ```
 */
export function updatedAt() {
  return timestamp("updated_at", { mode: "date" }).defaultNow().notNull();
}

/**
 * Creates both createdAt and updatedAt timestamp columns.
 *
 * This is the recommended helper for most tables that need audit timestamps.
 * Returns an object that can be spread into your table definition.
 *
 * @returns An object with createdAt and updatedAt column definitions
 *
 * @example
 * ```typescript
 * import { timestamps } from '@repo/database';
 * import { pgTable, text } from 'drizzle-orm/pg-core';
 *
 * const users = pgTable("users", {
 *   id: text("id").primaryKey(),
 *   email: text("email").notNull(),
 *   name: text("name"),
 *   ...timestamps(), // Spreads createdAt and updatedAt
 * });
 *
 * // Insert will auto-populate both timestamps
 * await db.insert(users).values({
 *   id: createId(),
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   // createdAt and updatedAt are automatically set
 * });
 *
 * // Update should set updatedAt manually
 * await db.update(users)
 *   .set({ name: 'Jane Doe', updatedAt: new Date() })
 *   .where(eq(users.id, userId));
 * ```
 */
export function timestamps() {
  return {
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  };
}

/**
 * Type for the return value of timestamps()
 */
export type TimestampColumns = ReturnType<typeof timestamps>;
