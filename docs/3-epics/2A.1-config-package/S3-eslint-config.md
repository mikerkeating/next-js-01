# Story 2A.1.S3: Configure ESLint for Next.js, React, TypeScript

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Configuration Package](./EPIC.md)
- **Depends On**: [S1](./S1-package-structure.md) - Package structure must exist
- **Blocks**: [S5](./S5-tailwind-config.md), [S6](./S6-integration.md)
- **Runs in Parallel With**: [S2](./S2-typescript-config.md), [S4](./S4-prettier-config.md)

## User Story

**As a** developer working in the monorepo
**I want** shared ESLint configurations for Next.js, React, and TypeScript projects
**So that** all packages and apps have consistent code quality enforcement without duplicating linting rules

## Acceptance Criteria

- [ ] Base ESLint configuration exists at `packages/config/src/eslint/base.js`
- [ ] Next.js-specific configuration exists at `packages/config/src/eslint/nextjs.js`
- [ ] React library configuration exists at `packages/config/src/eslint/react-library.js`
- [ ] ESLint uses flat config format (eslint.config.js style)
- [ ] TypeScript-ESLint integration is properly configured with type-aware rules
- [ ] React accessibility rules (eslint-plugin-jsx-a11y) are included
- [ ] Import ordering rules are enforced per coding standards
- [ ] Package exports are updated to expose ESLint configs via `@repo/config/eslint/*`
- [ ] A consuming package can extend the config via ESLint flat config spread
- [ ] Running `pnpm lint` in the config package passes with zero errors

## Technical Requirements

### Files to Create

| Path                                          | Purpose                                 |
| --------------------------------------------- | --------------------------------------- |
| `packages/config/src/eslint/base.js`          | Base ESLint flat config with core rules |
| `packages/config/src/eslint/nextjs.js`        | Next.js app-specific ESLint config      |
| `packages/config/src/eslint/react-library.js` | React library package ESLint config     |

### Files to Modify

| Path                           | Changes                                      |
| ------------------------------ | -------------------------------------------- |
| `packages/config/package.json` | Add ESLint config exports to `exports` field |
| `packages/config/package.json` | Add ESLint peer dependencies                 |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

Peer dependencies (declared in package.json):

- `eslint` - per canonical-versions.md
- `typescript` - per canonical-versions.md (for type-aware linting)
- `typescript-eslint` - for TypeScript parser and rules
- `eslint-plugin-react` - React-specific rules
- `eslint-plugin-react-hooks` - Hooks rules enforcement
- `eslint-plugin-jsx-a11y` - Accessibility rules
- `@next/eslint-plugin-next` - Next.js specific rules
- `eslint-plugin-import` - Import ordering and validation

### Configuration Details

