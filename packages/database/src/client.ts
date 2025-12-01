/**
 * Database Client Configuration
 *
 * This file initializes the Drizzle ORM client with the Neon HTTP driver
 * for edge-compatible, serverless PostgreSQL connections.
 *
 * Configuration choices per ADR-005 and AD-2A.2.S2.1/AD-2A.2.S2.2:
 * - Uses Neon HTTP driver for universal edge compatibility
 * - Enables fetchConnectionCache in production for connection optimization
 * - Passes schema object to enable relational query API
 *
 * @see https://orm.drizzle.team/docs/get-started-postgresql#neon
 */
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema/index";

import type { NeonQueryFunction } from "@neondatabase/serverless";

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
  if (process.env.VERCEL_ENV === "production") {
    neonConfig.fetchConnectionCache = true;
  }
}

// Initialize configuration
configureNeonConnection();

// Create the Neon SQL client with explicit type annotation
// The type assertion is required due to variance mismatch between
// @neondatabase/serverless and drizzle-orm/neon-http generic types
const sql: NeonQueryFunction<boolean, boolean> = neon(validateDatabaseUrl());

/**
 * Database instance configured with Drizzle ORM.
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
export const db = drizzle(sql, { schema });

/**
 * Type export for the database instance.
 * Useful for typing function parameters that accept the database.
 */
export type Database = typeof db;
