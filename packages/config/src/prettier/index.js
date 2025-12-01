/**
 * Prettier configuration for the monorepo.
 *
 * This configuration enforces consistent code formatting across all packages.
 * Settings are aligned with the coding standards defined in:
 * docs/2-technical/references/coding-standards.md
 *
 * @type {import('prettier').Config}
 */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: "es5",
  tabWidth: 2,
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
};
