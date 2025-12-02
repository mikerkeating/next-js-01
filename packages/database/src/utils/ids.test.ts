/**
 * Tests for ID generation utilities
 *
 * @packageDocumentation
 */

import { describe, it, expect } from "vitest";

import { createId, isValidId, ID_LENGTH, ID_PATTERN } from "./ids";

describe("ids", () => {
  describe("createId", () => {
    it("generates a string ID", () => {
      const id = createId();
      expect(typeof id).toBe("string");
    });

    it("generates IDs of correct length", () => {
      const id = createId();
      expect(id.length).toBe(ID_LENGTH);
    });

    it("generates URL-safe IDs (no special characters)", () => {
      const ids = Array.from({ length: 100 }, () => createId());
      const urlSafePattern = /^[a-z0-9]+$/;

      for (const id of ids) {
        expect(id).toMatch(urlSafePattern);
      }
    });

    it("generates unique IDs across 10,000 iterations", () => {
      const ids = new Set<string>();
      const iterations = 10_000;

      for (let i = 0; i < iterations; i++) {
        ids.add(createId());
      }

      expect(ids.size).toBe(iterations);
    });

    it("generates IDs matching the expected cuid2 pattern", () => {
      const id = createId();
      expect(id).toMatch(ID_PATTERN);
    });
  });

  describe("isValidId", () => {
    it("returns true for valid cuid2 IDs", () => {
      const id = createId();
      expect(isValidId(id)).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isValidId("")).toBe(false);
    });

    it("returns false for IDs with wrong length", () => {
      expect(isValidId("abc")).toBe(false);
      expect(isValidId("a".repeat(30))).toBe(false);
    });

    it("returns false for IDs with special characters", () => {
      expect(isValidId("abc-def-ghi-jkl-mno-pqr!")).toBe(false);
      expect(isValidId("abc_def_ghi_jkl_mno_pqrs")).toBe(false);
    });

    it("returns false for IDs with uppercase characters", () => {
      expect(isValidId("ABCdefghijklmnopqrstuvwx")).toBe(false);
    });
  });

  describe("ID_LENGTH", () => {
    it("is 24 characters (cuid2 default)", () => {
      expect(ID_LENGTH).toBe(24);
    });
  });

  describe("ID_PATTERN", () => {
    it("matches lowercase alphanumeric strings of correct length", () => {
      expect("a".repeat(ID_LENGTH)).toMatch(ID_PATTERN);
      expect("abc123def456ghi789jkl012".slice(0, ID_LENGTH)).toMatch(ID_PATTERN);
    });

    it("does not match strings with invalid characters", () => {
      // Test uppercase characters in an ID_LENGTH string
      const uppercaseId = "A" + "a".repeat(ID_LENGTH - 1);
      expect(uppercaseId).not.toMatch(ID_PATTERN);
      // Test special characters in an ID_LENGTH string
      const specialCharId = "-" + "a".repeat(ID_LENGTH - 1);
      expect(specialCharId).not.toMatch(ID_PATTERN);
    });
  });
});
