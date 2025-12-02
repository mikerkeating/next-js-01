/**
 * Tests for organization context utilities
 *
 * @packageDocumentation
 */

import { pgTable, text, getTableConfig } from "drizzle-orm/pg-core";
import { describe, it, expect } from "vitest";

import { organizationId, orgId, withOrgFilter, ORG_COLUMN_NAMES } from "./org-context";

// Create test tables with different org column naming conventions
const tableWithOrganizationId = pgTable("table_org_id", {
  id: text("id").primaryKey(),
  organizationId: organizationId(),
  name: text("name"),
});

const tableWithOrgId = pgTable("table_short_org", {
  id: text("id").primaryKey(),
  orgId: orgId(),
  name: text("name"),
});

describe("org-context", () => {
  describe("organizationId()", () => {
    it("creates a column named organization_id", () => {
      const config = getTableConfig(tableWithOrganizationId);
      const orgIdCol = config.columns.find((c) => c.name === "organization_id");

      expect(orgIdCol).toBeDefined();
    });

    it("creates a non-nullable column", () => {
      const config = getTableConfig(tableWithOrganizationId);
      const orgIdCol = config.columns.find((c) => c.name === "organization_id");

      expect(orgIdCol?.notNull).toBe(true);
    });

    it("creates a column without default value", () => {
      const config = getTableConfig(tableWithOrganizationId);
      const orgIdCol = config.columns.find((c) => c.name === "organization_id");

      expect(orgIdCol?.hasDefault).toBe(false);
    });
  });

  describe("orgId()", () => {
    it("creates a column named org_id", () => {
      const config = getTableConfig(tableWithOrgId);
      const orgIdCol = config.columns.find((c) => c.name === "org_id");

      expect(orgIdCol).toBeDefined();
    });

    it("creates a non-nullable column", () => {
      const config = getTableConfig(tableWithOrgId);
      const orgIdCol = config.columns.find((c) => c.name === "org_id");

      expect(orgIdCol?.notNull).toBe(true);
    });
  });

  describe("withOrgFilter()", () => {
    it("returns a SQL condition for organizationId column", () => {
      const testOrgId = "123e4567-e89b-12d3-a456-426614174000";
      const condition = withOrgFilter(tableWithOrganizationId, testOrgId);
      expect(condition).toBeDefined();
      expect(typeof condition).toBe("object");
    });

    it("returns a SQL condition for orgId column", () => {
      const testOrgId = "123e4567-e89b-12d3-a456-426614174000";
      const condition = withOrgFilter(tableWithOrgId, testOrgId);
      expect(condition).toBeDefined();
      expect(typeof condition).toBe("object");
    });

    it("accepts either organizationId or orgId column names", () => {
      const testOrgId = "123e4567-e89b-12d3-a456-426614174000";

      // Both should work without throwing
      expect(() => withOrgFilter(tableWithOrganizationId, testOrgId)).not.toThrow();
      expect(() => withOrgFilter(tableWithOrgId, testOrgId)).not.toThrow();
    });
  });

  describe("ORG_COLUMN_NAMES", () => {
    it("contains both organizationId and orgId", () => {
      expect(ORG_COLUMN_NAMES).toContain("organizationId");
      expect(ORG_COLUMN_NAMES).toContain("orgId");
    });

    it("has exactly 2 column names", () => {
      expect(ORG_COLUMN_NAMES).toHaveLength(2);
    });
  });
});
