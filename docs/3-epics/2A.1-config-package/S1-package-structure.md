# Story 2A.1.S1: Create @repo/config Package Structure

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Configuration Package](./EPIC.md)
- **Depends On**: None (first story)
- **Blocks**: [S2](./S2-typescript-config.md), [S3](./S3-eslint-config.md), [S4](./S4-prettier-config.md), [S5](./S5-tailwind-config.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer working in the monorepo
**I want** a centralized configuration package with proper structure and exports
**So that** all other packages and applications can import shared configurations from a single source

## Acceptance Criteria

- [ ] `packages/config` directory exists with proper package.json
- [ ] Package name is `@repo/config` with `"private": true`
- [ ] Package exports are configured for TypeScript, ESLint, Prettier, and Tailwind paths
- [ ] Package compiles without TypeScript errors
- [ ] Package is discoverable by other workspace packages via `workspace:*` protocol
- [ ] README.md documents package purpose and export structure

## Technical Requirements

### Files to Create

| Path                            | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `packages/config/package.json`  | Package manifest with exports configuration       |
| `packages/config/tsconfig.json` | TypeScript configuration for the package          |
| `packages/config/src/index.ts`  | Main entry point (placeholder for future exports) |
| `packages/config/README.md`     | Package documentation                             |

### Files to Modify

| Path                  | Changes                                          |
| --------------------- | ------------------------------------------------ |
| `pnpm-workspace.yaml` | Ensure `packages/*` glob includes config package |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

Peer dependencies (declared in package.json, not installed):

- `typescript`, `eslint`, `prettier`, `tailwindcss` - per canonical-versions.md

### Configuration Details

| Setting   | Requirement                           | TAD Reference                                                                |
| --------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `exports` | Map subpaths to config file locations | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) |
| `private` | Must be `true` (internal package)     | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) |
| `type`    | Set to `module` for ESM support       | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |

For complete configuration templates, see: [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)

## Test Requirements

### Manual Verification

- [ ] **Package Resolution**: Run `pnpm list @repo/config` from another package to verify workspace linking
- [ ] **Export Paths**: Verify package.json exports match intended structure

### Automated Tests

- [ ] Unit: `packages/config/tests/exports.test.ts` - Verify all export paths resolve correctly

### Verification Commands

```bash
# Verify package is recognized in workspace
pnpm list --filter @repo/config

# Verify TypeScript compilation
pnpm --filter @repo/config exec tsc --noEmit

# Verify package structure
ls -la packages/config/
```

## Implementation Notes

### Key Concepts

- **Workspace Protocol**: `workspace:*` allows packages to depend on latest local version
- **Package Exports**: The `exports` field defines public API surface
- **Peer Dependencies**: Configuration tools are peer deps to avoid version conflicts

### Common Patterns

Reference the TAD for implementation patterns:

- [TAD: @repo/config Structure](/docs/2-technical/2-tad-package-architecture.md#repoconfig)

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) - Package structure and exports patterns
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Monorepo structure decisions
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Workspace protocol usage

## Out of Scope

- **TypeScript configuration content** - Handled in S2
- **ESLint rules and plugins** - Handled in S3
- **Prettier settings** - Handled in S4
- **Tailwind theme tokens** - Handled in S5

## Dependencies on Other Stories

### Depends On (Must Complete First)

None - this is the foundation story for the epic.

### Enables (Unblocks These Stories)

- **S2, S3, S4, S5**: All configuration stories require this package structure

## References

- [EPIC.md: Configuration Package](./EPIC.md)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#package-entry-points)

## Verification Checklist

- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All acceptance criteria met
- [ ] Package.json follows workspace conventions
- [ ] Exports field properly configured
- [ ] No lint errors, types compile
- [ ] README.md created
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
