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

    // Verify page has a non-empty title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("homepage has visible h1 heading", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify there is a visible h1 heading
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("MK3 Platform");
  });

  test("homepage contains expected content elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify main content container is visible
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Verify description paragraph contains expected text
    const description = page.locator("p").filter({ hasText: "Next.js" });
    await expect(description).toBeVisible();
    await expect(description).toContainText("TypeScript");

    // Verify primary CTA/badge is visible with expected text
    const ctaBadge = page.locator("text=Steel Thread Complete");
    await expect(ctaBadge).toBeVisible();
  });

  test("homepage loads within acceptable time", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    // Use Navigation Timing API to measure actual browser load metrics
    const navigationTiming = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (!entry) return null;
      return {
        duration: entry.duration,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime,
        loadEventEnd: entry.loadEventEnd - entry.startTime,
      };
    });

    expect(navigationTiming).not.toBeNull();
    // Page should load within 10 seconds (generous for cold starts/preview deploys)
    expect(navigationTiming!.loadEventEnd).toBeLessThan(10000);
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

    const heading = page.locator("h1").first();
    const main = page.locator("main");
    const ctaBadge = page.locator("text=Steel Thread Complete");

    // Test mobile viewport (375px - below Tailwind's sm breakpoint of 640px)
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify key elements are visible on mobile
    await expect(heading).toBeVisible();
    await expect(main).toBeVisible();
    await expect(ctaBadge).toBeVisible();

    // Get mobile heading font size (should be text-4xl = 2.25rem = 36px)
    const mobileFontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);

    // Test desktop viewport (1280px - above Tailwind's sm breakpoint)
    await page.setViewportSize({ width: 1280, height: 720 });

    // Verify key elements remain visible on desktop
    await expect(heading).toBeVisible();
    await expect(main).toBeVisible();
    await expect(ctaBadge).toBeVisible();

    // Get desktop heading font size (should be sm:text-6xl = 3.75rem = 60px)
    const desktopFontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);

    // Verify responsive font size change occurred
    const mobileSize = parseFloat(mobileFontSize);
    const desktopSize = parseFloat(desktopFontSize);
    expect(desktopSize).toBeGreaterThan(mobileSize);
  });
});
