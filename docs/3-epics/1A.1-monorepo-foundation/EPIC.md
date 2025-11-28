# Epic 1A.1: Monorepo Foundation

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context
- **PRD Reference**: [PRD: Technology Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- **TAD Reference**: [TAD: System Architecture - Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- **Phase**: 1A - Foundation & Infrastructure (Days 3-7)
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)
| Epic | Title | Reason |
|------|-------|--------|
| 0A.1 | [Steel Thread Deployment](../0A.1-steel-thread/EPIC.md) | Provides deployed Next.js app with Vercel integration and GitHub CI workflow to build upon |

### Blocks (Enables These Epics)
| Epic | Title | What This Provides |
|------|-------|-------------------|
| 1A.2 | [Package Management & Quality Gates](../1A.2-package-management/EPIC.md) | Workspace structure required for package-level quality gates and Husky configuration |
| 1A.3 | [Testing Foundation](../1A.3-testing-foundation/EPIC.md) | Turborepo pipeline and workspace configuration for shared test configuration |
| 1A.4 | [Documentation Foundation](../1A.4-documentation-foundation/EPIC.md) | `/docs` directory structure and monorepo conventions |
| 1A.5 | [Basic CI/CD Pipeline](../1A.5-basic-cicd/EPIC.md) | Turborepo `--filter` capability for affected-only CI runs |
| 2A.1 | [Configuration Package](../2A.1-config-package/EPIC.md) | `packages/` directory structure and workspace protocol for `@repo/config` |

### Can Run in Parallel With
| Epic | Title | Notes |
|------|-------|-------|
| - | None | This epic establishes the monorepo structure that all subsequent Phase 1A/2A epics depend on |

## Overview

The Monorepo Foundation transforms the steel thread Next.js application into a fully-configured Turborepo monorepo with workspace management, intelligent caching, and standardised directory structure. This epic establishes the architectural foundation upon which all shared packages and applications will be built.

**Key Deliverables:**
- Turborepo installed with `turbo.json` configuration
- pnpm workspace configuration with `apps/` and `packages/` directories
- Turborepo pipeline with `build`, `dev`, `lint`, `test`, `type-check`, and `clean` tasks
- Remote caching configured for Vercel
- Task dependency graph optimised for parallel execution
- Existing Next.js app migrated to `apps/routing/` workspace
- Root README with architecture overview and developer quickstart

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] Developers can run `pnpm dev` from root and start all applications
- [ ] Developers can run `pnpm build` and get cached results on subsequent runs (>70% build time reduction on cache hit)
- [ ] Running `pnpm turbo build --filter=@repo/routing` builds only the routing app and its dependencies
- [ ] Remote cache is enabled and team members share cached build artefacts via Vercel
- [ ] Creating a new package in `packages/` automatically integrates with workspace commands
- [ ] All TypeScript packages compile without errors using `pnpm turbo type-check`
- [ ] Vercel deployment succeeds from the new monorepo structure with correct app detection
- [ ] Root README documents monorepo architecture, directory structure, and common commands
- [ ] All stories complete and verified
- [ ] Documentation updated

## Stories

| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [Install and Configure Turborepo](./S1-install-turborepo.md) | M | ⬜ | - | S2, S3, S4 |
| S2 | [Configure pnpm Workspaces](./S2-pnpm-workspaces.md) | S | ⬜ | S1 | S3, S5 |
| S3 | [Migrate Next.js App to Workspace](./S3-migrate-nextjs-app.md) | M | ⬜ | S1, S2 | S4, S5, S6 |
| S4 | [Define Turborepo Pipeline Configuration](./S4-turbo-pipeline.md) | M | ⬜ | S1, S3 | S5, S6, S7 |
| S5 | [Configure Remote Caching](./S5-remote-caching.md) | S | ⬜ | S2, S3, S4 | S7 |
| S6 | [Update Vercel Deployment Configuration](./S6-vercel-deployment.md) | S | ⬜ | S3, S4 | S7 |
| S7 | [Document Monorepo Architecture](./S7-documentation.md) | S | ⬜ | S5, S6 | - |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (Install Turborepo)
 ├──→ S2 (pnpm Workspaces)
 │     ↓
 │     ├──→ S3 (Migrate Next.js App) ←── S1
 │     │         ↓
 │     │         ├──→ S4 (Turbo Pipeline) ←── S1
 │     │         │         ↓
 │     │         │         ├──→ S5 (Remote Caching) ←── S2, S3
 │     │         │         └──→ S6 (Vercel Deployment) ←── S3
 │     │         │                   ↓
 │     │         └─────────────────→ S7 (Documentation) ←── S5
 └──────────────────────────────────────────────────────────┘
