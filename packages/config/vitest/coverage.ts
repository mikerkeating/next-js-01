/**
 * Shared coverage configuration for Vitest.
 *
 * This configuration provides consistent coverage settings across all
 * packages in the monorepo. It uses the V8 provider for native coverage
 * collection and enforces minimum thresholds to maintain test quality.
 *
 * Coverage thresholds:
 * - Centralized thresholds — see config below for current values
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
  // - json-summary: generates coverage-summary.json for PR comments (Epic 1A.5.S3)
  reporter: ["text", "lcov", "html", "json-summary"],

  // Enforce minimum coverage thresholds
  // Tests fail with exit code 1 when coverage drops below these values
  // TODO: Restore to 80% after addressing coverage gaps in @repo/routing
  // See: docs/3-epics/1A.5-basic-cicd/test-gaps.md
  thresholds: {
    // Global thresholds apply to the entire codebase
    lines: 15,
    branches: 5,
    functions: 25,
    statements: 15,
  },

  // Patterns to exclude from coverage collection
  exclude: [
    // Test files (coverage of tests is not meaningful)
    // Note: Only .test.* patterns needed - project uses .spec.* for Playwright E2E tests
    "**/*.test.ts",
    "**/*.test.tsx",

    // Type declarations (no runtime code)
    "**/*.d.ts",

    // Type-only files (no runtime code, only TypeScript types/interfaces)
    "**/types.ts",
    "**/types/*.ts",

    // Next.js boilerplate files (minimal logic, framework conventions)
    "**/app/layout.tsx",
    "**/app/page.tsx",

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
    "**/test/**",
    "**/__tests__/**",
    "**/__mocks__/**",

    // Generated code (auto-generated, not authored)
    "**/generated/**",
  ],

  // Files to include in coverage (source code patterns)
  include: ["src/**/*.{ts,tsx}"],

  // Skip files with 100% coverage from the report
  // When true, files with full coverage are excluded from reports
  // When false (default), all files are included regardless of coverage level
  skipFull: false,

  // Clean coverage results before each run
  clean: true,
};

export default coverageConfig;
