/**
 * Tests for @repo/config package exports.
 *
 * Verifies that all export paths defined in package.json resolve correctly.
 * This ensures the package structure matches the public API contract.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

describe("@repo/config package exports", () => {
  const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf-8")) as {
    name: string;
    private: boolean;
    type: string;
    exports: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

  describe("package.json configuration", () => {
    it("should have correct package name", () => {
      expect(packageJson.name).toBe("@repo/config");
    });

    it("should be marked as private", () => {
      expect(packageJson.private).toBe(true);
    });

    it("should use ESM module type", () => {
      expect(packageJson.type).toBe("module");
    });
  });

  describe("export paths", () => {
    it("should have exports field defined", () => {
      expect(packageJson.exports).toBeDefined();
      expect(typeof packageJson.exports).toBe("object");
    });

    it("should export TypeScript configuration paths", () => {
      expect(packageJson.exports["./typescript/base"]).toBeDefined();
      expect(packageJson.exports["./typescript/nextjs"]).toBeDefined();
    });

    it("should export ESLint configuration paths", () => {
      expect(packageJson.exports["./eslint/base"]).toBeDefined();
      expect(packageJson.exports["./eslint/nextjs"]).toBeDefined();
    });

    it("should export Prettier configuration path", () => {
      expect(packageJson.exports["./prettier"]).toBeDefined();
    });

    it("should export Tailwind configuration path", () => {
      expect(packageJson.exports["./tailwind"]).toBeDefined();
    });

    it("should export main entry point", () => {
      expect(packageJson.exports["."]).toBeDefined();
    });

    it("all exported paths should resolve to existing files", () => {
      const exports = packageJson.exports;
      const missingFiles: string[] = [];

      for (const [exportPath, filePath] of Object.entries(exports)) {
        const absolutePath = resolve(packageRoot, filePath);
        if (!existsSync(absolutePath)) {
          missingFiles.push(`${exportPath} -> ${filePath}`);
        }
      }

      expect(missingFiles).toEqual([]);
    });
  });

  describe("peer dependencies", () => {
    it("should declare TypeScript as peer dependency", () => {
      expect(packageJson.peerDependencies?.typescript).toBeDefined();
    });

    it("should declare ESLint as peer dependency", () => {
      expect(packageJson.peerDependencies?.eslint).toBeDefined();
    });

    it("should declare Prettier as peer dependency", () => {
      expect(packageJson.peerDependencies?.prettier).toBeDefined();
    });

    it("should declare Tailwind CSS as peer dependency", () => {
      expect(packageJson.peerDependencies?.tailwindcss).toBeDefined();
    });
  });
});

describe("main entry point", () => {
  it("should have src/index.ts file", () => {
    const indexPath = resolve(packageRoot, "src/index.ts");
    expect(existsSync(indexPath)).toBe(true);
  });

  it("should re-export all Tailwind theme utilities from main entry", async () => {
    const mainExports = await import("../src/index.js");

    // Color utilities
    expect(mainExports.colorPalettes).toBeDefined();
    expect(mainExports.colorShades).toBeDefined();
    expect(mainExports.getCssColorVar).toBeDefined();
    expect(mainExports.isColorPalette).toBeDefined();
    expect(mainExports.isColorShade).toBeDefined();

    // Spacing utilities
    expect(mainExports.spacingScale).toBeDefined();
    expect(mainExports.spacingToPx).toBeDefined();
    expect(mainExports.isSpacingKey).toBeDefined();

    // Typography utilities
    expect(mainExports.fontFamilies).toBeDefined();
    expect(mainExports.fontSizes).toBeDefined();
    expect(mainExports.fontWeights).toBeDefined();
    expect(mainExports.lineHeights).toBeDefined();

    // Layout utilities
    expect(mainExports.borderRadius).toBeDefined();
    expect(mainExports.zIndex).toBeDefined();

    // CSS path constant
    expect(mainExports.TAILWIND_BASE_CSS_PATH).toBeDefined();
    expect(mainExports.TAILWIND_BASE_CSS_PATH).toBe("@repo/config/tailwind/base.css");
  });

  it("should export utility functions that work correctly from main entry", async () => {
    const { getCssColorVar, spacingToPx, isColorPalette, isSpacingKey } =
      await import("../src/index.js");

    // Test getCssColorVar
    expect(getCssColorVar("primary", "500")).toBe("var(--color-primary-500)");

    // Test spacingToPx
    expect(spacingToPx("4")).toBe(16);

    // Test isColorPalette
    expect(isColorPalette("primary")).toBe(true);
    expect(isColorPalette("invalid")).toBe(false);

    // Test isSpacingKey
    expect(isSpacingKey("4")).toBe(true);
    expect(isSpacingKey("invalid")).toBe(false);
  });
});
