/**
 * Homepage Smoke Test
 *
 * Validates that the homepage loads successfully and contains
 * expected content. This is a critical smoke test for verifying
 * the application is deployed and rendering correctly.
 *
 * @tag smoke
 * @see https://playwright.dev/docs/writing-tests
 */
import { expect, test } from "@playwright/test";

test.describe("@smoke Homepage", () => {
  test("homepage loads successfully with expected title", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for DOM to be ready (troubleshooting recommendation from story)
    await page.waitForLoadState("domcontentloaded");

    // Verify page has a title - should contain MK3 or similar branding
    await expect(page).toHaveTitle(/MK3/i);
  });

  test("homepage has visible h1 heading", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify there is a visible h1 heading
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("homepage body is not empty", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify the body has content
    const bodyContent = page.locator("body");
    await expect(bodyContent).not.toBeEmpty();
  });

  test("homepage loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds (generous for cold starts/preview deploys)
    expect(loadTime).toBeLessThan(10000);
  });

  test("homepage has no critical console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors before navigation
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Filter out known benign errors
    const criticalErrors = consoleErrors.filter((error) => {
      const benignPatterns = [
        /favicon/i, // Favicon-related warnings are ok
        /hydration/i, // React hydration warnings in dev mode
      ];
      return !benignPatterns.some((pattern) => pattern.test(error));
    });

    expect(criticalErrors).toHaveLength(0);
  });

  test("homepage responds to viewport changes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const bodyMobile = page.locator("body");
    await expect(bodyMobile).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    const bodyDesktop = page.locator("body");
    await expect(bodyDesktop).toBeVisible();
  });
});
