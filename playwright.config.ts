/**
 * Playwright Configuration
 *
 * Configures cross-browser E2E testing for the mk3-platform monorepo.
 * Tests run against Chrome, Firefox, and WebKit (Safari) browsers.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
import { defineConfig, devices } from "@playwright/test";

/**
 * Base URL for tests. Can be overridden via BASE_URL environment variable
 * to test against preview deployments or staging environments.
 */
const baseURL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Whether running in CI environment. Controls retry behavior and other
 * CI-specific settings.
 */
const isCI = !!process.env.CI;

export default defineConfig({
  // Test directory containing E2E specs
  testDir: "./tests/e2e",

  // Output directory for test artifacts (screenshots, videos, traces)
  outputDir: "testing/e2e/results",

  // Global test timeout (30 seconds per test)
  timeout: 30_000,

  // Expect timeout for assertions
  expect: {
    timeout: 5_000,
  },

  // Run tests in parallel - better performance
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in code
  forbidOnly: isCI,

  // Retry failed tests to reduce flakiness impact
  // 2 retries in CI, 0 locally for faster feedback
  retries: isCI ? 2 : 0,

  // Limit parallel workers in CI to prevent resource exhaustion
  workers: isCI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    // Always output to console
    ["list"],
    // HTML report for detailed analysis
    ["html", { outputFolder: "testing/e2e/report", open: "never" }],
    // JSON report for CI integration
    ...(isCI ? [["json", { outputFile: "testing/e2e/results/report.json" }] as const] : []),
  ],

  // Shared settings for all browser projects
  use: {
    // Base URL for navigation - configurable via BASE_URL env var
    baseURL,

    // Capture trace on first retry - helps debug flaky tests
    trace: "on-first-retry",

    // Capture screenshot only when test fails - reduces artifact size
    screenshot: "only-on-failure",

    // Retain video only when test fails - reduces artifact size
    video: "retain-on-failure",

    // Viewport for consistent rendering across browsers
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors for local development only
    ignoreHTTPSErrors: !isCI,
  },

  // Browser projects for cross-browser testing
  projects: [
    // Smoke test projects - fast deployment validation
    // All tests in ./tests/e2e/smoke are smoke tests
    {
      name: "smoke-chromium",
      use: { ...devices["Desktop Chrome"] },
      testDir: "./tests/e2e/smoke",
    },
    {
      name: "smoke-firefox",
      use: { ...devices["Desktop Firefox"] },
      testDir: "./tests/e2e/smoke",
    },
    {
      name: "smoke-webkit",
      use: { ...devices["Desktop Safari"] },
      testDir: "./tests/e2e/smoke",
    },

    // Full E2E test projects (excluding smoke tests to avoid duplication)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /smoke/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /smoke/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /smoke/,
    },
  ],

  // Do not run local dev server - tests run against running instance or preview URL
  // webServer: undefined - tests expect app to be running or use BASE_URL
});
