import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for smoke tests.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only - helps with flaky tests due to cold starts */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for more consistent results */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL from environment variable with localhost fallback */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Global timeout for the entire test suite (60 seconds) */
  globalTimeout: 60000,

  /* Timeout for each test (30 seconds) */
  timeout: 30000,

  /* Configure projects for smoke tests - Chromium only for speed */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Alternative: Run local dev server (uncomment if not using Vercel previews)
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
  */
});
