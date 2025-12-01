/**
 * Base ESLint flat configuration for the monorepo.
 *
 * This configuration provides:
 * - Core JavaScript/TypeScript linting rules
 * - TypeScript parser integration with type-aware rules
 * - Import ordering per coding standards
 * - Common ignores for build artifacts
 *
 * @example
 * // eslint.config.js in consuming package
 * import base from "@repo/config/eslint/base";
 *
 * export default [
 *   ...base,
 *   {
 *     // Package-specific overrides
 *   },
 * ];
 *
 * @type {import('eslint').Linter.Config[]}
 */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

/**
 * Creates a base ESLint configuration for TypeScript projects.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.tsconfigRootDir] - Root directory for tsconfig resolution
 * @returns {import('eslint').Linter.Config[]} ESLint flat config array
 */
export function createBaseConfig(options = {}) {
  const { tsconfigRootDir } = options;

  return [
    // Global ignores (applies to all configs)
    {
      ignores: [
        "node_modules/**",
        "dist/**",
        ".next/**",
        ".turbo/**",
        "coverage/**",
        "*.config.js",
        "*.config.mjs",
        "*.config.cjs",
        "src/eslint/**/*.js",
        "src/prettier/**/*.cjs",
      ],
    },

    // Base JavaScript recommended rules
    js.configs.recommended,

    // TypeScript configuration
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx"],
    })),

    // TypeScript files configuration
    {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: true,
          ...(tsconfigRootDir && { tsconfigRootDir }),
          ecmaVersion: "latest",
          sourceType: "module",
        },
        globals: {
          ...globals.node,
          ...globals.es2022,
        },
      },
      plugins: {
        "@typescript-eslint": tseslint.plugin,
        import: importPlugin,
      },
      rules: {
        // Disable base rules that conflict with TypeScript
        "no-unused-vars": "off",
        "no-undef": "off",

        // TypeScript-specific rules
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
          },
        ],
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
          },
        ],

        // Import ordering per coding standards
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
            pathGroups: [
              {
                pattern: "@repo/**",
                group: "internal",
                position: "before",
              },
            ],
            pathGroupsExcludedImportTypes: ["type"],
            "newlines-between": "always",
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
          },
        ],
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",

        // General code quality
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": "error",
        "no-var": "error",
        eqeqeq: ["error", "always", { null: "ignore" }],
      },
      settings: {
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
    },

    // JavaScript files configuration (less strict)
    {
      files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
          ...globals.node,
          ...globals.es2022,
        },
      },
      plugins: {
        import: importPlugin,
      },
      rules: {
        "no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
          },
        ],
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
            "newlines-between": "always",
          },
        ],
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": "error",
        "no-var": "error",
      },
    },
  ];
}

/**
 * Default base configuration.
 *
 * For most packages, import this directly:
 *
 * @example
 * import base from "@repo/config/eslint/base";
 * export default [...base];
 */
export default createBaseConfig();
