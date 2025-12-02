/**
 * Database Client Factory
 *
 * Provides URL-based detection to determine the appropriate database driver.
 * Per AD-2A.2.S9.1: Auto-detect database driver based on DATABASE_URL format
 * rather than requiring a separate environment variable.
 *
 * Supported database types:
 * - Neon: URLs containing `.neon.tech` domain
 * - Local: URLs pointing to localhost, 127.0.0.1, or Docker host
 *
 * @see https://orm.drizzle.team/docs/get-started-postgresql#neon
 * @see https://orm.drizzle.team/docs/get-started-postgresql#node-postgres
 */

/**
 * Database connection type based on URL pattern.
 *
 * - 'neon': Neon serverless PostgreSQL (uses HTTP driver)
 * - 'local': Local PostgreSQL (uses postgres.js driver)
 * - 'unknown': Unrecognized URL pattern
 */
export type DatabaseType = "neon" | "local" | "unknown";

/**
 * Pattern to match Neon database URLs.
 * Neon URLs contain `.neon.tech` in the hostname.
 *
 * Examples:
 * - postgres://user:pass@ep-example-123.us-east-1.aws.neon.tech/neondb
 * - postgres://user:pass@ep-example-123-pooler.eu-central-1.aws.neon.tech/neondb
 */
const NEON_URL_PATTERN = /\.neon\.tech/i;

/**
 * Pattern to match Neon pooler URLs.
 * Pooler URLs have `-pooler` suffix before the region in the hostname.
 *
 * Example: ep-example-123-pooler.eu-west-2.aws.neon.tech
 */
const NEON_POOLER_PATTERN = /-pooler\./i;

/**
 * Patterns to match local PostgreSQL URLs.
 * Matches localhost, loopback IPs, and Docker internal host.
 */
const LOCAL_URL_PATTERNS = [
  /localhost/i,
  /127\.0\.0\.1/,
  /\[::1\]/, // IPv6 localhost
  /host\.docker\.internal/i,
];

/**
 * Checks if a database URL points to a Neon database.
 *
 * Neon URLs are identified by the `.neon.tech` domain in the hostname.
 * This is the most reliable way to detect Neon connections as all Neon
 * endpoints use this domain pattern.
 *
 * @param url - The database connection URL to check
 * @returns true if the URL is a Neon database URL
 *
 * @example
 * ```typescript
 * isNeonUrl('postgres://user:pass@ep-example.us-east-1.aws.neon.tech/db'); // true
 * isNeonUrl('postgres://postgres:postgres@localhost:5432/postgres'); // false
 * ```
 */
export function isNeonUrl(url: string): boolean {
  return NEON_URL_PATTERN.test(url);
}

/**
 * Checks if a database URL points to a local PostgreSQL instance.
 *
 * Local URLs are identified by hostnames that indicate local development:
 * - localhost
 * - 127.0.0.1 (IPv4 loopback)
 * - [::1] (IPv6 loopback)
 * - host.docker.internal (Docker for Mac/Windows)
 *
 * @param url - The database connection URL to check
 * @returns true if the URL points to a local database
 *
 * @example
 * ```typescript
 * isLocalPostgresUrl('postgres://postgres:postgres@localhost:5432/postgres'); // true
 * isLocalPostgresUrl('postgres://user:pass@ep-example.neon.tech/db'); // false
 * ```
 */
export function isLocalPostgresUrl(url: string): boolean {
  // Don't match remote URLs that happen to contain local-like patterns
  if (isNeonUrl(url)) {
    return false;
  }

  return LOCAL_URL_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Determines the database type from a connection URL.
 *
 * Per AD-2A.2.S9.1: URL-based driver selection means developers only need
 * to change DATABASE_URL to switch between local and Neon databases.
 *
 * Detection priority:
 * 1. Neon URLs (contain .neon.tech)
 * 2. Local URLs (localhost, 127.0.0.1, Docker host)
 * 3. Unknown (all other URLs)
 *
 * @param url - The database connection URL to analyze
 * @returns The detected database type
 *
 * @example
 * ```typescript
 * getDatabaseType('postgres://user:pass@ep-example.neon.tech/db'); // 'neon'
 * getDatabaseType('postgres://postgres:postgres@localhost:5432/postgres'); // 'local'
 * getDatabaseType('postgres://user:pass@some.other.host/db'); // 'unknown'
 * ```
 */
export function getDatabaseType(url: string): DatabaseType {
  if (!url) {
    return "unknown";
  }

  // Check for Neon first (most specific pattern)
  if (isNeonUrl(url)) {
    return "neon";
  }

  // Check for local development patterns
  if (isLocalPostgresUrl(url)) {
    return "local";
  }

  // Unrecognized URL pattern
  return "unknown";
}

/**
 * Checks if a Neon URL is using the connection pooler.
 *
 * Neon pooler URLs have `-pooler` in the hostname. The pooler is optimized
 * for serverless environments but has limitations:
 * - No session-mode operations (DDL, transactions, prepared statements)
 * - Read-only mode may be enforced for certain operations
 *
 * @param url - The database connection URL to check
 * @returns true if the URL uses the Neon pooler
 *
 * @example
 * ```typescript
 * isNeonPoolerUrl('postgres://user:pass@ep-example-pooler.neon.tech/db'); // true
 * isNeonPoolerUrl('postgres://user:pass@ep-example.neon.tech/db'); // false
 * ```
 */
export function isNeonPoolerUrl(url: string): boolean {
  return isNeonUrl(url) && NEON_POOLER_PATTERN.test(url);
}

/**
 * Converts a Neon pooler URL to a direct connection URL.
 *
 * Neon pooler URLs have limitations for session-based operations like
 * transactions and DDL statements. This function transforms a pooler URL
 * to a direct connection URL that supports all PostgreSQL features.
 *
 * Use this for operations that require:
 * - Transactions with rollback capability
 * - DDL statements (CREATE TABLE, ALTER TABLE, etc.)
 * - Prepared statements
 *
 * @param url - The Neon database URL (pooler or direct)
 * @returns The direct connection URL (pooler suffix removed if present)
 *
 * @example
 * ```typescript
 * // Pooler URL gets converted to direct
 * toNeonDirectUrl('postgres://user:pass@ep-example-pooler.eu-west-2.aws.neon.tech/db');
 * // Returns: 'postgres://user:pass@ep-example.eu-west-2.aws.neon.tech/db'
 *
 * // Direct URLs pass through unchanged
 * toNeonDirectUrl('postgres://user:pass@ep-example.us-east-1.aws.neon.tech/db');
 * // Returns: 'postgres://user:pass@ep-example.us-east-1.aws.neon.tech/db'
 *
 * // Non-Neon URLs pass through unchanged
 * toNeonDirectUrl('postgres://postgres:postgres@localhost:5432/postgres');
 * // Returns: 'postgres://postgres:postgres@localhost:5432/postgres'
 * ```
 */
export function toNeonDirectUrl(url: string): string {
  if (!isNeonUrl(url)) {
    return url;
  }

  // Remove the -pooler suffix from the hostname
  // e.g., ep-example-123-pooler.eu-west-2.aws.neon.tech -> ep-example-123.eu-west-2.aws.neon.tech
  return url.replace(/-pooler\./i, ".");
}
