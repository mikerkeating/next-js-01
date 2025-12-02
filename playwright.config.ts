/**
 * Playwright Configuration
 *
 * Configures cross-browser E2E testing for the mk3-platform monorepo.
 * Tests run against Chrome, Firefox, and WebKit (Safari) browsers.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

/**
 * ES module equivalent of __dirname
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment variables from .env.local if it exists.
 * Playwright doesn't auto-load .env files like Next.js does.
 *
 * Note: This uses a simple custom parser rather than the dotenv package.
 * It handles KEY=VALUE pairs (including values with = signs) and comments.
 * This is sufficient for our use case (simple basic auth credentials) and
 * avoids adding a dependency. For complex .env needs (quoted values,
 * multiline, escape sequences), consider switching to dotenv.
 */
const envLocalPath = resolve(__dirname, ".env.local");
if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    // Skip empty lines, comments, and lines without '=' (invalid KEY=VALUE format)
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      const trimmedKey = key?.trim();
      // Only set if key is non-empty and not already in process.env
      if (trimmedKey && !(trimmedKey in process.env)) {
        process.env[trimmedKey] = value;
      }
    }
  }
}

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

/**
 * Whether to ignore HTTPS certificate errors (e.g., self-signed certs).
 * Requires explicit opt-in via PLAYWRIGHT_IGNORE_HTTPS_ERRORS=true.
 *
 * Use this ONLY for:
 * - Local development with self-signed certificates
 * - Testing against local HTTPS dev servers (e.g., mkcert, self-signed)
 *
 * To enable: Set PLAYWRIGHT_IGNORE_HTTPS_ERRORS=true in your environment
 * or prefix your test command: PLAYWRIGHT_IGNORE_HTTPS_ERRORS=true pnpm test:e2e
 *
 * WARNING: Never enable in CI or production testing environments.
 */
const ignoreHTTPSErrors = process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === "true";

/**
 * HTTP Basic Auth credentials for testing against protected environments.
 * Set BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD environment variables
 * to authenticate with the basic auth proxy.
 */
const httpCredentials =
  process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD
    ? {
        username: process.env.BASIC_AUTH_USERNAME,
        password: process.env.BASIC_AUTH_PASSWORD,
      }
    : undefined;

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

    // HTTP Basic Auth credentials for protected environments
    httpCredentials,

    // Capture trace on first retry - helps debug flaky tests
    trace: "on-first-retry",

    // Capture screenshot only when test fails - reduces artifact size
    screenshot: "only-on-failure",

    // Retain video only when test fails - reduces artifact size
    video: "retain-on-failure",

    // Viewport for consistent rendering across browsers
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors only when explicitly enabled (see config comment above)
    ignoreHTTPSErrors,
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
