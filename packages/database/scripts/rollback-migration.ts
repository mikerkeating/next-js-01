#!/usr/bin/env npx tsx

/**
 * Rollback Migration Script
 *
 * Rolls back database migrations. Note: Drizzle Kit does not have built-in
 * rollback support in the same way as some other migration tools.
 *
 * This script provides guidance and safety checks for manual rollback procedures.
 *
 * IMPORTANT: Drizzle ORM migrations are designed to be forward-only. Rollback
 * requires manual SQL execution or database restoration from backup.
 *
 * Usage:
 *   pnpm run db:rollback
 *
 * Environment variables:
 *   DATABASE_URL - Required. PostgreSQL connection string.
 *
 * @example
 * ```bash
 * # Show rollback guidance
 * pnpm run db:rollback
 * ```
 */

import { sql } from "drizzle-orm";

import { db } from "../src/client";

/**
 * Interface for migration record in the drizzle migrations table.
 */
interface MigrationRecord extends Record<string, unknown> {
  id: number;
  hash: string;
  created_at: number;
}

/**
 * Gets the list of applied migrations from the database.
 */
async function getAppliedMigrations(): Promise<MigrationRecord[]> {
  try {
    const result = await db.execute<MigrationRecord>(
      sql`SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    // Table might not exist if no migrations have been applied
    // Log the error for debugging purposes
    console.debug(
      "Failed to read drizzle migrations table (may not exist yet):",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Formats a timestamp to readable date string.
 */
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Main function to provide rollback guidance.
 */
async function main(): Promise<void> {
  console.log("Database Migration Rollback\n");
  console.log("=".repeat(50));
  console.log("\n⚠️  Important: Drizzle ORM migrations are forward-only.\n");
  console.log("Rollback options:");
  console.log("  1. Write a new migration that reverses the changes");
  console.log("  2. Restore from database backup");
  console.log("  3. Manually execute rollback SQL\n");

  console.log("Current applied migrations:\n");

  const migrations = await getAppliedMigrations();

  if (migrations.length === 0) {
    console.log("  No migrations have been applied yet.\n");
    return;
  }

  for (const migration of migrations) {
    console.log(`  [${migration.id}] ${migration.hash}`);
    console.log(`      Applied: ${formatTimestamp(migration.created_at)}\n`);
  }

  console.log("=".repeat(50));
  console.log("\nTo manually rollback the last migration:");
  console.log("  1. Identify the migration file in ./src/migrations/");
  console.log("  2. Write and execute the inverse SQL operations");
  console.log("  3. Remove the migration record:");
  console.log(`     DELETE FROM drizzle.__drizzle_migrations WHERE id = ${migrations[0]?.id};`);
  console.log("\n⚠️  Always backup your database before manual rollback operations.");
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
