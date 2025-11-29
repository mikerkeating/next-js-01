# Story 2A.1.S5: Configure Tailwind CSS v4 with Theme Tokens

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Configuration Package](./EPIC.md)
- **Depends On**: [S1](./S1-package-structure.md), [S2](./S2-typescript-config.md), [S3](./S3-eslint-config.md), [S4](./S4-prettier-config.md)
- **Blocks**: [S6](./S6-integration.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer working in the monorepo
**I want** a shared Tailwind CSS v4 configuration with design system theme tokens
**So that** all UI-consuming packages have consistent styling and access to branded design tokens without duplicating theme configuration

## Acceptance Criteria

- [ ] Tailwind CSS v4 base configuration exists at `packages/config/src/tailwind/base.css`
- [ ] Theme tokens defined using CSS-first configuration (CSS custom properties)
- [ ] Color tokens include primary, secondary, accent, neutral, success, warning, error palettes
- [ ] Spacing scale follows 4px base unit system (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, etc.)
- [ ] Typography scale includes font families, sizes, weights, and line heights
- [ ] Package exports are updated to expose Tailwind config via `@repo/config/tailwind`
- [ ] A consuming package can import and use the CSS configuration
- [ ] CSS custom properties are available to consuming packages for runtime theming
- [ ] Dark mode is supported via CSS custom properties and `prefers-color-scheme`

## Technical Requirements

### Files to Create

| Path                                    | Purpose                                         |
| --------------------------------------- | ----------------------------------------------- |
| `packages/config/src/tailwind/base.css` | Tailwind CSS v4 configuration with theme tokens |
| `packages/config/src/tailwind/theme.ts` | TypeScript exports for theme token values       |
| `packages/config/src/tailwind/index.ts` | Package entry point for Tailwind exports        |

### Files to Modify

| Path                           | Changes                                        |
| ------------------------------ | ---------------------------------------------- |
| `packages/config/package.json` | Add Tailwind config exports to `exports` field |
| `packages/config/package.json` | Add Tailwind CSS peer dependency               |
| `packages/config/src/index.ts` | Re-export Tailwind theme utilities             |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

Peer dependencies (declared in package.json):

- `tailwindcss` - per canonical-versions.md (v4.x)

### Configuration Details

| Setting           | Requirement                                      | TAD Reference                                                |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Config format     | CSS-first configuration (v4 default)             | [EPIC: Technology Decisions](./EPIC.md#technology-decisions) |
| Color tokens      | CSS custom properties with light/dark support    | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)  |
| Spacing           | 4px base unit scale                              | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)  |
| Typography        | System font stack with fallbacks                 | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)  |
| Dark mode         | `prefers-color-scheme` with manual toggle option | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)  |
| Container queries | Enabled for responsive components                | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)  |

**Configuration Rationale**: Tailwind CSS v4 uses a CSS-first configuration approach where theme tokens are defined as CSS custom properties. This enables runtime theming and better integration with design tools. The 4px base unit ensures consistent spacing across the design system.

For package structure details, see: [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)

## Test Requirements

### Manual Verification

- [ ] **CSS Import**: Import base.css in a consuming package, verify styles apply
- [ ] **Theme Tokens**: Use a theme token class (e.g., `bg-primary`), verify correct color
- [ ] **Dark Mode**: Toggle dark mode, verify colors switch appropriately
- [ ] **Spacing Scale**: Apply spacing utilities, verify consistent 4px-based sizing

### Automated Tests

- [ ] Unit: `packages/config/tests/tailwind.test.ts` - Verify CSS file is valid and parseable
- [ ] Unit: `packages/config/tests/tailwind.test.ts` - Verify theme.ts exports expected token values
- [ ] Unit: `packages/config/tests/tailwind.test.ts` - Verify color palettes have required shades

### Integration Tests

- [ ] Theme tokens correctly cascade when imported in consuming package's CSS

### Verification Commands

```bash
# Verify CSS file exists and is valid
pnpm --filter @repo/config exec cat src/tailwind/base.css | head -50

# Verify TypeScript exports compile
pnpm --filter @repo/config exec tsc --noEmit

# Verify package exports resolve correctly
pnpm --filter @repo/config exec node -e "console.log(require('@repo/config/tailwind'))"

# Test Tailwind compilation with config
cd apps/routing && pnpm exec tailwindcss --help
```

## Implementation Notes

### Implementation Sequence

1. **Create base.css**
   - Define CSS custom properties for theme tokens
   - Configure color palettes with light/dark variants
   - Set up spacing scale based on 4px unit
   - Define typography tokens (font families, sizes, weights)

