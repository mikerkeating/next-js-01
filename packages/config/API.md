# @repo/config API Reference

Complete API documentation for all exported configurations and utilities from `@repo/config`.

## Table of Contents

- [TypeScript Configurations](#typescript-configurations)
- [ESLint Configurations](#eslint-configurations)
- [Prettier Configuration](#prettier-configuration)
- [Tailwind CSS](#tailwind-css)
  - [Theme Utilities](#theme-utilities)
  - [Type Guards](#type-guards)
  - [Constants](#constants)
  - [Types](#types)
- [Vitest Configurations](#vitest-configurations)

---

## TypeScript Configurations

### `@repo/config/typescript/base`

Base TypeScript configuration with strict settings for all packages.

**Export**: JSON configuration file (extends via `tsconfig.json`)

**Key Settings**:

| Option                             | Value       | Description                              |
| ---------------------------------- | ----------- | ---------------------------------------- |
| `strict`                           | `true`      | Enable all strict type-checking options  |
| `noUncheckedIndexedAccess`         | `true`      | Add undefined to index signature results |
| `exactOptionalPropertyTypes`       | `true`      | Differentiate optional from undefined    |
| `noImplicitReturns`                | `true`      | Report error when not all paths return   |
| `target`                           | `"ES2022"`  | ECMAScript target version                |
| `module`                           | `"ESNext"`  | Module code generation                   |
| `moduleResolution`                 | `"bundler"` | Module resolution strategy               |
| `composite`                        | `true`      | Enable project references                |
| `declaration`                      | `true`      | Generate .d.ts declaration files         |
| `declarationMap`                   | `true`      | Generate declaration source maps         |
| `esModuleInterop`                  | `true`      | Emit additional JS for CJS compatibility |
| `skipLibCheck`                     | `true`      | Skip type checking of declaration files  |
| `isolatedModules`                  | `true`      | Ensure each file can be transpiled alone |
| `resolveJsonModule`                | `true`      | Allow importing .json files              |
| `forceConsistentCasingInFileNames` | `true`      | Disallow inconsistent file references    |

### `@repo/config/typescript/nextjs`

Next.js-specific TypeScript configuration.

**Export**: JSON configuration file (extends `./base.json`)

**Additional Settings**:

| Option        | Value                               | Description                    |
| ------------- | ----------------------------------- | ------------------------------ |
| `jsx`         | `"preserve"`                        | Let Next.js handle JSX         |
| `lib`         | `["DOM", "DOM.Iterable", "ES2022"]` | Runtime libraries              |
| `plugins`     | `[{ "name": "next" }]`              | Next.js TypeScript plugin      |
| `allowJs`     | `true`                              | Allow JavaScript files         |
| `incremental` | `true`                              | Enable incremental compilation |

### `@repo/config/typescript/react-library`

TypeScript configuration for React component libraries.

**Export**: JSON configuration file (extends `./base.json`)

**Additional Settings**:

| Option           | Value                               | Description                  |
| ---------------- | ----------------------------------- | ---------------------------- |
| `jsx`            | `"react-jsx"`                       | Modern JSX runtime transform |
| `lib`            | `["DOM", "DOM.Iterable", "ES2022"]` | Runtime libraries            |
| `declaration`    | `true`                              | Generate .d.ts files         |
| `declarationMap` | `true`                              | Generate declaration maps    |

---

## ESLint Configurations

All ESLint configurations export flat config arrays compatible with ESLint v9+.

### `@repo/config/eslint/base`

Base ESLint configuration for TypeScript projects.

**Export**: `default` - ESLint flat config array

**Included Rules**:

- `@typescript-eslint/recommended` - TypeScript recommended rules
- `@typescript-eslint/strict` - Strict TypeScript rules
- `import/order` - Import statement ordering
- `no-unused-vars` - Disabled in favor of TypeScript version

**Ignored Patterns**:

- `node_modules/**`
- `dist/**`
- `coverage/**`

### `@repo/config/eslint/nextjs`

ESLint configuration for Next.js applications.

**Export**: `default` - ESLint flat config array

**Extends**: Base config

**Additional Plugins**:

- `@next/eslint-plugin-next` - Next.js specific rules
- `eslint-plugin-react` - React rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-jsx-a11y` - Accessibility rules

**Additional Ignores**:

- `.next/**`

### `@repo/config/eslint/react-library`

ESLint configuration for React component libraries.

**Export**: `default` - ESLint flat config array

**Extends**: Base config (without Next.js plugin)

**Included Plugins**:

- `eslint-plugin-react` - React rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-jsx-a11y` - Accessibility rules

---

## Prettier Configuration

### `@repo/config/prettier`

Shared Prettier formatting configuration.

**Export**: `default` - Prettier configuration object

**Settings**:

| Option          | Value                             | Description                         |
| --------------- | --------------------------------- | ----------------------------------- |
| `semi`          | `true`                            | Add semicolons at end of statements |
| `singleQuote`   | `true`                            | Use single quotes for strings       |
| `trailingComma` | `"es5"`                           | Trailing commas where valid in ES5  |
| `tabWidth`      | `2`                               | Spaces per indentation level        |
| `printWidth`    | `100`                             | Line wrap at 100 characters         |
| `plugins`       | `["prettier-plugin-tailwindcss"]` | Tailwind class sorting              |

---

## Tailwind CSS

### CSS Configuration

#### `@repo/config/tailwind/base.css`

CSS file containing design system theme tokens using Tailwind v4's `@theme` directive.

**Usage**:

```css
@import "tailwindcss";
@import "@repo/config/tailwind/base.css";
```

**Defined Tokens**:

- Color palettes (primary, secondary, accent, neutral, success, warning, error)
- Spacing scale (4px base unit)
- Typography (font families, sizes, weights, line heights)
- Border radius
- Shadows
- Animations
- Z-index scale
- Dark mode support (via `prefers-color-scheme` and `.dark` class)

### Theme Utilities

#### `@repo/config/tailwind`

TypeScript entry point re-exporting all theme utilities.

#### `@repo/config/tailwind/theme`

Direct import for theme token values.

---

### Color Utilities

#### `colorPalettes`

```typescript
const colorPalettes: readonly [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "success",
  "warning",
  "error",
];
```

Array of available color palette names in the design system.

#### `colorShades`

```typescript
const colorShades: readonly [
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
];
```

Array of available shade values for each color palette.

#### `getCssColorVar(palette, shade)`

```typescript
function getCssColorVar(palette: ColorPalette, shade: ColorShade): string;
```

Generates a CSS variable reference for a color token.

**Parameters**:

- `palette` - Color palette name (`"primary"`, `"secondary"`, etc.)
- `shade` - Shade value (`"50"`, `"100"`, ... `"950"`)

**Returns**: CSS variable reference string

**Example**:

```typescript
getCssColorVar("primary", "500");
// Returns: "var(--color-primary-500)"
```

---

### Spacing Utilities

#### `spacingScale`

```typescript
const spacingScale: {
  "0": "0";
  px: "1px";
  "0.5": "0.125rem";
  "1": "0.25rem";
  // ... through "96": "24rem"
};
```

Object mapping spacing keys to CSS values. Based on 4px (0.25rem) base unit.

#### `spacingToPx(key)`

```typescript
function spacingToPx(key: SpacingKey): number;
```

Converts a spacing key to its pixel value (assuming 16px base font).

**Parameters**:

- `key` - Spacing scale key (`"0"`, `"1"`, `"4"`, etc.)

**Returns**: Pixel value as number

**Example**:

```typescript
spacingToPx("4"); // Returns: 16
spacingToPx("8"); // Returns: 32
spacingToPx("px"); // Returns: 1
spacingToPx("0"); // Returns: 0
```

---

### Typography Utilities

#### `fontFamilies`

```typescript
const fontFamilies: {
  sans: string; // System sans-serif stack
  serif: string; // System serif stack
  mono: string; // System monospace stack
};
```

Font family definitions matching CSS custom properties.

#### `fontSizes`

```typescript
const fontSizes: {
  xs: "0.75rem";
  sm: "0.875rem";
  base: "1rem";
  lg: "1.125rem";
  xl: "1.25rem";
  "2xl": "1.5rem";
  // ... through "9xl": "8rem"
};
```

Font size scale in rem units.

#### `fontWeights`

```typescript
const fontWeights: {
  thin: 100;
  extralight: 200;
  light: 300;
  normal: 400;
  medium: 500;
  semibold: 600;
  bold: 700;
  extrabold: 800;
  black: 900;
};
```

Font weight numeric values.

#### `lineHeights`

```typescript
const lineHeights: {
  none: 1;
  tight: 1.25;
  snug: 1.375;
  normal: 1.5;
  relaxed: 1.625;
  loose: 2;
};
```

Line height multipliers.

---

### Layout Utilities

#### `borderRadius`

```typescript
const borderRadius: {
  none: "0";
  sm: "0.125rem";
  default: "0.25rem";
  md: "0.375rem";
  lg: "0.5rem";
  xl: "0.75rem";
  "2xl": "1rem";
  "3xl": "1.5rem";
  full: "9999px";
};
```

Border radius values.

#### `zIndex`

```typescript
const zIndex: {
  "0": 0;
  "10": 10;
  "20": 20;
  "30": 30;
  "40": 40;
  "50": 50;
  auto: "auto";
};
```

Z-index scale for layering elements.

---

### Type Guards

#### `isColorPalette(value)`

```typescript
function isColorPalette(value: string): value is ColorPalette;
```

Type guard to check if a string is a valid color palette name.

**Example**:

```typescript
if (isColorPalette(userInput)) {
  // TypeScript knows userInput is ColorPalette
  const cssVar = getCssColorVar(userInput, "500");
}
```

#### `isColorShade(value)`

```typescript
function isColorShade(value: string): value is ColorShade;
```

Type guard to check if a string is a valid color shade.

#### `isSpacingKey(value)`

```typescript
function isSpacingKey(value: string): value is SpacingKey;
```

Type guard to check if a string is a valid spacing key.

---

### Constants

#### `TAILWIND_BASE_CSS_PATH`

```typescript
const TAILWIND_BASE_CSS_PATH: "@repo/config/tailwind/base.css";
```

Path constant for the Tailwind base CSS file. Use for programmatic reference.

---

### Types

#### `ColorPaletteType`

```typescript
type ColorPaletteType =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error";
```

Union type of valid color palette names.

#### `ColorShade`

```typescript
type ColorShade =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "950";
```

Union type of valid color shades.

#### `SpacingKeyType`

```typescript
type SpacingKeyType = "0" | "px" | "0.5" | "1" | "1.5" | "2" | ... | "96"
```

Union type of valid spacing scale keys.

#### `FontFamily`

```typescript
type FontFamily = "sans" | "serif" | "mono";
```

#### `FontSize`

```typescript
type FontSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | ... | "9xl"
```

#### `FontWeight`

```typescript
type FontWeight =
  | "thin"
  | "extralight"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";
```

#### `LineHeight`

```typescript
type LineHeight = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose";
```

#### `BorderRadius`

```typescript
type BorderRadius = "none" | "sm" | "default" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
```

#### `ZIndex`

```typescript
type ZIndex = "0" | "10" | "20" | "30" | "40" | "50" | "auto";
```

---

## Vitest Configurations

### `@repo/config/vitest/base`

Base Vitest configuration for all packages.

**Export**: `baseConfig` - Vitest config object

**Settings**:

| Option        | Value         | Description                 |
| ------------- | ------------- | --------------------------- |
| `globals`     | `true`        | Enable global test APIs     |
| `environment` | `"happy-dom"` | Default DOM implementation  |
| `pool`        | `"threads"`   | Run tests in worker threads |
| `testTimeout` | `10000`       | 10s timeout per test        |
| `hookTimeout` | `10000`       | 10s timeout for hooks       |

**Include Patterns**: `["**/*.test.ts", "**/*.test.tsx"]`

**Exclude Patterns**: `["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**"]`

### `@repo/config/vitest/coverage`

Coverage configuration for Vitest.

**Export**: `coverageConfig` - Coverage options object

**Settings**:

| Option             | Value                                      | Description           |
| ------------------ | ------------------------------------------ | --------------------- |
| `provider`         | `"v8"`                                     | V8 native coverage    |
| `enabled`          | `false`                                    | Off by default        |
| `reportsDirectory` | `"coverage"`                               | Output directory      |
| `reporter`         | `["text", "lcov", "html", "json-summary"]` | Report formats        |
| `thresholds`       | `{ lines: 15, branches: 5, ... }`          | Minimum coverage      |
| `include`          | `["src/**/*.{ts,tsx}"]`                    | Source file patterns  |
| `clean`            | `true`                                     | Clean before each run |

### `@repo/config/vitest/setup-react`

Setup file for React component testing.

**Export**: Setup file (import as `setupFiles`)

**Provides**:

- `@testing-library/jest-dom` matchers
- React Testing Library configuration

### `@repo/config/vitest/setup-msw`

Setup file for MSW (Mock Service Worker) API mocking.

**Export**: Setup file (import as `setupFiles`)

**Provides**:

- MSW server setup and teardown
- Request handler configuration

---

## Import Examples

### TypeScript (tsconfig.json)

```json
{
  "extends": "@repo/config/typescript/nextjs"
}
```

### ESLint (eslint.config.js)

```javascript
import nextjsConfig from "@repo/config/eslint/nextjs";

export default [...nextjsConfig];
```

### Prettier (prettier.config.js)

```javascript
export { default } from "@repo/config/prettier";
```

### Tailwind (globals.css)

```css
@import "tailwindcss";
@import "@repo/config/tailwind/base.css";
```

### Tailwind Utilities (TypeScript)

```typescript
import {
  colorPalettes,
  getCssColorVar,
  spacingToPx,
  isColorPalette,
  type ColorPaletteType,
  type SpacingKeyType,
} from "@repo/config/tailwind";
```

### Vitest (vitest.config.ts)

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "@repo/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Package-specific config
    },
  })
);
```
