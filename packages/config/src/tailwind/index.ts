/**
 * @repo/config Tailwind CSS Configuration Entry Point
 *
 * This module re-exports all Tailwind CSS theme utilities and provides
 * a constant for the CSS file path that consumers can use for imports.
 *
 * @example
 * ```typescript
 * // Import theme utilities
 * import {
 *   colorPalettes,
 *   spacingScale,
 *   fontFamilies,
 *   TAILWIND_BASE_CSS_PATH
 * } from '@repo/config/tailwind';
 *
 * // In CSS (consuming package)
 * // @import '@repo/config/tailwind/base.css';
 * ```
 */

// Re-export all theme utilities and types
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
  // Type constants for runtime checking
  ColorPalette,
  SpacingKey,
} from "./theme.js";

// Re-export types
export type {
  ColorPalette as ColorPaletteType,
  ColorShade,
  SpacingKey as SpacingKeyType,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  BorderRadius,
  ZIndex,
} from "./theme.js";

/**
 * Path to the Tailwind CSS base configuration file.
 *
 * Use this constant when you need to reference the CSS file path
 * programmatically. For CSS imports, use the subpath export directly:
 * `@import '@repo/config/tailwind/base.css';`
 */
export const TAILWIND_BASE_CSS_PATH = "@repo/config/tailwind/base.css";
