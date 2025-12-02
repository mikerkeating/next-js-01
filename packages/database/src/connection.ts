/**
 * Connection Utilities
 *
 * Provides health check and retry utilities for resilient database connections.
 * Designed for serverless and edge environments where connections may fail transiently.
 *
 * @example
 * ```typescript
 * import { checkDatabaseHealth, withRetry, ConnectionError } from '@repo/database';
 *
 * // Health check
 * const health = await checkDatabaseHealth();
 * if (health.status === 'healthy') {
 *   console.log(`Database latency: ${health.latencyMs}ms`);
 * }
 *
 * // Retry wrapper
 * const result = await withRetry(
 *   () => db.query.users.findFirst({ where: eq(users.id, userId) }),
 *   { maxAttempts: 3, baseDelayMs: 100 }
 * );
 * ```
 *
 * @packageDocumentation
 */
import { sql } from "drizzle-orm";

import { db } from "./client";

/**
 * Result of a database health check operation.
 */
export interface HealthCheckResult {
  /** Current health status */
  status: "healthy" | "unhealthy";
  /** Query execution time in milliseconds */
  latencyMs: number;
  /** ISO 8601 timestamp of when the check was performed */
  timestamp: string;
  /** Error message if unhealthy */
  error?: string;
}

/**
 * Options for the health check operation.
 */
export interface HealthCheckOptions {
  /** Maximum time to wait for health check in milliseconds. Default: 5000ms */
  timeoutMs?: number;
}

/**
 * Options for configuring retry behavior.
 */
export interface RetryOptions {
  /** Maximum number of attempts (including initial). Default: 3 */
  maxAttempts?: number;
  /** Base delay between retries in milliseconds. Default: 100ms */
  baseDelayMs?: number;
  /** Callback invoked on each retry with the error and attempt number */
  onRetry?: (error: Error, attempt: number) => void;
  /** Function to determine if an error should trigger a retry. Default: always true */
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Error codes for connection-related failures.
 */
export type ConnectionErrorCode =
  | "CONNECTION_FAILED"
  | "CONNECTION_TIMEOUT"
  | "DB_UNAVAILABLE"
  | "QUERY_FAILED"
  | "RETRY_EXHAUSTED";

/**
 * Custom error class for database connection failures.
 * Provides additional context through error codes for programmatic handling.
 */
export class ConnectionError extends Error {
  /** Unique error code for programmatic handling */
  readonly code: ConnectionErrorCode;

  constructor(message: string, code: ConnectionErrorCode, cause?: Error) {
    super(message);
    this.name = "ConnectionError";
    this.code = code;
    this.cause = cause;
    // Capture stack trace for V8 environments (Node.js, Chrome)
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ConnectionError);
    }
  }
}

/** Default health check timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 5000;

/** Default retry options */
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, "onRetry">> &
  Pick<RetryOptions, "onRetry"> = {
  maxAttempts: 3,
  baseDelayMs: 100,
  onRetry: undefined,
  shouldRetry: () => true,
};

/**
 * Performs a health check on the database connection.
 *
 * Executes a simple `SELECT 1` query to verify database connectivity and
 * measures the round-trip latency. Returns a structured result indicating
 * whether the database is healthy or unhealthy.
 *
 * @param options - Configuration options for the health check
 * @returns A promise resolving to the health check result
 *
 * @example
 * ```typescript
 * const health = await checkDatabaseHealth();
 *
 * if (health.status === 'healthy') {
 *   console.log(`Database is healthy. Latency: ${health.latencyMs}ms`);
 * } else {
 *   console.error(`Database unhealthy: ${health.error}`);
 * }
 * ```
 */
export async function checkDatabaseHealth(
  options: HealthCheckOptions = {}
): Promise<HealthCheckResult> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const startTime = Date.now();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new ConnectionError("Health check timeout exceeded", "CONNECTION_TIMEOUT"));
      }, timeoutMs);
    });

    // Execute simple health check query
    // Using SELECT 1 as it's the minimal query to verify connectivity
    const queryPromise = db.execute(sql`SELECT 1`);

    // Race between the query and the timeout
    await Promise.race([queryPromise, timeoutPromise]);

    const latencyMs = Date.now() - startTime;

    return {
      status: "healthy",
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      status: "unhealthy",
      latencyMs,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Waits for a specified delay.
 *
 * @param ms - Delay in milliseconds
 * @returns A promise that resolves after the delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates exponential backoff delay.
 *
 * The delay increases exponentially with each attempt:
 * - Attempt 1: baseDelayMs * 1 = baseDelayMs
 * - Attempt 2: baseDelayMs * 2 = baseDelayMs * 2
 * - Attempt 3: baseDelayMs * 4 = baseDelayMs * 4
 *
 * @param attempt - Current attempt number (1-indexed)
 * @param baseDelayMs - Base delay in milliseconds
 * @returns The calculated delay in milliseconds
 */
function calculateBackoffDelay(attempt: number, baseDelayMs: number): number {
  // Exponential backoff: baseDelay * 2^(attempt-1)
  return baseDelayMs * Math.pow(2, attempt - 1);
}

/**
 * Wraps an async operation with retry logic and exponential backoff.
 *
 * Automatically retries failed operations up to the configured maximum attempts,
 * using exponential backoff to reduce load during transient failures.
 * Provides hooks for monitoring retry behavior.
 *
 * @typeParam T - The return type of the operation
 * @param operation - The async function to execute with retry logic
 * @param options - Configuration options for retry behavior
 * @returns A promise resolving to the operation result
 * @throws The last error if all retry attempts are exhausted
 *
 * @example
 * ```typescript
 * // Basic usage
 * const user = await withRetry(
 *   () => db.query.users.findFirst({ where: eq(users.id, userId) })
 * );
 *
 * // With custom options and retry monitoring
 * const result = await withRetry(
 *   () => fetchFromExternalApi(),
 *   {
 *     maxAttempts: 5,
 *     baseDelayMs: 200,
 *     onRetry: (error, attempt) => {
 *       console.warn(`Retry ${attempt}: ${error.message}`);
 *     },
 *     shouldRetry: (error) => error.message !== 'Invalid credentials'
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mergedOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const { maxAttempts, baseDelayMs, onRetry, shouldRetry } = mergedOptions;

  let lastError: Error = new Error("Operation failed");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // If this was the last attempt, don't wait
      if (attempt === maxAttempts) {
        break;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Wait with exponential backoff before next attempt
      const delayMs = calculateBackoffDelay(attempt, baseDelayMs);
      await delay(delayMs);
    }
  }

  // All attempts exhausted, throw the last error
  throw lastError;
}
