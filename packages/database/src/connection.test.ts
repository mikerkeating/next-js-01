/**
 * @file Connection Utilities Unit Tests
 *
 * Tests for database connection health check and retry logic utilities.
 * These tests mock the database client to test behavior without requiring
 * an actual database connection.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkDatabaseHealth,
  withRetry,
  ConnectionError,
  type HealthCheckResult,
  type RetryOptions,
} from "./connection";

// Mock the database client - factory cannot reference external variables
vi.mock("./client", () => {
  return {
    db: {
      execute: vi.fn(),
    },
  };
});

// Helper to get the mocked db.execute function
async function getMockedExecute(): Promise<ReturnType<typeof vi.fn>> {
  const { db } = await import("./client");
  return vi.mocked(db.execute);
}

describe("checkDatabaseHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns healthy status with latency when connection succeeds", async () => {
    const mockExecute = await getMockedExecute();
    // Mock successful query result (simplified - actual result structure doesn't matter for health check)
    mockExecute.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const resultPromise = checkDatabaseHealth();
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe("healthy");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();
    expect(mockExecute).toHaveBeenCalledWith(expect.any(Object));
  });

  it("returns unhealthy status with error message when connection fails", async () => {
    const mockExecute = await getMockedExecute();
    mockExecute.mockRejectedValueOnce(new Error("Connection refused"));

    const resultPromise = checkDatabaseHealth();
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe("unhealthy");
    expect(result.error).toContain("Connection refused");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns unhealthy status when DATABASE_URL is missing", async () => {
    const mockExecute = await getMockedExecute();
    mockExecute.mockRejectedValueOnce(new Error("DATABASE_URL environment variable is required"));

    const resultPromise = checkDatabaseHealth();
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.status).toBe("unhealthy");
    expect(result.error).toContain("DATABASE_URL");
  });

  it("includes timestamp in health check result", async () => {
    const mockExecute = await getMockedExecute();
    mockExecute.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const beforeCheck = new Date().toISOString();
    const resultPromise = checkDatabaseHealth();
    await vi.runAllTimersAsync();
    const result = await resultPromise;
    const afterCheck = new Date().toISOString();

    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(beforeCheck).getTime()
    );
    expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
      new Date(afterCheck).getTime()
    );
  });

  it("respects custom timeout option", async () => {
    const mockExecute = await getMockedExecute();
    // Simulate a slow query that exceeds timeout
    mockExecute.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ rows: [{ "?column?": 1 }] }), 10000);
        })
    );

    const resultPromise = checkDatabaseHealth({ timeoutMs: 1000 });

    // Advance past the timeout
    await vi.advanceTimersByTimeAsync(1500);

    const result = await resultPromise;

    expect(result.status).toBe("unhealthy");
    expect(result.error).toContain("timeout");
  });
});

describe("withRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns result immediately when operation succeeds on first try", async () => {
    const mockOperation = vi.fn().mockResolvedValue("success");

    const result = await withRetry(mockOperation);

    expect(result).toBe("success");
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it("retries operation on transient failure", async () => {
    const mockOperation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Connection reset"))
      .mockResolvedValueOnce("success");

    // Use minimal delay for fast tests
    const result = await withRetry(mockOperation, { baseDelayMs: 1 });

    expect(result).toBe("success");
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  it("retries configured number of times before failing", async () => {
    let callCount = 0;
    const mockOperation = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error("Persistent failure"));
    });

    const options: RetryOptions = { maxAttempts: 3, baseDelayMs: 1 };

    let caughtError: Error | undefined;
    try {
      await withRetry(mockOperation, options);
    } catch (error) {
      caughtError = error as Error;
    }

    expect(caughtError?.message).toBe("Persistent failure");
    expect(callCount).toBe(3);
  });

  it("uses exponential backoff between retries", async () => {
    vi.useFakeTimers();

    const callTimes: number[] = [];
    const mockOperation = vi.fn().mockImplementation(() => {
      callTimes.push(Date.now());
      if (callTimes.length < 3) {
        return Promise.reject(new Error(`Fail ${callTimes.length}`));
      }
      return Promise.resolve("success");
    });

    const options: RetryOptions = {
      maxAttempts: 3,
      baseDelayMs: 100,
    };

    const resultPromise = withRetry(mockOperation, options);

    // First call happens immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(mockOperation).toHaveBeenCalledTimes(1);

    // After 100ms (first retry delay), second call
    await vi.advanceTimersByTimeAsync(100);
    expect(mockOperation).toHaveBeenCalledTimes(2);

    // After 200ms more (second retry delay = 100 * 2), third call
    await vi.advanceTimersByTimeAsync(200);
    expect(mockOperation).toHaveBeenCalledTimes(3);

    const result = await resultPromise;
    expect(result).toBe("success");

    vi.useRealTimers();
  });

  it("respects custom retry options", async () => {
    let callCount = 0;
    const mockOperation = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error("Always fails"));
    });

    const options: RetryOptions = {
      maxAttempts: 5,
      baseDelayMs: 1,
    };

    let caughtError: Error | undefined;
    try {
      await withRetry(mockOperation, options);
    } catch (error) {
      caughtError = error as Error;
    }

    expect(caughtError).toBeDefined();
    expect(callCount).toBe(5);
  });

  it("calls onRetry callback on each retry", async () => {
    const mockOperation = vi
      .fn()
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"))
      .mockResolvedValueOnce("success");

    const onRetry = vi.fn();

    const options: RetryOptions = {
      maxAttempts: 3,
      baseDelayMs: 1,
      onRetry,
    };

    const result = await withRetry(mockOperation, options);

    expect(result).toBe("success");
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2);
  });

  it("does not retry non-retryable errors when shouldRetry returns false", async () => {
    let callCount = 0;
    const mockOperation = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error("Invalid query syntax"));
    });

    const options: RetryOptions = {
      maxAttempts: 3,
      shouldRetry: (error) => !error.message.includes("Invalid query"),
    };

    let caughtError: Error | undefined;
    try {
      await withRetry(mockOperation, options);
    } catch (error) {
      caughtError = error as Error;
    }

    expect(caughtError?.message).toBe("Invalid query syntax");
    expect(callCount).toBe(1);
  });
});

describe("ConnectionError", () => {
  it("creates error with code and original error", () => {
    const originalError = new Error("Socket closed");
    const connectionError = new ConnectionError(
      "Connection failed",
      "CONNECTION_FAILED",
      originalError
    );

    expect(connectionError.message).toBe("Connection failed");
    expect(connectionError.code).toBe("CONNECTION_FAILED");
    expect(connectionError.cause).toBe(originalError);
    expect(connectionError.name).toBe("ConnectionError");
  });

  it("can be created without original error", () => {
    const connectionError = new ConnectionError("Database unavailable", "DB_UNAVAILABLE");

    expect(connectionError.message).toBe("Database unavailable");
    expect(connectionError.code).toBe("DB_UNAVAILABLE");
    expect(connectionError.cause).toBeUndefined();
  });

  it("is instance of Error", () => {
    const connectionError = new ConnectionError("Test", "QUERY_FAILED");

    expect(connectionError).toBeInstanceOf(Error);
    expect(connectionError).toBeInstanceOf(ConnectionError);
  });
});

describe("HealthCheckResult type", () => {
  it("has correct shape for healthy result", () => {
    const healthyResult: HealthCheckResult = {
      status: "healthy",
      latencyMs: 42,
      timestamp: new Date().toISOString(),
    };

    expect(healthyResult.status).toBe("healthy");
    expect(healthyResult.latencyMs).toBe(42);
    expect(healthyResult.error).toBeUndefined();
  });

  it("has correct shape for unhealthy result", () => {
    const unhealthyResult: HealthCheckResult = {
      status: "unhealthy",
      latencyMs: 5000,
      timestamp: new Date().toISOString(),
      error: "Connection timeout",
    };

    expect(unhealthyResult.status).toBe("unhealthy");
    expect(unhealthyResult.error).toBe("Connection timeout");
  });
});
