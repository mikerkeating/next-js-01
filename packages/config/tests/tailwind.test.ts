/**
 * Tests for @repo/config Tailwind CSS v4 configuration.
 *
 * Verifies:
 * - CSS file exists and is valid
 * - Theme tokens are properly defined
 * - Color palettes have required shades
 * - Spacing scale follows 4px base unit
 * - Typography tokens are defined
 * - Dark mode support via CSS custom properties
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

describe("Tailwind CSS v4 Configuration", () => {
  describe("base.css file", () => {
    const baseCssPath = resolve(packageRoot, "src/tailwind/base.css");

    it("should exist at src/tailwind/base.css", () => {
      expect(existsSync(baseCssPath)).toBe(true);
    });

    it("should be a valid CSS file (parseable)", () => {
      const content = readFileSync(baseCssPath, "utf-8");
      // Basic check: should not be empty and should contain valid CSS syntax
      expect(content.length).toBeGreaterThan(0);
      // Should not have unbalanced braces (basic validation)
      const openBraces = (content.match(/{/g) ?? []).length;
      const closeBraces = (content.match(/}/g) ?? []).length;
      expect(openBraces).toBe(closeBraces);
    });

    it("should import Tailwind CSS", () => {
      const content = readFileSync(baseCssPath, "utf-8");
      expect(content).toMatch(/@import\s+["']tailwindcss["']/);
    });

    it("should use @theme directive for CSS-first configuration", () => {
      const content = readFileSync(baseCssPath, "utf-8");
      expect(content).toMatch(/@theme\s*{/);
    });
  });

  describe("color tokens", () => {
    const baseCssPath = resolve(packageRoot, "src/tailwind/base.css");
    let cssContent: string;

    beforeAll(() => {
      cssContent = readFileSync(baseCssPath, "utf-8");
    });

    const requiredColorPalettes = [
      "primary",
      "secondary",
      "accent",
      "neutral",
      "success",
      "warning",
      "error",
    ];

    it.each(requiredColorPalettes)("should define %s color palette", (palette) => {
      // At minimum, should have the base color (500 shade)
      const baseColorPattern = new RegExp(`--color-${palette}(?:-500)?\\s*:`);
      expect(cssContent).toMatch(baseColorPattern);
    });

    it.each(requiredColorPalettes)("should define %s palette with common shades", (palette) => {
      // Check for at least the key shades (50, 500, 900)
      const shade50 = new RegExp(`--color-${palette}-50\\s*:`);
      const shade500 = new RegExp(`--color-${palette}-500\\s*:`);
      const shade900 = new RegExp(`--color-${palette}-900\\s*:`);

      expect(cssContent).toMatch(shade50);
      expect(cssContent).toMatch(shade500);
      expect(cssContent).toMatch(shade900);
    });
  });

  describe("spacing scale", () => {
    const baseCssPath = resolve(packageRoot, "src/tailwind/base.css");
    let cssContent: string;

    beforeAll(() => {
      cssContent = readFileSync(baseCssPath, "utf-8");
    });

    // 4px base unit spacing scale
    const spacingValues = [
      { name: "0", value: "0" },
      { name: "1", value: "0.25rem" }, // 4px
      { name: "2", value: "0.5rem" }, // 8px
      { name: "3", value: "0.75rem" }, // 12px
      { name: "4", value: "1rem" }, // 16px
      { name: "5", value: "1.25rem" }, // 20px
      { name: "6", value: "1.5rem" }, // 24px
      { name: "8", value: "2rem" }, // 32px
      { name: "10", value: "2.5rem" }, // 40px
      { name: "12", value: "3rem" }, // 48px
      { name: "16", value: "4rem" }, // 64px
    ];

    it("should define spacing scale based on 4px unit", () => {
      // Check that spacing custom properties are defined
      const spacingPattern = /--spacing-\d+\s*:/;
      expect(cssContent).toMatch(spacingPattern);
    });

    it.each(spacingValues.slice(0, 5))(
      "should define spacing-$name with value $value",
      ({ name, value }) => {
        // Allow for variations in CSS value format
        const pattern = new RegExp(`--spacing-${name}\\s*:\\s*${value.replace(".", "\\.")}`);
        expect(cssContent).toMatch(pattern);
      }
    );
  });

  describe("typography tokens", () => {
    const baseCssPath = resolve(packageRoot, "src/tailwind/base.css");
    let cssContent: string;

    beforeAll(() => {
      cssContent = readFileSync(baseCssPath, "utf-8");
    });

    it("should define font family tokens", () => {
      expect(cssContent).toMatch(/--font-family-sans\s*:/);
      expect(cssContent).toMatch(/--font-family-mono\s*:/);
    });

    it("should define font size tokens", () => {
      expect(cssContent).toMatch(/--font-size-/);
    });

    it("should define font weight tokens", () => {
      expect(cssContent).toMatch(/--font-weight-/);
    });

    it("should define line height tokens", () => {
      expect(cssContent).toMatch(/--line-height-/);
    });
  });

  describe("dark mode support", () => {
    const baseCssPath = resolve(packageRoot, "src/tailwind/base.css");
    let cssContent: string;

    beforeAll(() => {
      cssContent = readFileSync(baseCssPath, "utf-8");
    });

    it("should include prefers-color-scheme media query", () => {
      expect(cssContent).toMatch(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/);
    });

    it("should define dark mode color overrides", () => {
      // Should have a dark mode section with color variables
      const darkModeSection = cssContent.match(
        /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*{[\s\S]*?}/
      );
      expect(darkModeSection).not.toBeNull();
      // Dark mode section should contain color variables
      if (darkModeSection) {
        expect(darkModeSection[0]).toMatch(/--color-/);
      }
    });

    it("should support manual dark mode toggle via class", () => {
      // Should have .dark class selector for manual toggle
      expect(cssContent).toMatch(/\.dark\s*{/);
    });
  });
});

describe("theme.ts exports", () => {
  it("should export theme.ts file at src/tailwind/theme.ts", () => {
    const themePath = resolve(packageRoot, "src/tailwind/theme.ts");
    expect(existsSync(themePath)).toBe(true);
  });

  it("should export color palette names", async () => {
    const { colorPalettes } = await import("../src/tailwind/theme.js");
    expect(colorPalettes).toBeDefined();
    expect(colorPalettes).toContain("primary");
    expect(colorPalettes).toContain("secondary");
    expect(colorPalettes).toContain("accent");
    expect(colorPalettes).toContain("neutral");
    expect(colorPalettes).toContain("success");
    expect(colorPalettes).toContain("warning");
    expect(colorPalettes).toContain("error");
  });

  it("should export spacing scale values", async () => {
    const { spacingScale } = await import("../src/tailwind/theme.js");
    expect(spacingScale).toBeDefined();
    expect(typeof spacingScale).toBe("object");
    // Check for key spacing values
    expect(spacingScale["1"]).toBe("0.25rem");
    expect(spacingScale["4"]).toBe("1rem");
    expect(spacingScale["8"]).toBe("2rem");
  });

  it("should export font family values", async () => {
    const { fontFamilies } = await import("../src/tailwind/theme.js");
    expect(fontFamilies).toBeDefined();
    expect(fontFamilies.sans).toBeDefined();
    expect(fontFamilies.mono).toBeDefined();
  });

  it("should export type definitions", async () => {
    const theme = await import("../src/tailwind/theme.js");
    // Check that types are exported (they should be TypeScript types)
    expect(theme.ColorPalette).toBeDefined();
    expect(theme.SpacingKey).toBeDefined();
  });
});

describe("Tailwind index.ts exports", () => {
  it("should export index.ts file at src/tailwind/index.ts", () => {
    const indexPath = resolve(packageRoot, "src/tailwind/index.ts");
    expect(existsSync(indexPath)).toBe(true);
  });

  it("should re-export theme utilities", async () => {
    const tailwindExports = await import("../src/tailwind/index.js");
    expect(tailwindExports.colorPalettes).toBeDefined();
    expect(tailwindExports.spacingScale).toBeDefined();
    expect(tailwindExports.fontFamilies).toBeDefined();
  });

  it("should export CSS file path constant", async () => {
    const tailwindExports = await import("../src/tailwind/index.js");
    expect(tailwindExports.TAILWIND_BASE_CSS_PATH).toBeDefined();
    expect(typeof tailwindExports.TAILWIND_BASE_CSS_PATH).toBe("string");
    expect(tailwindExports.TAILWIND_BASE_CSS_PATH).toContain("base.css");
  });
});

describe("package.json exports", () => {
  const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf-8")) as {
    exports: Record<string, string>;
  };

  it("should export Tailwind base CSS via @repo/config/tailwind/base.css", () => {
    expect(packageJson.exports["./tailwind/base.css"]).toBeDefined();
    expect(packageJson.exports["./tailwind/base.css"]).toContain("base.css");
  });

  it("should export Tailwind theme via @repo/config/tailwind/theme", () => {
    expect(packageJson.exports["./tailwind/theme"]).toBeDefined();
    expect(packageJson.exports["./tailwind/theme"]).toContain("theme");
  });

  it("should export Tailwind index via @repo/config/tailwind", () => {
    // Either direct path or through index
    const hasDirectExport = packageJson.exports["./tailwind"] !== undefined;
    expect(hasDirectExport).toBe(true);
  });
});
