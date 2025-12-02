/**
 * Test Database Client
 *
 * Provides a transaction-capable database client for integration tests.
 * Automatically selects the appropriate driver based on DATABASE_URL:
 * - Neon URLs: Uses Neon Pool API (WebSocket) for transaction support
 * - Local URLs: Uses postgres.js for direct PostgreSQL connection
 *
 * Key features:
 * - Separate test database connection via DATABASE_URL_TEST
 * - Transaction-based test isolation with automatic rollback
 * - Connection pooling for parallel test execution
 *
 * @example
 * ```typescript
 * import { createTestDatabase, createTestTransaction } from './__tests__/test-client';
 *
 * // Get a test database client
 * const testDb = await createTestDatabase();
 *
 * // Run operations in a transaction that will be rolled back
 * await createTestTransaction(async (tx) => {
 *   await tx.insert(users).values({ ... });
 *   // Test assertions here
 * }); // Transaction is rolled back after callback completes
 * ```
 *
 * @packageDocumentation
 */
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseType } from "../client-factory";
import * as schema from "../schema/index";

import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

/**
 * Type for the test database instance with transaction support.
 * Uses a union type to support both Neon and postgres.js drivers.
 */
export type TestDatabase = NeonDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;

/**
 * Type for a transaction client that can be used within test transactions.
 */
export type TestTransactionClient = Parameters<Parameters<TestDatabase["transaction"]>[0]>[0];

/**
 * Shared pool instance for Neon test connections.
 * Lazily initialized on first use.
 */
let neonTestPool: Pool | null = null;

/**
 * Shared postgres.js client for local test connections.
 * Lazily initialized on first use.
 */
let postgresTestClient: ReturnType<typeof postgres> | null = null;

/**
 * Test database instance.
 * Lazily initialized on first use.
 */
let testDb: TestDatabase | null = null;

/**
 * Cached database type to avoid re-parsing URL.
 */
let cachedDbType: "neon" | "local" | "unknown" | null = null;

/**
 * Gets the test database URL from environment.
 *
 * Checks DATABASE_URL_TEST first, then falls back to DATABASE_URL.
 * This allows CI environments to use a single DATABASE_URL variable.
 *
 * @throws Error if neither DATABASE_URL_TEST nor DATABASE_URL is configured
 */
function getTestDatabaseUrl(): string {
  const testUrl = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

  if (!testUrl) {
    throw new Error(
      "DATABASE_URL_TEST or DATABASE_URL environment variable is required for integration tests. " +
        "Either configure it or set SKIP_DB_TESTS=true to skip database tests."
    );
  }

  return testUrl;
}

/**
 * Checks if database tests should be skipped.
 *
 * Returns true if:
 * - SKIP_DB_TESTS is set to 'true'
 * - Neither DATABASE_URL_TEST nor DATABASE_URL is configured
 */
export function shouldSkipDatabaseTests(): boolean {
  if (process.env.SKIP_DB_TESTS === "true") {
    return true;
  }

  return !process.env.DATABASE_URL_TEST && !process.env.DATABASE_URL;
}

/**
 * Interface for WebSocket constructor that we need from ws package.
 * This avoids importing ws types directly which may not be installed.
 */
type WebSocketLike = new (url: string) => unknown;

/**
 * Lazily loads the ws module for WebSocket support.
 * This allows the test infrastructure to be imported even if ws is not installed.
 */
async function loadWebSocket(): Promise<WebSocketLike> {
  try {
    // Dynamic import to avoid breaking when ws is not installed
    // Using string variable to prevent TypeScript from trying to resolve the module
    const moduleName = "ws";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const wsModule: { default: WebSocketLike } = await import(moduleName);
    return wsModule.default;
  } catch {
    throw new Error(
      "The 'ws' package is required for Neon test database transactions. " +
        "Install it with: pnpm add -D ws @types/ws --filter @repo/database"
    );
  }
}

/**
 * Creates a Neon database client with WebSocket support.
 * Used for Neon URLs (*.neon.tech).
 */
async function createNeonTestClient(): Promise<NeonDatabase<typeof schema>> {
  if (!neonTestPool) {
    // Enable WebSocket for transaction support
    const wsConstructor = await loadWebSocket();
    // Cast to expected type - neonConfig expects typeof WebSocket but ws is compatible
    neonConfig.webSocketConstructor = wsConstructor as unknown as typeof WebSocket;

    neonTestPool = new Pool({
      connectionString: getTestDatabaseUrl(),
      // Use small pool size for tests
      max: 5,
    });
  }

  return drizzleNeon({ client: neonTestPool, schema });
}

/**
 * Creates a postgres.js database client.
 * Used for local URLs (localhost, 127.0.0.1, etc.).
 */
function createLocalTestClient(): PostgresJsDatabase<typeof schema> {
  if (!postgresTestClient) {
    postgresTestClient = postgres(getTestDatabaseUrl(), {
      // Use small pool size for tests
      max: 5,
      // Enable prepared statements
      prepare: true,
      // Connect timeout - fail fast if DB is not available
      connect_timeout: 10,
      // Idle timeout
      idle_timeout: 20,
    });
  }

  return drizzlePostgres({ client: postgresTestClient, schema });
}

/**
 * Creates or returns the shared test database client.
 *
 * Automatically selects the appropriate driver based on DATABASE_URL:
 * - Neon URLs use the Neon WebSocket driver for transaction support
 * - Local URLs use postgres.js for direct PostgreSQL connection
 *
 * @returns A promise resolving to the test database client
 *
 * @example
 * ```typescript
 * const testDb = await createTestDatabase();
 * const users = await testDb.query.users.findMany();
 * ```
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  if (testDb) {
    return testDb;
  }

  const databaseUrl = getTestDatabaseUrl();
  cachedDbType = getDatabaseType(databaseUrl);

  if (cachedDbType === "neon") {
    testDb = await createNeonTestClient();
  } else {
    // Use postgres.js for local and unknown URLs
    // Unknown URLs default to postgres.js as it works with standard PostgreSQL
    testDb = createLocalTestClient();
  }

  return testDb;
}

/**
 * Result of a test transaction execution.
 */
