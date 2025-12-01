/**
 * Tests for @repo/config TypeScript configurations.
 *
 * Validates that TypeScript config files:
 * 1. Are valid JSON
 * 2. Enable all required strict options
 * 3. Configure correct module and target settings
 * 4. Are properly structured for monorepo usage
 */
import { beforeAll, describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");
const typescriptDir = resolve(packageRoot, "src/typescript");

/**
 * Helper to read and parse a TypeScript config file
 */
function readTsConfig(filename: string): Record<string, unknown> {
  const filePath = resolve(typescriptDir, filename);
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as Record<string, unknown>;
}

/**
 * Helper to check if a file exists
 */
function configExists(filename: string): boolean {
  return existsSync(resolve(typescriptDir, filename));
}

describe("TypeScript configuration files", () => {
  describe("file existence", () => {
    it("should have base.json", () => {
      expect(configExists("base.json")).toBe(true);
    });

    it("should have nextjs.json", () => {
      expect(configExists("nextjs.json")).toBe(true);
    });

    it("should have react-library.json", () => {
      expect(configExists("react-library.json")).toBe(true);
    });
  });

  describe("valid JSON", () => {
    it("base.json should be valid JSON", () => {
      expect(() => readTsConfig("base.json")).not.toThrow();
    });

    it("nextjs.json should be valid JSON", () => {
      expect(() => readTsConfig("nextjs.json")).not.toThrow();
    });

    it("react-library.json should be valid JSON", () => {
      expect(() => readTsConfig("react-library.json")).not.toThrow();
    });
  });
});

describe("base.json configuration", () => {
  let config: Record<string, unknown>;
  let compilerOptions: Record<string, unknown>;

  beforeAll(() => {
    config = readTsConfig("base.json");
    compilerOptions = config.compilerOptions as Record<string, unknown>;
  });

  describe("strict mode options", () => {
    it("should enable strict mode", () => {
      expect(compilerOptions.strict).toBe(true);
    });

    it("should enable noUncheckedIndexedAccess for safer array/object access", () => {
      expect(compilerOptions.noUncheckedIndexedAccess).toBe(true);
    });

    it("should enable exactOptionalPropertyTypes to distinguish undefined from optional", () => {
      expect(compilerOptions.exactOptionalPropertyTypes).toBe(true);
    });

    it("should enable noImplicitReturns to require explicit returns", () => {
      expect(compilerOptions.noImplicitReturns).toBe(true);
    });
  });

  describe("module settings", () => {
    it("should target ES2022", () => {
      expect(compilerOptions.target).toBe("ES2022");
    });

    it("should use ESNext module system", () => {
      expect(compilerOptions.module).toBe("ESNext");
    });

    it("should use bundler module resolution for Next.js compatibility", () => {
      expect(compilerOptions.moduleResolution).toBe("bundler");
    });
  });

  describe("project references and build settings", () => {
    it("should enable composite for project references", () => {
      expect(compilerOptions.composite).toBe(true);
    });

    it("should enable declaration generation", () => {
      expect(compilerOptions.declaration).toBe(true);
    });

    it("should enable declarationMap for navigation", () => {
      expect(compilerOptions.declarationMap).toBe(true);
    });
  });

  describe("interoperability settings", () => {
    it("should enable esModuleInterop", () => {
      expect(compilerOptions.esModuleInterop).toBe(true);
    });

    it("should enable skipLibCheck", () => {
      expect(compilerOptions.skipLibCheck).toBe(true);
    });

    it("should enable forceConsistentCasingInFileNames", () => {
      expect(compilerOptions.forceConsistentCasingInFileNames).toBe(true);
    });

    it("should enable isolatedModules for bundler compatibility", () => {
      expect(compilerOptions.isolatedModules).toBe(true);
    });

    it("should enable resolveJsonModule", () => {
      expect(compilerOptions.resolveJsonModule).toBe(true);
    });
  });

  describe("schema and display", () => {
    it("should have JSON schema reference", () => {
      expect(config.$schema).toBe("https://json.schemastore.org/tsconfig");
    });

    it("should have display name", () => {
      expect(config.display).toBe("@repo/config/typescript/base");
    });
  });
});

describe("nextjs.json configuration", () => {
  let config: Record<string, unknown>;
  let compilerOptions: Record<string, unknown>;

  beforeAll(() => {
    config = readTsConfig("nextjs.json");
    compilerOptions = config.compilerOptions as Record<string, unknown>;
  });

  describe("inheritance", () => {
    it("should extend base.json", () => {
      expect(config.extends).toBe("./base.json");
    });
  });

  describe("Next.js specific settings", () => {
    it("should include DOM in lib", () => {
      const lib = compilerOptions.lib as string[];
      expect(lib).toContain("DOM");
      expect(lib).toContain("DOM.Iterable");
    });

    it("should preserve JSX for Next.js processing", () => {
      expect(compilerOptions.jsx).toBe("preserve");
    });

    it("should enable Next.js plugin", () => {
      const plugins = compilerOptions.plugins as Array<{ name: string }>;
      expect(plugins).toBeDefined();
      expect(plugins.some((p) => p.name === "next")).toBe(true);
    });

    it("should allow JavaScript files", () => {
      expect(compilerOptions.allowJs).toBe(true);
    });

    it("should enable incremental compilation", () => {
      expect(compilerOptions.incremental).toBe(true);
    });
  });

  describe("schema and display", () => {
    it("should have JSON schema reference", () => {
      expect(config.$schema).toBe("https://json.schemastore.org/tsconfig");
    });

    it("should have display name", () => {
      expect(config.display).toBe("@repo/config/typescript/nextjs");
    });
  });
});

describe("react-library.json configuration", () => {
  let config: Record<string, unknown>;
  let compilerOptions: Record<string, unknown>;

  beforeAll(() => {
    config = readTsConfig("react-library.json");
    compilerOptions = config.compilerOptions as Record<string, unknown>;
  });

  describe("inheritance", () => {
    it("should extend base.json", () => {
      expect(config.extends).toBe("./base.json");
    });
  });

  describe("React library settings", () => {
    it("should include DOM in lib", () => {
      const lib = compilerOptions.lib as string[];
      expect(lib).toContain("DOM");
      expect(lib).toContain("DOM.Iterable");
    });

    it("should use react-jsx for modern JSX transform", () => {
      expect(compilerOptions.jsx).toBe("react-jsx");
    });

    it("should enable declaration for library output", () => {
      expect(compilerOptions.declaration).toBe(true);
    });

    it("should enable declarationMap for library navigation", () => {
      expect(compilerOptions.declarationMap).toBe(true);
    });
  });

  describe("schema and display", () => {
    it("should have JSON schema reference", () => {
      expect(config.$schema).toBe("https://json.schemastore.org/tsconfig");
    });

    it("should have display name", () => {
      expect(config.display).toBe("@repo/config/typescript/react-library");
    });
  });
});

describe("package.json exports", () => {
  const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf-8")) as {
    exports: Record<string, string>;
  };

  it("should export typescript/base", () => {
    expect(packageJson.exports["./typescript/base"]).toBe("./src/typescript/base.json");
  });

  it("should export typescript/nextjs", () => {
    expect(packageJson.exports["./typescript/nextjs"]).toBe("./src/typescript/nextjs.json");
  });

  it("should export typescript/react-library", () => {
    expect(packageJson.exports["./typescript/react-library"]).toBe(
      "./src/typescript/react-library.json"
    );
  });
});
