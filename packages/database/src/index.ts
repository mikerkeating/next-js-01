/**
 * @repo/database - Database schema, client, and utilities
 *
 * This package provides the database layer for the monorepo using Drizzle ORM
 * with PostgreSQL (via Neon serverless HTTP driver).
 *
 * @example
 * ```typescript
 * import { db, Database } from '@repo/database';
 * import { eq } from 'drizzle-orm';
 *
 * // When schemas are added (S6+):
 * // import { users } from '@repo/database/schema';
 * // const user = await db.query.users.findFirst({
 * //   where: eq(users.email, 'user@example.com')
 * // });
 * ```
 *
 * @packageDocumentation
 */

// Export database client and types
export { db, type Database } from "./client";

// Re-export schema definitions for convenience
// Consumers can also use '@repo/database/schema' for explicit schema imports
export * from "./schema/index";

// Note: Additional exports will be added in subsequent stories:
// - S3: Connection utilities
// - S6: Schema definitions and types
