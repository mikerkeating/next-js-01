#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * Reset Database Script
 *
 * Resets the database by dropping all tables and reapplying migrations.
 * This script is ONLY intended for development and testing environments.
 *
 * ⚠️  DANGER: This will permanently delete ALL data in the database.
 *
 * Usage:
 *   pnpm run db:reset
 *   pnpm run db:reset --force  # Skip confirmation (CI/CD use)
 *
 * Environment variables:
 *   DATABASE_URL - Required. PostgreSQL connection string.
 *   NODE_ENV - Must NOT be "production" for this script to run.
 *
 * @example
 * ```bash
 * # Reset with confirmation prompt
 * NODE_ENV=development DATABASE_URL="..." pnpm run db:reset
 *
 * # Force reset without confirmation (for CI/CD)
 * NODE_ENV=test DATABASE_URL="..." pnpm run db:reset --force
 * ```
 */

import * as readline from "node:readline";

import { sql } from "drizzle-orm";

import { db } from "../src/client";
import { runMigrations } from "../src/migrate";

/** Environments where database reset is allowed */
const ALLOWED_ENVIRONMENTS = ["development", "test", "local"] as const;

/**
 * Environment safety check.
 * Prevents accidental data loss in production.
 */
function validateEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV;

  if (!nodeEnv || !ALLOWED_ENVIRONMENTS.includes(nodeEnv as (typeof ALLOWED_ENVIRONMENTS)[number])) {
    console.error("✗ ERROR: Database reset is only allowed in: " + ALLOWED_ENVIRONMENTS.join(", "));
    console.error(`  Current NODE_ENV: ${nodeEnv ?? "(not set)"}`);
    console.error("  Set NODE_ENV to an allowed value to proceed.");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("✗ ERROR: DATABASE_URL environment variable is required.");
    process.exit(1);
  }
}

/**
 * Parses command-line arguments.
 */
function parseArgs(): { force: boolean; verbose: boolean } {
  const args = process.argv.slice(2);
  return {
    force: args.includes("--force") || args.includes("-f"),
    verbose: args.includes("--verbose") || args.includes("-v"),
  };
}

/**
 * Prompts for user confirmation.
 */
async function confirmReset(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\n⚠️  This will DELETE ALL DATA. Type "RESET" to confirm: ', (answer: string) => {
      rl.close();
      resolve(answer === "RESET");
    });
  });
}

/**
 * Drops all tables in the public schema.
 */
async function dropAllTables(verbose: boolean): Promise<void> {
  if (verbose) {
    console.log("  Fetching table list...");
  }

  // Get all table names in public schema
  const tablesResult = await db.execute<{ tablename: string; [key: string]: unknown }>(sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `);

  const tables = tablesResult.rows.map((row) => row.tablename);

  if (tables.length === 0) {
    if (verbose) {
      console.log("  No tables to drop.");
    }
    return;
  }

  if (verbose) {
    console.log(`  Found ${tables.length} tables to drop.`);
  }

  // Drop all tables with CASCADE to handle dependencies
  for (const table of tables) {
    if (verbose) {
      console.log(`  Dropping table: ${table}`);
    }
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
  }

  // Also drop the drizzle schema if it exists
  if (verbose) {
    console.log("  Dropping drizzle schema...");
  }
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
}

/**
 * Main function to reset the database.
 */
async function main(): Promise<void> {
  validateEnvironment();

  const { force, verbose } = parseArgs();
  const nodeEnv = process.env.NODE_ENV ?? "development";

  console.log("Database Reset Script\n");
  console.log("=".repeat(50));
  console.log(`  Environment: ${nodeEnv}`);
  console.log(`  Force mode: ${force ? "enabled" : "disabled"}`);
  console.log("=".repeat(50));

  // Require confirmation unless force flag is set
  if (!force) {
    const confirmed = await confirmReset();
    if (!confirmed) {
      console.log("\n✗ Reset cancelled.");
      process.exit(0);
    }
  }

  console.log("\n1. Dropping all tables...");
  await dropAllTables(verbose);
  console.log("   ✓ Tables dropped");

  console.log("\n2. Applying migrations...");
  const result = await runMigrations({ verbose });

  if (!result.success) {
    console.error(`   ✗ Migration failed: ${result.error}`);
    process.exit(1);
  }

  console.log(`   ✓ Migrations applied in ${result.durationMs}ms`);

  console.log("\n=".repeat(50));
  console.log("✓ Database reset completed successfully");
  console.log("=".repeat(50));
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
