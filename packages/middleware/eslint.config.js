/**
 * ESLint flat configuration for @repo/middleware.
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
      "*.config.js", // ESLint config itself
      "*.config.ts", // Vitest config is outside tsconfig project
      "tests/**", // Tests are outside tsconfig project
    ],
  },
];
