# Story 1A.2.S3: Install and Configure Husky

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [S1: Configure pnpm and npmrc](./S1-pnpm-config.md)
- **Blocks**: [S4: lint-staged Configuration](./S4-lint-staged.md), [S5: Commitlint](./S5-commitlint.md)
- **Runs in Parallel With**: [S2: Environment Validation](./S2-env-validation.md)

## User Story
**As a** developer
**I want** Husky git hooks automatically installed when I run `pnpm install`
**So that** quality gates are enforced consistently without manual setup

## Acceptance Criteria
- [ ] Husky is installed at the version specified in [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)
- [ ] Running `pnpm install` automatically sets up Husky hooks via the `prepare` script
- [ ] The `.husky/` directory is created with `pre-commit` and `commit-msg` hook files
- [ ] Hook files are executable and run without errors (placeholder content initially)
- [ ] Fresh clone followed by `pnpm install` results in working git hooks
- [ ] Developers can bypass hooks with `git commit --no-verify` for emergencies

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `.husky/pre-commit` | Pre-commit hook (placeholder for lint-staged in S4) |
| `.husky/commit-msg` | Commit message hook (placeholder for commitlint in S5) |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` | Add husky dev dependency, ensure `prepare` script includes husky |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D husky
```

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `prepare` script | Must run `husky` to install hooks | [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) |
| Hook file format | Use Husky 9.x format (plain shell scripts) | [Husky Docs](https://typicode.github.io/husky/) |
| Hook permissions | Must be executable (chmod +x) | Git requirement |

## Test Requirements

### Manual Verification
- [ ] **Fresh Install**: Clone repo, run `pnpm install`, verify `.husky/` hooks exist and are executable
- [ ] **Hook Execution**: Modify a file, run `git commit`, verify pre-commit hook executes
- [ ] **Bypass**: Run `git commit --no-verify -m "test"`, verify commit succeeds

### Verification Commands
```bash
# Verify husky is installed
pnpm list husky

# Verify hooks are executable
test -x .husky/pre-commit && echo "pre-commit OK"
test -x .husky/commit-msg && echo "commit-msg OK"

# Test hook execution
sh .husky/pre-commit
```

## Implementation Notes

### Key Concepts
- **prepare script**: npm lifecycle script that runs after `install`
- **Husky 9.x**: Uses plain shell scripts (no `husky.sh` sourcing needed)

### Troubleshooting

**Issue**: Hooks not running after `pnpm install`
- **Solution**: Run `pnpm exec husky` manually, verify prepare script

**Issue**: Permission denied when running hooks
- **Solution**: Run `chmod +x .husky/pre-commit .husky/commit-msg`

## Estimated Effort
**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) - Hook patterns and bypass policy

### Story-Specific Decisions
None - all hook-related decisions covered by TAD.

## Out of Scope

- **lint-staged Configuration** - Deferred to [S4](./S4-lint-staged.md)
- **Commitlint Setup** - Deferred to [S5](./S5-commitlint.md)
- **Pre-push Hooks** - Not required for Phase 1A

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: Configure pnpm and npmrc - Requires `prepare` script pattern established

### Enables (Unblocks These Stories)
- **S4**: lint-staged Configuration - Requires `pre-commit` hook
- **S5**: Commitlint - Requires `commit-msg` hook

## References

### Epic & TAD References
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates)

### External Documentation
- [Husky Documentation](https://typicode.github.io/husky/)
- [Husky 9 Getting Started](https://typicode.github.io/husky/get-started.html)

## Verification Checklist

### Pre-Verification
- [ ] S1 (pnpm Configuration) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Husky version matches canonical-versions.md
- [ ] Hooks are executable
- [ ] Fresh clone + install results in working hooks

### Git Hygiene
- [ ] Conventional commit message used
- [ ] `.husky/` directory committed

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
