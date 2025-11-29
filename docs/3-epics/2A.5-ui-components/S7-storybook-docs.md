# Story 2A.5.S7: Configure Storybook and Write Documentation

> **To implement this story:** Read the Technical Requirements, configure Storybook for the component library following TAD patterns, create stories for all components, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [UI Component Library (Generic)](./EPIC.md)
- **Depends On**: [S3 - Implement Form Components](./S3-form-components.md), [S4 - Implement Layout Components](./S4-layout-components.md), [S5 - Implement Feedback Components](./S5-feedback-components.md), [S6 - Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None (requires all component stories and accessibility validation to complete first)

## User Story

**As a** developer using the component library
**I want** comprehensive Storybook documentation for all UI components
**So that** I can understand component APIs, explore variants visually, and learn usage patterns through interactive examples

## Acceptance Criteria

- [ ] Storybook 8.x configured in `packages/ui` with Vite builder
- [ ] All 12 core components have complete Storybook stories (Button, Input, Select, Card, Dialog, Dropdown Menu, Tabs, Toast, Avatar, Badge, Skeleton, Spinner)
- [ ] Each component has stories for all major variants and states
- [ ] Props tables auto-generated from TypeScript interfaces
- [ ] Accessibility addon configured and showing a11y violations in stories
- [ ] Controls addon enabled for interactive prop manipulation
- [ ] Component documentation includes usage examples and best practices
- [ ] ErrorBoundary component has dedicated story demonstrating error handling
- [ ] Dark mode theme toggle working in Storybook
- [ ] Storybook builds successfully without errors
- [ ] Storybook deployed to accessible URL (Chromatic or Vercel)
- [ ] Package README.md updated with link to deployed Storybook
- [ ] Component documentation follows consistent structure across all stories

## Technical Requirements

### Files to Create

| Path                                                          | Purpose                                   |
| ------------------------------------------------------------- | ----------------------------------------- |
| `packages/ui/.storybook/main.ts`                              | Storybook configuration                   |
| `packages/ui/.storybook/preview.ts`                           | Global decorators and parameters          |
| `packages/ui/.storybook/theme.ts`                             | Custom Storybook theme                    |
| `packages/ui/src/components/button.stories.tsx`               | Button component stories                  |
| `packages/ui/src/components/input.stories.tsx`                | Input component stories                   |
| `packages/ui/src/components/select.stories.tsx`               | Select component stories                  |
| `packages/ui/src/components/card.stories.tsx`                 | Card component stories                    |
| `packages/ui/src/components/dialog.stories.tsx`               | Dialog component stories                  |
| `packages/ui/src/components/dropdown-menu.stories.tsx`        | Dropdown Menu component stories           |
| `packages/ui/src/components/tabs.stories.tsx`                 | Tabs component stories                    |
| `packages/ui/src/components/toast.stories.tsx`                | Toast component stories                   |
| `packages/ui/src/components/avatar.stories.tsx`               | Avatar component stories                  |
| `packages/ui/src/components/badge.stories.tsx`                | Badge component stories                   |
| `packages/ui/src/components/skeleton.stories.tsx`             | Skeleton component stories                |
| `packages/ui/src/components/spinner.stories.tsx`              | Spinner component stories                 |
| `packages/ui/src/components/error-boundary.stories.tsx`       | ErrorBoundary component stories           |
| `.github/workflows/storybook.yml`                             | CI workflow to build and deploy Storybook |

### Files to Modify

| Path                                 | Changes                                                       |
| ------------------------------------ | ------------------------------------------------------------- |
| `packages/ui/package.json`           | Add Storybook dependencies and scripts                        |
| `packages/ui/README.md`              | Add Storybook documentation section and deployed URL          |
| `packages/ui/.gitignore`             | Add `storybook-static/` to gitignore                          |
| `turbo.json`                         | Add `storybook:build` and `storybook:dev` tasks               |
| `package.json` (root)                | Add workspace script for running Storybook                    |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# In packages/ui directory
pnpm add -D storybook@^8.0.0
pnpm add -D @storybook/react@^8.0.0
pnpm add -D @storybook/react-vite@^8.0.0
pnpm add -D @storybook/addon-essentials@^8.0.0
pnpm add -D @storybook/addon-a11y@^8.0.0
pnpm add -D @storybook/addon-interactions@^8.0.0
pnpm add -D @storybook/addon-links@^8.0.0
pnpm add -D @storybook/blocks@^8.0.0
pnpm add -D vite@^5.0.0
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.

| Setting                     | Requirement                                                 | TAD Reference                                                                |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Storybook builder           | Vite for fast builds and HMR                                | [TAD: Development Tools](/docs/2-technical/2-tad.md#development-tools)       |
| Story format                | Component Story Format 3 (CSF3) with TypeScript             | [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)  |
| Addons                      | Essentials, A11y, Interactions, Links                       | [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) |
| Theme integration           | Tailwind CSS with dark mode support                         | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                  |
| Props documentation         | Auto-generated from TypeScript using react-docgen           | [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)  |
| Deployment                  | Chromatic for visual regression or Vercel static deployment | [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)  |

**Configuration Rationale**:
- Storybook 8.x provides improved performance, better TypeScript support, and enhanced accessibility testing
- Vite builder offers faster build times compared to Webpack, improving developer experience
- A11y addon surfaces accessibility violations directly in component development workflow
- Component Story Format 3 provides cleaner, more maintainable story definitions
- Chromatic integration enables visual regression testing to catch unintended UI changes
- Dark mode support ensures components are tested in both theme modes

## Test Requirements

### Manual Verification

- [ ] **Storybook Dev Server**: Run `pnpm storybook:dev` and verify Storybook loads at localhost:6006
- [ ] **Component Stories**: Navigate through all 13 component stories and verify they render correctly
- [ ] **Variant Coverage**: Check that all major variants are documented (e.g., Button has default, primary, destructive, outline, ghost, link variants)
- [ ] **Interactive Controls**: Use Controls addon to modify props and verify component updates reactively
- [ ] **Dark Mode Toggle**: Switch between light and dark themes and verify all components render properly
- [ ] **Accessibility Tab**: Review A11y tab for each component and verify no critical violations
- [ ] **ErrorBoundary Demo**: Trigger error in ErrorBoundary story and verify fallback UI displays
- [ ] **Mobile Responsiveness**: Resize viewport and verify component stories are responsive
- [ ] **Props Documentation**: Verify props tables display for all components with descriptions
- [ ] **Build Process**: Run `pnpm storybook:build` and verify static build completes without errors

### Automated Tests

- [ ] Unit: All existing component tests pass with Storybook dependencies installed
- [ ] Build: `storybook:build` script succeeds in CI/CD
- [ ] Lint: ESLint passes for all `.stories.tsx` files
- [ ] Type Check: TypeScript compiles `.stories.tsx` files without errors

### Integration Tests

- [ ] Storybook build integrates with Turborepo cache for faster rebuilds
- [ ] Chromatic deployment workflow captures all component stories for visual regression
- [ ] Accessibility tests in S6 align with A11y violations shown in Storybook
- [ ] Deployed Storybook accessible via public URL (if using Chromatic) or Vercel
- [ ] Links from package README to Storybook resolve correctly

### Verification Commands

```bash
# Install dependencies
pnpm --filter @repo/ui install

# Run Storybook dev server
pnpm --filter @repo/ui storybook:dev

# Build Storybook for production
pnpm --filter @repo/ui storybook:build

# Verify build output
ls -la packages/ui/storybook-static

# Type check stories
pnpm --filter @repo/ui type-check

# Lint stories
pnpm --filter @repo/ui lint

# Run component tests (ensure Storybook deps don't break tests)
pnpm --filter @repo/ui test

# Deploy to Chromatic (if configured)
pnpm --filter @repo/ui chromatic
```

## Implementation Notes

### Implementation Sequence

1. **Install Storybook and Configure Builder**
   - Run `pnpm dlx storybook@latest init` in `packages/ui` directory
   - Configure Vite builder in `.storybook/main.ts`
   - Add Storybook scripts to `package.json` (`storybook:dev`, `storybook:build`)
   - Configure addons: essentials, a11y, interactions, links

2. **Configure Theme and Global Decorators**
   - Create `.storybook/preview.ts` with Tailwind CSS import
   - Add dark mode decorator using `next-themes` or CSS variables
   - Configure viewport presets for responsive testing
   - Set up global parameters for accessibility checks

3. **Create Stories for Form Components (S3)**
   - `button.stories.tsx`: All variants (default, primary, destructive, outline, ghost, link), sizes, states (loading, disabled)
   - `input.stories.tsx`: Text, email, password, number, search, with/without labels, error states
   - `select.stories.tsx`: Single select, multi-select, disabled, with/without placeholder, error states

4. **Create Stories for Layout Components (S4)**
   - `card.stories.tsx`: Default, with header/footer, clickable, image cards
   - `dialog.stories.tsx`: Default, with custom content, with form, scrollable content
   - `dropdown-menu.stories.tsx`: Default, with icons, with separators, nested menus
   - `tabs.stories.tsx`: Default, vertical, with icons, disabled tabs

5. **Create Stories for Feedback Components (S5)**
   - `toast.stories.tsx`: Success, error, warning, info, with action button
   - `avatar.stories.tsx`: Default, with image, with fallback, sizes
   - `badge.stories.tsx`: Default, secondary, destructive, outline variants
   - `skeleton.stories.tsx`: Text, avatar, card skeletons
   - `spinner.stories.tsx`: Default, sizes, colors

6. **Create ErrorBoundary Story**
   - `error-boundary.stories.tsx`: Normal render, triggered error, custom fallback, reset functionality
   - Include interactive example with button to trigger error

7. **Configure Deployment**
   - Set up Chromatic project (optional) for visual regression testing
   - Create `.github/workflows/storybook.yml` to build and deploy on push to main
   - Add Storybook URL to package README.md

8. **Documentation and Final Polish**
   - Add usage examples and best practices to component story descriptions
   - Ensure props tables are complete with JSDoc descriptions
   - Add "Getting Started" documentation page in Storybook
   - Test all stories in light and dark modes

### Key Concepts

- **Component Story Format (CSF)**: Standard format for writing component examples in Storybook, using ES modules
- **Story**: Single state or variation of a component (e.g., "Primary Button", "Disabled Input")
- **Decorators**: Wrapper functions that add context to stories (e.g., theme provider, layout wrapper)
- **Args**: Component props that can be manipulated via Storybook controls
- **Addon**: Plugin that extends Storybook functionality (e.g., A11y checker, viewport simulator)
- **Chromatic**: Visual regression testing service that integrates with Storybook
- **MDX**: Markdown format that allows embedding JSX, used for documentation pages in Storybook

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.

Reference the TAD for implementation patterns:

- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: Development Tools](/docs/2-technical/2-tad.md#development-tools)

Key pattern notes for this story:

- Use CSF3 format for concise story definitions with automatic titles
- Leverage `args` and `argTypes` for interactive controls
- Use decorators to provide Tailwind CSS and theme context to all stories
- Create template stories for complex components to avoid duplication
- Document accessibility considerations in story descriptions
- Use `play` function from `@storybook/addon-interactions` for interactive component testing (Dialog, Dropdown)
- Group related variants using subcomponents or story naming conventions

### Troubleshooting

| Issue                                      | Cause                                        | Solution                                                                      |
| ------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Tailwind styles not loading in Storybook   | Preview config missing Tailwind CSS import   | Import global Tailwind CSS in `.storybook/preview.ts`                         |
| Stories show TypeScript errors             | Storybook types not installed                | Install `@storybook/react` and ensure types are in `tsconfig.json`           |
| Dark mode toggle not working               | Theme decorator not configured               | Add theme decorator in `preview.ts` using `next-themes` or CSS variables     |
| A11y addon showing false positives         | Component intentionally violates rules       | Disable specific rules for that story using `parameters.a11y.config.rules`   |
| Component not re-rendering on control change | Args not properly wired to component props | Ensure story uses `args` object and component accepts props                   |
| Storybook build fails in CI                | Missing dependencies or incorrect Node version | Verify Node version matches canonical versions, check all deps installed     |
| Props table not showing                    | Missing JSDoc comments on component props    | Add JSDoc comments to TypeScript interface properties                        |

### Reference Materials

- [Storybook 8.x Documentation](https://storybook.js.org/docs)
- [Component Story Format 3.0](https://storybook.js.org/docs/api/csf)
- [Storybook Accessibility Addon](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Storybook Vite Builder](https://storybook.js.org/docs/builders/vite)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook TypeScript Guide](https://storybook.js.org/docs/configure/typescript)
- [Writing Stories Guide](https://storybook.js.org/docs/writing-stories)
- [Storybook Args Guide](https://storybook.js.org/docs/writing-stories/args)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Configure Storybook infrastructure (main.ts, preview.ts, theme): 1h
- Create stories for 12 core components (30-45min each): 4h
- Create ErrorBoundary story with interactive examples: 0.5h
- Configure dark mode and global decorators: 0.5h
- Set up Chromatic deployment workflow: 0.5h
- Documentation, testing, and final polish: 1.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Development Tools](/docs/2-technical/2-tad.md#development-tools) - Storybook as component documentation tool
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md) - Component documentation strategy, Storybook deployment
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture) - Component design system and accessibility requirements

### Story-Specific Decisions

#### AD-2A.5.S7.1: Storybook Builder Choice

**Scope**: Story-specific (isolated to `@repo/ui` Storybook configuration)

**Decision**: Use Vite as the Storybook builder instead of Webpack.

**Rationale**:

- Vite provides significantly faster dev server startup and hot module replacement (HMR)
- Consistent build tooling with package bundling (using tsup, which uses esbuild)
- Better out-of-the-box TypeScript support
- Smaller configuration surface area
- Modern ESM-first approach aligns with project architecture

**Consequences**:

- Faster Storybook development experience (dev server starts in <2s vs 10-30s with Webpack)
- Reduced configuration complexity
- Potential incompatibility with some older Storybook addons (mitigated by using Storybook 8.x compatible addons)
- Requires Vite as devDependency (minimal bundle size impact as dev-only)

**Alternatives Considered**:

- **Webpack Builder**: Rejected because slower build times and more complex configuration, though more mature ecosystem
- **Turbopack Builder**: Rejected because still experimental and not yet stable for Storybook

#### AD-2A.5.S7.2: Story Co-location Strategy

**Scope**: Story-specific (isolated to `@repo/ui` component file organization)

**Decision**: Co-locate `.stories.tsx` files alongside component implementation files in `src/components/` directory.

**Rationale**:

- Easier to find and update stories when modifying components
- Reduces cognitive overhead of navigating between separate directories
- Encourages developers to update stories when changing component API
- Industry standard practice for component libraries
- Storybook auto-discovery works seamlessly with co-located stories

**Consequences**:

- Stories included in source directory structure (not a separate `/stories` folder)
- Slightly larger `src/` directory, but better discoverability
- Need to ensure `.stories.tsx` files excluded from package build output (handled by tsup config)
- Easier to maintain stories alongside component changes

**Alternatives Considered**:

- **Separate `/stories` directory**: Rejected because it creates distance between component and documentation, harder to maintain
- **Stories in `/tests` directory**: Rejected because stories are documentation, not tests, and would confuse purpose

## Out of Scope

The following items are explicitly NOT part of this story:

- **Visual Regression Testing Integration** - Chromatic configuration provided but visual regression test suite deferred to QA phase
- **Custom Storybook Addons** - Using existing addons only; custom addon development deferred to future enhancements
- **Component Playground Application** - Storybook serves this purpose; separate playground app not needed
- **Multi-language Documentation** - Storybook stories in English only; i18n deferred to Epic 2B.6 (Localization)
- **Storybook Composition** - Combining multiple Storybooks from different packages deferred until additional UI packages created
- **Performance Benchmarking** - Component performance metrics deferred to performance epic
- **Automated Story Generation** - Stories hand-written for better control and documentation quality
- **Component Dependency Graph** - Storybook Docs addon provides some visualization, but full dependency graph deferred

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S3**: [Implement Form Components](./S3-form-components.md) - Form components (Button, Input, Select) must exist before creating stories
- **S4**: [Implement Layout Components](./S4-layout-components.md) - Layout components (Card, Dialog, Dropdown, Tabs) must exist before creating stories
- **S5**: [Implement Feedback Components](./S5-feedback-components.md) - Feedback components (Toast, Avatar, Badge, Skeleton, Spinner) must exist before creating stories
- **S6**: [Add Accessibility and Error Boundary Integration](./S6-accessibility-error-boundaries.md) - ErrorBoundary component and accessibility features must be complete before documenting

### Enables (Unblocks These Stories)

None - This is the final story in Epic 2A.5

## References

### Epic & TAD References

- [EPIC.md: UI Component Library (Generic)](./EPIC.md)
- [TAD: UI Components Architecture](/docs/2-technical/2-tad.md#ui-components-architecture)
- [TAD: Documentation Architecture](/docs/2-technical/2-tad-documentation.md)
- [TAD: Development Tools](/docs/2-technical/2-tad.md#development-tools)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

### External Documentation

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format (CSF)](https://storybook.js.org/docs/api/csf)
- [Storybook Accessibility Addon](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Storybook Vite Builder](https://storybook.js.org/docs/builders/vite)
- [Chromatic Visual Testing](https://www.chromatic.com/docs/)
- [Writing Stories Guide](https://storybook.js.org/docs/writing-stories)
- [Storybook Args Documentation](https://storybook.js.org/docs/writing-stories/args)

## Verification Checklist

### Pre-Verification

- [ ] S3 (Form Components), S4 (Layout Components), S5 (Feedback Components), and S6 (Accessibility) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `@repo/ui` package exists with all 12 core components and ErrorBoundary implemented

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm --filter @repo/ui lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/ui type-check`)
- [ ] All component tests still passing (`pnpm --filter @repo/ui test`)
- [ ] Storybook dev server runs without errors (`pnpm --filter @repo/ui storybook:dev`)
- [ ] Storybook builds successfully (`pnpm --filter @repo/ui storybook:build`)
- [ ] All 13 components have complete stories with major variants
- [ ] Props tables display for all components
- [ ] A11y addon configured and showing accessibility insights
- [ ] Dark mode toggle works across all component stories
- [ ] Interactive controls work for modifying component props
- [ ] ErrorBoundary story demonstrates error catching and recovery

### Documentation

- [ ] All stories include descriptive documentation and usage examples
- [ ] Component props documented with JSDoc comments
- [ ] README.md updated with Storybook section and deployed URL
- [ ] Story code is clean and follows consistent patterns
- [ ] Best practices and common pitfalls documented in story descriptions

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(ui): add storybook configuration and component stories`)
- [ ] No unrelated changes included
- [ ] PR description includes link to deployed Storybook or localhost screenshots
- [ ] `.gitignore` updated to exclude `storybook-static/` build output

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
