/**
 * @repo/config - Centralized configuration for the monorepo
 *
 * This package provides shared configuration files for:
 * - TypeScript (base, Next.js, React presets)
 * - ESLint (base, Next.js, React rules)
 * - Prettier (formatting rules)
 * - Tailwind CSS (base config, theme tokens, and presets)
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
 * // For Tailwind CSS theme tokens (TypeScript)
 * import { colorPalettes, spacingScale, fontFamilies } from "@repo/config/tailwind";
 *
 * // For Tailwind CSS base styles (CSS)
 * // @import "@repo/config/tailwind/base.css";
 * ```
 *
 * @packageDocumentation
 */

// Re-export Tailwind theme utilities from the main entry point
// for convenient access to theme tokens programmatically
export {
  // Color utilities
  colorPalettes,
  colorShades,
  getCssColorVar,
  isColorPalette,
  isColorShade,
  // Spacing utilities
  spacingScale,
  spacingToPx,
  isSpacingKey,
  // Typography utilities
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  // Layout utilities
  borderRadius,
  zIndex,
  // CSS path constant
  TAILWIND_BASE_CSS_PATH,
} from "./tailwind/index.js";

// Re-export types
export type {
  ColorPaletteType,
  ColorShade,
  SpacingKeyType,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  BorderRadius,
  ZIndex,
} from "./tailwind/index.js";
