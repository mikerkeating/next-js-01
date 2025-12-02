/**
 * ESLint flat configuration for @repo/database.
 *
 * Extends the shared base configuration from @repo/config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
import base from "@repo/config/eslint/base";

export default [
  ...base,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.ts", // Drizzle config is outside src and tsconfig project
      "*.config.js", // ESLint config itself
    ],
  },
  // Allow console.log in CLI scripts (they output to terminal)
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  // Allow console.log in integration tests (for debugging/observability)
  {
    files: ["src/__tests__/integration/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];
