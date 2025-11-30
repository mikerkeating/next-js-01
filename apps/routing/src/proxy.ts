import { timingSafeEqual as cryptoTimingSafeEqual } from "crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Basic Authentication Proxy
 *
 * Provides simple HTTP Basic Auth protection for pre-release deployments.
 * Auth is disabled when BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set.
 *
 * Bypasses:
 * - /api/health - Health check endpoint for monitoring
 * - Static assets are excluded via matcher config below
 */
export function proxy(request: NextRequest): NextResponse {
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  // If credentials are not configured, allow request through (development convenience)
  if (!username || !password) {
    return NextResponse.next();
  }

  // Get the Authorization header
  const authHeader = request.headers.get("authorization");

  // If no auth header or not Basic auth, prompt for credentials
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  // Decode and validate credentials
  const base64Credentials = authHeader.substring(6); // Remove "Basic " prefix
  let credentials: string;

  try {
    credentials = atob(base64Credentials);
  } catch {
    // Invalid base64 encoding
    return unauthorizedResponse();
  }

  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) {
    return unauthorizedResponse();
  }
  const providedUsername = credentials.substring(0, colonIndex);
  const providedPassword = credentials.substring(colonIndex + 1);

  // Validate credentials using timing-safe comparison
  if (
    !timingSafeEqual(providedUsername || "", username) ||
    !timingSafeEqual(providedPassword || "", password)
  ) {
    return unauthorizedResponse();
  }

  // Credentials valid, allow request through
  return NextResponse.next();
}

/**
 * Returns a 401 Unauthorized response with WWW-Authenticate header
 * to trigger the browser's basic auth prompt.
 */
function unauthorizedResponse(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
      "Content-Type": "text/plain",
    },
  });
}

/**
 * Timing-safe string comparison using Node.js crypto.
 * Uses constant-time comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against itself to maintain constant time
    cryptoTimingSafeEqual(bufA, bufA);
    return false;
  }
  return cryptoTimingSafeEqual(bufA, bufB);
}

/**
 * Proxy matcher configuration.
 * Excludes routes that should bypass authentication:
 * - /api/health - Health check endpoint for monitoring services
 * - /_next/* - Next.js static assets and internals
 * - /favicon.ico - Favicon
 * - Static file extensions (.svg, .png, .jpg, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/health (health check endpoint)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - Files with extensions (static assets)
     */
    "/((?!api/health|_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
  ],
};
