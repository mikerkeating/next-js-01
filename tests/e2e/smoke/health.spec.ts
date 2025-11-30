/**
 * Health Endpoint Smoke Test
 *
 * Validates that the /api/health endpoint is accessible and returns
 * the expected JSON structure. This is a critical smoke test for
 * verifying deployment health.
 *
 * @tag smoke
 * @see https://playwright.dev/docs/api-testing
 */
import { expect, test } from "@playwright/test";

test.describe("@smoke Health Endpoint", () => {
  test("GET /api/health returns 200 OK with valid JSON", async ({ request }) => {
    const response = await request.get("/api/health");

    // Verify HTTP status - 200 OK for healthy/degraded, 503 for unhealthy
    const status = response.status();
    expect([200, 503]).toContain(status);

    // Verify response is valid JSON
    const body = await response.json();
    expect(body).toBeDefined();

    // Verify required fields are present
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("environment");
    expect(body).toHaveProperty("checks");
    expect(body).toHaveProperty("uptime");
  });

  test("health response has valid status value", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    // Status should be one of the expected values
    expect(["healthy", "degraded", "unhealthy"]).toContain(body.status);
  });

  test("health response includes service checks", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    // Verify checks object contains expected services
    expect(body.checks).toHaveProperty("database");
    expect(body.checks).toHaveProperty("auth");
    expect(body.checks).toHaveProperty("cache");

    // Each service check should have a status
    expect(body.checks.database).toHaveProperty("status");
    expect(body.checks.auth).toHaveProperty("status");
    expect(body.checks.cache).toHaveProperty("status");
  });

  test("health timestamp is valid ISO date", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    // Verify timestamp is a valid ISO date string
    const timestamp = new Date(body.timestamp);
    expect(timestamp.toISOString()).toBe(body.timestamp);
  });

  test("health uptime is a positive number", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    // Uptime should be a non-negative number (seconds since server start)
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});
