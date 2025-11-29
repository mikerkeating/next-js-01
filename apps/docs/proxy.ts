import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Basic Authentication Proxy for Documentation Site
 *
 * Provides HTTP Basic Auth protection for pre-release documentation.
 * Auth is disabled when BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set,
 * allowing local development without credentials.
 *
 * Adapted from apps/routing/src/proxy.ts
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

  const [providedUsername, providedPassword] = credentials.split(":");

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
      "WWW-Authenticate": 'Basic realm="Documentation"',
      "Content-Type": "text/plain",
    },
  });
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Compares strings in constant time regardless of where they differ.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to maintain constant time
    // Using volatile pattern to prevent optimizer from removing the comparison
    let _dummy = 0;
    for (let i = 0; i < a.length; i++) {
      _dummy |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    // Use _dummy to prevent dead code elimination (volatile read)
    if (_dummy < -1) return true; // Never true, but compiler can't prove it
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Proxy matcher configuration.
 * Excludes routes that should bypass authentication:
 * - /_next/static - Next.js static assets
 * - /_next/image - Next.js image optimization
 * - /favicon.ico - Favicon
 * - Static file extensions (.svg, .png, .jpg, .ico, .css, .js, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - Files with extensions (static assets)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
  ],
};
