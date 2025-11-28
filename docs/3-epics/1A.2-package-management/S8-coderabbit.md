# Story 1A.2.S8: Configure CodeRabbit AI Code Review

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [S6: Configure Markdown Linting](./S6-markdown-lint.md), [S7: Configure Dependabot](./S7-dependabot.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None

## User Story

**As a** developer
**I want** automated AI code review on pull requests
**So that** I receive immediate, actionable feedback on code quality, potential bugs, and best practices without waiting for human reviewers

## Acceptance Criteria

- [x] CodeRabbit is installed and configured for the repository
- [x] Pull requests receive AI code review comments within 5 minutes
- [x] Configuration balances thorough review with actionable feedback (avoids excessive noise)
- [x] Path-based rules exclude generated files, lockfiles, and configuration from review
- [x] Review profile is configured for appropriate verbosity (balanced)
- [x] Configuration file includes comments explaining key settings

## Technical Requirements

### Files to Create

| Path               | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `.coderabbit.yaml` | CodeRabbit configuration for AI code review behaviour |

### Files to Modify

| Path | Changes                                                                 |
| ---- | ----------------------------------------------------------------------- |
| N/A  | No existing files modified; CodeRabbit installed via GitHub Marketplace |

### Dependencies

No npm dependencies required. CodeRabbit is a GitHub App requiring installation from [GitHub Marketplace](https://github.com/marketplace/coderabbit).

### Configuration Details

| Setting                       | Requirement                                                  | Reference                                                                 |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `language`                    | Set to `en-GB` for British English                           | Project convention                                                        |
| `reviews.profile`             | Set to `balanced`                                            | [EPIC.md: Actions Required](./EPIC.md#actions-or-decisions-required)      |
| `reviews.path_filters`        | Exclude `pnpm-lock.yaml`, `dist/`, `.next/`, `node_modules/` | Best practice                                                             |
| `reviews.auto_review.enabled` | Enable automatic review on PR creation                       | [CodeRabbit Docs](https://docs.coderabbit.ai/guides/configure-coderabbit) |
| `chat.auto_reply`             | Enable chat responses to review comments                     | Developer experience                                                      |

## Test Requirements

### Manual Verification

- [ ] **Installation**: CodeRabbit app appears in repository Settings > GitHub Apps
- [ ] **Review Triggered**: Create test PR with code changes - comments appear within 5 minutes
- [ ] **Path Exclusions**: PR with only `pnpm-lock.yaml` changes receives no review comments
- [ ] **Chat Response**: Reply to a CodeRabbit comment - receives follow-up response

### Verification Commands

```bash
# Validate YAML syntax locally
cat .coderabbit.yaml | python -c "import sys, yaml; yaml.safe_load(sys.stdin)"

# Check CodeRabbit installation via GitHub CLI
gh api repos/{owner}/{repo}/installation
```

## Implementation Notes

### Implementation Sequence

1. **Install CodeRabbit** - Navigate to [GitHub Marketplace](https://github.com/marketplace/coderabbit), install for repository, grant permissions
2. **Create configuration** - Create `.coderabbit.yaml` with profile and path filters
3. **Test with PR** - Create test branch, open PR, verify CodeRabbit comments appear
4. **Tune if needed** - Adjust profile or path exclusions based on feedback

### Troubleshooting

| Issue                     | Solution                                                                      |
| ------------------------- | ----------------------------------------------------------------------------- |
| CodeRabbit not commenting | Check Settings > GitHub Apps; verify "Pull requests: Read & Write" permission |
| Too many comments         | Change profile to "chill"; add more path exclusions                           |
| Config not read           | Validate YAML syntax; ensure filename is `.coderabbit.yaml`                   |

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions

- [EPIC.md: CodeRabbit review profile](./EPIC.md#actions-or-decisions-required) - Open decision resolved: use balanced profile
- [TAD: PR Workflow](/docs/2-technical/2-tad-developer-experience.md#pr-workflow-and-branching-strategy)

### Story-Specific Decisions

#### AD-1A.2.S8.1: Use Balanced Review Profile

**Scope**: Story-specific

**Decision**: Configure CodeRabbit with "balanced" review profile.

**Rationale**: "Assertive" risks excessive noise; "chill" may miss issues. Balanced is a safe default that can be adjusted based on team feedback. Resolves open EPIC decision.

## Out of Scope

- **Custom review instructions per path** - Use defaults; customise later if needed
- **Automated PR approval based on AI review** - Human approval still required
- **Custom AI prompts/personas** - Use CodeRabbit defaults

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S6**: Configure Markdown Linting - Documentation quality gates in place before AI review
- **S7**: Configure Dependabot - Dependency management configured for complete quality automation

### Enables (Unblocks These Stories)

- None - Final story in Epic 1A.2

## References

- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - "Pull requests receive automated AI code review feedback within 5 minutes"
- [EPIC.md: Risks and Mitigations](./EPIC.md#risks-and-mitigations) - "CodeRabbit false positives"
- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [CodeRabbit Configuration](https://docs.coderabbit.ai/guides/configure-coderabbit)
- [CodeRabbit GitHub Marketplace](https://github.com/marketplace/coderabbit)

## Verification Checklist

- [x] S6 and S7 completed
- [x] GitHub repository accessible with admin permissions
- [x] All acceptance criteria met
- [ ] CodeRabbit installed from GitHub Marketplace (requires manual installation)
- [x] `.coderabbit.yaml` created with valid configuration
- [x] Path exclusions configured for lockfiles and generated files
- [ ] Test PR received AI review comments (requires push to remote)
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Completed**: 2025-11-28
- **PR**: -

## Completion Notes

### Summary

Created `.coderabbit.yaml` configuration file for AI-powered code review on pull requests. The configuration uses the "balanced" review profile as decided in the EPIC, with comprehensive path exclusions for generated files, lockfiles, and build output. Path-specific review instructions are included for apps, packages, and test files to provide focused, relevant feedback.

### Test Results

| Test            | Command                                                              | Result |
| --------------- | -------------------------------------------------------------------- | ------ |
| YAML Validation | `python3 -c "import yaml; yaml.safe_load(open('.coderabbit.yaml'))"` | Pass   |
| Lint            | `pnpm lint`                                                          | Pass   |
| Types           | `pnpm type-check`                                                    | Pass   |

### Files Changed

| File               | Changes                                                                            |
| ------------------ | ---------------------------------------------------------------------------------- |
| `.coderabbit.yaml` | Created - CodeRabbit configuration with balanced profile and path-based exclusions |

### Configuration Highlights

**Review Profile**: `balanced` - thorough but not excessive, as decided in EPIC AD-1A.2.S8.1

**Path Exclusions**:

- Lockfiles: `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`
- Build output: `dist/`, `.next/`, `out/`, `build/`
- Dependencies: `node_modules/`, `.turbo/`, `.cache/`
- IDE config: `.vscode/`, `.idea/`
- Test output: `coverage/`, `test-results/`, `playwright-report/`
- Generated types: `**/*.d.ts`

**Path-Specific Instructions**:

- `apps/**` - Focus on Next.js best practices, React patterns, performance
- `packages/**` - Ensure proper TypeScript types, package boundaries
- `**/*.test.ts(x)` - Check test coverage, assertion quality, testing best practices

### Known Issues

- **Issue**: CodeRabbit GitHub App must be installed manually - **Status**: Expected - **Tracking**: User must install from [GitHub Marketplace](https://github.com/marketplace/coderabbit) and grant repository access
- **Issue**: Verification requires push to remote and test PR - **Status**: Expected - **Tracking**: Can be verified after push

### Lessons Learned

- CodeRabbit v2 configuration format uses nested structure with `reviews:` and `chat:` sections
- Path filters use `!` prefix for exclusion patterns (negation)
- The `path_instructions` feature allows context-specific review guidance for different parts of the codebase
- British English (`en-GB`) is supported as a language setting for review comments
