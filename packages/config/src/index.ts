/**
 * @repo/config - Centralized configuration for the monorepo
 *
 * This package provides shared configuration files for:
 * - TypeScript (base, Next.js, React presets)
 * - ESLint (base, Next.js, React rules)
 * - Prettier (formatting rules)
 * - Tailwind CSS (base config and presets)
 * - Vitest (test configuration)
 *
 * Configuration exports are accessed via subpath exports:
 * @example
 * ```typescript
 * // In tsconfig.json
 * { "extends": "@repo/config/typescript/base" }
 *
 * // In eslint.config.js
 * import baseConfig from "@repo/config/eslint/base";
 *
 * // In prettier.config.js
 * export { default } from "@repo/config/prettier";
 *
 * // In tailwind.config.ts
 * import baseConfig from "@repo/config/tailwind";
 * ```
 *
 * @packageDocumentation
 */

// This file serves as a placeholder entry point.
// Actual configurations are exported via subpath exports in package.json.
// See the exports field in package.json for available configuration paths.

export {};
