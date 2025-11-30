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
 * Validates Basic Auth credentials from the Authorization header.
 *
 * @param authHeader - The Authorization header value
 * @param username - Expected username
 * @param password - Expected password
 * @param realm - The authentication realm for the 401 response
 * @returns NextResponse if unauthorized, null if credentials are valid
 */
function validateCredentials(
  authHeader: string | null,
  username: string,
  password: string,
  realm: string
): NextResponse | null {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorizedResponse(realm);
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = decodeBase64(base64Credentials);

  if (credentials === null) {
    return unauthorizedResponse(realm);
  }

  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) {
    return unauthorizedResponse(realm);
  }

  const providedUsername = credentials.substring(0, colonIndex);
  const providedPassword = credentials.substring(colonIndex + 1);

  if (
    !timingSafeEqual(providedUsername, username) ||
    !timingSafeEqual(providedPassword, password)
  ) {
    return unauthorizedResponse(realm);
  }

  return null;
}

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
    allowUnauthenticatedWhenMisconfigured = false,
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

    // Handle missing credentials configuration
    if (!username || !password) {
      const missingVars = [!username && usernameEnvVar, !password && passwordEnvVar].filter(
        Boolean
      );

      if (allowUnauthenticatedWhenMisconfigured) {
        // Explicit opt-in: allow through with warning
        console.warn(
          `[BasicAuthProxy] WARNING: Missing credentials (${missingVars.join(", ")}). ` +
            "Allowing unauthenticated access because allowUnauthenticatedWhenMisconfigured is enabled. " +
            "This should only be used in development."
        );
        return NextResponse.next();
      }

      // Fail fast: return 500 to indicate server misconfiguration
      console.error(
        `[BasicAuthProxy] ERROR: Basic auth credentials not configured. ` +
          `Missing environment variables: ${missingVars.join(", ")}. ` +
          "Set these variables or use allowUnauthenticatedWhenMisconfigured for development."
      );
      return new NextResponse("Internal Server Error: Authentication not configured", {
        status: 500,
      });
    }

    const unauthorizedResult = validateCredentials(
      request.headers.get("authorization"),
      username,
      password,
      realm
    );
    if (unauthorizedResult) {
      return unauthorizedResult;
    }

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
