# Story 2A.5.S2: Configure shadcn/ui CLI and Tailwind Theme

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: [S1 - Create @repo/ui Package Structure](./S1-package-structure.md)
- **Blocks**: [S3 - Implement Form Components](./S3-form-components.md), [S4 - Implement Layout Components](./S4-layout-components.md), [S5 - Implement Feedback Components](./S5-feedback-components.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** shadcn/ui CLI configured with Tailwind v4 theme tokens
**So that** I can add components using the CLI and maintain consistent styling across all applications

## Acceptance Criteria

- [ ] shadcn/ui CLI is initialized and configured in `@repo/ui` package
- [ ] `components.json` configuration enables CLI component installation
- [ ] Tailwind CSS v4 is installed with theme tokens defined
- [ ] Design system tokens (colors, spacing, typography) are configured
- [ ] Light and dark mode theme variables are defined
- [ ] Theme configuration is exported and consumable by all applications
- [ ] CSS variables follow shadcn/ui conventions for component theming
- [ ] `cn()` utility function is available for conditional class merging
- [ ] CLI can successfully add a test component (Button) to verify setup

## Technical Requirements

### Files to Create

| Path                                       | Purpose                               |
| ------------------------------------------ | ------------------------------------- |
| `packages/ui/components.json`              | shadcn/ui CLI config                  |
| `packages/ui/src/lib/utils.ts`             | `cn()` utility function               |
| `packages/ui/src/styles/globals.css`       | Tailwind directives + theme variables |
| `packages/ui/tailwind.config.ts`           | Tailwind v4 config                    |
| `packages/ui/postcss.config.mjs`           | PostCSS config                        |
| `packages/ui/src/components/ui/button.tsx` | Test component (via CLI)              |
| `packages/ui/src/components/ui/index.ts`   | Component exports                     |
| `packages/ui/tsconfig.json`                | TypeScript config                     |
| `packages/ui/.eslintrc.js`                 | ESLint config                         |
| `packages/ui/README.md`                    | Usage documentation                   |

### Files to Modify

| Path                       | Changes                             |
| -------------------------- | ----------------------------------- |
| `packages/ui/package.json` | Add dependencies, build scripts     |
| `turbo.json`               | Add `@repo/ui#build` task if needed |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to UI package
cd packages/ui

# Install core UI dependencies
pnpm add react react-dom
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Install Tailwind CSS v4 and tooling
pnpm add -D tailwindcss postcss autoprefixer

# Install TypeScript and React types
pnpm add -D typescript @types/react @types/react-dom

# Install shadcn/ui CLI globally (optional, can use npx)
pnpm add -D shadcn
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                 | Requirement                                    | TAD Reference                                                  |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `components.json` style | "new-york" style                               | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)    |
| `components.json` color | "slate" base color                             | [TAD: UI Components](/docs/2-technical/2-tad-ui-components.md) |
| CSS variables           | Enable for theme customization                 | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)    |
| Theme tokens            | Define primary, secondary, accent, destructive | [TAD: UI Components](/docs/2-technical/2-tad-ui-components.md) |
| Dark mode               | Tailwind v4 `class` strategy                   | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)    |
| Typography              | Type scale (xs to 4xl)                         | [TAD: UI Components](/docs/2-technical/2-tad-ui-components.md) |
| Border radius           | Radius tokens (sm, md, lg)                     | [TAD: UI Components](/docs/2-technical/2-tad-ui-components.md) |

**Configuration Rationale**: CSS variables enable runtime theme switching. "new-york" style provides refined aesthetics. Tailwind v4 `class` mode allows explicit theme control. See [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling) for complete templates.

## Test Requirements

### Manual Verification

- [ ] **shadcn/ui CLI Test**: Run `pnpm dlx shadcn@latest add button` and verify component is added to `src/components/ui/`
- [ ] **Theme Switching**: Toggle between light and dark mode in a test app and verify theme variables update correctly
- [ ] **Import Test**: Import Button component from `@repo/ui` in a test application and verify it renders with correct styles

### Automated Tests

- [ ] Unit: `utils.test.ts` - Test `cn()` utility merges classes correctly and handles conflicts
- [ ] Unit: `button.test.tsx` - Test Button component renders all variants and sizes
- [ ] Integration: Verify Tailwind classes are properly resolved in built output

### Verification Commands

```bash
# Verify CLI setup and test component installation
cd packages/ui && cat components.json
pnpm dlx shadcn@latest add button
ls -la src/components/ui/button.tsx

# Build and verify package
pnpm build && ls -la dist/
pnpm typecheck && pnpm lint

# Test importing from consuming app
cd ../../apps/demo && pnpm add @repo/ui
```

## Implementation Notes

### Implementation Sequence

1. **Initialize shadcn/ui**: Run `pnpm dlx shadcn@latest init` with new-york style, slate color, CSS variables enabled
2. **Configure Tailwind v4**: Create config with theme tokens, CSS variables for light/dark modes, PostCSS setup
3. **Create Utilities**: Implement `cn()` using `clsx` and `tailwind-merge`, export from `src/lib/utils.ts`
4. **Set Up Theme**: Define color palette (primary, secondary, accent, destructive), typography scale, border radius tokens
5. **Install Test Component**: Add Button via CLI, create barrel export, verify rendering
6. **Configure Build**: TypeScript compilation, CSS extraction, build scripts, Turborepo task
7. **Document Usage**: README with installation, CLI usage, examples, theming customization

