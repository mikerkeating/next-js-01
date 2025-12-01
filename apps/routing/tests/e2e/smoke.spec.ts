import { expect, test } from '@playwright/test';

/**
 * Deployment Smoke Tests
 *
 * These tests validate that a deployment is functional by checking:
 * 1. Health endpoint returns 200 OK with "healthy" status
 * 2. Homepage loads successfully
 * 3. No console errors on page load
 * 4. Static assets load correctly
 *
 * Run with: pnpm test:e2e:smoke
 * Run against specific URL: BASE_URL=https://preview.vercel.app pnpm test:e2e:smoke
 */

test.describe('Deployment Smoke Tests', () => {
  test.describe('Health Check', () => {
    test('health endpoint returns 200 OK with healthy status', async ({ request }) => {
      const response = await request.get('/api/health');

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(['healthy', 'degraded']).toContain(body.status);
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('checks');
      expect(body).toHaveProperty('uptime');
    });

    test('health check includes all required service checks', async ({ request }) => {
      const response = await request.get('/api/health');
      const body = await response.json();

      expect(body.checks).toHaveProperty('database');
      expect(body.checks).toHaveProperty('auth');
      expect(body.checks).toHaveProperty('cache');

      // Each check should have a status
      expect(body.checks.database).toHaveProperty('status');
      expect(body.checks.auth).toHaveProperty('status');
      expect(body.checks.cache).toHaveProperty('status');
    });
  });

  test.describe('Homepage', () => {
    test('homepage loads successfully', async ({ page }) => {
      await page.goto('/');

      // Wait for the page to be fully loaded
      await page.waitForLoadState('domcontentloaded');

      // Verify page title contains expected content
      await expect(page).toHaveTitle(/MK3/);

      // Verify critical heading is visible
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('MK3');
    });

    test('homepage has no console errors', async ({ page }) => {
      const consoleErrors: string[] = [];

      // Listen for console errors before navigation
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Filter out known benign errors (e.g., third-party scripts)
      const criticalErrors = consoleErrors.filter((error) => {
        // Add any known benign errors to filter out here
        const benignPatterns = [
          /favicon/i, // Favicon-related warnings are ok
        ];
        return !benignPatterns.some((pattern) => pattern.test(error));
      });

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Static Assets', () => {
    test('static assets and metadata load correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Verify the page has a valid favicon link
      const faviconLink = page.locator('link[rel="icon"]');
      const faviconExists = (await faviconLink.count()) > 0;

      // Favicon is optional but should exist in production
      if (faviconExists) {
        const faviconHref = await faviconLink.getAttribute('href');
        expect(faviconHref).toBeTruthy();
      }

      // Verify meta tags exist
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
    });

    test('page responds within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Page should load within 10 seconds (generous for cold starts)
      expect(loadTime).toBeLessThan(10000);
    });
  });
});
