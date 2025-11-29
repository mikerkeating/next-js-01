/**
 * Vitest configuration for the @repo/testing package.
 *
 * This config is self-contained to avoid cyclic dependencies with @repo/config.
 *
 * @see https://vitest.dev/config/
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Package-specific test configuration
    name: "testing",

    // Root directory for tests
    root: __dirname,

    // Enable global APIs (describe, it, expect) without imports
    globals: true,

    // Use happy-dom for React component tests
    environment: "happy-dom",

    // Test file patterns to discover
    include: ["**/*.test.ts", "**/*.test.tsx"],

    // Files to exclude from testing
    exclude: ["**/node_modules/**", "**/dist/**"],

    // Setup files run before each test file
    setupFiles: ["./vitest.setup.ts"],

    // Timeout for each test (in ms)
    testTimeout: 10000,
  },
});
