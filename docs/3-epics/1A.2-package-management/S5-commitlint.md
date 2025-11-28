# Story 1A.2.S5: Set Up Commitlint for Conventional Commits

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [S1: Configure pnpm and npmrc](./S1-pnpm-config.md), [S3: Install and Configure Husky](./S3-husky-setup.md)
- **Blocks**: [S6: Configure Markdown Linting](./S6-markdown-lint.md)
- **Runs in Parallel With**: [S4: lint-staged Configuration](./S4-lint-staged.md)

## User Story
**As a** developer
**I want** commit messages automatically validated against conventional commit format
**So that** the commit history is consistent and can be used for automated changelog generation

## Acceptance Criteria
- [ ] Commitlint is installed at the version specified in [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)
- [ ] Commits following [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) format are accepted
- [ ] Commits not following conventional format are rejected with helpful error messages
- [ ] The `commit-msg` Husky hook runs commitlint on every commit
- [ ] Standard types (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`) are supported
- [ ] Scopes are optional but encouraged (e.g., `feat(auth):`, `fix(api):`)
- [ ] Breaking changes are supported via `!` suffix or `BREAKING CHANGE:` footer
- [ ] Developers can bypass with `git commit --no-verify` for emergencies

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `commitlint.config.js` | Commitlint configuration using conventional preset |

### Files to Modify
| Path | Changes |
|------|---------|
| `.husky/commit-msg` | Update to run commitlint on commit message |
| `package.json` | Add commitlint dev dependencies |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `extends` | Use `@commitlint/config-conventional` preset | [Commitlint Config](https://commitlint.js.org/reference/configuration.html) |
| Commit types | Support all conventional types | [Conventional Commits](https://www.conventionalcommits.org/) |
| Scope | Optional, no restrictions | [TAD: Commit Message Format](/docs/2-technical/2-tad-developer-experience.md#commit-message-format) |

**Configuration Rationale**: The `@commitlint/config-conventional` preset enforces the Conventional Commits specification without custom configuration, ensuring compatibility with semantic versioning tools and changelog generators.

## Test Requirements

### Manual Verification
- [ ] **Valid Commit**: Run `git commit -m "feat: add new feature"` - commit succeeds
- [ ] **Valid Scoped Commit**: Run `git commit -m "fix(auth): resolve login error"` - commit succeeds
- [ ] **Invalid Commit**: Run `git commit -m "added stuff"` - commit rejected with error
- [ ] **Breaking Change**: Run `git commit -m "feat!: breaking API change"` - commit succeeds
- [ ] **Bypass**: Run `git commit --no-verify -m "WIP"` - commit succeeds

### Verification Commands
```bash
# Verify commitlint is installed
pnpm list @commitlint/cli

# Test commitlint directly
echo "feat: valid message" | pnpm exec commitlint

# Test invalid message
echo "invalid message" | pnpm exec commitlint
# Should fail with error

# Verify hook runs commitlint
cat .husky/commit-msg
```

## Implementation Notes

### Key Concepts
- **Conventional Commits**: Structured commit format (`type(scope): subject`)
- **commitlint**: Linter for commit messages, runs via git hook
- **Preset**: `@commitlint/config-conventional` provides sensible defaults

### Common Patterns

Reference the TAD for implementation patterns:
- [TAD: Commit Message Format](/docs/2-technical/2-tad-developer-experience.md#commit-message-format)

Key pattern notes:
- Use the conventional preset without modification initially
- Custom scopes and types can be added later if needed

### Troubleshooting

**Issue**: Commitlint not running on commit
- **Cause**: Husky hook not properly configured
- **Solution**: Verify `.husky/commit-msg` contains `pnpm exec commitlint --edit $1`

**Issue**: Error "Config file not found"
- **Cause**: Missing `commitlint.config.js` in root
- **Solution**: Create config file with `module.exports = { extends: ['@commitlint/config-conventional'] };`

**Issue**: "subject may not be empty" error
- **Cause**: Commit message missing subject after type/scope
- **Solution**: Ensure message follows format `type(scope): subject`

### Reference Materials
- [Commitlint Documentation](https://commitlint.js.org/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [commitlint config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)

## Estimated Effort
**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [TAD: Commit Message Format](/docs/2-technical/2-tad-developer-experience.md#commit-message-format) - Standard commit types and format
- [EPIC.md: Actions or Decisions Required](./EPIC.md#actions-or-decisions-required) - Resolved: Use conventional preset

### Story-Specific Decisions
None - using standard `@commitlint/config-conventional` preset as resolved in Epic.

## Out of Scope

- **Custom commit types** - Use standard conventional types; custom types deferred if needed
- **Scope enforcement** - Scopes remain optional per conventional commit spec
- **Changelog generation** - Deferred to Epic 1A.5 (CI/CD Pipeline)
- **Semantic release integration** - Requires CI pipeline first
- **GitHub PR title validation** - Separate from local commit validation

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: Configure pnpm and npmrc - Provides package management setup
- **S3**: Install and Configure Husky - Provides `commit-msg` hook

### Enables (Unblocks These Stories)
- **S6**: Configure Markdown Linting - Requires quality gate infrastructure complete

## References

### Epic & TAD References
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates)

### ADR References
- N/A - Commitlint decision documented in Epic

### External Documentation
- [Commitlint Documentation](https://commitlint.js.org/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/)
- [commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)

## Verification Checklist

### Pre-Verification
- [ ] S1 (pnpm Configuration) completed
- [ ] S3 (Husky Setup) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Commitlint version matches canonical-versions.md
- [ ] Valid conventional commits accepted
- [ ] Invalid commits rejected with helpful messages
- [ ] Breaking change syntax works

### Documentation
- [ ] Config file includes comment explaining preset choice

### Git Hygiene
- [ ] Conventional commit message used for this story
- [ ] No unrelated changes included

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