```

**Parallel Execution Notes:**
- S2 (pnpm Workspaces) can start immediately after S1 completes
- S3 (Migrate App) requires both S1 and S2, as it needs workspace structure
- S4 (Pipeline) requires S1 and S3, as it configures tasks for the migrated app
- S5 (Remote Caching) and S6 (Vercel Deployment) can run in parallel after S4
- S7 (Documentation) is the final convergence point

## Technical Constraints

### Required Patterns
- **Monorepo Structure**: Follow `apps/` and `packages/` directory convention per [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- **Package Naming**: Use `@repo/package-name` convention for internal packages per [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- **Workspace Protocol**: Use `workspace:*` for internal package dependencies per [ADR-002: pnpm](/docs/2-technical/adr/002-pnpm-package-manager.md)

### Technology Decisions
| Decision | Choice | Reference |
|----------|--------|-----------|
| Monorepo Tool | Turborepo | [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) |
| Package Manager | pnpm 10.x | [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| Framework | Next.js 16 | [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md) |
| Hosting | Vercel | [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) |

### Constraints
- **Versions**: All technology versions per [Canonical Versions](/docs/2-technical/references/canonical-versions.md)
- **Root Workspace**: Root `package.json` must be `"private": true` and define workspace patterns
- **Turborepo Tasks**: Must define at minimum: `build`, `dev`, `lint`, `test`, `type-check`, `clean`
- **Task Dependencies**: Build must depend on `^build` (dependencies built first)
- **Cache Outputs**: All cacheable tasks must specify `outputs` in `turbo.json`
- **No Breaking Changes**: Existing deployment pipeline must continue working throughout migration

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Shared Configuration Package (`@repo/config`)** - Deferred to Epic 2A.1 (Configuration Package); this epic creates the structure, not the content
- **Testing Framework Configuration (Vitest)** - Deferred to Epic 1A.3 (Testing Foundation); `test` task defined but placeholder implementation
- **Quality Gates (Husky, lint-staged, commitlint)** - Deferred to Epic 1A.2 (Package Management & Quality Gates)
- **Additional Applications** - This epic migrates only the routing app; other apps (api, cdn, docs) created in later phases
- **Shared UI Package (`@repo/ui`)** - Deferred to Epic 2A.5 (UI Component Library)
- **Environment Validation Package** - Deferred to Epic 2A.1 (Configuration Package)

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| Initial app name in monorepo | `routing` vs `web` vs `main` | Affects directory naming and references | ✅ Resolved: Use `routing` per roadmap |
| Remote cache token storage | Environment variable vs Vercel integration | Affects CI configuration | ⬜ Open |
| Turbo daemon usage | Enable daemon by default vs opt-in | Affects local development performance | ⬜ Open |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vercel monorepo detection issues | Low | High | Test deployment before completing; use explicit root directory config |
| pnpm workspace resolution conflicts | Medium | Medium | Use strict peer dependencies; test with clean install |
| Build cache invalidation issues | Low | Medium | Document cache clearing procedures; verify with clean CI run |
| Migration breaks existing deployment | Low | High | Incremental migration; verify deployment after each story |

## Estimated Effort

| Metric | Value |
|--------|-------|
| Total Stories | 7 |
| Total Hours | 24h |
| Calendar Days | 3 days |
| Parallel Tracks | 2 (after S2) |

### Story Breakdown
| Size | Count | Hours |
|------|-------|-------|
| XS (1-2h) | 0 | 0h |
| S (2-4h) | 4 | 12h |
| M (4-8h) | 3 | 12h |
| L (8-16h) | 0 | 0h |

**Note**: S-sized stories estimated at ~3h average, M-sized at ~4h average. Migration and pipeline configuration require extra care for correctness.

## References

### Internal Documentation
- [PRD: Technical Requirements](/docs/1-product/1-prd.md#6-technical-requirements)
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture)
- [Roadmap: Phase 1A](/docs/1-product/3-roadmap.md#phase-1a-foundation--infrastructure-days-3-7)

### ADRs
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
