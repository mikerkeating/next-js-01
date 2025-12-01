/**
 * @repo/database - Database schema, client, and utilities
 *
 * This package provides the database layer for the monorepo using Drizzle ORM
 * with PostgreSQL (via Neon serverless).
 *
 * @packageDocumentation
 */

// Re-export schema definitions
export * from "./schema/index";

// Note: Database client and connection utilities will be added in subsequent stories:
// - S2: Configure Drizzle ORM and Client
// - S3: Implement Connection Utilities