export interface TestTransactionResult<T> {
  /** Whether the transaction completed successfully (before rollback) */
  success: boolean;
  /** The result from the transaction callback (if successful) */
  result?: T;
  /** Error message if the transaction failed */
  error?: string;
}

/**
 * Custom error class for intentional transaction rollback.
 * Used to distinguish intentional rollbacks from actual errors.
 */
class TestRollbackError extends Error {
  constructor() {
    super("Test transaction rollback");
    this.name = "TestRollbackError";
  }
}

/**
 * Executes a callback within a database transaction that is automatically rolled back.
 *
 * This is the primary mechanism for test isolation. Each test can run database
 * operations within a transaction, and all changes are rolled back after the
 * test completes (regardless of success or failure).
 *
 * @typeParam T - The return type of the callback
 * @param callback - Async function that receives the transaction client
 * @returns A promise resolving to the transaction result
 *
 * @example
 * ```typescript
 * const result = await createTestTransaction(async (tx) => {
 *   // Insert test data
 *   const [user] = await tx.insert(users).values({
 *     email: 'test@example.com',
 *     name: 'Test User',
 *   }).returning();
 *
 *   // Query and assert
 *   const found = await tx.query.users.findFirst({
 *     where: eq(users.id, user.id),
 *   });
 *
 *   expect(found).toBeDefined();
 *   return user;
 * });
 *
 * // Transaction is rolled back - no data persisted
 * expect(result.success).toBe(true);
 * ```
 */
export async function createTestTransaction<T>(
  callback: (tx: TestTransactionClient) => Promise<T>
): Promise<TestTransactionResult<T>> {
  const db = await createTestDatabase();

  let callbackResult: T | undefined;
  let callbackError: string | undefined;
  let callbackSuccess = false;

  try {
    await db.transaction(async (tx) => {
      try {
        // Execute the test callback
        callbackResult = await callback(tx);
        callbackSuccess = true;
      } catch (error) {
        // Capture callback error but don't prevent rollback
        callbackError = error instanceof Error ? error.message : String(error);
        callbackSuccess = false;
      }

      // Always throw to trigger rollback
      throw new TestRollbackError();
    });
  } catch (error) {
    // Ignore intentional rollback error
    if (!(error instanceof TestRollbackError)) {
      // Re-throw unexpected errors
      throw error;
    }
  }

  return {
    success: callbackSuccess,
    result: callbackResult,
    error: callbackError,
  };
}

/**
 * Interface for managing a test transaction lifecycle in beforeEach/afterEach hooks.
 */
export interface TestTransactionContext {
  /** The transaction client for database operations */
  client: TestTransactionClient | null;
  /** Start a new transaction (call in beforeEach) */
  begin: () => Promise<void>;
  /** Rollback the transaction (call in afterEach) */
  rollback: () => Promise<void>;
}

/**
 * Creates a test transaction context for use with Vitest hooks.
 *
 * This provides fine-grained control over transaction lifecycle,
 * useful when you need the transaction client available across
 * multiple test steps.
 *
 * @returns A transaction context object with begin/rollback methods
 *
 * @example
 * ```typescript
 * const txContext = createTestTransactionContext();
 *
 * beforeEach(async () => {
 *   await txContext.begin();
 * });
 *
 * afterEach(async () => {
 *   await txContext.rollback();
 * });
 *
 * it('creates a user', async () => {
 *   const tx = txContext.client!;
 *   await tx.insert(users).values({ ... });
 * });
 * ```
 */
export function createTestTransactionContext(): TestTransactionContext {
  let transactionClient: TestTransactionClient | null = null;
  let rollbackFn: (() => void) | null = null;
  let transactionPromise: Promise<void> | null = null;

  return {
    get client(): TestTransactionClient | null {
      return transactionClient;
    },

    async begin(): Promise<void> {
      if (transactionClient) {
        throw new Error("Transaction already started. Call rollback() first.");
      }

      const db = await createTestDatabase();

      // Create a promise that will be resolved when rollback is called
      transactionPromise = new Promise<void>((resolve, reject) => {
        db.transaction(async (tx) => {
          transactionClient = tx;

          // Wait for rollback to be called
          await new Promise<void>((resolveRollback) => {
            rollbackFn = resolveRollback;
          });

          // Throw to trigger rollback
          throw new TestRollbackError();
        })
          .catch((error: unknown) => {
            if (error instanceof TestRollbackError) {
              resolve();
            } else {
              // Wrap non-Error values in an Error for proper rejection
              const errorToReject =
                error instanceof Error
                  ? error
                  : new Error(typeof error === "string" ? error : "Transaction failed");
              reject(errorToReject);
            }
          })
          .finally(() => {
            transactionClient = null;
            rollbackFn = null;
          });
      });
    },

    async rollback(): Promise<void> {
      if (rollbackFn) {
        rollbackFn();
        await transactionPromise;
      }
      transactionClient = null;
      rollbackFn = null;
      transactionPromise = null;
    },
  };
}

/**
 * Closes the test database connection pool.
 *
 * Call this in a global teardown to clean up connections.
 */
export async function closeTestDatabase(): Promise<void> {
  if (neonTestPool) {
    await neonTestPool.end();
    neonTestPool = null;
  }

  if (postgresTestClient) {
    await postgresTestClient.end();
    postgresTestClient = null;
  }

  testDb = null;
  cachedDbType = null;
}
