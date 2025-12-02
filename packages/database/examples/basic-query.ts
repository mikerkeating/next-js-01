#!/usr/bin/env npx tsx
/* eslint-disable no-console */
/**
 * Basic Query Example
 *
 * Demonstrates type-safe database queries using @repo/database.
 * This example shows health checks, retry logic, and basic CRUD operations.
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable set
 *   - Database migrations applied
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx examples/basic-query.ts
 *
 * Or from the package directory:
 *   pnpm exec tsx examples/basic-query.ts
 */

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { checkDatabaseHealth, withRetry, createId, isValidId } from "../src/index";

// Example schema definition (normally in src/schema/)
const _users = pgTable("example_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

type _User = typeof _users.$inferSelect;
type NewUser = typeof _users.$inferInsert;

/**
 * Health Check Example
 *
 * Always verify database connectivity before operations.
 */
async function demonstrateHealthCheck(): Promise<void> {
  console.log("\n--- Health Check ---");

  const health = await checkDatabaseHealth({ timeoutMs: 5000 });

  if (health.status === "healthy") {
    console.log(`Database is healthy`);
    console.log(`  Latency: ${health.latencyMs}ms`);
    console.log(`  Timestamp: ${health.timestamp}`);
  } else {
    console.error(`Database is unhealthy: ${health.error}`);
    throw new Error("Cannot proceed without healthy database");
  }
}

/**
 * Retry Logic Example
 *
 * Wrap database operations with retry for resilience.
 */
async function demonstrateRetryLogic(): Promise<void> {
  console.log("\n--- Retry Logic ---");

  const result = await withRetry(
    async () => {
      // This query will be retried if it fails
      const health = await checkDatabaseHealth();
      return health;
    },
    {
      maxAttempts: 3,
      baseDelayMs: 100,
      onRetry: (error, attempt) => {
        console.log(`  Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );

  console.log(`  Query succeeded: ${result.status}`);
}

/**
 * ID Generation Example
 *
 * Generate and validate URL-safe identifiers.
 */
function demonstrateIdGeneration(): string {
  console.log("\n--- ID Generation ---");

  // Generate a new ID
  const newId = createId();
  console.log(`  Generated ID: ${newId}`);
  console.log(`  ID length: ${newId.length} characters`);

  // Validate IDs
  console.log(`  Valid ID check (new ID): ${isValidId(newId)}`);
  console.log(`  Valid ID check ("abc"): ${isValidId("abc")}`);
  console.log(`  Valid ID check (""): ${isValidId("")}`);

  return newId;
}

/**
 * CRUD Operations Example
 *
 * Demonstrates Create, Read, Update operations.
 * Note: This example uses a temporary table that would need to be created first.
 */
function demonstrateCrudOperations(): void {
  console.log("\n--- CRUD Operations (simulated) ---");

  // CREATE: Insert a new user
  const newUser: NewUser = {
    id: createId(),
    email: `user.${Date.now()}@example.com`,
    name: "Example User",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log("  CREATE:");
  console.log(`    Would insert: ${JSON.stringify(newUser, null, 2)}`);

  // The actual insert would be:
  // const [insertedUser] = await db.insert(users).values(newUser).returning();

  // READ: Query users
  console.log("\n  READ:");
  console.log("    Query: db.select().from(users).orderBy(desc(users.createdAt))");

  // The actual query would be:
  // const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  // READ: Find by ID
  console.log("\n  READ (by ID):");
  console.log("    Query: db.select().from(users).where(eq(users.id, userId))");

  // The actual query would be:
  // const user = await db.select().from(users).where(eq(users.id, newUser.id)).limit(1);

  // UPDATE: Modify a user
  console.log("\n  UPDATE:");
  console.log("    Query: db.update(users).set({ name, updatedAt }).where(eq(users.id, id))");

  // The actual update would be:
  // await db.update(users)
  //   .set({ name: 'Updated Name', updatedAt: new Date() })
  //   .where(eq(users.id, newUser.id));
}

/**
 * Type-Safe Query Patterns
 *
 * Shows how TypeScript ensures correct usage.
 */
function demonstrateTypeSafety(): void {
  console.log("\n--- Type Safety ---");

  // Inferred types from schema
  console.log("  User type includes: id, email, name, createdAt, updatedAt");

  // The compiler catches mistakes:
  // - users.nonExistent  // Error: Property doesn't exist
  // - users.id = 'x'     // Error: Cannot assign to read-only

  console.log("  TypeScript prevents:");
  console.log("    - Accessing non-existent columns");
  console.log("    - Wrong data types in inserts/updates");
  console.log("    - Missing required fields");
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log("=".repeat(50));
  console.log("@repo/database - Basic Query Example");
  console.log("=".repeat(50));

  try {
    // Verify database connection
    await demonstrateHealthCheck();

    // Show retry logic
    await demonstrateRetryLogic();

    // Show ID generation
    demonstrateIdGeneration();

    // Show CRUD patterns (simulated)
    demonstrateCrudOperations();

    // Show type safety
    demonstrateTypeSafety();

    console.log("\n" + "=".repeat(50));
    console.log("Example completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\nExample failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
main().catch((error: unknown) => {
  console.error("Unexpected error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
