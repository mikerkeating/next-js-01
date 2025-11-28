# Story 2A.1.S6: Integrate Configs Across Monorepo Packages

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Configuration Package](./EPIC.md)
- **Depends On**: [S2](./S2-typescript-config.md), [S3](./S3-eslint-config.md), [S4](./S4-prettier-config.md), [S5](./S5-tailwind-config.md)
- **Blocks**: [S7](./S7-tests-docs.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer working in the monorepo
**I want** all existing apps and future packages to extend the shared configurations from `@repo/config`
**So that** configuration changes propagate consistently and new packages can be scaffolded quickly with standardized settings

## Acceptance Criteria

- [ ] `apps/routing` extends TypeScript config from `@repo/config/typescript/nextjs`
- [ ] `apps/routing` extends ESLint config from `@repo/config/eslint/nextjs`
- [ ] `apps/routing` references Prettier config from `@repo/config/prettier`
- [ ] `apps/routing` imports Tailwind base CSS from `@repo/config/tailwind`
- [ ] Running `pnpm lint` from monorepo root passes for all packages
- [ ] Running `pnpm type-check` from monorepo root passes for all packages
- [ ] Running `pnpm format:check` from monorepo root passes for all packages
- [ ] New package template script or documentation exists for consistent scaffolding
- [ ] Root `package.json` includes workspace-wide scripts for lint, type-check, and format

## Technical Requirements

### Files to Create

| Path                            | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `apps/routing/eslint.config.js` | ESLint flat config extending `@repo/config` |
| `apps/routing/.prettierrc.js`   | Prettier config reference to `@repo/config` |

### Files to Modify

| Path                               | Changes                                             |
| ---------------------------------- | --------------------------------------------------- |
| `apps/routing/tsconfig.json`       | Extend `@repo/config/typescript/nextjs`             |
| `apps/routing/package.json`        | Add `@repo/config` dependency, update lint scripts  |
| `apps/routing/src/app/globals.css` | Import Tailwind base CSS from `@repo/config`        |
| `package.json` (root)              | Add workspace-wide lint, type-check, format scripts |
| `turbo.json`                       | Add format task configuration                       |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
pnpm --filter @repo/routing add @repo/config@workspace:*
```

### Configuration Details

| Setting              | Requirement                                     | TAD Reference                                                                   |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| TypeScript `extends` | Use `@repo/config/typescript/nextjs`            | [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig) |
| ESLint flat config   | Spread `@repo/config/eslint/nextjs` base config | [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig) |
| Prettier reference   | Export from `@repo/config/prettier`             | [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig) |
| Tailwind CSS import  | `@import "@repo/config/tailwind/base.css"`      | [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig) |
| Workspace protocol   | Use `workspace:*` for internal dependencies     | [ADR-002: pnpm](/docs/2-technical/adr/002-pnpm-package-manager.md)              |

**Configuration Rationale**: Centralizing configuration via `@repo/config` ensures all packages share identical tooling settings. Using ESLint flat config allows modern composition via array spreading. The workspace protocol ensures packages always use the local version of `@repo/config`.

## Test Requirements

### Manual Verification

- [ ] **Lint Pass**: Run `pnpm lint` at monorepo root, all packages pass
- [ ] **Type Check Pass**: Run `pnpm type-check` at monorepo root, all packages pass
- [ ] **Format Check**: Run `pnpm format:check` at monorepo root, all files formatted
- [ ] **Dev Server**: Run `pnpm --filter @repo/routing dev`, app starts without config errors
- [ ] **Tailwind Classes**: Verify Tailwind utility classes apply correctly in routing app

### Automated Tests

- [ ] Unit: Existing tests continue to pass after config migration

### Integration Tests

- [ ] Config package changes reflect in consuming apps when rebuilt

### Verification Commands

```bash
# Verify TypeScript config extends correctly
pnpm --filter @repo/routing exec tsc --showConfig | grep "extends"

# Verify ESLint config resolves
pnpm --filter @repo/routing exec eslint --print-config src/app/page.tsx | head -20

# Run workspace-wide quality checks
pnpm lint
pnpm type-check
pnpm format:check

# Verify Turborepo task graph
pnpm exec turbo run lint --dry-run

# Verify app builds with new configs
pnpm --filter @repo/routing build
```

## Implementation Notes

### Implementation Sequence

1. **Update root package.json**
   - Add workspace-wide scripts: `lint`, `type-check`, `format`, `format:check`
   - Scripts should use Turborepo for task orchestration

2. **Update turbo.json**
   - Add `format` and `format:check` task configurations
   - Configure proper task dependencies

3. **Update apps/routing configuration**
   - Add `@repo/config` as workspace dependency
   - Create `eslint.config.js` extending shared config
   - Create `.prettierrc.js` referencing shared config
   - Update `tsconfig.json` to extend shared config
   - Update `globals.css` to import Tailwind base

4. **Verify integration**
   - Run all quality gates from root
   - Verify dev server starts correctly
   - Verify build completes successfully

### Key Concepts

- **Workspace Protocol**: `workspace:*` ensures the local package is used, not a published version
- **Flat Config Composition**: ESLint flat configs are arrays that can be spread and extended
- **CSS Imports**: Tailwind v4 CSS-first configs can be imported like regular CSS files

### Common Patterns

Reference the TAD for implementation patterns:

- [TAD: @repo/config Structure](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)

Key pattern notes for this story:

- Apps extend configs, packages may override specific settings as needed
- ESLint ignores should include generated directories (`.next`, `dist`)
- TypeScript paths for app-specific aliases are configured in the app's tsconfig

### Troubleshooting

| Issue                             | Cause                          | Solution                                         |
| --------------------------------- | ------------------------------ | ------------------------------------------------ |
| "Cannot find module @repo/config" | Missing dependency             | Add `@repo/config@workspace:*` to dependencies   |
| ESLint "Configuration not found"  | Old .eslintrc file conflicting | Remove legacy .eslintrc.\*, use eslint.config.js |
| Tailwind classes not applying     | CSS import missing             | Verify `@import` statement in globals.css        |

## Estimated Effort

**Size**: M (5h)

**Breakdown**:

- Root configuration updates: 1h
- Apps/routing migration: 2h
- Integration testing and verification: 1.5h
- Documentation and troubleshooting: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Package dependency patterns
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Task orchestration
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Workspace protocol usage

### Story-Specific Decisions

#### AD-2A.1.S6.1: ESLint Config File Replacement Strategy

**Scope**: Story-specific (does not affect other stories)

**Decision**: Remove existing `.eslintrc.*` files and replace with `eslint.config.js` (flat config).

**Rationale**: ESLint flat config is the modern standard (legacy deprecated); prevents conflicts between formats.

**Consequences**: All apps must migrate to flat config format; app-specific overrides rewritten in flat config syntax.

## Out of Scope

- **New app creation** - Future apps will follow this pattern; this story migrates existing apps only
- **Package-level config overrides** - Individual packages add local overrides as needed (not standardized here)
- **CI/CD workflow updates** - GitHub Actions workflow updates handled in Epic 1A.5
- **Pre-commit hook integration** - Husky/lint-staged configuration handled in Epic 1A.2
- **Other packages beyond routing** - Future packages (Epic 2A.2+) will extend configs when created

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2**: TypeScript config - Base TypeScript configurations must exist
- **S3**: ESLint config - Base ESLint configurations must exist
- **S4**: Prettier config - Prettier configuration must exist
- **S5**: Tailwind config - Tailwind CSS configuration must exist

### Enables (Unblocks These Stories)

- **S7**: Tests and documentation - Integration tests require configs to be applied
- **Epic 2A.2+**: Future packages - Database, Auth, UI packages will extend these configs

## References

- [EPIC.md: Configuration Package](./EPIC.md)
- [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ESLint Flat Config Migration](https://eslint.org/docs/latest/use/configure/migration-guide)

## Verification Checklist

- [ ] S2, S3, S4, S5 completed (all config stories)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors, types compile, code formatted
- [ ] Existing tests continue to pass
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
