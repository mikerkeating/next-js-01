#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * Migration Workflow Example
 *
 * Demonstrates programmatic migration execution using @repo/database.
 * Shows health checks, migration running, and error handling.
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable set
 *   - Migration files in src/migrations/
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx examples/migration-workflow.ts
 *
 * Or from the package directory:
 *   pnpm exec tsx examples/migration-workflow.ts
 */

import {
  checkDatabaseHealth,
  runMigrations,
  getMigrationsPath,
  MigrationError,
  type MigrationResult,
  type HealthCheckResult,
} from "../src/index";

/**
 * Pre-Migration Health Check
 *
 * Always verify database connectivity before migrations.
 */
async function verifyDatabaseHealth(): Promise<HealthCheckResult> {
  console.log("\n--- Pre-Migration Health Check ---");

  const health = await checkDatabaseHealth({ timeoutMs: 10000 });

  if (health.status === "healthy") {
    console.log(`  Status: ${health.status}`);
    console.log(`  Latency: ${health.latencyMs}ms`);
    console.log(`  Timestamp: ${health.timestamp}`);
    return health;
  }

  console.error(`  Status: ${health.status}`);
  console.error(`  Error: ${health.error}`);
  throw new Error("Cannot run migrations without healthy database connection");
}

/**
 * Run Migrations
 *
 * Execute pending migrations with progress logging.
 */
async function executeMigrations(): Promise<MigrationResult> {
  console.log("\n--- Running Migrations ---");

  // Get the migrations path for display
  const migrationsPath = getMigrationsPath();
  console.log(`  Migrations folder: ${migrationsPath}`);

  // Run migrations with verbose logging
  const result = await runMigrations({
    verbose: true, // Enable detailed output
    // migrationsFolder: customPath, // Optional: override default path
  });

  return result;
}

/**
 * Handle Migration Result
 *
 * Process and report migration outcome.
 */
function handleMigrationResult(result: MigrationResult): void {
  console.log("\n--- Migration Result ---");

  if (result.success) {
    console.log("  Status: SUCCESS");
    console.log(`  Duration: ${result.durationMs}ms`);
    console.log(`  Path: ${result.migrationsPath}`);
  } else {
    console.error("  Status: FAILED");
    console.error(`  Error: ${result.error}`);
    console.error(`  Duration: ${result.durationMs}ms`);
    console.error(`  Path: ${result.migrationsPath}`);
    throw new Error(`Migration failed: ${result.error}`);
  }
}

/**
 * Error Recovery Guidance
 *
 * Shows how to handle different migration errors.
 */
function demonstrateErrorHandling(): void {
  console.log("\n--- Error Handling Patterns ---");

  console.log("\n  Connection Errors:");
  console.log("    1. Verify DATABASE_URL is correct");
  console.log("    2. Check database server is running");
  console.log("    3. Verify network connectivity");
  console.log("    4. Check SSL settings (sslmode=require for Neon)");

  console.log("\n  Migration Errors:");
  console.log("    1. Review migration SQL for syntax errors");
  console.log("    2. Check for conflicting schema changes");
  console.log("    3. Verify migration files exist in migrations folder");
  console.log("    4. Check __drizzle_migrations table for state");

  console.log("\n  Recovery Options:");
  console.log("    - Create reversal migration for failed changes");
  console.log("    - Restore database from backup");
  console.log("    - Manual SQL to fix schema state");
  console.log("    - Run db:rollback for guidance");
}

/**
 * Best Practices
 *
 * Guidelines for safe migration execution.
 */
function demonstrateBestPractices(): void {
  console.log("\n--- Best Practices ---");

  console.log("\n  Before Migration:");
  console.log("    - Backup database (especially production)");
  console.log("    - Review generated migration SQL");
  console.log("    - Test locally before staging/production");
  console.log("    - Verify health check passes");

  console.log("\n  During Migration:");
  console.log("    - Use verbose mode for visibility");
  console.log("    - Monitor for errors");
  console.log("    - Have rollback plan ready");

  console.log("\n  After Migration:");
  console.log("    - Verify schema changes with db:studio");
  console.log("    - Run application tests");
  console.log("    - Monitor for runtime issues");
  console.log("    - Commit migration files to version control");
}

/**
 * CI/CD Integration Example
 *
 * Shows patterns for automated migration in pipelines.
 */
function demonstrateCiCdIntegration(): void {
  console.log("\n--- CI/CD Integration ---");

  console.log("\n  GitHub Actions Example:");
  console.log("    ```yaml");
  console.log("    - name: Run migrations");
  console.log("      env:");
  console.log("        DATABASE_URL: ${{ secrets.DATABASE_URL }}");
  console.log("      run: |");
  console.log("        cd packages/database");
  console.log("        pnpm run db:apply-migrations --verbose");
  console.log("    ```");

  console.log("\n  Programmatic Check in CI:");
  console.log("    const result = await runMigrations();");
  console.log("    if (!result.success) {");
  console.log("      process.exit(1);");
  console.log("    }");

  console.log("\n  Pre-Deployment Validation:");
  console.log("    - Lint: pnpm run lint");
  console.log("    - Type check: pnpm run type-check");
  console.log("    - Test: pnpm run test");
  console.log("    - Migrate: pnpm run db:apply-migrations");
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("@repo/database - Migration Workflow Example");
  console.log("=".repeat(60));

  try {
    // Step 1: Health check
    await verifyDatabaseHealth();

    // Step 2: Run migrations
    const result = await executeMigrations();

    // Step 3: Handle result
    handleMigrationResult(result);

    // Step 4: Show best practices
    demonstrateBestPractices();

    // Step 5: Show error handling
    demonstrateErrorHandling();

    // Step 6: Show CI/CD patterns
    demonstrateCiCdIntegration();

    console.log("\n" + "=".repeat(60));
    console.log("Example completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("Example failed!");
    console.error("=".repeat(60));

    if (error instanceof MigrationError) {
      console.error(`\nMigration Error [${error.code}]: ${error.message}`);

      // Provide specific guidance based on error code
      switch (error.code) {
        case "CONNECTION_ERROR":
          console.error("\nSuggestion: Check DATABASE_URL and database connectivity");
          break;
        case "INVALID_PATH":
          console.error("\nSuggestion: Verify migrations folder exists");
          break;
        case "MIGRATION_FAILED":
          console.error("\nSuggestion: Review migration SQL for errors");
          break;
        default:
          console.error("\nSuggestion: Check the error details above");
      }
    } else {
      console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
    }

    process.exit(1);
  }
}

// Run the example
main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
