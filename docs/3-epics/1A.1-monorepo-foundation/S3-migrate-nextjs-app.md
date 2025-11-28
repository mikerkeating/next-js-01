# Story 1A.1.S3: Migrate Next.js App to Workspace

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Monorepo Foundation](./EPIC.md)
- **Depends On**: [S1: Install and Configure Turborepo](./S1-install-turborepo.md), [S2: Configure pnpm Workspaces](./S2-pnpm-workspaces.md)
- **Blocks**: [S4: Turbo Pipeline](./S4-turbo-pipeline.md), [S5: Configure Remote Caching](./S5-remote-caching.md), [S6: Vercel Deployment](./S6-vercel-deployment.md)
- **Runs in Parallel With**: None

## User Story
**As a** developer
**I want** the existing Next.js application migrated to the `apps/routing/` workspace directory
**So that** the monorepo structure supports multiple applications with shared dependencies while preserving existing functionality

## Acceptance Criteria
- [ ] Next.js application exists at `apps/routing/` with its own `package.json`
- [ ] Application runs successfully with `pnpm --filter @repo/routing dev`
- [ ] Application builds successfully with `pnpm --filter @repo/routing build`
- [ ] Root-level turbo commands (`pnpm turbo dev`, `pnpm turbo build`) execute the routing app
- [ ] All existing routes and pages function identically to pre-migration
- [ ] Existing E2E smoke tests pass against the migrated application
- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint passes with no errors

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `apps/routing/package.json` | Workspace package configuration for the routing app |
| `apps/routing/tsconfig.json` | TypeScript configuration extending root config |
| `apps/routing/next.config.ts` | Next.js configuration (moved from root) |
| `apps/routing/src/` | Application source code (moved from root) |
| `apps/routing/public/` | Static assets directory (if applicable) |
| `apps/routing/.eslintrc.json` | ESLint configuration extending root (if needed) |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` (root) | Remove Next.js-specific dependencies; update scripts for workspace execution |
| `turbo.json` | Ensure tasks apply to workspace apps |
| `.gitignore` | Add workspace-specific patterns if needed |

### Files to Remove/Move
| Path | Action |
|------|--------|
| `src/` (root) | Move to `apps/routing/src/` |
| `next.config.ts` (root) | Move to `apps/routing/` |
| `tailwind.config.ts` (root) | Move to `apps/routing/` |
| `postcss.config.js` (root) | Move to `apps/routing/` |
| `tests/` (root) | Move to `apps/routing/tests/` |
| `playwright.config.ts` (root) | Move to `apps/routing/` |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

The routing app workspace inherits most dependencies. Key dependencies to include in `apps/routing/package.json`:

**Production dependencies** (move from root):
- `next`, `react`, `react-dom` - Core framework
- `@t3-oss/env-nextjs`, `zod` - Environment validation

**Dev dependencies** (move from root):
- TypeScript types, Tailwind CSS, PostCSS, Autoprefixer
- Playwright (for workspace-specific E2E tests)

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `apps/routing/package.json` name | Use `@repo/routing` workspace name | [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) |
| `apps/routing/tsconfig.json` extends | Extend from root tsconfig if shared configs exist | [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure) |
| Root `package.json` scripts | Update to use `turbo run` for workspace execution | [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md) |

**Configuration Rationale**:
- The `@repo/` namespace follows the internal package naming convention from TAD
- Workspace-specific configs allow per-app customisation while sharing common patterns
- Root scripts delegate to Turborepo for proper workspace orchestration

## Test Requirements

### Manual Verification
- [ ] **Dev Server**: Run `pnpm --filter @repo/routing dev` and verify app loads at localhost:3000
- [ ] **Build**: Run `pnpm --filter @repo/routing build` and verify successful completion
- [ ] **Root Commands**: Run `pnpm turbo dev` from root and verify routing app starts
- [ ] **Page Rendering**: Visit homepage and verify "MK3 Platform" content renders correctly
- [ ] **Hot Reload**: Modify a component and verify hot reload works

### Automated Tests
- [ ] Existing E2E smoke tests pass: `pnpm --filter @repo/routing test:e2e:smoke`

### Integration Tests
- [ ] Turborepo correctly identifies and executes tasks for `@repo/routing` workspace
- [ ] Dependency resolution works correctly with workspace protocol

### Verification Commands
```bash
# Verify workspace is recognised
pnpm list -r --depth 0 | grep routing

# Verify app builds
pnpm --filter @repo/routing build

