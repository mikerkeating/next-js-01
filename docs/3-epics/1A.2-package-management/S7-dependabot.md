# Story 1A.2.S7: Configure Dependabot for Automated Updates

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [S1: Configure pnpm and npmrc](./S1-pnpm-config.md)
- **Blocks**: [S8: Configure CodeRabbit AI Code Review](./S8-coderabbit.md)
- **Runs in Parallel With**: [S2: Environment Validation](./S2-env-validation.md), [S3: Husky Setup](./S3-husky-setup.md), [S4: lint-staged](./S4-lint-staged.md), [S5: Commitlint](./S5-commitlint.md), [S6: Markdown Linting](./S6-markdown-lint.md)

## User Story

**As a** developer
**I want** automated pull requests for dependency updates created by Dependabot
**So that** dependencies stay current with security patches and new features without manual effort

## Acceptance Criteria

- [ ] Dependabot is configured for npm ecosystem at repository level
- [ ] Dependabot is configured for GitHub Actions updates
- [ ] Updates are scheduled weekly to reduce PR noise
- [ ] Related dependencies are grouped (e.g., all ESLint packages together)
- [ ] Security updates are prioritised and processed immediately
- [ ] Commit messages follow conventional commit format
- [ ] Pull request titles follow a consistent pattern for easy identification
- [ ] Configuration includes appropriate labels for automated PRs

## Technical Requirements

### Files to Create

| Path                     | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `.github/dependabot.yml` | Dependabot configuration for npm and GitHub Actions ecosystems |

### Files to Modify

| Path | Changes                    |
| ---- | -------------------------- |
| N/A  | No existing files modified |

### Dependencies

No npm dependencies required. Dependabot is a GitHub-native feature that requires only configuration.

### Configuration Details

