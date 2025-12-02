/**
 * Database Client Configuration
 *
 * This file initializes the Drizzle ORM client with automatic driver selection
 * based on the DATABASE_URL format:
 * - Neon URLs (.neon.tech) -> Neon HTTP driver (edge-compatible, serverless)
 * - Local URLs (localhost, 127.0.0.1) -> postgres.js driver
 *
 * Per AD-2A.2.S9.1: URL-based driver selection means developers only need
 * to change DATABASE_URL to switch between local and cloud databases.
 *
 * Configuration choices per ADR-005 and AD-2A.2.S2.1/AD-2A.2.S2.2:
 * - Uses Neon HTTP driver for production/edge compatibility
 * - Uses postgres.js for local development (lighter weight, ESM-first)
 * - Enables fetchConnectionCache in production for connection optimization
 * - Passes schema object to enable relational query API
 *
 * @see https://orm.drizzle.team/docs/get-started-postgresql#neon
 * @see https://orm.drizzle.team/docs/get-started-postgresql#postgresjs
 */
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

import { getDatabaseType } from "./client-factory";
import { createLocalClient } from "./client-local";
import * as schema from "./schema/index";

/**
 * Unified database type that works with both Neon and local clients.
 * Both drivers provide the same Drizzle API surface.
 */
export type Database = ReturnType<typeof drizzleNeon<typeof schema>>;

/**
 * Validates that DATABASE_URL environment variable is present.
 * Throws an error if not configured to fail fast during initialization.
 */
function validateDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required. " +
        "Please configure it in your .env.local file or environment."
    );
  }

  return databaseUrl;
}

/**
 * Configures Neon connection settings based on environment.
 *
 * Per AD-2A.2.S2.2:
 * - Production: Enable fetchConnectionCache for optimized connections (<100ms target)
 * - Development: Disable caching for fresh connections during schema changes
 */
function configureNeonConnection(): void {
  // Enable connection caching in production for better performance
  // This caches the fetch connection to reduce latency for subsequent queries
  // Check both VERCEL_ENV (Vercel deployments) and NODE_ENV (other production deployments)
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    neonConfig.fetchConnectionCache = true;
  }
}

/**
 * Creates a Neon database client using the HTTP driver.
 * Used for production/cloud deployments and Neon databases.
 */
function createNeonClient(databaseUrl: string): Database {
  // Configure Neon-specific settings
  configureNeonConnection();

  // Create the Neon SQL client
  const sql = neon(databaseUrl);

  // Create and return Drizzle instance with schema for relational queries
  // Type assertion needed to unify Database type across client implementations
  return drizzleNeon({ client: sql, schema }) as unknown as Database;
}

/**
 * Creates the appropriate database client based on DATABASE_URL.
 *
 * Detection logic per AD-2A.2.S9.1:
 * - URLs containing .neon.tech -> Neon HTTP driver
 * - URLs with localhost/127.0.0.1 -> postgres.js driver
 * - Other URLs -> Default to Neon HTTP driver (for other cloud providers)
 */
function createDatabaseClient(): Database {
  const databaseUrl = validateDatabaseUrl();
  const dbType = getDatabaseType(databaseUrl);

  if (dbType === "local") {
    // Use postgres.js for local development
    // Type assertion needed as both clients implement the same interface
    // but TypeScript sees them as different types
    return createLocalClient(databaseUrl) as unknown as Database;
  }

  // Log warning for unknown URL patterns to help diagnose configuration issues
  if (dbType === "unknown") {
    console.warn(
      "[database] Unknown DATABASE_URL pattern detected. Falling back to Neon HTTP driver. " +
        "If this is unexpected, verify your DATABASE_URL is correct. " +
        "Recognized patterns: *.neon.tech (Neon), localhost/127.0.0.1 (local)"
    );
  }

  // Use Neon HTTP driver for Neon URLs and unknown URLs
  // Unknown URLs default to Neon as it works with standard PostgreSQL
  return createNeonClient(databaseUrl);
}

/**
 * Database instance configured with Drizzle ORM.
 *
 * The client is automatically selected based on DATABASE_URL:
 * - Neon URLs (.neon.tech) use the Neon HTTP driver
 * - Local URLs (localhost, 127.0.0.1) use postgres.js
 *
 * Usage:
 * ```typescript
 * import { db } from '@repo/database';
 * import { users } from '@repo/database/schema';
 * import { eq } from 'drizzle-orm';
 *
 * // Simple query
 * const user = await db.query.users.findFirst({
 *   where: eq(users.email, 'user@example.com')
 * });
 *
 * // Insert
 * const newUser = await db.insert(users).values({...}).returning();
 * ```
 *
 * @remarks
 * The schema object is passed to enable:
 * - Relational query API (`db.query.*`)
 * - Type inference for all operations
 * - Autocomplete in IDEs
 */
export const db = createDatabaseClient();