| Setting                | Requirement                                 | TAD Reference                                                               |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| Config format          | Flat config (eslint.config.js)              | [EPIC: Technology Decisions](./EPIC.md#technology-decisions)                |
| TypeScript integration | Type-aware rules with parserOptions.project | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)      |
| React version          | Auto-detect from package.json               | [TAD: Technology Stack](/docs/2-technical/2-tad.md#ui--styling)             |
| Import ordering        | Enforce groups with blank line separation   | [Coding Standards](/docs/2-technical/references/coding-standards.md)        |
| Accessibility          | WCAG 2.1 Level AA via jsx-a11y/recommended  | [TAD: UI Components](/docs/2-technical/2-tad.md#ui-components-architecture) |

**Configuration Rationale**: ESLint flat config is the modern standard (legacy .eslintrc deprecated). Type-aware linting catches bugs that static analysis alone misses. Accessibility rules prevent WCAG violations at development time rather than requiring manual audits.

For package structure details, see: [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)

## Test Requirements

### Manual Verification

- [ ] **Config Extension**: Create a test eslint.config.js that spreads base config, verify rules apply
- [ ] **Lint Errors**: Intentionally introduce a linting error in consuming package, verify ESLint catches it
- [ ] **A11y Rules**: Create an `<img>` without alt, verify jsx-a11y reports violation

### Automated Tests

- [ ] Unit: `packages/config/tests/eslint.test.ts` - Verify config files export valid ESLint configs
- [ ] Unit: `packages/config/tests/eslint.test.ts` - Verify required plugins are configured

### Integration Tests

- [ ] ESLint runs successfully when config is extended by another package

### Verification Commands

```bash
# Verify config files are valid JavaScript
pnpm --filter @repo/config exec node -e "require('./src/eslint/base.js')"

# Run ESLint on config package itself
pnpm --filter @repo/config lint

# Test extending config from another package
cd apps/routing && pnpm lint --print-config src/app/page.tsx | head -20

# Validate exports resolve correctly
pnpm --filter @repo/config exec node -e "console.log(require.resolve('@repo/config/eslint/base'))"
```

## Implementation Notes

### Implementation Sequence

1. **Create base.js**
   - Configure ESLint flat config structure
   - Set up TypeScript parser with type-aware linting
   - Define core rules (no-unused-vars, no-console, etc.)
   - Configure import ordering per coding standards

2. **Create nextjs.js**
   - Spread base config
   - Add @next/eslint-plugin-next rules
   - Configure Next.js-specific ignores (e.g., .next directory)

3. **Create react-library.js**
   - Spread base config
   - Add React hooks rules
   - Add jsx-a11y accessibility rules
   - Configure for library output (no Next.js specifics)

4. **Update package.json exports**
   - Add exports for each ESLint config file
   - Ensure JavaScript files resolve correctly

### Key Concepts

- **Flat Config**: New ESLint config format using arrays of config objects
- **Type-Aware Rules**: Rules that use TypeScript type information for deeper analysis
- **Config Spreading**: Flat configs can be extended via `[...baseConfig, { /* overrides */ }]`

### Common Patterns

Reference the TAD for implementation patterns:

- [TAD: @repo/config Structure](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [Coding Standards: Import Standards](/docs/2-technical/references/coding-standards.md#3-import-standards)

Key pattern notes for this story:

- Use `languageOptions.parserOptions.project` for type-aware rules
- Set `languageOptions.parserOptions.tsconfigRootDir` to enable proper tsconfig discovery
- Use `settings['import/resolver']` for TypeScript path resolution

### Troubleshooting

| Issue                                 | Cause                                   | Solution                                            |
| ------------------------------------- | --------------------------------------- | --------------------------------------------------- |
| "Parsing error: Cannot find tsconfig" | Incorrect project path in parserOptions | Set `tsconfigRootDir` to consuming package's root   |
| "Definition for rule X was not found" | Missing plugin in flat config           | Add plugin to `plugins` object in config            |
| Type-aware rules extremely slow       | Parsing entire project for each file    | Use `TIMING=1` to identify slow rules; add to cache |
| "Cannot find module" for plugin       | Plugin not in peer dependencies         | Add to peerDependencies in package.json             |

### Reference Materials

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [typescript-eslint Getting Started](https://typescript-eslint.io/getting-started)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Base configuration setup: 1.5h
- Next.js configuration: 1h
- React library configuration: 1h
- Package exports and testing: 1.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Package structure and exports patterns
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#development-tools) - ESLint 9.x selection
- [EPIC: Technology Decisions](./EPIC.md#technology-decisions) - Flat config decision
- [Coding Standards](/docs/2-technical/references/coding-standards.md) - Import ordering and naming rules

### Story-Specific Decisions

#### AD-2A.1.S3.1: Three-Tier ESLint Configuration

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create three separate ESLint configurations (base, nextjs, react-library) rather than a single config with conditional rules.

**Rationale**:

- Next.js has specific plugins and rules that don't apply to library packages
- Libraries need stricter export rules; apps need runtime-focused rules
- Explicit configs are easier to debug when linting fails
- Mirrors the TypeScript config structure from S2 for consistency

**Consequences**:

- Consuming packages must choose the appropriate config to extend
- Three files to maintain instead of one

**Alternatives Considered**:

- **Single config with feature flags**: Rejected because flat config doesn't support conditional plugins well

## Out of Scope

- **Prettier integration** - Handled in S4 (separate config, not ESLint plugin)
- **Custom rules for specific packages** - Each package adds local overrides as needed
- **Editor integration** - VS Code settings handled in Epic 1A.4
- **Pre-commit hook setup** - Handled in Epic 1A.2 (lint-staged)
- **CI linting workflow** - Handled in Epic 1A.5 (GitHub Actions)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package structure - The `packages/config` directory and base package.json must exist

### Enables (Unblocks These Stories)

- **S5**: Tailwind config - Requires ESLint config for linting CSS-in-JS patterns
- **S6**: Integration - Applies ESLint configs across all monorepo packages

## References

- [EPIC.md: Configuration Package](./EPIC.md)
- [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#development-tools)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs)
- [typescript-eslint](https://typescript-eslint.io/)

## Verification Checklist

- [ ] S1 (Package Structure) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors, types compile successfully
- [ ] Tests written and passing
- [ ] Package README updated with ESLint config usage
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
