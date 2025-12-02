/**
 * Basic Authentication Proxy
 *
 * Uses the shared @repo/middleware package for Basic Auth protection.
 * When BASIC_AUTH_USERNAME or BASIC_AUTH_PASSWORD are not set:
 * - Returns 500 Internal Server Error (fail-fast security behavior)
 * - This prevents accidental exposure without authentication
 *
 * Bypasses (no auth required):
 * - /api/health - Health check endpoint for monitoring (exact match only)
 * - /_next/* - Next.js static assets and internals
 * - Static file extensions (.svg, .png, .jpg, etc.)
 */

import { createBasicAuthProxy } from '@repo/middleware/basic-auth';

const { proxy: proxyHandler } = createBasicAuthProxy({
  realm: 'Secure Area',
  bypassPaths: ['/api/health', '/api/debug-env', '/_next/*', '/favicon.ico'],
  bypassStaticFiles: true,
});

export function proxy(request: import('next/server').NextRequest) {
  return proxyHandler(request);
}

// Config must be statically defined - cannot be re-exported from factory
export const config = {
  matcher: [
    // Match all paths except bypassed ones
    '/((?!api/health|api/debug-env|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)',
  ],
};
