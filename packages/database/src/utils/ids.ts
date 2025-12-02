/**
 * ID Generation Utilities
 *
 * Provides collision-resistant, URL-safe unique identifiers using cuid2.
 * These IDs are suitable for database primary keys and can be safely exposed in URLs.
 *
 * @example
 * ```typescript
 * import { createId, isValidId } from '@repo/database';
 *
 * // Generate a new ID
 * const id = createId(); // e.g., "clh3am1x70000qw39ugwx0abcd"
 *
 * // Validate an ID
 * if (isValidId(userInput)) {
 *   // Safe to use as database lookup
 * }
 *
 * // Use in Drizzle schema
 * const users = pgTable("users", {
 *   id: text("id").primaryKey().$defaultFn(() => createId()),
 * });
 * ```
 *
 * @packageDocumentation
 */

import { createId as cuid2CreateId, isCuid } from "@paralleldrive/cuid2";

/**
 * The length of generated cuid2 IDs (default is 24 characters)
 */
export const ID_LENGTH = 24;

/**
 * Regular expression pattern for valid cuid2 IDs
 * Matches lowercase alphanumeric strings of exactly ID_LENGTH characters
 */
export const ID_PATTERN = new RegExp(`^[a-z0-9]{${ID_LENGTH}}$`);

/**
 * Generates a globally unique, URL-safe identifier using cuid2.
 *
 * Properties:
 * - Collision-resistant: < 0.001% collision probability
 * - URL-safe: Contains only lowercase alphanumeric characters
 * - Compact: 24 characters (shorter than UUID's 36 characters)
 *
 * Note: Unlike cuid v1, cuid2 IDs are NOT timestamp-sortable and do not
 * contain a timestamp prefix. They are random and not chronologically ordered.
 *
 * @returns A unique 24-character lowercase alphanumeric string
 *
 * @example
 * ```typescript
 * const userId = createId();
 * const postId = createId();
 *
 * // Use as default value in Drizzle schema
 * const posts = pgTable("posts", {
 *   id: text("id").primaryKey().$defaultFn(() => createId()),
 * });
 * ```
 */
export function createId(): string {
  return cuid2CreateId();
}

/**
 * Validates whether a string is a valid cuid2 ID.
 *
 * Checks:
 * - Correct length (24 characters)
 * - Only lowercase alphanumeric characters
 * - Passes cuid2 validation
 *
 * Use this to validate user-provided IDs before database lookups
 * to prevent injection attacks and ensure data integrity.
 *
 * @param id - The string to validate
 * @returns true if the string is a valid cuid2 ID, false otherwise
 *
 * @example
 * ```typescript
 * const userInput = req.params.id;
 *
 * if (!isValidId(userInput)) {
 *   return res.status(400).json({ error: 'Invalid ID format' });
 * }
 *
 * // Safe to use in query
 * const user = await db.query.users.findFirst({
 *   where: eq(users.id, userInput),
 * });
 * ```
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  if (id.length !== ID_LENGTH) {
    return false;
  }

  if (!ID_PATTERN.test(id)) {
    return false;
  }

  return isCuid(id);
}

/**
 * Type alias for a cuid2 ID string.
 * Use this for type-safe ID handling in your application.
 *
 * @example
 * ```typescript
 * function getUser(id: CuidId): Promise<User | null> {
 *   return db.query.users.findFirst({
 *     where: eq(users.id, id),
 *   });
 * }
 * ```
 */
export type CuidId = string;
