# Story 1A.1.S4: Define Turborepo Pipeline Configuration

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Monorepo Foundation](./EPIC.md)
- **Depends On**: [S1: Install and Configure Turborepo](./S1-install-turborepo.md), [S3: Migrate Next.js App](./S3-migrate-nextjs-app.md)
- **Blocks**: [S5: Configure Remote Caching](./S5-remote-caching.md), [S6: Vercel Deployment](./S6-vercel-deployment.md), [S7: Documentation](./S7-documentation.md)
- **Runs in Parallel With**: None

## User Story
**As a** developer
**I want** Turborepo pipeline tasks properly configured with dependencies and caching
**So that** builds are optimised with intelligent caching, tasks run in the correct order, and incremental builds are efficient

## Acceptance Criteria
- [ ] `turbo.json` defines tasks: `build`, `dev`, `lint`, `test`, `type-check`, `clean`
- [ ] `build` task depends on `^build` (dependencies built first) with cache outputs configured
- [ ] `dev` task is marked as `persistent: true` and not cached
- [ ] `lint` and `type-check` tasks are cacheable with appropriate inputs/outputs
- [ ] `test` task depends on `^build` and is cacheable with coverage outputs
- [ ] `clean` task is not cached and clears build artefacts
- [ ] Running `pnpm turbo build` shows cache hit on second run (>70% time reduction)
- [ ] Running `pnpm turbo build --filter=@repo/routing` builds only the routing app and its dependencies
- [ ] Task dependency graph is correct (`turbo run build --graph` shows expected order)
- [ ] Environment variables affecting builds are configured in `globalEnv` or task-specific `env`

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| None | This story modifies existing `turbo.json` created in S1 |

### Files to Modify
| Path | Changes |
|------|---------|
| `turbo.json` | Configure complete task definitions with dependencies, caching, inputs, outputs |
| `apps/routing/package.json` | Ensure workspace scripts align with turbo task names |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies required. Turborepo is already installed from S1.

### Configuration Details

