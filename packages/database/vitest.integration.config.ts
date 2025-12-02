/**
 * Vitest Configuration for Integration Tests
 *
 * Separate configuration for database integration tests that require
 * a live PostgreSQL connection. These tests:
 * - Run against actual databases (local Docker or Neon)
 * - Have longer timeouts for network operations
 * - Skip gracefully when DATABASE_URL is not available
 *
 * Per AD-2A.2.S10.1: Separate integration test configuration for:
 * - Different timeout requirements (30s vs 5s for unit tests)
 * - Database availability requirements
 * - CI/CD job separation (unit tests can run without database)
 *
 * Note: This config does NOT extend the base config because we need
 * complete control over the include/exclude patterns to prevent
 * unit tests from being picked up.
 *
 * @see https://vitest.dev/config/
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Enable global APIs (describe, it, expect) without imports
    globals: true,

    // Use Node environment for database operations (no DOM)
    environment: "node",

    // Integration test file pattern - ONLY integration tests
    include: ["src/__tests__/integration/**/*.integration.test.ts"],

    // Exclude non-integration test files
    exclude: ["**/node_modules/**", "**/dist/**"],

    // Longer timeouts for database operations
    // Per story requirements: 30s timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,

    // Run tests sequentially to avoid database connection contention
    // Integration tests may share state through the database
    sequence: {
      concurrent: false,
    },

    // Setup file for integration test environment
    setupFiles: ["./src/__tests__/integration/setup.ts"],

    // Disable coverage for integration tests
    // Coverage is measured in unit tests which have deterministic mocking
    coverage: {
      enabled: false,
    },

    // Pool settings for database tests
    pool: "forks",
    poolOptions: {
      forks: {
        // Single thread to avoid database connection issues
        minForks: 1,
        maxForks: 1,
      },
    },
  },
});
