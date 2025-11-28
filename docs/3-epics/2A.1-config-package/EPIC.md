# Epic 2A.1: Configuration Package

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- **TAD Reference**: [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- **Phase**: 2A - Core Platform Packages (Week 2)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title                                                                    | Reason                                                                                 |
| ---- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md)                       | CI pipeline infrastructure for testing package builds, lint, and type-check validation |
| 1A.2 | [Package Management & Quality Gates](../1A.2-package-management/EPIC.md) | Husky pre-commit hooks, lint-staged, and commitlint for quality gate enforcement       |
| 1A.3 | [Testing Foundation](../1A.3-testing-foundation/EPIC.md)                 | Vitest configuration and testing utilities for package tests                           |

### Blocks (Enables These Epics)

| Epic | Title                                                              | What This Provides                                                                     |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 2A.2 | [Database Infrastructure](../2A.2-database-infrastructure/EPIC.md) | Shared TypeScript config, ESLint rules, and Tailwind theme tokens for database package |
| 2A.3 | [Observability Package](../2A.3-observability/EPIC.md)             | TypeScript and ESLint configurations for consistent logging and error handling code    |
| 2A.4 | [Analytics Infrastructure](../2A.4-analytics-infra/EPIC.md)        | Shared configurations for analytics package development                                |
| 2A.5 | [UI Component Library](../2A.5-ui-components/EPIC.md)              | Tailwind CSS v4 base configuration with theme tokens for component styling             |
| 2A.6 | [Middleware Package](../2A.6-middleware/EPIC.md)                   | TypeScript strict mode and ESLint rules for middleware utilities                       |
| 2A.7 | [Auth Infrastructure](../2A.7-auth-infra/EPIC.md)                  | Shared configurations for authentication package                                       |
| 2A.8 | [API Client Package](../2A.8-api-client/EPIC.md)                   | TypeScript configuration for type-safe API client development                          |

### Can Run in Parallel With

| Epic | Title                                                              | Notes                                                                                           |
| ---- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 2A.2 | [Database Infrastructure](../2A.2-database-infrastructure/EPIC.md) | Both depend on 1A.5; can start concurrently once config package baseline is established (S1-S3) |

## Overview

Configuration Package (`@repo/config`) centralises all shared configuration files for the monorepo, ensuring consistency across all packages and applications. This epic establishes the single source of truth for TypeScript compiler settings, ESLint rules, Prettier formatting standards, and Tailwind CSS v4 theming. By consolidating configurations in one package, developers can extend standardised configs without duplication, reducing maintenance burden and ensuring code quality consistency across the entire codebase.

**Key Deliverables:**

- `@repo/config` package with exportable configurations
- TypeScript base configurations for different package types (library, app, React)
- ESLint configuration supporting Next.js, React, and TypeScript with strict rules
- Prettier configuration for consistent code formatting
- Tailwind CSS v4 base configuration with design system theme tokens
- All packages and apps in monorepo extend the shared configs
- Comprehensive test coverage (≥80%) for configuration utilities

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] All packages in the monorepo can import and extend TypeScript config from `@repo/config`
- [ ] Running `pnpm lint` across the monorepo uses the shared ESLint configuration consistently
- [ ] Prettier formatting is applied uniformly via `pnpm format` with no configuration drift
- [ ] Tailwind CSS theme tokens (colors, spacing, typography) are available to all UI-consuming packages
- [ ] A new package can be scaffolded extending shared configs in <5 minutes
- [ ] TypeScript strict mode is enforced across all packages without per-package configuration
- [ ] ESLint catches accessibility violations in React components
- [ ] Configuration changes propagate to all consuming packages via single update
- [ ] Test coverage for configuration utilities and exports ≥80%
- [ ] All stories complete and verified
- [ ] Documentation updated with config extension examples

## Stories

| ID  | Title                                                                    | Size | Status | Depends On     | Blocks         |
| --- | ------------------------------------------------------------------------ | ---- | ------ | -------------- | -------------- |
| S1  | [Create @repo/config Package Structure](./S1-package-structure.md)       | S    | ⬜     | -              | S2, S3, S4, S5 |
| S2  | [Configure TypeScript Base Configurations](./S2-typescript-config.md)    | M    | ⬜     | S1             | S5, S6         |
| S3  | [Configure ESLint for Next.js, React, TypeScript](./S3-eslint-config.md) | M    | ⬜     | S1             | S5, S6         |
| S4  | [Configure Prettier Formatting Standards](./S4-prettier-config.md)       | S    | ⬜     | S1             | S5, S6         |
| S5  | [Configure Tailwind CSS v4 with Theme Tokens](./S5-tailwind-config.md)   | M    | ⬜     | S1, S2, S3, S4 | S6             |
| S6  | [Integrate Configs Across Monorepo Packages](./S6-integration.md)        | M    | ⬜     | S2, S3, S4, S5 | S7             |
| S7  | [Add Tests and Documentation](./S7-tests-docs.md)                        | S    | ⬜     | S6             | -              |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Package Structure)
 │
 ├──→ S2 (TypeScript Config)
 │     │
 ├──→ S3 (ESLint Config)
 │     │
 ├──→ S4 (Prettier Config)
 │     │
 └──→ S5 (Tailwind Config) ←── S2, S3, S4
           │
           └──→ S6 (Integration) ←── S2, S3, S4
                     │
                     └──→ S7 (Tests & Docs)
