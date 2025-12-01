# Story 2A.4.S1: Create @repo/analytics Package Structure

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [2A.1: Configuration Package](../2A.1-config-package/EPIC.md) - TypeScript and ESLint configs
- **Blocks**: [S2: Core Event Tracking](./S2-core-event-tracking.md), [S3: Event Validation](./S3-event-validation.md), [S4: Consent Management](./S4-consent-management.md), [S5: Provider Integration](./S5-provider-integration.md), [S6: Component Tracking](./S6-component-tracking.md), [S7: Feature Flags](./S7-feature-flags.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** a properly configured `@repo/analytics` package with TypeScript, ESLint, and build tooling
**So that** I can implement event tracking, consent management, and analytics utilities in a type-safe, well-structured manner

## Acceptance Criteria

- [ ] Package directory exists at `packages/analytics/` with standard monorepo structure
- [ ] Package builds successfully with TypeScript (`pnpm build`)
- [ ] All linting passes with no errors (`pnpm lint`)
- [ ] Type checking passes with strict mode enabled (`pnpm type-check`)
- [ ] Package exports are properly configured for tree-shaking and ES modules
- [ ] Package.json includes correct dependencies and peer dependencies
- [ ] README.md documents package purpose and basic usage
- [ ] Package integrates with Turborepo build pipeline

## Technical Requirements

### Files to Create

| Path                                | Purpose                                         |
| ----------------------------------- | ----------------------------------------------- |
| `packages/analytics/package.json`   | Package configuration and dependencies          |
| `packages/analytics/tsconfig.json`  | TypeScript configuration extending @repo/config |
| `packages/analytics/.eslintrc.js`   | ESLint configuration extending @repo/config     |
| `packages/analytics/src/index.ts`   | Main package entry point with exports           |
| `packages/analytics/src/types.ts`   | Shared TypeScript type definitions              |
| `packages/analytics/README.md`      | Package documentation                           |
| `packages/analytics/.gitignore`     | Git ignore rules for build artifacts            |
| `packages/analytics/tsup.config.ts` | Build configuration for package bundling        |

### Files to Modify

| Path                       | Changes                                        |
| -------------------------- | ---------------------------------------------- |
| `turbo.json`               | Add `@repo/analytics#build` task to pipeline   |
| Root `pnpm-workspace.yaml` | Verify `packages/*` pattern includes analytics |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to package directory
cd packages/analytics

# Install production dependencies (to be added in later stories)
# posthog-js will be added in S5
# zod for validation will be added in S3

# Install development dependencies
pnpm add -D typescript tsup @repo/config
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                  | Requirement                               | TAD Reference                                                                |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| TypeScript `strict` mode | Must be enabled for type safety           | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| ESLint extends           | Must extend `@repo/config/eslint/base`    | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| Package exports          | Use conditional exports for ESM           | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| Build output             | Generate ESM modules in `dist/` directory | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| Module type              | `"type": "module"` for native ESM support | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |

**Configuration Rationale**: The analytics package must support both server and client environments (Edge, Node.js, browser), requiring ESM modules with proper conditional exports. TypeScript strict mode ensures type safety for event data and provider integrations. Build tooling (tsup) enables tree-shaking for minimal bundle impact, critical for client-side analytics code.

For complete configuration templates, see: [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)

## Test Requirements

### Manual Verification

- [ ] **Package Installation**: Install package from monorepo root (`pnpm install`) completes without errors
- [ ] **Build Output**: Build generates `dist/` directory with `.js` and `.d.ts` files
- [ ] **Import Test**: Create test file importing from `@repo/analytics` and verify TypeScript resolution works

### Automated Tests

- [ ] Unit: `packages/analytics/__tests__/package.test.ts` - Verify package.json exports are valid
- [ ] Integration: Verify package can be imported in a Next.js app context (deferred to S8)

### Verification Commands

```bash
# Install dependencies from monorepo root
pnpm install

# Build the analytics package
pnpm --filter @repo/analytics build

# Run linting
pnpm --filter @repo/analytics lint

# Run type checking
pnpm --filter @repo/analytics type-check

# Verify package exports are accessible
node -e "import('@repo/analytics').then(console.log)"

# Verify Turborepo caching works
pnpm build --filter @repo/analytics
pnpm build --filter @repo/analytics # Should use cache
```

## Implementation Notes

### Implementation Sequence

1. **Create Package Directory**: Create `packages/analytics/` with `src/` and `__tests__/` subdirectories
2. **Configure Package.json**: Set `@repo/analytics` name, exports for `./index`, scripts (`build`, `lint`, `type-check`, `test`), and `"type": "module"`
3. **Configure TypeScript**: Create `tsconfig.json` extending `@repo/config/typescript/base` with output to `dist/` and `declaration: true`
4. **Configure ESLint**: Create `.eslintrc.js` extending `@repo/config/eslint/base`
5. **Configure Build (tsup)**: Create `tsup.config.ts` for ESM bundling with tree-shaking
6. **Create Initial Source**: Create `src/index.ts` and `src/types.ts` with placeholder exports
7. **Update Turborepo**: Add `@repo/analytics#build` to `turbo.json` pipeline
8. **Write README.md**: Document package purpose, planned exports, and reference Epic 2A.4

### Key Concepts

- **Monorepo Package**: Package uses `@repo/*` scoping and is published only within the monorepo workspace
- **Tree-Shaking**: ESM exports allow consuming apps to import only what they need, reducing bundle size
- **Type Definitions**: `.d.ts` files enable TypeScript autocomplete and type checking in consuming apps
- **Turborepo Integration**: Package participates in monorepo build caching and task orchestration
- **Privacy-First Design**: Package structure supports consent management and event queuing required for GDPR/privacy compliance

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)

