#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * Apply Migrations Script
 *
 * Programmatically applies pending database migrations.
 * This script uses the drizzle-orm migrator for edge-compatible migrations.
 *
 * Usage:
 *   pnpm run db:apply-migrations
 *   pnpm run db:apply-migrations --verbose
 *
 * Environment variables:
 *   DATABASE_URL - Required. PostgreSQL connection string.
 *
 * @example
 * ```bash
 * # Apply migrations with default settings
 * DATABASE_URL="postgresql://..." pnpm run db:apply-migrations
 *
 * # Apply with verbose logging
 * DATABASE_URL="postgresql://..." pnpm run db:apply-migrations --verbose
 * ```
 */

import { runMigrations, type MigrationResult } from "../src/migrate";

/**
 * Parses command-line arguments.
 */
function parseArgs(): { verbose: boolean } {
  const args = process.argv.slice(2);
  return {
    verbose: args.includes("--verbose") || args.includes("-v"),
  };
}

/**
 * Formats the migration result for console output.
 */
function formatResult(result: MigrationResult): string {
  if (result.success) {
    return `✓ Migrations applied successfully in ${result.durationMs}ms`;
  }
  return `✗ Migration failed: ${result.error}`;
}

/**
 * Main function to apply migrations.
 */
async function main(): Promise<void> {
  const { verbose } = parseArgs();

  console.log("Applying database migrations...\n");

  const result = await runMigrations({ verbose });

  console.log(formatResult(result));

  if (!result.success) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