2. **Create theme.ts**
   - Export TypeScript constants for theme values
   - Provide type-safe access to color palette names
   - Export spacing scale values for programmatic use

3. **Create index.ts**
   - Re-export theme utilities and constants
   - Provide path to base.css for CSS imports

4. **Update package.json exports**
   - Add exports for CSS file and TypeScript modules
   - Configure proper module resolution

### Key Concepts

- **CSS-First Config**: Tailwind v4 uses CSS `@theme` directive instead of JavaScript config
- **Custom Properties**: Theme tokens defined as `--color-primary-500` CSS variables
- **Design Tokens**: Systematic naming for colors, spacing, typography
- **Dark Mode**: Uses CSS custom properties that change based on color scheme preference

### Common Patterns

Reference the TAD for implementation patterns:

- [TAD: @repo/config Structure](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)

Key pattern notes for this story:

- Use semantic color names (primary, secondary) not raw colors (blue, red)
- Define both light and dark mode values using CSS custom properties
- Spacing values should be multiples of 4px for consistency
- Export TypeScript types for theme values to enable type-safe usage

### Troubleshooting

| Issue                           | Cause                                  | Solution                                               |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| CSS variables not applying      | Missing `@import` of base.css          | Ensure base.css is imported in consuming package's CSS |
| Dark mode not working           | Missing color scheme media query       | Verify `prefers-color-scheme` media queries in CSS     |
| Tailwind classes not generating | PostCSS not processing the CSS         | Verify PostCSS config includes Tailwind v4 plugin      |
| Theme token TypeScript errors   | Incorrect export paths in package.json | Verify exports field maps to correct file paths        |

### Reference Materials

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 CSS-First Configuration](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Base CSS configuration with theme tokens: 2h
- TypeScript theme exports: 1h
- Dark mode configuration: 1h
- Package exports and testing: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Package structure and exports patterns
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) - Tailwind CSS v4 selection and styling approach
- [EPIC: Technology Decisions](./EPIC.md#technology-decisions) - CSS-first configuration decision

### Story-Specific Decisions

#### AD-2A.1.S5.1: CSS Custom Properties for Theme Tokens

**Scope**: Story-specific (does not affect other stories)

**Decision**: Define all theme tokens as CSS custom properties rather than using Tailwind's JavaScript theme configuration.

**Rationale**:

- Tailwind v4's recommended approach is CSS-first configuration
- CSS custom properties enable runtime theming without rebuild
- Better integration with design tools and CSS-in-JS libraries
- Allows dark mode toggle without JavaScript class manipulation

**Consequences**:

- Theme values accessible in both CSS and JavaScript
- Slightly different syntax than Tailwind v3 configurations
- Consuming packages can override individual tokens easily

**Alternatives Considered**:

- **JavaScript theme config with v3 compatibility**: Rejected because v4 CSS-first is the future direction and provides better runtime capabilities

#### AD-2A.1.S5.2: 4px Base Unit Spacing Scale

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use a 4px base unit for the spacing scale (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, etc. pixels).

**Rationale**:

- 4px is the industry standard for design systems (Material Design, Ant Design)
- Provides enough granularity for fine-tuning while maintaining consistency
- Works well with common display densities and grid systems
- Easy mental math for designers and developers

**Consequences**:

- Spacing values are multiples of 4 (or 0.25rem at 16px base)
- Custom spacing can be added for edge cases using arbitrary values

## Out of Scope

- **Component-specific Tailwind classes** - Handled in @repo/ui (Epic 2A.5)
- **Animation utilities** - Added as needed in @repo/ui
- **Custom Tailwind plugins** - Deferred to Epic 2A.5 when component needs arise
- **Design token documentation site** - Deferred to Epic 4A.2 (Storybook)
- **Brand-specific color palettes** - Organization branding handled at application level

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package structure - The `packages/config` directory and base package.json must exist
- **S2**: TypeScript config - Required for type-safe theme exports
- **S3**: ESLint config - Required for linting Tailwind-related code
- **S4**: Prettier config - Required for Tailwind class sorting (prettier-plugin-tailwindcss)

### Enables (Unblocks These Stories)

- **S6**: Integration - Applies Tailwind config across all monorepo packages
- **Epic 2A.5**: UI Component Library - Uses Tailwind theme tokens for component styling

## References

### Epic & TAD References

- [EPIC.md: Configuration Package](./EPIC.md)
- [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 CSS-First Configuration](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens](https://www.designtokens.org/)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Structure) completed
- [ ] S2 (TypeScript Config) completed
- [ ] S3 (ESLint Config) completed
- [ ] S4 (Prettier Config) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing

### Documentation

- [ ] Package README updated with Tailwind config usage
- [ ] Theme token values documented in code comments

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
