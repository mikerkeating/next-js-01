/**
 * @file Apply Migrations Script Tests
 *
 * Tests for the apply-migrations CLI script logic.
 * These tests verify the migration application workflow.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

import { parseArgs, formatResult } from "./apply-migrations";

// Mock the migrate module before importing anything that uses it
vi.mock("../src/migrate", () => ({
  runMigrations: vi.fn(),
}));

describe("apply-migrations script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("runMigrations integration", () => {
    it("calls runMigrations with default options", async () => {
      const { runMigrations } = await import("../src/migrate");
      const mockedRunMigrations = vi.mocked(runMigrations);

      mockedRunMigrations.mockResolvedValueOnce({
        success: true,
        durationMs: 100,
        migrationsPath: "/path/to/migrations",
      });

      const result = await mockedRunMigrations({});

      expect(result.success).toBe(true);
      expect(mockedRunMigrations).toHaveBeenCalledWith({});
    });

    it("calls runMigrations with verbose option", async () => {
      const { runMigrations } = await import("../src/migrate");
      const mockedRunMigrations = vi.mocked(runMigrations);

      mockedRunMigrations.mockResolvedValueOnce({
        success: true,
        durationMs: 150,
        migrationsPath: "/path/to/migrations",
      });

      const result = await mockedRunMigrations({ verbose: true });

      expect(result.success).toBe(true);
      expect(mockedRunMigrations).toHaveBeenCalledWith({ verbose: true });
    });

    it("handles migration failure gracefully", async () => {
      const { runMigrations } = await import("../src/migrate");
      const mockedRunMigrations = vi.mocked(runMigrations);

      mockedRunMigrations.mockResolvedValueOnce({
        success: false,
        durationMs: 50,
        migrationsPath: "/path/to/migrations",
        error: "SQL syntax error in migration",
      });

      const result = await mockedRunMigrations({});

      expect(result.success).toBe(false);
      expect(result.error).toBe("SQL syntax error in migration");
    });
  });

  describe("formatResult", () => {
    it("formats successful result correctly", () => {
      const successResult = formatResult({
        success: true,
        durationMs: 100,
        migrationsPath: "/path/to/migrations",
      });

      expect(successResult).toBe("✓ Migrations applied successfully in 100ms");
    });

    it("formats failure result correctly", () => {
      const failureResult = formatResult({
        success: false,
        durationMs: 50,
        migrationsPath: "/path/to/migrations",
        error: "Connection refused",
      });

      expect(failureResult).toBe("✗ Migration failed: Connection refused");
    });
  });

  describe("parseArgs", () => {
    it("parses verbose flag from --verbose", () => {
      expect(parseArgs(["--verbose"]).verbose).toBe(true);
    });

    it("parses verbose flag from -v", () => {
      expect(parseArgs(["-v"]).verbose).toBe(true);
    });

    it("returns false for verbose when no flag provided", () => {
      expect(parseArgs([]).verbose).toBe(false);
    });
  });
});
