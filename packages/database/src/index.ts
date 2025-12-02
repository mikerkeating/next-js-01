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

// Export utility functions (ID generation, timestamps, soft delete, org context)
export {
  // ID generation
  createId,
  isValidId,
  ID_LENGTH,
  ID_PATTERN,
  type CuidId,
  // Timestamps
  timestamps,
  createdAt,
  updatedAt,
  TIMESTAMP_COLUMNS,
  type TimestampColumnName,
  type TimestampColumns,
  // Soft delete
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
  // Organization context
  organizationId,
  orgId,
  withOrgFilter,
  withoutOrgChange,
  ORG_COLUMN_NAMES,
  type OrgColumnName,
  type OrgScopedTable,
  type OrganizationId,
} from "./utils/index";

// Export seed utilities
export {
  // Config
  getSeedConfig,
  getSeedEnvironment,
  type SeedConfig,
  type SeedEnvironment,
  type SeedCounts,
  // Factories
  createFactory,
  createUserData,
  createOrganizationData,
  setFakerSeed,
  type FactoryOptions,
  type UserData,
  type OrganizationData,
  // Utils
  createSeedLogger,
  createProgressTracker,
  SeedError,
  type SeedLogger,
  type ProgressTracker,
  type SeedProgress,
  type SeedLoggerOptions,
  type SeedErrorCode,
  // Runner
  runSeed,
  createSeedRunner,
  main as runSeedMain,
  type SeedFunction,
  type SeedFunctionResult,
  type SeedDefinition,
  type SeedResult,
  type SeedOptions,
  type SeedRunner,
} from "./seed/index";
