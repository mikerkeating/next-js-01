/**
 * @repo/config Tailwind CSS Theme TypeScript Exports
 *
 * This module provides type-safe access to theme token values defined in base.css.
 * Use these exports for:
 * - Type-safe color palette names
 * - Programmatic access to spacing values
 * - Font family definitions
 * - Integration with design tools and other JavaScript/TypeScript code
 *
 * @example
 * ```typescript
 * import { colorPalettes, spacingScale, fontFamilies } from '@repo/config/tailwind/theme';
 *
 * // Type-safe color palette access
 * const primaryColor = `bg-${colorPalettes[0]}-500`;
 *
 * // Programmatic spacing calculation
 * const padding = spacingScale['4']; // '1rem'
 * ```
 */

/* ==========================================================================
   Color Palettes
   ========================================================================== */

/**
 * Available color palette names in the design system.
 * These correspond to the CSS custom property prefixes defined in base.css.
 */
export const colorPalettes = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "success",
  "warning",
  "error",
] as const;

/**
 * Type representing a valid color palette name.
 */
export type ColorPalette = (typeof colorPalettes)[number];

/**
 * Color shade values available for each palette (50-950).
 */
export const colorShades = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

/**
 * Type representing a valid color shade.
 */
export type ColorShade = (typeof colorShades)[number];

/**
 * Helper to generate a CSS variable reference for a color token.
 *
 * @example
 * ```typescript
 * getCssColorVar('primary', '500'); // 'var(--color-primary-500)'
 * ```
 */
export function getCssColorVar(palette: ColorPalette, shade: ColorShade): string {
  return `var(--color-${palette}-${shade})`;
}

/* ==========================================================================
   Spacing Scale
   ========================================================================== */

/**
 * Spacing scale based on 4px base unit.
 * Keys are Tailwind spacing class names, values are CSS rem values.
 *
 * The scale follows a 4px grid:
 * - 1 = 4px = 0.25rem
 * - 2 = 8px = 0.5rem
 * - 4 = 16px = 1rem
 * - etc.
 */
export const spacingScale = {
  "0": "0",
  px: "1px",
  "0.5": "0.125rem",
  "1": "0.25rem",
  "1.5": "0.375rem",
  "2": "0.5rem",
  "2.5": "0.625rem",
  "3": "0.75rem",
  "3.5": "0.875rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
  "11": "2.75rem",
  "12": "3rem",
  "14": "3.5rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "28": "7rem",
  "32": "8rem",
  "36": "9rem",
  "40": "10rem",
  "44": "11rem",
  "48": "12rem",
  "52": "13rem",
  "56": "14rem",
  "60": "15rem",
  "64": "16rem",
  "72": "18rem",
  "80": "20rem",
  "96": "24rem",
} as const;

/**
 * Type representing valid spacing scale keys.
 */
export type SpacingKey = keyof typeof spacingScale;

/**
 * Converts a spacing key to its pixel value.
 *
 * @example
 * ```typescript
 * spacingToPx('4'); // 16
 * spacingToPx('2'); // 8
 * ```
 */
export function spacingToPx(key: SpacingKey): number {
  const value = spacingScale[key];
  if (value === "0") return 0;
  if (value === "1px") return 1;
  // Convert rem to px (assuming 16px base)
  const remValue = parseFloat(value);
  return remValue * 16;
}

/* ==========================================================================
   Typography
   ========================================================================== */

/**
 * Font family definitions matching the CSS custom properties.
 * System font stack for optimal performance.
 */
export const fontFamilies = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

/**
 * Type representing valid font family keys.
 */
export type FontFamily = keyof typeof fontFamilies;

/**
 * Font size scale matching Tailwind defaults.
 * Values are in rem.
 */
export const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
  "7xl": "4.5rem",
  "8xl": "6rem",
  "9xl": "8rem",
} as const;

/**
 * Type representing valid font size keys.
 */
export type FontSize = keyof typeof fontSizes;

/**
 * Font weight values.
 */
export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

/**
 * Type representing valid font weight keys.
 */
export type FontWeight = keyof typeof fontWeights;

/**
 * Line height values.
 */
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

/**
 * Type representing valid line height keys.
 */
export type LineHeight = keyof typeof lineHeights;

/* ==========================================================================
   Border Radius
   ========================================================================== */

/**
 * Border radius scale.
 */
export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  default: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

/**
 * Type representing valid border radius keys.
 */
export type BorderRadius = keyof typeof borderRadius;

/* ==========================================================================
   Z-Index Scale
   ========================================================================== */

/**
 * Z-index scale for layering elements.
 */
export const zIndex = {
  "0": 0,
  "10": 10,
  "20": 20,
  "30": 30,
  "40": 40,
  "50": 50,
  auto: "auto",
} as const;

/**
 * Type representing valid z-index keys.
 */
export type ZIndex = keyof typeof zIndex;

/* ==========================================================================
   Type Guards and Utilities
   ========================================================================== */

/**
 * Type guard to check if a string is a valid color palette.
 */
export function isColorPalette(value: string): value is ColorPalette {
  return colorPalettes.includes(value as ColorPalette);
}

/**
 * Type guard to check if a string is a valid color shade.
 */
export function isColorShade(value: string): value is ColorShade {
  return colorShades.includes(value as ColorShade);
}

/**
 * Type guard to check if a string is a valid spacing key.
 */
export function isSpacingKey(value: string): value is SpacingKey {
  return value in spacingScale;
}

/* ==========================================================================
   Constants Export for Type Checking
   ========================================================================== */

/**
 * Exported constant for ColorPalette type checking in runtime.
 * Used in tests to verify type exports.
 */
export const ColorPalette = colorPalettes;

/**
 * Exported constant for SpacingKey type checking in runtime.
 * Used in tests to verify type exports.
 */
export const SpacingKey = Object.keys(spacingScale);
