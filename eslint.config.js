/**
 * Root ESLint flat configuration.
 *
 * This configuration is used by lint-staged during pre-commit hooks.
 * It extends the shared base configuration from @repo/config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
import base from "./packages/config/src/eslint/base.js";

export default [
  ...base,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".turbo/**",
      "dist/**",
      "coverage/**",
      "apps/**", // Apps have their own configs
      "packages/**", // Packages have their own configs
    ],
  },
];
