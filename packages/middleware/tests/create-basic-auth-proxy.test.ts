/**
 * Tests for Basic Auth Proxy middleware factory.
 *
 * Tests the createBasicAuthProxy function including:
 * - Configuration options
 * - Credential validation
 * - Bypass path handling
 * - Error scenarios
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

import { createBasicAuthProxy } from "../src/basic-auth/create-basic-auth-proxy";

/**
 * Helper to create a mock NextRequest with a given pathname and optional headers.
 */
function createMockRequest(pathname: string, headers?: Record<string, string>): NextRequest {
  const url = new URL(pathname, "http://localhost:3000");
  return new NextRequest(url, {
    headers: new Headers(headers),
  });
}

/**
 * Helper to create Basic Auth header value.
 */
function basicAuthHeader(username: string, password: string): string {
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${credentials}`;
}

describe("createBasicAuthProxy", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("factory function", () => {
    it("returns proxy function, config, and shouldBypassAuth", () => {
      const result = createBasicAuthProxy();

      expect(result.proxy).toBeDefined();
      expect(typeof result.proxy).toBe("function");

      expect(result.config).toBeDefined();
      expect(result.config.matcher).toBeInstanceOf(Array);

      expect(result.shouldBypassAuth).toBeDefined();
      expect(typeof result.shouldBypassAuth).toBe("function");
    });

    it("uses default options when none provided", () => {
      const { shouldBypassAuth, config } = createBasicAuthProxy();

      // Default bypass paths: /_next/*, /favicon.ico
      expect(shouldBypassAuth("/_next/static/main.js")).toBe(true);
      expect(shouldBypassAuth("/favicon.ico")).toBe(true);
      expect(shouldBypassAuth("/dashboard")).toBe(false);

      // Config should have a matcher pattern
      expect(config.matcher.length).toBe(1);
    });

    it("accepts custom bypassPaths", () => {
      const { shouldBypassAuth } = createBasicAuthProxy({
        bypassPaths: ["/api/health", "/public/*"],
      });

      expect(shouldBypassAuth("/api/health")).toBe(true);
      expect(shouldBypassAuth("/public/assets/logo.png")).toBe(true);
      // Default paths should still work due to bypassStaticFiles default
      expect(shouldBypassAuth("/favicon.ico")).toBe(true); // static file
    });

    it("respects bypassStaticFiles option", () => {
      const { shouldBypassAuth } = createBasicAuthProxy({
        bypassPaths: [],
        bypassStaticFiles: false,
      });

      // Static files should NOT bypass when disabled
      expect(shouldBypassAuth("/logo.png")).toBe(false);
      expect(shouldBypassAuth("/styles.css")).toBe(false);
    });
  });

  describe("proxy function - bypass paths", () => {
    it("allows bypass paths without authentication", () => {
      process.env.BASIC_AUTH_USERNAME = "admin";
      process.env.BASIC_AUTH_PASSWORD = "secret";

      const { proxy } = createBasicAuthProxy({
        bypassPaths: ["/api/health"],
      });

      const request = createMockRequest("/api/health");
      const response = proxy(request);

      // NextResponse.next() returns a response with no special status
      expect(response.status).toBe(200);
    });

    it("allows static files without authentication when enabled", () => {
      process.env.BASIC_AUTH_USERNAME = "admin";
      process.env.BASIC_AUTH_PASSWORD = "secret";

      const { proxy } = createBasicAuthProxy({
        bypassStaticFiles: true,
      });

      const request = createMockRequest("/images/logo.png");
      const response = proxy(request);

      expect(response.status).toBe(200);
    });
  });

  describe("proxy function - missing credentials configuration", () => {
    it("returns 500 when username not configured", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      delete process.env.BASIC_AUTH_USERNAME;
      process.env.BASIC_AUTH_PASSWORD = "secret";

      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard");
      const response = proxy(request);

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0]?.[0]).toContain("BASIC_AUTH_USERNAME");

      consoleErrorSpy.mockRestore();
    });

    it("returns 500 when password not configured", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      process.env.BASIC_AUTH_USERNAME = "admin";
      delete process.env.BASIC_AUTH_PASSWORD;

      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard");
      const response = proxy(request);

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0]?.[0]).toContain("BASIC_AUTH_PASSWORD");

      consoleErrorSpy.mockRestore();
    });

    it("returns 500 when both credentials not configured", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      delete process.env.BASIC_AUTH_USERNAME;
      delete process.env.BASIC_AUTH_PASSWORD;

      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard");
      const response = proxy(request);

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("allows through when allowUnauthenticatedWhenMisconfigured is true", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      delete process.env.BASIC_AUTH_USERNAME;
      delete process.env.BASIC_AUTH_PASSWORD;

      const { proxy } = createBasicAuthProxy({
        allowUnauthenticatedWhenMisconfigured: true,
      });
      const request = createMockRequest("/dashboard");
      const response = proxy(request);

      expect(response.status).toBe(200);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0]?.[0]).toContain("WARNING");

      consoleWarnSpy.mockRestore();
    });
  });

  describe("proxy function - authentication", () => {
    beforeEach(() => {
      process.env.BASIC_AUTH_USERNAME = "admin";
      process.env.BASIC_AUTH_PASSWORD = "secretpassword";
    });

    it("returns 401 when no Authorization header", () => {
      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard");
      const response = proxy(request);

      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toContain("Basic realm=");
    });

    it("returns 401 when Authorization header is not Basic auth", () => {
      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: "Bearer token123",
      });
      const response = proxy(request);

      expect(response.status).toBe(401);
    });

    it("returns 401 when credentials are invalid base64", () => {
      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: "Basic not-valid-base64!!!",
      });
      const response = proxy(request);

      // Even invalid base64 doesn't throw in Buffer.from, but credentials won't match
      expect(response.status).toBe(401);
    });

    it("returns 401 when credentials have no colon separator", () => {
      const { proxy } = createBasicAuthProxy();
      const noColonCredentials = Buffer.from("invalidcredentials").toString("base64");
      const request = createMockRequest("/dashboard", {
        authorization: `Basic ${noColonCredentials}`,
      });
      const response = proxy(request);

      expect(response.status).toBe(401);
    });

    it("returns 401 when username is incorrect", () => {
      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("wronguser", "secretpassword"),
      });
      const response = proxy(request);

      expect(response.status).toBe(401);
    });

    it("returns 401 when password is incorrect", () => {
      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("admin", "wrongpassword"),
      });
      const response = proxy(request);

      expect(response.status).toBe(401);
    });

    it("allows request with correct credentials", () => {
      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("admin", "secretpassword"),
      });
      const response = proxy(request);

      expect(response.status).toBe(200);
    });

    it("handles passwords with colons", () => {
      process.env.BASIC_AUTH_PASSWORD = "secret:with:colons";

      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("admin", "secret:with:colons"),
      });
      const response = proxy(request);

      expect(response.status).toBe(200);
    });

    it("handles empty username and password", () => {
      process.env.BASIC_AUTH_USERNAME = "";
      process.env.BASIC_AUTH_PASSWORD = "";

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { proxy } = createBasicAuthProxy();
      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("", ""),
      });
      const response = proxy(request);

      // Empty credentials should trigger the "not configured" path (falsy check)
      expect(response.status).toBe(500);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("proxy function - custom options", () => {
    it("uses custom realm in 401 response", () => {
      process.env.BASIC_AUTH_USERNAME = "admin";
      process.env.BASIC_AUTH_PASSWORD = "secret";

      const { proxy } = createBasicAuthProxy({
        realm: "My Custom App",
      });

      const request = createMockRequest("/dashboard");
      const response = proxy(request);

      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toBe('Basic realm="My Custom App"');
    });

    it("uses custom environment variable names", () => {
      process.env.MY_APP_USER = "customuser";
      process.env.MY_APP_PASS = "custompass";

      const { proxy } = createBasicAuthProxy({
        usernameEnvVar: "MY_APP_USER",
        passwordEnvVar: "MY_APP_PASS",
      });

      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("customuser", "custompass"),
      });
      const response = proxy(request);

      expect(response.status).toBe(200);
    });

    it("fails with wrong credentials when using custom env vars", () => {
      process.env.MY_APP_USER = "customuser";
      process.env.MY_APP_PASS = "custompass";
      process.env.BASIC_AUTH_USERNAME = "defaultuser";
      process.env.BASIC_AUTH_PASSWORD = "defaultpass";

      const { proxy } = createBasicAuthProxy({
        usernameEnvVar: "MY_APP_USER",
        passwordEnvVar: "MY_APP_PASS",
      });

      // Using default credentials should fail
      const request = createMockRequest("/dashboard", {
        authorization: basicAuthHeader("defaultuser", "defaultpass"),
      });
      const response = proxy(request);

      expect(response.status).toBe(401);
    });
  });

  describe("config output", () => {
    it("generates matcher pattern for Next.js middleware config", () => {
      const { config } = createBasicAuthProxy({
        bypassPaths: ["/api/health", "/_next/*"],
      });

      expect(config.matcher).toHaveLength(1);
      expect(typeof config.matcher[0]).toBe("string");
      expect(config.matcher[0]).toContain("api/health");
      expect(config.matcher[0]).toContain("_next");
    });
  });
});
