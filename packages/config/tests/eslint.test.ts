/**
 * Tests for @repo/config ESLint configurations.
 *
 * Validates that ESLint config files:
 * 1. Are valid ESLint flat config arrays
 * 2. Include required plugins and rules
 * 3. Configure TypeScript parser correctly
 * 4. Include proper import ordering rules
 */
import { describe, it, expect, beforeAll } from "vitest";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const eslintDir = resolve(packageRoot, "src/eslint");

/**
 * Shared type definitions for ESLint configuration objects
 */
type LanguageOptions = {
  parser?: unknown;
  parserOptions?: {
    project?: boolean;
    tsconfigRootDir?: string;
  };
  ecmaVersion?: number | string;
  sourceType?: string;
};

type ConfigObject = {
  files?: string[];
  ignores?: string[];
  languageOptions?: LanguageOptions;
  plugins?: Record<string, unknown>;
  rules?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

/**
 * Package.json exports type
 */
type PackageJsonExports = {
  exports: Record<string, string>;
};

/**
 * Helper to check if a file exists
 */
function configExists(filename: string): boolean {
  return existsSync(resolve(eslintDir, filename));
}

describe("ESLint configuration files", () => {
  describe("file existence", () => {
    it("should have base.js", () => {
      expect(configExists("base.js")).toBe(true);
    });

    it("should have nextjs.js", () => {
      expect(configExists("nextjs.js")).toBe(true);
    });

    it("should have react-library.js", () => {
      expect(configExists("react-library.js")).toBe(true);
    });
  });

  describe("valid ESLint flat configs", () => {
    it("base.js should export a valid flat config array", async () => {
      const config = await import("@repo/config/eslint/base");
      expect(Array.isArray(config.default)).toBe(true);
      expect(config.default.length).toBeGreaterThan(0);
    });

    it("nextjs.js should export a valid flat config array", async () => {
      const config = await import("@repo/config/eslint/nextjs");
      expect(Array.isArray(config.default)).toBe(true);
      expect(config.default.length).toBeGreaterThan(0);
    });

    it("react-library.js should export a valid flat config array", async () => {
      const config = await import("@repo/config/eslint/react-library");
      expect(Array.isArray(config.default)).toBe(true);
      expect(config.default.length).toBeGreaterThan(0);
    });
  });
});

describe("base.js configuration", () => {
  let configArray: ConfigObject[];

  beforeAll(async () => {
    const imported = (await import("@repo/config/eslint/base")) as { default: ConfigObject[] };
    configArray = imported.default;
  });

  describe("TypeScript configuration", () => {
    it("should configure TypeScript files (*.ts, *.tsx)", () => {
      const tsConfig = configArray.find(
        (c) => c.files && (c.files.includes("**/*.ts") || c.files.includes("**/*.tsx"))
      );
      expect(tsConfig).toBeDefined();
    });

    it("should include TypeScript parser", () => {
      const tsConfig = configArray.find(
        (c) => c.files && (c.files.includes("**/*.ts") || c.files.includes("**/*.tsx"))
      );
      expect(tsConfig?.languageOptions?.parser).toBeDefined();
    });
  });

  describe("plugins", () => {
    it("should include @typescript-eslint plugin", () => {
      const hasPlugin = configArray.some(
        (c) => c.plugins && ("@typescript-eslint" in c.plugins || "typescript-eslint" in c.plugins)
      );
      expect(hasPlugin).toBe(true);
    });

    it("should include import plugin for import ordering", () => {
      const hasPlugin = configArray.some((c) => c.plugins && "import" in c.plugins);
      expect(hasPlugin).toBe(true);
    });
  });

  describe("rules", () => {
    it("should configure import ordering rules", () => {
      const hasImportOrder = configArray.some(
        (c) => c.rules && ("import/order" in c.rules || "sort-imports" in c.rules)
      );
      expect(hasImportOrder).toBe(true);
    });

    it("should disable rules that conflict with TypeScript", () => {
      // Find the TypeScript config that has both no-unused-vars disabled and @typescript-eslint/no-unused-vars enabled
      const tsRulesConfig = configArray.find(
        (c) =>
          c.files?.includes("**/*.ts") &&
          c.rules &&
          "no-unused-vars" in c.rules &&
          "@typescript-eslint/no-unused-vars" in c.rules
      );
      expect(tsRulesConfig).toBeDefined();
      expect(tsRulesConfig?.rules?.["no-unused-vars"]).toBe("off");
    });
  });

  describe("ignores", () => {
    it("should configure global ignores", () => {
      const ignoresConfig = configArray.find((c) => c.ignores && !c.files);
      expect(ignoresConfig).toBeDefined();
      expect(ignoresConfig?.ignores).toContain("node_modules/**");
    });
  });
});

describe("nextjs.js configuration", () => {
  let configArray: ConfigObject[];

  beforeAll(async () => {
    const imported = (await import("@repo/config/eslint/nextjs")) as { default: ConfigObject[] };
    configArray = imported.default;
  });

  describe("Next.js specific configuration", () => {
    it("should include Next.js plugin", () => {
      const hasNextPlugin = configArray.some(
        (c) => c.plugins && ("@next/next" in c.plugins || "next" in c.plugins)
      );
      expect(hasNextPlugin).toBe(true);
    });

    it("should include React plugin", () => {
      const hasReactPlugin = configArray.some((c) => c.plugins && "react" in c.plugins);
      expect(hasReactPlugin).toBe(true);
    });

    it("should include React hooks plugin", () => {
      const hasHooksPlugin = configArray.some((c) => c.plugins && "react-hooks" in c.plugins);
      expect(hasHooksPlugin).toBe(true);
    });

    it("should ignore .next directory", () => {
      const hasNextIgnore = configArray.some((c) => c.ignores?.includes(".next/**"));
      expect(hasNextIgnore).toBe(true);
    });
  });
});

describe("react-library.js configuration", () => {
  let configArray: ConfigObject[];

  beforeAll(async () => {
    const imported = (await import("@repo/config/eslint/react-library")) as {
      default: ConfigObject[];
    };
    configArray = imported.default;
  });

  describe("React library configuration", () => {
    it("should include React plugin", () => {
      const hasReactPlugin = configArray.some((c) => c.plugins && "react" in c.plugins);
      expect(hasReactPlugin).toBe(true);
    });

    it("should include React hooks plugin", () => {
      const hasHooksPlugin = configArray.some((c) => c.plugins && "react-hooks" in c.plugins);
      expect(hasHooksPlugin).toBe(true);
    });

    it("should include jsx-a11y plugin for accessibility", () => {
      const hasA11yPlugin = configArray.some((c) => c.plugins && "jsx-a11y" in c.plugins);
      expect(hasA11yPlugin).toBe(true);
    });

    it("should NOT include Next.js plugin", () => {
      const hasNextPlugin = configArray.some(
        (c) => c.plugins && ("@next/next" in c.plugins || "next" in c.plugins)
      );
      expect(hasNextPlugin).toBe(false);
    });
  });
});

describe("package.json exports", () => {
  let packageJson: PackageJsonExports;

  beforeAll(async () => {
    packageJson = (await import("../package.json")) as PackageJsonExports;
  });

  it("should export eslint/base", () => {
    expect(packageJson.exports["./eslint/base"]).toBe("./src/eslint/base.js");
  });

  it("should export eslint/nextjs", () => {
    expect(packageJson.exports["./eslint/nextjs"]).toBe("./src/eslint/nextjs.js");
  });

  it("should export eslint/react-library", () => {
    expect(packageJson.exports["./eslint/react-library"]).toBe("./src/eslint/react-library.js");
  });
});