Key pattern notes for this story:

- Use conditional exports in package.json to support both server and client imports
- Follow the standard package structure: `src/` for source, `dist/` for build output, `__tests__/` for tests
- Use tsup for bundling to generate optimized ESM output with type declarations
- Ensure bundle size target of <10KB gzipped for client-side code

### Troubleshooting

| Issue                                      | Cause                                        | Solution                                                             |
| ------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| TypeScript cannot find `@repo/config`      | Config package not built or linked           | Run `pnpm build --filter @repo/config` first                         |
| Import fails with module not found         | Package exports not configured correctly     | Verify `package.json` exports field matches file structure           |
| Turborepo doesn't cache build              | Task not defined in `turbo.json`             | Add `@repo/analytics#build` to pipeline with outputs config          |
| ESLint fails with config not found         | ESLint config package not installed properly | Verify `@repo/config` is in devDependencies and installed            |
| Type checking fails with strict mode error | Source files have type errors                | Fix type errors or add `@ts-expect-error` comments with explanations |

### Reference Materials

- [Turborepo Package Architecture](https://turbo.build/repo/docs/core-concepts/monorepos/structuring-a-repository)
- [TypeScript Package Exports](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [tsup Documentation](https://tsup.egoist.dev/)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces)

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - Monorepo package structure
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Build caching rationale
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - Overall analytics strategy

### Story-Specific Decisions

#### AD-2A.4.S1.1: Use tsup for Package Bundling

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use tsup instead of tsc for building the analytics package

**Rationale**:

- tsup provides zero-config bundling with tree-shaking
- Generates optimized ESM output with type declarations
- Faster build times for library packages compared to tsc alone
- Built-in support for multiple entry points (needed for future sub-exports)

**Consequences**:

- Simpler build configuration
- Better bundle optimization for client-side code
- Dependency on tsup package (minimal risk, widely used)

**Alternatives Considered**:

- **tsc only**: Rejected because requires additional bundling configuration and lacks tree-shaking optimization
- **rollup**: Rejected due to more complex configuration overhead for simple package needs

## Out of Scope

The following items are explicitly NOT part of this story:

- **Event tracking implementation** - Deferred to S2 (Core Event Tracking)
- **Event validation with Zod** - Deferred to S3 (Event Validation)
- **Consent management system** - Deferred to S4 (Consent Management)
- **Provider integrations** (PostHog, GA4, Vercel) - Deferred to S5 (Provider Integration)
- **Component tracking utilities** - Deferred to S6 (Component Tracking)
- **Feature flag utilities** - Deferred to S7 (Feature Flags)
- **Comprehensive test suite** - Deferred to S8 (Tests and Documentation)
- **Environment variable configuration** - Handled by `@repo/config` package

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **2A.1: Configuration Package** - Provides TypeScript and ESLint configurations that this package extends

### Enables (Unblocks These Stories)

- **S2: Core Event Tracking** - Requires package structure to implement `trackEvent()` function
- **S3: Event Validation** - Requires package structure to add Zod schemas
- **S4: Consent Management** - Requires package structure to implement consent system
- **S5: Provider Integration** - Requires package structure to add provider SDKs
- **S6: Component Tracking** - Requires package structure to create React hooks
- **S7: Feature Flags** - Requires package structure to implement feature flag utilities

## References

**Internal**:

- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)

**External**:

- [Turborepo Handbook](https://turbo.build/repo/docs/core-concepts/monorepos/structuring-a-repository)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Package Exports](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [tsup Documentation](https://tsup.egoist.dev/)

## Verification Checklist

- [ ] **Pre-Verification**: Epic 2A.1 complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] **Quality**: No lint errors; types compile; build succeeds; Turborepo caching works
- [ ] **Documentation**: README.md complete; package.json includes description
- [ ] **Git**: Conventional commit (e.g., `feat(analytics): create package structure`); PR references Epic 2A.4.S1

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
