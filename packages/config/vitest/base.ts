/**
 * Shared Vitest configuration for all packages in the monorepo.
 *
 * This base configuration provides consistent test settings across all apps
 * and packages. Individual vitest.config.ts files should extend this base
 * and add app-specific settings like path aliases.
 *
 * Includes coverage configuration for enforcing quality thresholds.
 * Coverage is collected when running `pnpm test:coverage`.
 *
 * @see https://vitest.dev/config/
 * @see https://vitest.dev/guide/coverage.html
 */
import { defineConfig } from "vitest/config";

import { coverageConfig } from "./coverage";

export const baseConfig = defineConfig({
  test: {
    // Enable global APIs (describe, it, expect) without imports
    globals: true,

    // Default test environment for DOM-based tests
    // Individual packages can override to 'node' for non-DOM tests
    environment: "happy-dom",

    // Test file patterns to discover
    include: ["**/*.test.ts", "**/*.test.tsx"],

    // Files to exclude from testing
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**"],

    // Watch mode configuration
    watch: true,

    // Enable better test output
    reporters: ["default"],

    // Pool configuration for running tests in parallel
    pool: "threads",

    // Timeout for each test (in ms)
    testTimeout: 10000,

    // Timeout for hooks (beforeEach, afterEach, etc.)
    hookTimeout: 10000,

    // Coverage configuration from shared settings
    // Activated when running with --coverage flag
    coverage: coverageConfig,
  },
});

export default baseConfig;
