/**
 * @file Migration Utilities Unit Tests
 *
 * Tests for programmatic database migration functionality.
 * These tests mock the drizzle-orm migrator to test behavior without
 * requiring an actual database connection.
 */
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { runMigrations, getMigrationsPath, MigrationError, type MigrationOptions } from "./migrate";

// Mock the drizzle-orm neon-http migrator
vi.mock("drizzle-orm/neon-http/migrator", () => ({
  migrate: vi.fn(),
}));

// Mock the database client
vi.mock("./client", () => ({
  db: {},
}));

// Helper to get the mocked migrate function
async function getMockedMigrate(): Promise<Mock> {
  const { migrate } = await import("drizzle-orm/neon-http/migrator");
  return vi.mocked(migrate) as Mock;
}

describe("getMigrationsPath", () => {
  it("returns the default migrations path relative to the module", () => {
    const migrationsPath = getMigrationsPath();

    // Should be an absolute path ending with /migrations
    expect(path.isAbsolute(migrationsPath)).toBe(true);
    expect(migrationsPath).toMatch(/\/migrations$/);
  });

  it("returns custom path when provided", () => {
    const customPath = "/custom/migrations/path";
    const result = getMigrationsPath(customPath);

    expect(result).toBe(customPath);
  });
});

describe("runMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset mocks between tests
  });

  it("successfully runs migrations and returns result", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockResolvedValueOnce(undefined);

    const result = await runMigrations();

    expect(result.success).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.migrationsPath).toContain("migrations");
    expect(result.error).toBeUndefined();
    expect(mockMigrate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        migrationsFolder: expect.any(String),
      })
    );
  });

  it("accepts custom migrations folder path", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockResolvedValueOnce(undefined);

    const customPath = "/custom/migrations";
    const options: MigrationOptions = { migrationsFolder: customPath };

    const result = await runMigrations(options);

    expect(result.success).toBe(true);
    expect(result.migrationsPath).toBe(customPath);
    expect(mockMigrate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        migrationsFolder: customPath,
      })
    );
  });

  it("returns failure result when migrations fail", async () => {
    const mockMigrate = await getMockedMigrate();
    const migrationError = new Error("Migration failed: syntax error in SQL");
    mockMigrate.mockRejectedValueOnce(migrationError);

    const result = await runMigrations();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Migration failed: syntax error in SQL");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("handles unknown error types gracefully", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockRejectedValueOnce("String error");

    const result = await runMigrations();

    expect(result.success).toBe(false);
    expect(result.error).toBe("String error");
  });

  it("handles non-string, non-Error thrown values", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockRejectedValueOnce({ code: "UNKNOWN" });

    const result = await runMigrations();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unknown migration error");
  });

  it("logs migration start when verbose option is true", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockResolvedValueOnce(undefined);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runMigrations({ verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Starting migration"));
    consoleSpy.mockRestore();
  });

  it("logs migration success when verbose option is true", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockResolvedValueOnce(undefined);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runMigrations({ verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Migration completed"));
    consoleSpy.mockRestore();
  });

  it("logs migration failure when verbose option is true", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockRejectedValueOnce(new Error("Failed"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runMigrations({ verbose: true });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Migration failed"));
    consoleSpy.mockRestore();
  });

  it("does not log when verbose option is false", async () => {
    const mockMigrate = await getMockedMigrate();
    mockMigrate.mockResolvedValueOnce(undefined);

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runMigrations({ verbose: false });

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe("MigrationError", () => {
  it("creates error with code and original error", () => {
    const originalError = new Error("SQL syntax error");
    const migrationError = new MigrationError(
      "Migration failed",
      "MIGRATION_FAILED",
      originalError
    );

    expect(migrationError.message).toBe("Migration failed");
    expect(migrationError.code).toBe("MIGRATION_FAILED");
    expect(migrationError.cause).toBe(originalError);
    expect(migrationError.name).toBe("MigrationError");
  });

  it("can be created without original error", () => {
    const migrationError = new MigrationError("No migrations found", "NO_MIGRATIONS");

    expect(migrationError.message).toBe("No migrations found");
    expect(migrationError.code).toBe("NO_MIGRATIONS");
    expect(migrationError.cause).toBeUndefined();
  });

  it("is instance of Error", () => {
    const migrationError = new MigrationError("Test", "MIGRATION_FAILED");

    expect(migrationError).toBeInstanceOf(Error);
    expect(migrationError).toBeInstanceOf(MigrationError);
  });
});
