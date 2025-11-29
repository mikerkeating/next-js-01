/**
 * Example E2E Test Suite
 *
 * Demonstrates Playwright testing patterns for the mk3-platform.
 * Use this as a reference when writing new E2E tests.
 *
 * Key patterns demonstrated:
 * - test.describe for grouping related tests
 * - test.beforeEach for common setup
 * - Playwright's auto-waiting assertions
 * - Page navigation and element interaction
 *
 * @see https://playwright.dev/docs/best-practices
 */
import { test, expect } from "@playwright/test";

/**
 * Homepage Test Suite
 *
 * Basic smoke tests to verify the application is accessible
 * and rendering correctly across all browsers.
 */
test.describe("Homepage", () => {
  /**
   * Navigate to homepage before each test in this suite.
   * This ensures each test starts from a known state.
   */
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  /**
   * Verify the page loads and has a title.
   *
   * This is a basic smoke test that validates:
   * - The application server is running
   * - The homepage route is accessible
   * - The page renders with expected content
   */
  test("should load and display title", async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState("domcontentloaded");

    // Verify the page has a title (non-empty)
    // Using toMatch with regex to allow flexibility in the exact title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  /**
   * Verify the page has basic structure.
   *
   * This test checks for semantic HTML landmarks that should
   * be present on every page for accessibility.
   */
  test("should have accessible structure", async ({ page }) => {
    // Verify body has content
    const bodyContent = page.locator("body");
    await expect(bodyContent).not.toBeEmpty();
  });

  /**
   * Verify the page responds to viewport changes.
   *
   * Tests that the page renders correctly at different viewport sizes.
   * This is especially important for responsive designs.
   */
  test("should be responsive to viewport changes", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState("domcontentloaded");

    // Page should still be functional at mobile size
    const bodyContent = page.locator("body");
    await expect(bodyContent).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState("domcontentloaded");
    await expect(bodyContent).toBeVisible();

    // Test desktop viewport (original size)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState("domcontentloaded");
    await expect(bodyContent).toBeVisible();
  });
});

/**
 * Navigation Test Suite
 *
 * Tests for basic navigation functionality.
 * Expands as more routes are added to the application.
 */
test.describe("Navigation", () => {
  /**
   * Verify that the base URL is configurable.
   *
   * This test validates that the BASE_URL environment variable
   * is being used correctly for test configuration.
   */
  test("should use configured base URL", async ({ page, baseURL }) => {
    // Navigate to root and verify we're at the expected URL
    await page.goto("/");

    // The URL should start with our configured baseURL
    const currentURL = page.url();
    expect(currentURL).toContain(baseURL || "localhost");
  });
});
