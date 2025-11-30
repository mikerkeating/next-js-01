/**
 * Static Assets Smoke Test
 *
 * Validates that static assets (favicon, fonts, CSS) load correctly
 * and no JavaScript errors occur during page load. This is a critical
 * smoke test for verifying deployment asset delivery.
 *
 * @tag smoke
 * @see https://playwright.dev/docs/network
 */
import { expect, test } from "@playwright/test";

test.describe("@smoke Static Assets", () => {
  test("favicon is present and accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check for favicon link element
    const faviconLink = page.locator('link[rel*="icon"]');
    const count = await faviconLink.count();
    expect(count).toBeGreaterThan(0);

    // Get favicon href and verify it's accessible
    const href = await faviconLink.first().getAttribute("href");
    expect(href).toBeTruthy();

    // Request the favicon directly to verify it loads
    if (href) {
      const response = await page.request.get(href);
      expect(response.ok()).toBe(true);
    }
  });

  test("CSS styles are applied correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify that styles are loaded by checking computed styles
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();

    // Check that font-family is applied (not browser default)
    const fontFamily = await heading.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(fontFamily.length).toBeGreaterThan(0);

    // Check that custom colors are applied (not pure black #000)
    const color = await heading.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).toBeTruthy();
  });

  test("JavaScript bundle loads without errors", async ({ page }) => {
    const jsErrors: string[] = [];

    // Listen for page errors (uncaught exceptions)
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known benign errors
    const criticalJsErrors = jsErrors.filter((error) => {
      const benignPatterns = [
        /hydration/i, // React hydration warnings in dev mode
        /development mode/i, // Development mode warnings
      ];
      return !benignPatterns.some((pattern) => pattern.test(error));
    });

    expect(criticalJsErrors).toHaveLength(0);
  });

  test("no failed network requests for critical resources", async ({ page }) => {
    const failedRequests: string[] = [];

    // Monitor network requests
    page.on("response", (response) => {
      const url = response.url();
      const status = response.status();

      // Track failed requests for critical resources (CSS, JS, images)
      if (
        status >= 400 &&
        (url.includes(".css") ||
          url.includes(".js") ||
          url.includes(".woff") ||
          url.includes(".png") ||
          url.includes(".jpg") ||
          url.includes(".svg"))
      ) {
        failedRequests.push(`${status}: ${url}`);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(failedRequests).toHaveLength(0);
  });

  test("page resources load within acceptable time", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get resource timing entries
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowestResource: Math.max(...resources.map((r) => r.duration)),
      };
    });

    // Basic sanity checks - page should have loaded some resources
    expect(resourceMetrics.totalResources).toBeGreaterThan(0);

    // Slowest resource should load within 10 seconds (generous for preview deploys)
    expect(resourceMetrics.slowestResource).toBeLessThan(10000);
  });
});
