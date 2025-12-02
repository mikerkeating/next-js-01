/**
 * Local PostgreSQL Client Configuration
 *
 * This file initializes a Drizzle ORM client using postgres.js driver
 * for local development with Docker PostgreSQL.
 *
 * Per AD-2A.2.S9.2: Uses postgres.js instead of node-postgres (pg) because:
 * - Smaller bundle size (~50KB vs ~200KB)
 * - Modern ESM-first design
 * - Excellent TypeScript support
 * - Simpler connection API
 *
 * @see https://orm.drizzle.team/docs/get-started-postgresql#postgresjs
 * @see https://github.com/porsager/postgres
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index";

/**
 * Creates a local PostgreSQL database client using postgres.js.
 *
 * This client is used when DATABASE_URL points to a local PostgreSQL
 * instance (localhost, 127.0.0.1, or Docker host).
 *
 * @param databaseUrl - The PostgreSQL connection URL
 * @returns Drizzle ORM database instance
 *
 * @example
 * ```typescript
 * const db = createLocalClient('postgres://postgres:postgres@localhost:5432/postgres');
 *
 * // Query example
 * const users = await db.query.users.findMany();
 * ```
 */
export function createLocalClient(databaseUrl: string): ReturnType<typeof drizzle<typeof schema>> {
  // Create postgres.js connection
  // The connection is lazy - it only connects when queries are made
  const client = postgres(databaseUrl, {
    // Prepare statements for better performance
    prepare: true,

    // Connection pool settings for local development
    // Keep low for local dev to avoid resource exhaustion
    max: 10,

    // Idle timeout - close connections after 20 seconds of inactivity
    idle_timeout: 20,

    // Connect timeout - fail fast if local DB is not available
    connect_timeout: 10,
  });

  // Create and return Drizzle instance with schema for relational queries
  return drizzle({ client, schema });
}

/**
 * Type export for local database client.
 * Matches the type signature of the Neon client for compatibility.
 */
export type LocalDatabase = ReturnType<typeof createLocalClient>;
