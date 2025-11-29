# Story 2A.1.S2: Configure TypeScript Base Configurations

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Configuration Package](./EPIC.md)
- **Depends On**: [S1](./S1-package-structure.md) - Package structure must exist
- **Blocks**: [S5](./S5-tailwind-config.md), [S6](./S6-integration.md)
- **Runs in Parallel With**: [S3](./S3-eslint-config.md), [S4](./S4-prettier-config.md)

## User Story

**As a** developer working in the monorepo
**I want** shared TypeScript configurations for different package types
**So that** all packages and apps have consistent, strict type checking without duplicating configuration

## Acceptance Criteria

- [ ] Base TypeScript configuration exists at `packages/config/src/typescript/base.json`
- [ ] Next.js-specific configuration exists at `packages/config/src/typescript/nextjs.json`
- [ ] React library configuration exists at `packages/config/src/typescript/react-library.json`
- [ ] All configurations enable strict mode with additional safety flags
- [ ] TypeScript project references are properly configured for monorepo performance
- [ ] Package exports are updated to expose TypeScript configs via `@repo/config/typescript/*`
- [ ] A consuming package can extend the config with `"extends": "@repo/config/typescript/base"`
- [ ] Type checking passes for the config package itself

## Technical Requirements

### Files to Create

| Path                                                | Purpose                                 |
| --------------------------------------------------- | --------------------------------------- |
| `packages/config/src/typescript/base.json`          | Base TypeScript config with strict mode |
| `packages/config/src/typescript/nextjs.json`        | Next.js app-specific TypeScript config  |
| `packages/config/src/typescript/react-library.json` | React library package TypeScript config |

### Files to Modify

| Path                            | Changes                                               |
| ------------------------------- | ----------------------------------------------------- |
| `packages/config/package.json`  | Add TypeScript config exports to `exports` field      |
| `packages/config/tsconfig.json` | Extend base config, validate package builds correctly |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required. TypeScript is already a peer dependency from S1.

### Configuration Details

| Setting                      | Requirement                                      | TAD Reference                                                                |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `strict`                     | `true` - Enable all strict type checking options | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |
| `noUncheckedIndexedAccess`   | `true` - Safer array/object access               | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |
| `exactOptionalPropertyTypes` | `true` - Distinguish undefined from optional     | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |
| `noImplicitReturns`          | `true` - Require explicit returns                | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |
| `composite`                  | `true` - Enable project references for monorepo  | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md) |
| `module`                     | `ESNext` - ESM module system                     | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |
| `target`                     | `ES2022` - Modern JavaScript target              | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |
| `moduleResolution`           | `bundler` - For Next.js/bundler compatibility    | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)       |

**Configuration Rationale**: Strict TypeScript settings prevent common runtime errors and improve code quality. Project references enable incremental builds and better IDE performance in monorepos. The `bundler` module resolution is required for Next.js 16 compatibility.

For package structure details, see: [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)

## Test Requirements

### Manual Verification

- [ ] **Config Extension**: Create a test tsconfig that extends base config, verify it inherits all settings
- [ ] **Type Errors**: Intentionally introduce a type error in consuming package, verify tsc catches it

### Automated Tests

- [ ] Unit: `packages/config/tests/typescript.test.ts` - Verify config files are valid JSON
- [ ] Unit: `packages/config/tests/typescript.test.ts` - Verify required strict options are enabled

### Integration Tests

- [ ] Config extends correctly when referenced by another package's tsconfig.json

### Verification Commands

```bash
# Verify config files are valid JSON
pnpm --filter @repo/config exec node -e "require('./src/typescript/base.json')"

# Verify TypeScript compilation with new configs
pnpm --filter @repo/config exec tsc --noEmit

# Test extending config from another package
cd apps/routing && pnpm exec tsc --showConfig | grep "strict"

# Validate exports resolve correctly
pnpm --filter @repo/config exec node -e "console.log(require.resolve('@repo/config/typescript/base'))"
```

## Implementation Notes

### Implementation Sequence

1. **Create base.json**
   - Define compiler options with strict mode enabled
   - Configure module and target settings
   - Enable project references settings

2. **Create nextjs.json**
   - Extend base.json
   - Add Next.js-specific paths and plugins
   - Configure JSX settings for React 19

3. **Create react-library.json**
   - Extend base.json
   - Configure for library output (declarations)
   - Set appropriate module settings for package consumption

4. **Update package.json exports**
   - Add exports for each TypeScript config file
   - Ensure JSON files resolve correctly

### Troubleshooting

| Issue                               | Cause                                   | Solution                                               |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| "Cannot find module" when extending | Incorrect exports path in package.json  | Verify exports field maps to correct file paths        |
| Strict errors in existing code      | Enabling strict mode on non-strict code | Fix type errors or add temporary `// @ts-expect-error` |
| Slow type checking                  | Missing project references              | Ensure `composite: true` and references configured     |
| JSX errors in React components      | Missing jsx/jsxImportSource settings    | Add `"jsx": "react-jsx"` to config                     |

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
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime) - TypeScript 5.x with strict mode
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Project references for build performance

### Story-Specific Decisions

#### AD-2A.1.S2.1: Three-Tier TypeScript Configuration

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create three separate TypeScript configurations (base, nextjs, react-library) rather than a single config with conditional settings.

**Rationale**:

- Different package types have genuinely different requirements (JSX, declarations, paths)
- Explicit configs are easier to understand and maintain
- Follows the pattern established by other major monorepo templates

**Consequences**:

- Consuming packages must choose the appropriate config to extend
- Three files to maintain instead of one

**Alternatives Considered**:

- **Single config with overrides**: Rejected because Next.js and library configs have incompatible settings

## Out of Scope

- **ESLint configuration** - Handled in S3
- **Path aliases for specific apps** - Each app configures its own path aliases extending these base configs
- **Build tooling (tsup)** - Package bundling configuration handled separately
- **VS Code settings** - Editor configuration handled in Epic 1A.4

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package structure - The `packages/config` directory and base package.json must exist

### Enables (Unblocks These Stories)

- **S5**: Tailwind config - Requires TypeScript config for type-safe CSS configuration
- **S6**: Integration - Applies TypeScript configs across all monorepo packages

## References

- [EPIC.md: Configuration Package](./EPIC.md)
- [TAD: @repo/config](/docs/2-technical/2-tad-package-architecture.md#repoconfig)
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-003: Next.js 16 as Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## Verification Checklist

- [ ] S1 (Package Structure) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors, types compile successfully
- [ ] Tests written and passing
- [ ] Package README updated with TypeScript config usage
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
