/**
 * Migration Utilities
 *
 * Provides programmatic migration functionality for the database.
 * Uses drizzle-orm/neon-http/migrator for edge-compatible migrations.
 *
 * @example
 * ```typescript
 * import { runMigrations, getMigrationsPath } from '@repo/database';
 *
 * // Run migrations with default settings
 * const result = await runMigrations();
 * if (result.success) {
 *   console.log(`Migrations completed in ${result.durationMs}ms`);
 * } else {
 *   console.error(`Migration failed: ${result.error}`);
 * }
 *
 * // Run with verbose logging
 * await runMigrations({ verbose: true });
 *
 * // Use custom migrations folder
 * await runMigrations({ migrationsFolder: '/custom/path' });
 * ```
 *
 * @packageDocumentation
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/neon-http/migrator";

import { db } from "./client";

/**
 * Result of a migration operation.
 */
export interface MigrationResult {
  /** Whether the migration completed successfully */
  success: boolean;
  /** Time taken for migration in milliseconds */
  durationMs: number;
  /** Path to the migrations folder that was used */
  migrationsPath: string;
  /** Error message if migration failed */
  error?: string;
}

/**
 * Options for running migrations.
 */
export interface MigrationOptions {
  /** Custom path to migrations folder. If not provided, uses default ./migrations */
  migrationsFolder?: string;
  /** Enable verbose logging. Default: false */
  verbose?: boolean;
}

/**
 * Error codes for migration-related failures.
 */
export type MigrationErrorCode =
  | "MIGRATION_FAILED"
  | "NO_MIGRATIONS"
  | "INVALID_PATH"
  | "CONNECTION_ERROR";

/**
 * Custom error class for migration failures.
 * Provides additional context through error codes for programmatic handling.
 */
export class MigrationError extends Error {
  /** Unique error code for programmatic handling */
  readonly code: MigrationErrorCode;

  constructor(message: string, code: MigrationErrorCode, cause?: Error) {
    super(message);
    this.name = "MigrationError";
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Gets the default migrations folder path.
 *
 * The default path is relative to this module's location at ./migrations.
 * This ensures migrations are always found regardless of where the consuming
 * code is executed from.
 *
 * @param customPath - Optional custom path to use instead of the default
 * @returns Absolute path to the migrations folder
 *
 * @example
 * ```typescript
 * // Get default path
 * const defaultPath = getMigrationsPath();
 * // Returns: /path/to/packages/database/src/migrations
 *
 * // Use custom path
 * const customPath = getMigrationsPath('/my/migrations');
 * // Returns: /my/migrations
 * ```
 */
export function getMigrationsPath(customPath?: string): string {
  if (customPath) {
    return customPath;
  }

  // Get the directory of this file (works in ESM)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  return path.join(__dirname, "migrations");
}

/**
 * Extracts error message from unknown error types.
 *
 * @param error - The error to extract message from
 * @returns The error message string
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown migration error";
}

/**
 * Runs database migrations programmatically.
 *
 * This function applies all pending migrations from the migrations folder
 * to the database. It uses the drizzle-orm/neon-http/migrator which is
 * compatible with edge runtimes and serverless environments.
 *
 * The migration state is tracked in the `drizzle.__drizzle_migrations` table
 * in the database. Migrations that have already been applied will be skipped.
 *
 * @param options - Configuration options for the migration run
 * @returns A promise resolving to the migration result
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await runMigrations();
 *
 * if (!result.success) {
 *   throw new Error(`Migration failed: ${result.error}`);
 * }
 *
 * // With options
 * const result = await runMigrations({
 *   migrationsFolder: './custom-migrations',
 *   verbose: true
 * });
 *
 * console.log(`Completed in ${result.durationMs}ms`);
 * ```
 */
export async function runMigrations(options: MigrationOptions = {}): Promise<MigrationResult> {
  const { migrationsFolder, verbose = false } = options;
  const migrationsPath = getMigrationsPath(migrationsFolder);
  const startTime = Date.now();

  if (verbose) {
    console.warn(`Starting migration from: ${migrationsPath}`);
  }

  try {
    await migrate(db, { migrationsFolder: migrationsPath });

    const durationMs = Date.now() - startTime;

    if (verbose) {
      console.warn(`Migration completed successfully in ${durationMs}ms`);
    }

    return {
      success: true,
      durationMs,
      migrationsPath,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    if (verbose) {
      console.error(`Migration failed: ${errorMessage}`);
    }

    return {
      success: false,
      durationMs,
      migrationsPath,
      error: errorMessage,
    };
  }
}