# Verify app runs
pnpm --filter @repo/routing dev &
sleep 5 && curl -s http://localhost:3000 | grep -q "MK3 Platform"

# Verify root turbo commands work
pnpm turbo build --filter=@repo/routing

# Verify TypeScript compilation
pnpm --filter @repo/routing type-check

# Verify ESLint passes
pnpm --filter @repo/routing lint

# Verify E2E tests pass
pnpm --filter @repo/routing test:e2e:smoke
```

## Implementation Notes

### Implementation Sequence

1. **Create Directory Structure**
   - Create `apps/routing/` directory
   - Create `apps/routing/src/` directory
   - Remove `apps/.gitkeep` (no longer needed)

2. **Move Source Files**
   - Move `src/` contents to `apps/routing/src/`
   - Move `next.config.ts` to `apps/routing/`
   - Move `tailwind.config.ts` to `apps/routing/`
   - Move `postcss.config.js` to `apps/routing/`
   - Move `tests/` to `apps/routing/tests/`
   - Move `playwright.config.ts` to `apps/routing/`
   - Move `public/` if it exists

3. **Create Workspace Package Configuration**
   - Create `apps/routing/package.json` with `@repo/routing` name
   - Move relevant dependencies from root `package.json`
   - Configure workspace-specific scripts

4. **Create TypeScript Configuration**
   - Create `apps/routing/tsconfig.json`
   - Configure paths and extends as appropriate

5. **Update Root Configuration**
   - Update root `package.json` scripts to use `turbo run`
   - Remove migrated dependencies from root
   - Keep shared dev dependencies at root (Turborepo, shared configs)

6. **Verify and Test**
   - Run `pnpm install` to update workspace links
   - Verify all verification commands pass
   - Run E2E smoke tests

### Key Concepts
- **Workspace Protocol**: Use `workspace:*` for internal package dependencies
- **Filter Flag**: `--filter` targets specific workspaces for commands
- **Package Naming**: `@repo/` prefix identifies internal packages

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Workspace not found | pnpm doesn't recognise workspace | Verify `apps/routing/package.json` exists with correct `name`; run `pnpm install` |
| Import paths break | TypeScript paths not updated | Update `tsconfig.json` paths; verify `@/` alias |
| Tailwind styles missing | Content paths incorrect | Update `tailwind.config.ts` content paths |
| E2E tests fail | Playwright config using old paths | Update `playwright.config.ts` webServer command |

## Estimated Effort
**Size**: M (4-8h)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Workspace conventions
- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure) - `apps/` and `packages/` convention
- [TAD: Package Architecture](/docs/2-technical/2-tad.md#package-architecture) - `@repo/` naming convention

### Story-Specific Decisions
None - app naming (`@repo/routing`) follows established TAD conventions. "Routing" reflects the app's role as the main entry point per roadmap.

## Out of Scope

The following items are explicitly NOT part of this story:

- **Turborepo Pipeline Configuration** - Deferred to S4 (Turbo Pipeline); S3 uses placeholder tasks
- **Remote Caching Setup** - Deferred to S5 (Remote Caching)
- **Vercel Deployment Configuration** - Deferred to S6 (Vercel Deployment)
- **Shared Configuration Package** - Deferred to Epic 2A.1 (Configuration Package)
- **Additional Applications** - Only the routing app is created; api, cdn, docs apps deferred to later phases
- **Shared TypeScript/ESLint Configs** - Keep existing configs for now; shared configs in Epic 2A.1

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: Install and Configure Turborepo - Turbo.json must exist for workspace task execution
- **S2**: Configure pnpm Workspaces - Workspace structure (`apps/`, `packages/`) must be configured

### Enables (Unblocks These Stories)
- **S4**: Turbo Pipeline - Can configure task dependencies once app exists in workspace
- **S5**: Configure Remote Caching - Requires working workspace builds to test caching
- **S6**: Vercel Deployment - Requires app in workspace for monorepo deployment config

## References

- [EPIC.md](./EPIC.md), [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md), [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md), [ADR-003](/docs/2-technical/adr/003-nextjs-framework.md)
- [Turborepo Docs](https://turbo.build/repo/docs), [Next.js Monorepos](https://nextjs.org/docs/pages/building-your-application/configuring/monorepo)

## Verification Checklist

- [ ] S1 and S2 completed; environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All acceptance criteria met (app runs, builds, lint passes, TypeScript compiles)
- [ ] E2E smoke tests pass; hot reload works
- [ ] Conventional commit; file moves tracked with `git mv` where possible

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
