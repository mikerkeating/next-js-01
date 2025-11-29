/**
 * Shared coverage configuration for Vitest.
 *
 * This configuration provides consistent coverage settings across all
 * packages in the monorepo. It uses the V8 provider for native coverage
 * collection and enforces minimum thresholds to maintain test quality.
 *
 * Coverage thresholds:
 * - 80% minimum for lines, branches, functions, and statements
 * - Tests fail when coverage drops below threshold (exit code 1)
 *
 * Reporters:
 * - text: Console output for local development
 * - lcov: Standard format for CI/CD integration
 * - html: Interactive browser-based report
 *
 * @see https://vitest.dev/guide/coverage.html
 */
import type { CoverageOptions } from "vitest/node";

/**
 * Coverage configuration object for merging into Vitest config.
 *
 * @example
 * ```ts
 * import { mergeConfig } from 'vitest/config';
 * import { coverageConfig } from '@repo/config/vitest/coverage';
 *
 * export default mergeConfig(baseConfig, {
 *   test: {
 *     coverage: coverageConfig,
 *   },
 * });
 * ```
 */
export const coverageConfig: CoverageOptions<"v8"> = {
  // Use V8 coverage provider for native, fast coverage collection
  // V8 is faster than Istanbul and doesn't require code transformation
  provider: "v8",

  // Disable by default - coverage is collected only when --coverage flag is used
  // This avoids performance overhead during normal test runs
  enabled: false,

  // Output directory for coverage reports
  // Each app/package will have its own coverage/ directory
  reportsDirectory: "coverage",

  // Reporter formats for different use cases:
  // - text: console output for quick local checks
  // - lcov: standard format for CI integration (Codecov, SonarQube, etc.)
  // - html: interactive report for detailed local analysis
  reporter: ["text", "lcov", "html"],

  // Enforce minimum coverage thresholds
  // Tests fail with exit code 1 when coverage drops below these values
  thresholds: {
    // Global thresholds apply to the entire codebase
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80,
  },

  // Patterns to exclude from coverage collection
  exclude: [
    // Test files (coverage of tests is not meaningful)
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",

    // Type declarations (no runtime code)
    "**/*.d.ts",

    // Configuration files (infrastructure, not business logic)
    "**/vitest.config.*",
    "**/vitest.setup.*",
    "**/vitest.workspace.*",
    "**/*.config.ts",
    "**/*.config.js",
    "**/*.config.mjs",

    // Build outputs and dependencies
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",

    // Test utilities and setup (testing infrastructure)
    "**/testing/**",
    "**/test/**",
    "**/__tests__/**",
    "**/__mocks__/**",

    // Generated code (auto-generated, not authored)
    "**/generated/**",
  ],

  // Files to include in coverage (source code patterns)
  include: ["src/**/*.{ts,tsx}"],

  // Skip coverage for files with no tests
  // This prevents artificially low coverage from untested files
  skipFull: false,

  // Clean coverage results before each run
  clean: true,
};

export default coverageConfig;
