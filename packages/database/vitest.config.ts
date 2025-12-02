/**
 * Vitest configuration for @repo/database package.
 *
 * Extends the base configuration with database-specific settings:
 * - Node environment (no DOM APIs needed)
 * - 80% coverage thresholds for utility functions
 * - Test setup file for environment configuration
 *
 * @see https://vitest.dev/config/
 */
import { defineConfig, mergeConfig } from "vitest/config";

import { baseConfig } from "@repo/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Use Node environment for database operations (no DOM)
      environment: "node",

      // Test file patterns
      include: ["src/**/*.test.ts"],

      // Exclude scripts tests and integration tests from default unit test runs
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "scripts/**/*.test.ts",
        "src/__tests__/integration/**",
      ],

      // Test timeouts
      testTimeout: 10000, // 10s for integration tests
      hookTimeout: 10000,

      // Coverage configuration with 80% thresholds for utility functions
      coverage: {
        // Package-specific coverage thresholds
        // Enforces 80% coverage for database utilities as per story S7
        thresholds: {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
        },

        // Include only source files
        include: ["src/utils/**/*.ts", "src/connection.ts", "src/migrate.ts", "src/seed/**/*.ts"],

        // Exclude test infrastructure and re-export files
        exclude: [
          "**/*.test.ts",
          "**/*.d.ts",
          "**/index.ts", // Re-export files
          "src/__tests__/**", // Test utilities
          "src/client.ts", // Client instantiation (env-dependent)
          "src/schema/**", // Schema definitions (no logic)
          "src/seed/run.ts", // CLI runner script
        ],
      },
    },
  })
);
