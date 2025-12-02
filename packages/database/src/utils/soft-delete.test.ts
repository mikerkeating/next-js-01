/**
 * Tests for soft delete utilities
 *
 * @packageDocumentation
 */

import { pgTable, text, getTableConfig } from "drizzle-orm/pg-core";
import { describe, it, expect } from "vitest";

import {
  softDelete,
  deletedAt,
  isNotDeleted,
  isDeleted,
  markAsDeleted,
  markAsRestored,
  SOFT_DELETE_COLUMN,
} from "./soft-delete";

// Create test tables for verifying column definitions and query helpers
const testTableWithSoftDelete = pgTable("test_soft_delete", {
  id: text("id").primaryKey(),
  name: text("name"),
  ...softDelete(),
});

const testTableWithDeletedAt = pgTable("test_deleted_at", {
  id: text("id").primaryKey(),
  deletedAt: deletedAt(),
});

describe("soft-delete", () => {
  describe("softDelete()", () => {
    it("returns an object with deletedAt property", () => {
      const columns = softDelete();
      expect(columns).toHaveProperty("deletedAt");
    });

    it("can be spread into a pgTable definition", () => {
      const config = getTableConfig(testTableWithSoftDelete);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("deleted_at");
    });

    it("creates a nullable column (no notNull constraint)", () => {
      const config = getTableConfig(testTableWithSoftDelete);
      const deletedAtCol = config.columns.find((c) => c.name === "deleted_at");

      // Soft delete column should be nullable (NULL = not deleted)
      expect(deletedAtCol?.notNull).toBe(false);
    });

    it("creates a column without default value", () => {
      const config = getTableConfig(testTableWithSoftDelete);
      const deletedAtCol = config.columns.find((c) => c.name === "deleted_at");

      // No default - NULL by default means record is not deleted
      expect(deletedAtCol?.hasDefault).toBe(false);
    });
  });

  describe("deletedAt()", () => {
    it("creates a column named deleted_at", () => {
      const config = getTableConfig(testTableWithDeletedAt);
      const deletedAtCol = config.columns.find((c) => c.name === "deleted_at");

      expect(deletedAtCol).toBeDefined();
    });

    it("creates a nullable column", () => {
      const config = getTableConfig(testTableWithDeletedAt);
      const deletedAtCol = config.columns.find((c) => c.name === "deleted_at");

      expect(deletedAtCol?.notNull).toBe(false);
    });
  });

  describe("isNotDeleted()", () => {
    it("returns a SQL condition for checking deletedAt is null", () => {
      const condition = isNotDeleted(testTableWithSoftDelete);
      expect(condition).toBeDefined();
      // The condition should be a Drizzle SQL expression
      expect(typeof condition).toBe("object");
    });

    it("can be used with tables that have deletedAt column", () => {
      // This test verifies the function accepts our test table
      const condition = isNotDeleted(testTableWithSoftDelete);
      expect(condition).toBeDefined();
    });
  });

  describe("isDeleted()", () => {
    it("returns a SQL condition for checking deletedAt is not null", () => {
      const condition = isDeleted(testTableWithSoftDelete);
      expect(condition).toBeDefined();
      expect(typeof condition).toBe("object");
    });

    it("can be used with tables that have deletedAt column", () => {
      const condition = isDeleted(testTableWithSoftDelete);
      expect(condition).toBeDefined();
    });
  });

  describe("markAsDeleted()", () => {
    it("returns an object with deletedAt set to current timestamp", () => {
      const before = new Date();
      const update = markAsDeleted();
      const after = new Date();

      expect(update).toHaveProperty("deletedAt");
      expect(update.deletedAt).toBeInstanceOf(Date);
      expect(update.deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(update.deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("accepts a custom deletion timestamp", () => {
      const customDate = new Date("2024-01-15T10:30:00Z");
      const update = markAsDeleted(customDate);

      expect(update.deletedAt).toEqual(customDate);
    });
  });

  describe("markAsRestored()", () => {
    it("returns an object with deletedAt set to null", () => {
      const update = markAsRestored();
      expect(update).toHaveProperty("deletedAt");
      expect(update.deletedAt).toBeNull();
    });
  });

  describe("SOFT_DELETE_COLUMN", () => {
    it("is the column name 'deletedAt'", () => {
      expect(SOFT_DELETE_COLUMN).toBe("deletedAt");
    });
  });
});
