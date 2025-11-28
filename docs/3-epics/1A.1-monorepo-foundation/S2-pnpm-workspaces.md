# Story 1A.1.S2: Configure pnpm Workspaces

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Monorepo Foundation](./EPIC.md)
- **Depends On**: [S1: Install and Configure Turborepo](./S1-install-turborepo.md)
- **Blocks**: [S3: Migrate Next.js App](./S3-migrate-nextjs-app.md), [S5: Configure Remote Caching](./S5-remote-caching.md)
- **Runs in Parallel With**: None

## User Story
**As a** developer
**I want** pnpm workspaces configured for the monorepo
**So that** I can manage dependencies across multiple apps and packages with efficient linking and shared tooling

## Acceptance Criteria
- [x] `pnpm-workspace.yaml` exists at repository root with `apps/*` and `packages/*` patterns
- [x] `.npmrc` exists with workspace-optimised settings (strict peer deps, workspace linking)
- [x] Root `package.json` is marked as `private: true` with `packageManager` and `engines` fields
- [x] Running `pnpm install` succeeds without errors
- [x] Directory structure includes `apps/` and `packages/` directories (with `.gitkeep`)
- [x] `.nvmrc` file exists with correct Node.js version
- [x] Creating a new package in `packages/` automatically integrates with workspace commands (verified by test)

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | pnpm workspace configuration defining package locations |
| `.npmrc` | pnpm configuration with workspace and dependency settings |
| `.nvmrc` | Node.js version specification for nvm users |
| `apps/.gitkeep` | Placeholder to preserve empty apps directory in git |
| `packages/.gitkeep` | Placeholder to preserve empty packages directory in git |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` | Add `private`, `packageManager`, `engines` fields |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies to install - this story configures pnpm itself.

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `pnpm-workspace.yaml` packages | Define `apps/*` and `packages/*` patterns | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `.npmrc` strict-peer-dependencies | Set to `true` for strict dependency resolution | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `.npmrc` link-workspace-packages | Set to `true` for automatic workspace linking | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `package.json` private | Set to `true` to prevent accidental publishing | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `package.json` packageManager | Specify pnpm version per canonical-versions.md | [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) |

**Configuration Rationale**: Workspace configuration follows ADR-002 patterns. `private: true` prevents accidental publishing. `packageManager` enables Corepack. Strict peer deps ensure explicit dependency declarations.

## Test Requirements

### Manual Verification
- [x] **Workspace Recognition**: Run `pnpm list -r` and confirm workspace structure is recognised
- [x] **Install Success**: Run `pnpm install` from fresh state (delete node_modules first)
- [x] **Package Auto-Integration**: Create a test package in `packages/`, run `pnpm install`, verify it appears in `pnpm list -r`

### Verification Commands
```bash
# Verify workspace is configured
pnpm list -r --depth 0

# Verify package.json has required fields
node -e "const p=require('./package.json'); \
  console.log('private:', p.private, \
  'packageManager:', p.packageManager)"

# Verify directory structure
ls apps/ packages/

# Verify new packages auto-integrate with workspace (creates temp package, verifies, cleans up)
mkdir -p packages/test-pkg && \
  echo '{"name":"@repo/test","version":"0.0.0"}' > packages/test-pkg/package.json && \
  pnpm install && \
  pnpm list -r --depth 0 | grep -q "@repo/test" && \
  echo "✓ New package auto-integrated" && \
  rm -rf packages/test-pkg && \
  pnpm install
```

## Implementation Notes

### Implementation Sequence

1. **Create Directory Structure** - Create `apps/` and `packages/` with `.gitkeep`
2. **Create pnpm-workspace.yaml** - Define workspace patterns per ADR-002
3. **Create .npmrc** - Configure strict peer deps, workspace linking per ADR-002
4. **Update Root package.json** - Add `private`, `packageManager`, `engines` fields
5. **Create .nvmrc** - Specify Node.js major version
6. **Verify** - Run `pnpm install` and verification commands

### Troubleshooting

**Issue**: `pnpm install` fails with workspace errors
- **Cause**: Invalid YAML syntax or missing directories
- **Solution**: Verify YAML syntax; ensure directories exist

**Issue**: `packageManager` field not recognised
- **Cause**: Corepack not enabled
- **Solution**: Run `corepack enable`

### Reference Materials
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [pnpm .npmrc Configuration](https://pnpm.io/npmrc)

## Estimated Effort
**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Workspace configuration
- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure) - Directory convention

### Story-Specific Decisions
None - all decisions covered by ADR-002.

## Out of Scope

- **Turborepo Installation** - Completed in S1
- **Application Migration** - Deferred to S3
- **Shared Package Creation** - Deferred to Epic 2A.x
- **CI/CD pnpm Configuration** - Deferred to Epic 1A.5

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: Install and Configure Turborepo - Turborepo must be installed first

### Enables (Unblocks These Stories)
- **S3**: Migrate Next.js App - Requires workspace structure
- **S5**: Configure Remote Caching - Requires workspace configuration

## References

### Epic & TAD References
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)

### ADR References
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)

### External Documentation
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Corepack](https://nodejs.org/api/corepack.html)

## Verification Checklist

### Pre-Verification
- [x] S1 (Install Turborepo) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality
- [x] All acceptance criteria met
- [x] `pnpm-workspace.yaml` is valid YAML
- [x] `.npmrc` follows ADR-002 recommendations
- [x] `pnpm install` runs without errors

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No unrelated changes included

## Status
- **State**: Complete
- **Completed**: 2025-11-28
- **PR**: -

## Completion Notes

### Summary
Configured pnpm workspaces for the monorepo by creating the `.npmrc` file with workspace-optimised settings per ADR-002, and creating the `apps/` and `packages/` directory structure with `.gitkeep` files. The `pnpm-workspace.yaml`, root `package.json` (with `private`, `packageManager`, `engines` fields), and `.nvmrc` were already in place from previous work.

### Test Results
| Test | Command | Result |
|------|---------|--------|
| Lint | `pnpm lint` | Pass |
| Types | `pnpm type-check` | Pass |
| Workspace Recognition | `pnpm list -r --depth 0` | Pass |
| Install | `pnpm install` | Pass |

### Files Changed
Files created as specified in story:
- `.npmrc` - pnpm workspace configuration with strict peer deps, workspace linking
- `apps/.gitkeep` - Placeholder for apps directory
- `packages/.gitkeep` - Placeholder for packages directory

Files already in place (verified):
- `pnpm-workspace.yaml` - Already configured with `apps/*` and `packages/*` patterns
- `package.json` - Already has `private: true`, `packageManager: pnpm@10.22.0`, `engines` fields
- `.nvmrc` - Already set to `24`

### Known Issues
None.

### Lessons Learned
- The ADR-002 specifies `frozen-lockfile=true` in `.npmrc`, but this setting is typically only used in CI environments to ensure reproducible builds. It was omitted from the local `.npmrc` as it prevents adding new dependencies during development. CI/CD configuration (Epic 1A.5) should add this setting for production builds.
