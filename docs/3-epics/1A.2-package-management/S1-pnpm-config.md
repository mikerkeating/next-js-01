# Story 1A.2.S1: Configure pnpm and npmrc

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [Epic 1A.1: Monorepo Foundation](../1A.1-monorepo-foundation/EPIC.md) (specifically S2: pnpm Workspaces)
- **Blocks**: [S2: Environment Validation](./S2-env-validation.md), [S3: Husky Setup](./S3-husky-setup.md), [S5: Commitlint](./S5-commitlint.md), [S7: Dependabot](./S7-dependabot.md)
- **Runs in Parallel With**: None (first story in epic)

## User Story
**As a** developer
**I want** optimised pnpm and npmrc configuration for the monorepo
**So that** I have fast, reliable dependency management with proper caching, strict resolution, and consistent behaviour across all environments

## Acceptance Criteria
- [ ] `.npmrc` is updated with production-ready settings (side-effects-cache, shell-emulator, lockfile enforcement)
- [ ] Root `package.json` includes all required scripts for package management (`prepare`, `clean`, `reinstall`)
- [ ] Running `pnpm install` completes successfully with frozen lockfile when `pnpm-lock.yaml` exists
- [ ] CI environment is detected correctly with `frozen-lockfile` applied automatically
- [ ] Developers can bypass strict lockfile locally via `--no-frozen-lockfile` flag when needed
- [ ] Shell scripts in `scripts` package.json entries execute correctly across macOS and Linux

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| None | This story enhances existing configuration from Epic 1A.1 |

### Files to Modify
| Path | Changes |
|------|---------|
| `.npmrc` | Add production-ready settings (shell-emulator, side-effects-cache, prefer-frozen-lockfile) |
| `package.json` | Add `prepare`, `clean`, `reinstall` scripts |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies required - this story optimises existing pnpm configuration.

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `shell-emulator` | Set to `true` for cross-platform script compatibility | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `side-effects-cache` | Set to `true` for faster reinstalls | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `prefer-frozen-lockfile` | Set to `true` for CI reliability | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| `resolution-mode` | Set to `highest` for optimal dependency resolution | [pnpm docs](https://pnpm.io/npmrc#resolution-mode) |

**Configuration Rationale**: These settings enhance the baseline configuration from Epic 1A.1 S2 with production optimisations. Shell-emulator ensures scripts work identically on macOS and Linux. Side-effects cache improves rebuild performance. Prefer-frozen-lockfile ensures CI reproducibility.

## Test Requirements

### Manual Verification
- [ ] **Clean Install**: Delete `node_modules` and `pnpm-lock.yaml`, run `pnpm install` - should complete successfully
- [ ] **Frozen Lockfile**: With existing `pnpm-lock.yaml`, run `pnpm install --frozen-lockfile` - should complete without modifications
- [ ] **Cross-Platform Scripts**: Run `pnpm clean` on both macOS and Linux (or WSL) - should work identically

### Verification Commands
```bash
# Verify .npmrc contains required settings
grep -E "shell-emulator|side-effects-cache|prefer-frozen-lockfile" .npmrc

# Verify scripts exist in package.json
node -e "const p=require('./package.json'); \
  console.log('prepare:', !!p.scripts?.prepare, \
  'clean:', !!p.scripts?.clean)"

# Test frozen lockfile behaviour
pnpm install --frozen-lockfile

# Test clean script
pnpm clean
```

## Implementation Notes

### Key Concepts
- **shell-emulator**: pnpm's built-in shell emulator runs scripts in a cross-platform manner
- **side-effects-cache**: Caches packages with post-install scripts for faster subsequent installs
- **frozen-lockfile**: Fails if `pnpm-lock.yaml` would be modified, ensuring reproducible installs

### Common Patterns

> **Note**: For complete .npmrc configuration, reference [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md).

Key enhancement notes for this story:
- Build upon existing `.npmrc` from Epic 1A.1 S2
- Add performance and reliability settings, not replace existing ones
- Scripts should use pnpm-compatible patterns (avoid npm-specific features)

### Troubleshooting

**Issue**: `pnpm install` fails with frozen-lockfile in CI
- **Cause**: Lockfile was modified locally but not committed
- **Solution**: Run `pnpm install` locally, commit `pnpm-lock.yaml`, push

**Issue**: Scripts fail on Windows with shell-emulator enabled
- **Cause**: Complex shell syntax not fully supported
- **Solution**: Simplify script or use Node.js script runner

### Reference Materials
- [pnpm .npmrc Configuration](https://pnpm.io/npmrc)
- [pnpm Shell Emulator](https://pnpm.io/cli/run#shell-emulator)

## Estimated Effort
**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - All pnpm configuration decisions
- [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md) - Quality gate patterns

### Story-Specific Decisions
None - all decisions covered by ADR-002.

## Out of Scope

- **Initial pnpm Workspace Setup** - Completed in Epic 1A.1 S2
- **Husky Prepare Hook** - Deferred to S3 (Husky Setup)
- **CI/CD pnpm Caching** - Deferred to Epic 1A.5 (Basic CI/CD Pipeline)
- **Dependabot npm Ecosystem Configuration** - Deferred to S7 (Dependabot)

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **Epic 1A.1 S2**: Configure pnpm Workspaces - Base pnpm configuration must exist

### Enables (Unblocks These Stories)
- **S2**: Environment Validation - Requires functional pnpm for dependency installation
- **S3**: Husky Setup - Requires `prepare` script in package.json
- **S5**: Commitlint - Requires functional pnpm for package installation
- **S7**: Dependabot - Requires stable pnpm configuration for automated updates

## References

### Epic & TAD References
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)

### ADR References
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)

### External Documentation
- [pnpm Configuration](https://pnpm.io/npmrc)
- [pnpm CLI Reference](https://pnpm.io/cli/install)

## Verification Checklist

### Pre-Verification
- [ ] Epic 1A.1 completed (monorepo foundation in place)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] pnpm installed at specified version

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] `.npmrc` follows ADR-002 recommendations
- [ ] Scripts use pnpm-compatible syntax
- [ ] `pnpm install` runs without errors
- [ ] `pnpm install --frozen-lockfile` runs without errors (with existing lockfile)

### Documentation
- [ ] Any non-obvious configuration choices commented in `.npmrc`

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] `pnpm-lock.yaml` committed if modified

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
