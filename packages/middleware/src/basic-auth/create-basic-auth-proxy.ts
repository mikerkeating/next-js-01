/**
 * Factory function for creating Basic Auth proxy middleware.
 *
 * @module create-basic-auth-proxy
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { BasicAuthProxyOptions, BasicAuthProxyResult } from "./types";
import {
  createBypassChecker,
  decodeBase64,
  generateMatcherPattern,
  timingSafeEqual,
  unauthorizedResponse,
} from "./utils";

/**
 * Default bypass paths for Next.js applications.
 */
const DEFAULT_BYPASS_PATHS = ["/_next/*", "/favicon.ico"];

/**
 * Creates a Basic Auth proxy middleware with the specified configuration.
 *
 * @param options - Configuration options for the proxy
 * @returns An object containing the proxy handler, config, and bypass checker
 *
 * @example
 * ```typescript
 * // In your middleware.ts or proxy.ts
 * import { createBasicAuthProxy } from '@repo/middleware/basic-auth';
 *
 * const { proxy, config } = createBasicAuthProxy({
 *   realm: 'My App',
 *   bypassPaths: ['/_next/*', '/api/health', '/favicon.ico'],
 * });
 *
 * export { proxy, config };
 * ```
 */
export function createBasicAuthProxy(options: BasicAuthProxyOptions = {}): BasicAuthProxyResult {
  const {
    realm = "Secure Area",
    usernameEnvVar = "BASIC_AUTH_USERNAME",
    passwordEnvVar = "BASIC_AUTH_PASSWORD",
    bypassPaths = DEFAULT_BYPASS_PATHS,
    bypassStaticFiles = true,
  } = options;

  // Create the bypass checker function
  const shouldBypassAuth = createBypassChecker(bypassPaths, bypassStaticFiles);

  // Generate the matcher pattern
  const matcherPattern = generateMatcherPattern(bypassPaths, bypassStaticFiles);

  /**
   * The proxy handler function.
   */
  function proxy(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    // Bypass authentication for excluded paths
    if (shouldBypassAuth(pathname)) {
      return NextResponse.next();
    }

    const username = process.env[usernameEnvVar];
    const password = process.env[passwordEnvVar];

    // If credentials are not configured, allow request through (development convenience)
    if (!username || !password) {
      return NextResponse.next();
    }

    // Get the Authorization header
    const authHeader = request.headers.get("authorization");

    // If no auth header or not Basic auth, prompt for credentials
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return unauthorizedResponse(realm);
    }

    // Decode and validate credentials
    const base64Credentials = authHeader.substring(6); // Remove "Basic " prefix
    const credentials = decodeBase64(base64Credentials);

    if (credentials === null) {
      // Invalid base64 encoding
      return unauthorizedResponse(realm);
    }

    const colonIndex = credentials.indexOf(":");
    if (colonIndex === -1) {
      return unauthorizedResponse(realm);
    }

    const providedUsername = credentials.substring(0, colonIndex);
    const providedPassword = credentials.substring(colonIndex + 1);

    // Validate credentials using timing-safe comparison
    if (
      !timingSafeEqual(providedUsername, username) ||
      !timingSafeEqual(providedPassword, password)
    ) {
      return unauthorizedResponse(realm);
    }

    // Credentials valid, allow request through
    return NextResponse.next();
  }

  return {
    proxy,
    config: {
      matcher: [matcherPattern],
    },
    shouldBypassAuth,
  };
}
