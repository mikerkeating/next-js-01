/**
 * @repo/database - Database schema, client, and utilities
 *
 * This package provides the database layer for the monorepo using Drizzle ORM
 * with PostgreSQL (via Neon serverless HTTP driver).
 *
 * @example
 * ```typescript
 * import { db, Database, checkDatabaseHealth, withRetry, runMigrations } from '@repo/database';
 * import { eq } from 'drizzle-orm';
 *
 * // Health check
 * const health = await checkDatabaseHealth();
 * if (health.status === 'healthy') {
 *   console.log(`Database latency: ${health.latencyMs}ms`);
 * }
 *
 * // Retry wrapper for resilient operations
 * const user = await withRetry(
 *   () => db.query.users.findFirst({ where: eq(users.email, 'user@example.com') }),
 *   { maxAttempts: 3, baseDelayMs: 100 }
 * );
 *
 * // Run migrations programmatically
 * const result = await runMigrations({ verbose: true });
 * if (result.success) {
 *   console.log(`Migrations completed in ${result.durationMs}ms`);
 * }
 * ```
 *
 * @packageDocumentation
 */

// Export database client and types
export { db, type Database } from "./client";

// Re-export schema definitions for convenience
// Consumers can also use '@repo/database/schema' for explicit schema imports
export * from "./schema/index";

// Export connection utilities
export {
  checkDatabaseHealth,
  withRetry,
  ConnectionError,
  type HealthCheckResult,
  type HealthCheckOptions,
  type RetryOptions,
  type ConnectionErrorCode,
} from "./connection";

// Export migration utilities
export {
  runMigrations,
  getMigrationsPath,
  MigrationError,
  type MigrationResult,
  type MigrationOptions,
  type MigrationErrorCode,
} from "./migrate";