```

**Parallel Execution Notes:**

- S2 (TypeScript), S3 (ESLint), and S4 (Prettier) can run in parallel after S1 completes
- S5 (Tailwind) requires S1-S4 to ensure consistent tooling integration
- S6 (Integration) requires all config stories to complete before monorepo-wide application
- S7 (Tests & Docs) is the final convergence point

## Technical Constraints

### Required Patterns

- **Package Exports**: Use `exports` field in package.json for explicit module resolution per [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- **Config Extension**: All configs must be extendable via standard tool mechanisms (extends, presets) per [TAD: Developer Experience](/docs/2-technical/2-tad.md#developer-experience)
- **Strict TypeScript**: Enable `strict: true` and additional strict flags per [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)
- **ES Modules**: Package must support ESM imports for modern tooling compatibility

### Technology Decisions

| Decision             | Choice                          | Reference                                                                             |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| TypeScript Version   | 5.x with strict mode            | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)              |
| ESLint Version       | 8.x with Next.js, React plugins | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)              |
| Prettier Version     | 3.x                             | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)              |
| Tailwind CSS Version | 4.x (CSS-first configuration)   | [Canonical Versions](/docs/2-technical/references/canonical-versions.md)              |
| Monorepo Tool        | Turborepo                       | [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)   |
| Package Manager      | pnpm with workspaces            | [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) |

### Constraints

- **No Runtime Dependencies**: Config package should have minimal/no runtime dependencies to avoid bloating consuming packages
- **Peer Dependencies**: Tools (TypeScript, ESLint, Prettier, Tailwind) should be peer dependencies, not direct dependencies
- **Workspace Protocol**: Use `workspace:*` for internal package references per pnpm conventions
- **Version Pinning**: Tool versions must match [Canonical Versions](/docs/2-technical/references/canonical-versions.md) exactly
- **Backwards Compatibility**: Config changes should not break existing packages without migration path

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Jest Configuration** - Project uses Vitest; Jest configs not needed (see Epic 1A.3)
- **Webpack/Vite Configs** - Next.js handles bundling internally; Storybook uses Vite (see Epic 4A.2)
- **Package-Specific Overrides** - Individual packages may add local overrides; this epic establishes base only
- **Design Token Documentation Site** - Storybook design token display deferred to Epic 4A.2
- **Runtime Utilities** - This package is configs only; runtime utilities belong in specific packages
- **CI-Specific Configs** - GitHub Actions configs are in Epic 1A.5
- **Tailwind Component Classes** - Component-specific classes belong in @repo/ui (Epic 2A.5)
- **Editor Configurations** - VS Code settings are in Epic 1A.4 (Documentation Foundation)

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision                       | Options                                              | Impact                                      | Status                                          |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| Tailwind v4 migration strategy | CSS-first config vs JS config compat layer           | Affects Tailwind setup complexity           | ✅ Resolved: CSS-first per Tailwind v4 defaults |
| ESLint flat config vs legacy   | Flat config (eslint.config.js) vs legacy (.eslintrc) | Affects config file structure               | ✅ Resolved: Flat config for modern tooling     |
| TypeScript project references  | Enable vs disable                                    | Affects build performance and type checking | ✅ Resolved: Enable for monorepo performance    |
| Theme token naming convention  | Design system tokens (e.g., `--color-primary`)       | Affects UI package integration              | ⬜ Open                                         |

## Risks and Mitigations

| Risk                                | Likelihood | Impact | Mitigation                                                     |
| ----------------------------------- | ---------- | ------ | -------------------------------------------------------------- |
| Tailwind v4 breaking changes        | Medium     | Medium | Pin to stable v4 release; test extensively before integration  |
| ESLint flat config compatibility    | Low        | Medium | Use @eslint/eslintrc for legacy plugin compatibility if needed |
| Config conflicts between packages   | Medium     | Low    | Document override patterns; use consistent base configs        |
| TypeScript version mismatches       | Low        | High   | Enforce version via packageManager field and CI checks         |
| Theme token naming conflicts        | Medium     | Medium | Establish naming convention early; document in style guide     |
| Performance impact from strict mode | Low        | Low    | Profile build times; adjust if significant regression          |

## Estimated Effort

| Metric          | Value                              |
| --------------- | ---------------------------------- |
| Total Stories   | 7                                  |
| Total Hours     | 26h                                |
| Calendar Days   | 3-4 days                           |
| Parallel Tracks | 3 (S2, S3, S4 can run in parallel) |

### Story Breakdown

| Size      | Count | Hours |
| --------- | ----- | ----- |
| XS (1-2h) | 0     | 0h    |
| S (2-4h)  | 3     | 10h   |
| M (4-8h)  | 4     | 16h   |

**Note**: M-sized stories involve complex configuration with multiple tool integrations (ESLint plugins, TypeScript paths, Tailwind theming). S-sized stories are more focused single-tool configurations.

## References

### Internal Documentation

- [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [TAD: Developer Experience](/docs/2-technical/2-tad.md#developer-experience)
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)
- [Roadmap: Phase 2A](/docs/1-product/3-roadmap.md#phase-2a-core-platform-packages-week-2)
- [Canonical Versions](/docs/2-technical/references/canonical-versions.md)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ADR-003: Next.js 16 as Framework](/docs/2-technical/adr/003-nextjs-framework.md)

### External Documentation

- [TypeScript Handbook - Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 CSS-First Configuration](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Package Configuration](https://turbo.build/repo/docs/core-concepts/monorepos/configuring-workspaces)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