### Key Concepts

- **CSS Variables**: shadcn/ui uses CSS custom properties for theme tokens, enabling runtime theme switching without rebuilding
- **Tailwind Merge**: The `cn()` utility uses `tailwind-merge` to intelligently resolve conflicting Tailwind classes
- **Component Composition**: shadcn/ui components are copied into your codebase, allowing full customization
- **Dark Mode**: Tailwind v4 uses `class` strategy where `.dark` class on root element activates dark theme
- **Monorepo Integration**: UI package must be built before consuming apps can import components

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: UI & Styling - shadcn/ui Setup](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: UI Components - Theme Configuration](/docs/2-technical/2-tad-ui-components.md)

Key pattern notes for this story:

- Use `cn()` utility in all component implementations for conditional class merging
- Always define color tokens as CSS variables, never hardcode hex values
- Follow shadcn/ui naming conventions for CSS variables (e.g., `--primary`, `--background`)
- Export components individually for tree-shaking optimization

### Troubleshooting

| Issue                                             | Cause                                 | Solution                                                  |
| ------------------------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| CLI fails with "components.json not found"        | Running CLI from wrong directory      | Ensure you're in `packages/ui` directory                  |
| Theme variables not applying in consuming apps    | CSS not imported in app               | Import `@repo/ui/styles/globals.css` in app layout        |
| Type errors when importing Button                 | TypeScript paths not configured       | Add `@repo/ui` to tsconfig paths in consuming app         |
| Tailwind classes not resolved in production build | PostCSS not processing CSS            | Verify `postcss.config.mjs` exists and Tailwind is listed |
| Dark mode not working                             | Missing `.dark` class on root element | Add theme toggle that applies `.dark` class to `<html>`   |
| Component styles conflict with app styles         | CSS specificity issues                | Ensure UI package styles are imported before app styles   |

### Reference Materials

- [shadcn/ui Installation Guide](https://ui.shadcn.com/docs/installation)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [class-variance-authority Documentation](https://cva.style/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)

## Estimated Effort

**Size**: M (6-7h)

**Breakdown**: shadcn/ui init (1h), Tailwind setup (2h), utilities/TypeScript (1h), test component (1h), build process (1h), documentation (1h)

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: UI & Styling - Component Library Choice](/docs/2-technical/2-tad.md#ui--styling) - Rationale for shadcn/ui over alternative component libraries
- [TAD: UI & Styling - Tailwind CSS v4](/docs/2-technical/2-tad.md#ui--styling) - Benefits of Tailwind v4 over v3

### Story-Specific Decisions

#### AD-2A.5.S2.1: Use "new-york" Style Over "default"

**Scope**: Story-specific (aesthetic choice for this project)

**Decision**: Use shadcn/ui "new-york" style variant.

**Rationale**: More refined aesthetics, smaller border radius for modern professional appearance, better for data-dense interfaces.

**Consequences**: Smaller default border radius, more compact spacing, visual consistency.

**Alternatives Considered**: "default" style (too rounded for enterprise context), custom style (maintenance burden).

#### AD-2A.5.S2.2: Enable CSS Variables for Theming

**Scope**: Story-specific (implementation approach for this package)

**Decision**: Enable CSS variables for all theme tokens.

**Rationale**: Runtime theme switching, easy token overrides, better DX, future feature flag support.

**Consequences**: Negligible performance overhead, requires fallbacks for older browsers, more flexible theming.

**Alternatives Considered**: Static classes only (requires rebuild for changes), Tailwind config-only (less runtime flexibility).

## Out of Scope

- **Component implementations** - Deferred to S3, S4, S5
- **Storybook configuration** - Deferred to S7
- **Accessibility testing** - Deferred to S6
- **Analytics/Error boundaries** - Deferred to S6
- **Form validation** - Handled in consuming apps
- **Advanced theming** - Multi-brand themes deferred to future epic

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: [Create @repo/ui Package Structure](./S1-package-structure.md) - Requires package scaffolding and basic configuration before adding shadcn/ui and Tailwind

### Enables (Unblocks These Stories)

- **S3**: [Implement Form Components](./S3-form-components.md) - Provides theming and CLI for adding form components
- **S4**: [Implement Layout Components](./S4-layout-components.md) - Provides theming and CLI for adding layout components
- **S5**: [Implement Feedback Components](./S5-feedback-components.md) - Provides theming and CLI for adding feedback components

## References

### Epic & TAD References

- [EPIC.md: UI Component Library (Generic)](./EPIC.md)
- [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad-ui-components.md)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)

### Canonical Versions

- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

### External Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [class-variance-authority](https://cva.style/docs)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Structure) completed and verified
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Node.js 24.x and pnpm 10.x installed

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint` passes)
- [ ] Types compile successfully (`pnpm typecheck` passes)
- [ ] Build succeeds (`pnpm build` produces dist/ output)
- [ ] Tests written and passing
- [ ] shadcn/ui CLI successfully adds components

### Documentation

- [ ] README.md includes installation and usage instructions
- [ ] Theme customization documented
- [ ] Examples provided for common use cases
- [ ] Inline code comments for complex utilities

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
