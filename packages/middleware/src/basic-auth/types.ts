/**
 * Type definitions for Basic Auth middleware.
 */

import type { NextRequest, NextResponse } from "next/server";

/**
 * Configuration options for creating a Basic Auth proxy.
 */
export interface BasicAuthProxyOptions {
  /**
   * The realm string shown in the browser's authentication dialog.
   * @default "Secure Area"
   */
  realm?: string;

  /**
   * Environment variable name for the username.
   * @default "BASIC_AUTH_USERNAME"
   */
  usernameEnvVar?: string;

  /**
   * Environment variable name for the password.
   * @default "BASIC_AUTH_PASSWORD"
   */
  passwordEnvVar?: string;

  /**
   * Paths to bypass authentication. Used with shouldBypassAuth function.
   * These are exact path matches or prefix matches (ending with /*).
   */
  bypassPaths?: string[];

  /**
   * Whether to bypass authentication for paths with file extensions.
   * @default true
   */
  bypassStaticFiles?: boolean;

  /**
   * Whether to allow unauthenticated access when credentials are not configured.
   *
   * When false (default):
   * - In development (NODE_ENV === 'development'): Returns 500 error with warning
   * - In production: Returns 500 error to fail fast
   *
   * When true:
   * - Allows requests through without authentication (with console warning)
   * - Use only for local development or testing scenarios
   *
   * @default false
   */
  allowUnauthenticatedWhenMisconfigured?: boolean;
}

/**
 * Result of creating a Basic Auth proxy.
 */
export interface BasicAuthProxyResult {
  /**
   * The proxy handler function for use in middleware.
   */
  proxy: (request: NextRequest) => NextResponse;

  /**
   * Middleware matcher configuration for Next.js.
   * Use this in your middleware.ts exports.
   */
  config: {
    matcher: string[];
  };

  /**
   * Function to check if a path should bypass authentication.
   * Useful when using the proxy in custom middleware logic.
   */
  shouldBypassAuth: (pathname: string) => boolean;
}
