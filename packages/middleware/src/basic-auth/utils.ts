/**
 * Utility functions for Basic Auth middleware.
 */

import { createHash, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

/**
 * Returns a 401 Unauthorized response with WWW-Authenticate header
 * to trigger the browser's basic auth prompt.
 *
 * @param realm - The realm string shown in the authentication dialog
 */
export function unauthorizedResponse(realm: string): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}"`,
      "Content-Type": "text/plain",
    },
  });
}

/**
 * Timing-safe string comparison using Node.js crypto.
 * Normalizes inputs to fixed-length SHA-256 digests before comparison,
 * ensuring constant-time operation regardless of input length.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
export function timingSafeEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const strA = a ?? "";
  const strB = b ?? "";
  const digestA = createHash("sha256").update(strA).digest();
  const digestB = createHash("sha256").update(strB).digest();
  return cryptoTimingSafeEqual(digestA, digestB);
}

/**
 * Decodes a base64-encoded string safely.
 *
 * @param encoded - The base64-encoded string
 * @returns The decoded string, or null if decoding fails
 */
export function decodeBase64(encoded: string): string | null {
  try {
    return Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

/**
 * Creates a function to check if a path should bypass authentication.
 *
 * @param bypassPaths - Array of paths to bypass (exact match or prefix with /*)
 * @param bypassStaticFiles - Whether to bypass paths with file extensions
 */
export function createBypassChecker(
  bypassPaths: string[],
  bypassStaticFiles: boolean
): (pathname: string) => boolean {
  return (pathname: string): boolean => {
    // Check explicit bypass paths
    for (const path of bypassPaths) {
      if (path.endsWith("/*")) {
        // Prefix match
        const prefix = path.slice(0, -1); // Remove the '*'
        if (pathname.startsWith(prefix)) {
          return true;
        }
      } else if (pathname === path) {
        // Exact match
        return true;
      }
    }

    // Check for static files (paths with extensions)
    if (bypassStaticFiles && /\.[a-zA-Z0-9]+$/.test(pathname)) {
      return true;
    }

    return false;
  };
}

/**
 * Generates a Next.js middleware matcher pattern from bypass paths.
 * Creates a negative lookahead regex that matches all paths except the bypassed ones.
 *
 * @param bypassPaths - Array of paths to bypass
 * @param bypassStaticFiles - Whether to bypass paths with file extensions
 */
export function generateMatcherPattern(bypassPaths: string[], bypassStaticFiles: boolean): string {
  const patterns: string[] = [];

  for (const path of bypassPaths) {
    if (path.endsWith("/*")) {
      // Convert /path/* to path pattern (without leading slash)
      const prefix = path.slice(1, -2); // Remove leading / and trailing /*
      patterns.push(escapeRegex(prefix));
    } else {
      // Exact path (without leading slash)
      const exactPath = path.startsWith("/") ? path.slice(1) : path;
      patterns.push(escapeRegex(exactPath));
    }
  }

  // Add static file pattern if needed
  if (bypassStaticFiles) {
    patterns.push(".*\\..+"); // Match any path with a file extension
  }

  if (patterns.length === 0) {
    // Match everything if no bypass patterns
    return "/:path*";
  }

  // Build negative lookahead pattern
  return `/((?!${patterns.join("|")}).*)`;
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