| Setting                             | Requirement                                                                         | Reference                                                                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `package-ecosystem: npm`            | Enable npm dependency updates                                                       | [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) |
| `package-ecosystem: github-actions` | Enable GitHub Actions updates                                                       | [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) |
| `schedule.interval: weekly`         | Weekly update schedule per [EPIC decision](./EPIC.md#actions-or-decisions-required) | Project convention                                                                                                                                           |
| `groups`                            | Group related dependencies to reduce PR count                                       | [EPIC: Risks and Mitigations](./EPIC.md#risks-and-mitigations)                                                                                               |
| `commit-message.prefix`             | Use `chore(deps):` for conventional commits                                         | [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)                                                                                 |
| `labels`                            | Add `dependencies` label for filtering                                              | Project convention                                                                                                                                           |
| `target-branch`                     | Target `development` branch for PRs                                                 | [TAD: Branching Model](/docs/2-technical/2-tad-developer-experience.md#branching-model)                                                                      |

**Configuration Rationale**:

- Weekly schedule balances staying current with manageable PR volume
- Grouping reduces the number of PRs by combining related updates (e.g., all `@types/*` packages)
- Conventional commit prefix ensures changelog generation works with dependency updates
- Targeting `development` branch aligns with branching strategy (not direct to `main`)

## Test Requirements

### Manual Verification

- [ ] **Configuration Syntax**: Push `.github/dependabot.yml` - no syntax errors reported by GitHub
- [ ] **Ecosystem Detection**: Check GitHub repository Settings > Code security > Dependabot - both ecosystems shown as enabled
- [ ] **Initial Scan**: Within 24 hours, Dependabot creates PRs for any outdated dependencies
- [ ] **PR Format**: Verify created PRs have correct labels, title format, and commit message prefix
- [ ] **Security Alerts**: Enable a known vulnerable package (test only) - verify security update PR created promptly

### Verification Commands

```bash
# Validate YAML syntax locally
pnpm exec yaml-lint .github/dependabot.yml

# Or use any YAML validator
cat .github/dependabot.yml | python -c "import sys, yaml; yaml.safe_load(sys.stdin)"

# Check GitHub CLI for Dependabot status (requires gh cli)
gh api repos/{owner}/{repo}/vulnerability-alerts

# List Dependabot PRs
gh pr list --label dependencies
```

## Implementation Notes

### Implementation Sequence

1. **Create configuration file**
   - Create `.github/dependabot.yml` with both ecosystem configurations
   - Configure weekly schedule and grouping

2. **Configure npm ecosystem**
   - Set directory to `/` (root of monorepo)
   - Define groups for common dependency categories
   - Set commit message prefix for conventional commits

3. **Configure GitHub Actions ecosystem**
   - Set directory to `/`
   - Weekly schedule for action updates
   - Group all actions together

4. **Verify configuration**
   - Push to repository
   - Check GitHub Settings > Code security > Dependabot
   - Wait for initial Dependabot scan (can take up to 24h)

### Key Concepts

- **Package Ecosystem**: Dependabot supports multiple ecosystems; this story configures `npm` and `github-actions`
- **Groups**: Combine related packages into single PRs to reduce noise
- **Security Updates**: Handled separately from version updates; prioritised automatically
- **Schedule**: Controls when Dependabot checks for updates (not when PRs are created)

### Common Dependency Groups

Recommended groupings for a typical Next.js monorepo:

| Group Name   | Pattern                                                   | Description                     |
| ------------ | --------------------------------------------------------- | ------------------------------- |
| `typescript` | `typescript`, `@types/*`                                  | TypeScript and type definitions |
| `testing`    | `vitest`, `@vitest/*`, `playwright`, `@testing-library/*` | Testing tools                   |
| `linting`    | `eslint`, `eslint-*`, `@eslint/*`, `prettier`             | Linting and formatting          |
| `react`      | `react`, `react-dom`, `@types/react*`                     | React ecosystem                 |
| `nextjs`     | `next`, `@next/*`                                         | Next.js framework               |

### Troubleshooting

**Issue**: Dependabot not creating PRs after configuration push

- **Cause**: GitHub needs time to process configuration (up to 24h initial scan)
- **Solution**: Check Settings > Code security > Dependabot for status; verify YAML syntax

**Issue**: Too many PRs despite grouping

- **Cause**: Groups not matching actual package names; new ungrouped dependencies
- **Solution**: Review group patterns; add `*` wildcard patterns for broader matching

**Issue**: PRs targeting wrong branch

- **Cause**: `target-branch` not specified or incorrect
- **Solution**: Explicitly set `target-branch: development` in configuration

**Issue**: Security updates not appearing

- **Cause**: Dependabot security updates are separate from version updates
- **Solution**: Enable "Dependabot alerts" and "Dependabot security updates" in repository settings

### Reference Materials

- [Dependabot Configuration Options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Dependabot Grouping](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#groups)
- [Customising Commit Messages](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#commit-message)

## Estimated Effort

**Size**: S (2-4h)

**Breakdown**:

- Create and configure dependabot.yml: 1h
- Define dependency groups: 0.5h
- Push and verify GitHub detection: 0.5h
- Wait for initial scan and verify PRs: 1h (elapsed time)
- Documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [EPIC.md: Dependabot update schedule](./EPIC.md#actions-or-decisions-required) - Weekly schedule resolved
- [TAD: Branching Model](/docs/2-technical/2-tad-developer-experience.md#branching-model) - PR target branch
- [TAD: Commit Message Format](/docs/2-technical/2-tad-developer-experience.md#commit-message-format-conventional-commits) - Conventional commit prefix

### Story-Specific Decisions

#### AD-1A.2.S7.1: Group Dependencies by Category

**Scope**: Story-specific (does not affect other stories)

**Decision**: Group related dependencies into categories (typescript, testing, linting, react, nextjs) to reduce PR noise.

**Rationale**:

- Reduces number of PRs from potential dozens to a handful
- Related packages often need to be updated together for compatibility
- Easier to review and merge grouped updates
- Aligns with EPIC risk mitigation for "Dependabot PR flood"

**Consequences**:

- Grouped PRs may be larger and take longer to review
- A failing test in one grouped package blocks the entire group update

**Alternatives Considered**:

- **No grouping**: Rejected - would create too many PRs (EPIC identifies this as a risk)
- **Single group for all**: Rejected - too coarse; prefer category-based grouping for easier review

## Out of Scope

- **Auto-merge for patch updates** - Requires CI pipeline for safety checks; deferred to Epic 1A.5 per [EPIC.md](./EPIC.md#out-of-scope)
- **Renovate as alternative** - Decision made to use native Dependabot
- **Custom Dependabot actions/workflows** - Basic configuration only in this story
- **Ignore rules for specific packages** - Add as needed after initial setup
- **Version pinning policies** - Use default behaviour; customise if needed later

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Configure pnpm and npmrc - Stable pnpm configuration required for Dependabot to correctly update lockfile

### Enables (Unblocks These Stories)

- **S8**: Configure CodeRabbit AI Code Review - Requires Dependabot in place for complete quality automation

## References

### Epic & TAD References

- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - "Dependabot creates PRs for outdated dependencies on a weekly schedule"
- [EPIC.md: Risks and Mitigations](./EPIC.md#risks-and-mitigations) - "Dependabot PR flood on initial enable"
- [TAD: Developer Experience](/docs/2-technical/2-tad-developer-experience.md)

### External Documentation

- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Dependabot Security Updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)
- [Dependabot Grouping](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#groups)

## Verification Checklist

### Pre-Verification

- [ ] S1 (pnpm config) completed
- [ ] GitHub repository accessible with admin permissions
- [ ] Dependabot enabled in repository settings (Settings > Code security)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] `.github/dependabot.yml` passes YAML validation
- [ ] Both npm and github-actions ecosystems configured
- [ ] Dependency groups defined for common categories
- [ ] Weekly schedule configured
- [ ] Commit message prefix set to `chore(deps):`
- [ ] Target branch set to `development`

### Documentation

- [ ] Configuration file includes comments explaining key settings
- [ ] Group rationale documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
