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
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