> **Note**: This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `tasks.build.dependsOn` | Must include `^build` for topological dependency ordering | [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md) |
| `tasks.build.outputs` | Include `.next/**`, `!.next/cache/**` for Next.js apps | [Turborepo Docs](https://turbo.build/repo/docs/reference/configuration#outputs) |
| `tasks.dev.persistent` | Must be `true` for long-running dev servers | [Turborepo Docs](https://turbo.build/repo/docs/reference/configuration#persistent) |
| `tasks.dev.cache` | Must be `false` - dev servers should never be cached | [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md) |
| `tasks.lint.outputs` | Empty array `[]` - lint produces no artefacts | [Turborepo Docs](https://turbo.build/repo/docs/reference/configuration#outputs) |
| `tasks.test.outputs` | Include `coverage/**` for test coverage reports | [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture) |
| `tasks.type-check.outputs` | Empty array `[]` - type-check produces no artefacts | Standard Turborepo pattern |
| `tasks.clean.cache` | Must be `false` - clean should always run | Standard Turborepo pattern |
| `globalEnv` | Include `NODE_ENV`, `CI` for cache invalidation | [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md) |

**Configuration Rationale**:
- Task dependencies ensure packages are built before their dependents
- Cache outputs allow Turborepo to restore previous build artefacts
- Persistent tasks keep dev servers running without Turborepo terminating them
- Global environment variables ensure cache invalidation when environment changes
- The `^` prefix in `dependsOn` creates topological ordering (build dependencies first)

## Test Requirements

### Manual Verification
- [ ] **Cache Hit Verification**: Run `pnpm turbo build` twice; second run should show "FULL TURBO" with >70% time reduction
- [ ] **Filter Verification**: Run `pnpm turbo build --filter=@repo/routing` and verify only routing app builds
- [ ] **Task Graph**: Run `pnpm turbo run build --graph` and verify dependency graph is correct
- [ ] **Dev Server**: Run `pnpm turbo dev` and verify dev server starts and remains running
- [ ] **Clean Task**: Run `pnpm turbo clean` and verify `.next` directories are removed

### Automated Tests
N/A - Configuration story; verification is through manual commands and cache behaviour.

### Integration Tests
- [ ] Turborepo correctly identifies task dependencies and executes in correct order
- [ ] Cache invalidation works when source files change
- [ ] Workspace filtering correctly identifies affected packages

### Verification Commands
```bash
# Verify turbo.json is valid
node -e "require('./turbo.json')"

# Run build and verify cache behaviour (run twice)
pnpm turbo build --summarize
pnpm turbo build --summarize  # Should show cache hits

# Verify task graph
pnpm turbo run build --graph

# Verify filter works
pnpm turbo build --filter=@repo/routing --dry-run

# Verify lint task
pnpm turbo lint

# Verify type-check task
pnpm turbo type-check

# Verify clean task
pnpm turbo clean && ls apps/routing/.next 2>/dev/null || echo "✓ .next cleaned"

# Verify dev server (manual - Ctrl+C to stop)
pnpm turbo dev
```

## Implementation Notes

### Implementation Sequence

1. **Analyse Current turbo.json** - Review placeholder tasks from S1; determine cache outputs for each task
2. **Configure Build Task** - Add `dependsOn: ["^build"]`; configure `outputs` for `.next/**`
3. **Configure Dev Task** - Set `persistent: true`; set `cache: false`
4. **Configure Lint & Type-Check Tasks** - Set `outputs: []`; configure appropriate inputs
5. **Configure Test Task** - Add `dependsOn: ["^build"]`; configure `outputs` for coverage
6. **Configure Clean Task** - Set `cache: false`
7. **Configure Global Settings** - Add `globalEnv` and `globalDependencies`
8. **Update Workspace Scripts** - Ensure `apps/routing/package.json` scripts match turbo task names

### Key Concepts
- **Task Dependencies**: `dependsOn` defines which tasks must complete before this task runs
- **Topological Ordering**: `^build` prefix means "build all dependencies first"
- **Cache Outputs**: Files/directories Turborepo should cache and restore
- **Persistent Tasks**: Long-running tasks (like dev servers) that don't exit
- **Global Environment**: Environment variables that affect all tasks and cache keys

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:
- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)

Key pattern notes for this story:
- Next.js outputs go to `.next/**` but exclude `.next/cache/**` (handled by Next.js)
- Test coverage typically outputs to `coverage/**`
- Lint and type-check produce no filesystem outputs (validation only)

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Cache not used on second build | Outputs misconfigured | Run `turbo build --summarize`; verify outputs |
| `turbo dev` exits immediately | Missing `persistent: true` | Add `"persistent": true` to dev task |
| Build order incorrect | Missing `^` prefix | Add `"dependsOn": ["^build"]` |
| Cache invalidates unexpectedly | Untracked file changes | Review `inputs` and `globalDependencies` |

### Reference Materials
- [Turborepo Configuration Reference](https://turbo.build/repo/docs/reference/configuration)
- [Turborepo Caching](https://turbo.build/repo/docs/core-concepts/caching)

## Estimated Effort
**Size**: M (4-8h)

**Breakdown**: Analysis (1h), Build task (1h), Dev/lint/type-check tasks (1h), Test/clean tasks (1h), Global settings (0.5h), Testing (1.5h)

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Establishes Turborepo task conventions
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack) - Defines required tasks (build, dev, lint, test, type-check, clean)
- [TAD: Testing Architecture](/docs/2-technical/2-tad.md#testing-architecture) - Defines test coverage output requirements

### Story-Specific Decisions

No story-specific decisions required - all decisions for this story are covered by ADR-001 and the TAD. Task configuration follows standard Turborepo patterns.

## Out of Scope

The following items are explicitly NOT part of this story:

- **Remote Caching Configuration** - Deferred to S5 (Remote Caching); S4 configures local caching only
- **Vercel Integration** - Deferred to S6 (Vercel Deployment)
- **Shared Configuration Package** - Deferred to Epic 2A.1; task configs use inline values for now
- **Additional Workspace Tasks** - Future workspaces may add tasks; S4 configures the routing app only
- **CI/CD Pipeline Integration** - Deferred to Epic 1A.5 (Basic CI/CD Pipeline)
- **Testing Framework Setup** - Deferred to Epic 1A.3; `test` task defined but may use placeholder script

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: Install and Configure Turborepo - `turbo.json` must exist with placeholder tasks
- **S3**: Migrate Next.js App - App must be in workspace for task verification

### Enables (Unblocks These Stories)
- **S5**: Configure Remote Caching - Requires working local cache to enable remote
- **S6**: Vercel Deployment - Requires correct task configuration for Vercel builds
- **S7**: Documentation - Requires complete pipeline for documentation of commands

## References

- [EPIC.md](./EPIC.md), [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [Turborepo Docs](https://turbo.build/repo/docs), [Turborepo Caching](https://turbo.build/repo/docs/core-concepts/caching)

## Verification Checklist

### Pre-Verification
- [ ] S1 and S3 completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] `turbo.json` exists with placeholder tasks from S1
- [ ] `apps/routing/` workspace exists with working build

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] `turbo.json` passes JSON schema validation
- [ ] All six required tasks configured (build, dev, lint, test, type-check, clean)
- [ ] Cache hit achieved on second build run
- [ ] Task dependencies execute in correct order

### Documentation
- [ ] Configuration comments explain non-obvious choices
- [ ] README deferred to S7 (Documentation)

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
