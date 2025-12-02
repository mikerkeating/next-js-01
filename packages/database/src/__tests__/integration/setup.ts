/**
 * Integration Test Setup
 *
 * Global setup and teardown for integration tests that require a live
 * database connection. This file is loaded before all integration tests.
 *
 * Per AD-2A.2.S10.2: Integration tests skip gracefully when DATABASE_URL
 * is not set or database is unreachable.
 *
 * @packageDocumentation
 */

import { afterAll, beforeAll, describe, it } from "vitest";

import { closeTestDatabase, shouldSkipDatabaseTests } from "../test-client";

/**
 * Environment variable that controls integration test skipping
 */
export const SKIP_INTEGRATION_ENV = "SKIP_DB_INTEGRATION_TESTS";

/**
 * Checks if integration tests should be skipped.
 *
 * Tests are skipped if:
 * - SKIP_DB_INTEGRATION_TESTS is set to 'true'
 * - DATABASE_URL is not configured
 *
 * @returns true if tests should be skipped
 */
export function shouldSkipIntegrationTests(): boolean {
  if (process.env[SKIP_INTEGRATION_ENV] === "true") {
    return true;
  }

  return shouldSkipDatabaseTests();
}

/**
 * Wrapper for integration test suites that handles graceful skipping.
 *
 * Use this instead of raw `describe` for integration test suites.
 * If DATABASE_URL is not available, tests will be skipped with a warning.
 *
 * @param name - Test suite name
 * @param fn - Test suite function
 *
 * @example
 * ```typescript
 * import { describeIntegration } from './setup';
 *
 * describeIntegration('Connection tests', () => {
 *   it('connects to database', async () => {
 *     // Test code
 *   });
 * });
 * ```
 */
export function describeIntegration(name: string, fn: () => void): void {
  const shouldSkip = shouldSkipIntegrationTests();

  if (shouldSkip) {
    describe.skip(`[SKIPPED: No DATABASE_URL] ${name}`, () => {
      it("skipped - DATABASE_URL not configured", () => {
        // Placeholder test to show skip reason
      });
    });
    return;
  }

  describe(name, fn);
}

/**
 * Global cleanup after all integration tests complete
 */
afterAll(async () => {
  await closeTestDatabase();
});

/**
 * Log integration test mode at startup
 */
beforeAll(() => {
  const skip = shouldSkipIntegrationTests();
  const databaseUrl = process.env.DATABASE_URL;

  if (skip) {
    console.warn("\n⚠️  Integration tests will be SKIPPED");
    console.warn("   Reason: DATABASE_URL is not configured or SKIP_DB_INTEGRATION_TESTS=true");
    console.warn("   To run integration tests:");
    console.warn("     1. Start the local database: pnpm run db:start");
    console.warn("     2. Set DATABASE_URL in your environment");
    console.warn("     3. Run: pnpm --filter @repo/database run test:integration\n");
  } else {
    // Mask the URL for safe logging
    const maskedUrl = databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ":****@") : "unknown";
    console.log("\n✓ Integration tests will run against:");
    console.log(`  ${maskedUrl}\n`);
  }
});

/**
 * Re-export test utilities for convenience
 */
export { createTestDatabase, createTestTransaction, shouldSkipDatabaseTests } from "../test-client";
export type { TestDatabase, TestTransactionClient, TestTransactionResult } from "../test-client";
