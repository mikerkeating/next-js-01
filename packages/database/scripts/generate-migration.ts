#!/usr/bin/env npx tsx

/**
 * Generate Migration Script
 *
 * Generates a new migration file from schema changes.
 * This script wraps `drizzle-kit generate` for consistent migration generation.
 *
 * Usage:
 *   pnpm run db:generate
 *   pnpm run db:generate --name add_users_table
 *
 * Environment variables:
 *   DATABASE_URL - Required. PostgreSQL connection string.
 *
 * @example
 * ```bash
 * # Generate migration (auto-named based on timestamp)
 * pnpm run db:generate
 *
 * # Generate with custom name
 * pnpm run db:generate --name add_users_table
 * ```
 *
 * The generated migration file will be placed in ./src/migrations/
 * Always review generated migrations before applying them.
 */

import { spawn } from "node:child_process";

/**
 * Parses command-line arguments.
 */
function parseArgs(): { name?: string; verbose: boolean } {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf("--name");

  // Only accept the next token as name if it exists and is not another flag
  let name: string | undefined;
  if (nameIndex !== -1) {
    const nextArg = args[nameIndex + 1];
    if (nextArg && !nextArg.startsWith("-")) {
      name = nextArg;
    }
  }

  return {
    name,
    verbose: args.includes("--verbose") || args.includes("-v"),
  };
}

/**
 * Runs drizzle-kit generate command.
 */
async function runDrizzleKitGenerate(options: { name?: string }): Promise<number> {
  const args = ["drizzle-kit", "generate"];

  if (options.name) {
    args.push("--name", options.name);
  }

  return new Promise((resolve, reject) => {
    const child = spawn("npx", args, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
    });

    child.on("close", (code) => {
      resolve(code ?? 0);
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Main function to generate migrations.
 */
async function main(): Promise<void> {
  const { name, verbose } = parseArgs();

  console.log("Generating migration from schema changes...\n");

  if (verbose && name) {
    console.log(`Migration name: ${name}`);
  }

  const exitCode = await runDrizzleKitGenerate({ name });

  if (exitCode !== 0) {
    console.error("\n✗ Migration generation failed");
    process.exit(exitCode);
  }

  console.log("\n✓ Migration generated successfully");
  console.log("\nNext steps:");
  console.log("  1. Review the generated migration file in ./src/migrations/");
  console.log("  2. Test the migration locally: pnpm run db:apply-migrations");
  console.log("  3. Commit the migration file to version control");
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
