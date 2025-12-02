#!/usr/bin/env node
/**
 * Seed Script CLI Entry Point
 *
 * This script is executed via `pnpm run db:seed` to populate the database
 * with seed data based on the current NODE_ENV.
 *
 * Usage:
 *   NODE_ENV=development pnpm run db:seed  # Development seeds (rich dataset)
 *   NODE_ENV=test pnpm run db:seed         # Test seeds (minimal dataset)
 *   NODE_ENV=staging pnpm run db:seed      # Staging seeds (production-like)
 *
 * @packageDocumentation
 */

import { main, type SeedDefinition } from "./index";

/**
 * Define your seed functions here.
 *
 * This is a placeholder for the generic seed framework.
 * Product-specific seeds (users, organizations, etc.) should be added
 * in Epic 2B.1 when actual schema tables are available.
 *
 * Example:
 * ```typescript
 * const seeds: SeedDefinition[] = [
 *   {
 *     name: 'users',
 *     seed: async (config) => {
 *       const users = createUserData({ _count: config.counts.users });
 *       await db.insert(usersTable).values(users);
 *       return { count: users.length };
 *     },
 *   },
 *   {
 *     name: 'organizations',
 *     seed: async (config) => {
 *       const orgs = createOrganizationData({ _count: config.counts.organizations });
 *       await db.insert(organizationsTable).values(orgs);
 *       return { count: orgs.length };
 *     },
 *   },
 * ];
 * ```
 */
const seeds: SeedDefinition[] = [
  // Placeholder seed that demonstrates the framework works
  // Replace with actual seeds when schema tables are available
  {
    name: "demo",
    seed: (config) => {
      console.warn(`[demo] Would seed with config: ${JSON.stringify(config.counts)}`);
      console.warn("[demo] No actual tables to seed yet - this is a framework placeholder");
      return Promise.resolve({ count: 0 });
    },
  },
];

// Run the seeds
main(seeds).catch((error: unknown) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
