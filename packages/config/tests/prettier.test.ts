/**
 * Tests for @repo/config Prettier configuration.
 *
 * Validates that Prettier config:
 * 1. Exports a valid Prettier configuration object
 * 2. Enforces consistent formatting rules per coding standards
 * 3. Includes Tailwind CSS class sorting plugin
 * 4. Is properly exported via package.json
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const prettierConfig = resolve(packageRoot, "src/prettier/index.js");

describe("Prettier configuration file", () => {
  describe("file existence", () => {
    it("should have src/prettier/index.js", () => {
      expect(existsSync(prettierConfig)).toBe(true);
    });
  });

  describe("valid Prettier config", () => {
    it("should export a valid configuration object", async () => {
      const config = await import("@repo/config/prettier");
      expect(config.default).toBeDefined();
      expect(typeof config.default).toBe("object");
    });
  });
});

describe("Prettier formatting rules", () => {
  type PrettierConfig = {
    semi?: boolean;
    singleQuote?: boolean;
    trailingComma?: "none" | "es5" | "all";
    tabWidth?: number;
    printWidth?: number;
    plugins?: string[];
  };

  let config: PrettierConfig;

  beforeAll(async () => {
    const imported = (await import("@repo/config/prettier")) as { default: PrettierConfig };
    config = imported.default;
  });

  describe("semicolons", () => {
    it("should enforce semicolons (semi: true)", () => {
      expect(config.semi).toBe(true);
    });
  });

  describe("quotes", () => {
    it("should use single quotes (singleQuote: true)", () => {
      expect(config.singleQuote).toBe(true);
    });
  });

  describe("trailing commas", () => {
    it('should use ES5 trailing commas (trailingComma: "es5")', () => {
      expect(config.trailingComma).toBe("es5");
    });
  });

  describe("indentation", () => {
    it("should use 2-space indentation (tabWidth: 2)", () => {
      expect(config.tabWidth).toBe(2);
    });
  });

  describe("line width", () => {
    it("should set print width to 100 (printWidth: 100)", () => {
      expect(config.printWidth).toBe(100);
    });
  });
});

describe("Tailwind CSS plugin", () => {
  type PrettierConfig = {
    plugins?: string[];
  };

  let config: PrettierConfig;

  beforeAll(async () => {
    const imported = (await import("@repo/config/prettier")) as { default: PrettierConfig };
    config = imported.default;
  });

  it("should include plugins array", () => {
    expect(Array.isArray(config.plugins)).toBe(true);
  });

  it("should include prettier-plugin-tailwindcss", () => {
    expect(config.plugins).toContain("prettier-plugin-tailwindcss");
  });
});

describe("package.json exports", () => {
  it("should export prettier config at ./prettier", async () => {
    const packageJson = (await import("../package.json")) as {
      exports: Record<string, string>;
    };
    expect(packageJson.exports["./prettier"]).toBe("./src/prettier/index.js");
  });
});

describe("package.json peer dependencies", () => {
  it("should have prettier as peer dependency", async () => {
    const packageJson = (await import("../package.json")) as {
      peerDependencies: Record<string, string>;
    };
    expect(packageJson.peerDependencies["prettier"]).toBeDefined();
  });

  it("should have prettier-plugin-tailwindcss as peer dependency", async () => {
    const packageJson = (await import("../package.json")) as {
      peerDependencies: Record<string, string>;
    };
    expect(packageJson.peerDependencies["prettier-plugin-tailwindcss"]).toBeDefined();
  });
});
