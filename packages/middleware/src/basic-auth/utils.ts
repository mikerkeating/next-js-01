/**
 * Utility functions for Basic Auth middleware.
 */

import { createHash, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

/**
 * Common static file extensions to bypass authentication.
 * These are matched at the end of the path to avoid false positives
 * on versioned API paths like /api/v1.2/users.
 */
const STATIC_FILE_EXTENSIONS = [
  // Styles
  "css",
  // Scripts
  "js",
  "mjs",
  "cjs",
  // Images
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
  "webp",
  "avif",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  // Data/Documents
  "json",
  "xml",
  "txt",
  "pdf",
  // Media
  "webm",
  "mp4",
  "mp3",
  "ogg",
  "wav",
  // Source maps
  "map",
] as const;

/**
 * Regex pattern matching common static file extensions at the end of a path.
 */
const STATIC_FILE_REGEX = new RegExp(`\\.(${STATIC_FILE_EXTENSIONS.join("|")})$`, "i");

/**
 * Regex pattern string for use in Next.js matcher (without anchors, case-insensitive handled separately).
 */
const STATIC_FILE_MATCHER_PATTERN = `.*\\.(${STATIC_FILE_EXTENSIONS.join("|")})`;

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
 * Normalizes a path to ensure it starts with a single leading slash.
 *
 * @param path - The path to normalize
 * @returns The normalized path with a leading slash
 */
function normalizePath(path: string): string {
  // Remove leading slashes and add exactly one
  return "/" + path.replace(/^\/+/, "");
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
    // Normalize the pathname for consistent comparison
    const normalizedPathname = normalizePath(pathname);

    // Check explicit bypass paths
    for (const path of bypassPaths) {
      if (path.endsWith("/*")) {
        // Prefix match: normalize and remove trailing '*'
        const prefix = normalizePath(path.slice(0, -1)); // Remove '*', then normalize
        if (normalizedPathname.startsWith(prefix)) {
          return true;
        }
      } else {
        // Exact match: normalize both paths
        const normalizedPath = normalizePath(path);
        if (normalizedPathname === normalizedPath) {
          return true;
        }
      }
    }

    // Check for static files (common file extensions at end of path)
    if (bypassStaticFiles && STATIC_FILE_REGEX.test(normalizedPathname)) {
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
    // Normalize the path first, then extract the pattern without leading slash
    const normalized = normalizePath(path.endsWith("/*") ? path.slice(0, -2) : path);
    const withoutLeadingSlash = normalized.slice(1); // Remove leading /

    if (path.endsWith("/*")) {
      // Prefix pattern
      patterns.push(escapeRegex(withoutLeadingSlash));
    } else {
      // Exact path pattern
      patterns.push(escapeRegex(withoutLeadingSlash));
    }
  }

  // Add static file pattern if needed (matches common extensions at end of path)
  if (bypassStaticFiles) {
    patterns.push(STATIC_FILE_MATCHER_PATTERN);
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
