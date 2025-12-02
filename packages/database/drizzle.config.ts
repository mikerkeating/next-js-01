/**
 * Drizzle Kit Configuration
 *
 * This file configures Drizzle Kit for migration generation and management.
 * See ADR-005 for rationale on Drizzle ORM selection and configuration choices.
 *
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for Drizzle Kit commands");
}

export default defineConfig({
  // Schema location - all schema definitions are exported from this file
  schema: "./src/schema/index.ts",

  // Migration output directory
  out: "./src/migrations",

  // Database dialect - using PostgreSQL via Neon serverless
  dialect: "postgresql",

  // Database connection credentials
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // Enable verbose output for detailed migration information
  verbose: true,

  // Enable strict mode for stricter schema validation
  strict: true,
});
