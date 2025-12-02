/**
 * Tests for timestamp column helper utilities
 *
 * @packageDocumentation
 */

import { pgTable, text, getTableConfig } from "drizzle-orm/pg-core";
import { describe, it, expect } from "vitest";

import { timestamps, createdAt, updatedAt, TIMESTAMP_COLUMNS } from "./timestamps";

// Create a test schema to verify column definitions work correctly
const testTableWithTimestamps = pgTable("test_timestamps", {
  id: text("id").primaryKey(),
  ...timestamps(),
});

const testTableWithCreatedAt = pgTable("test_created_at", {
  id: text("id").primaryKey(),
  createdAt: createdAt(),
});

const testTableWithUpdatedAt = pgTable("test_updated_at", {
  id: text("id").primaryKey(),
  updatedAt: updatedAt(),
});

describe("timestamps", () => {
  describe("timestamps()", () => {
    it("returns an object with createdAt and updatedAt properties", () => {
      const columns = timestamps();
      expect(columns).toHaveProperty("createdAt");
      expect(columns).toHaveProperty("updatedAt");
    });

    it("can be spread into a pgTable definition", () => {
      const config = getTableConfig(testTableWithTimestamps);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");
    });

    it("creates columns that are not nullable", () => {
      const config = getTableConfig(testTableWithTimestamps);
      const createdAtCol = config.columns.find((c) => c.name === "created_at");
      const updatedAtCol = config.columns.find((c) => c.name === "updated_at");

      expect(createdAtCol?.notNull).toBe(true);
      expect(updatedAtCol?.notNull).toBe(true);
    });

    it("creates columns with default values", () => {
      const config = getTableConfig(testTableWithTimestamps);
      const createdAtCol = config.columns.find((c) => c.name === "created_at");
      const updatedAtCol = config.columns.find((c) => c.name === "updated_at");

      expect(createdAtCol?.hasDefault).toBe(true);
      expect(updatedAtCol?.hasDefault).toBe(true);
    });
  });

  describe("createdAt()", () => {
    it("creates a column named created_at", () => {
      const config = getTableConfig(testTableWithCreatedAt);
      const createdAtCol = config.columns.find((c) => c.name === "created_at");

      expect(createdAtCol).toBeDefined();
    });

    it("creates a non-nullable column with default", () => {
      const config = getTableConfig(testTableWithCreatedAt);
      const createdAtCol = config.columns.find((c) => c.name === "created_at");

      expect(createdAtCol?.notNull).toBe(true);
      expect(createdAtCol?.hasDefault).toBe(true);
    });
  });

  describe("updatedAt()", () => {
    it("creates a column named updated_at", () => {
      const config = getTableConfig(testTableWithUpdatedAt);
      const updatedAtCol = config.columns.find((c) => c.name === "updated_at");

      expect(updatedAtCol).toBeDefined();
    });

    it("creates a non-nullable column with default", () => {
      const config = getTableConfig(testTableWithUpdatedAt);
      const updatedAtCol = config.columns.find((c) => c.name === "updated_at");

      expect(updatedAtCol?.notNull).toBe(true);
      expect(updatedAtCol?.hasDefault).toBe(true);
    });
  });

  describe("TIMESTAMP_COLUMNS", () => {
    it("contains the expected column names", () => {
      expect(TIMESTAMP_COLUMNS).toEqual(["createdAt", "updatedAt"]);
    });
  });
});
