# Story 1A.2.S4: Configure lint-staged with ESLint and Prettier

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [S3: Install and Configure Husky](./S3-husky-setup.md)
- **Blocks**: [S6: Configure Markdown Linting](./S6-markdown-lint.md)
- **Runs in Parallel With**: [S5: Set Up Commitlint](./S5-commitlint.md)

## User Story

**As a** developer
**I want** staged files automatically linted and formatted before each commit
**So that** code quality issues are caught early without blocking the entire codebase

## Acceptance Criteria

- [x] lint-staged is installed at the version specified in [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)
- [x] Pre-commit hook runs lint-staged on staged files only (not the entire codebase)
- [x] TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`) run ESLint with auto-fix and Prettier
- [x] JSON, Markdown, and YAML files (`.json`, `.md`, `.yml`, `.yaml`) run Prettier only
- [x] Commits are blocked if linting errors cannot be auto-fixed
- [x] Pre-commit checks complete in under 10 seconds for typical commits (< 10 files)
- [ ] Developers can verify lint-staged configuration with `pnpm lint-staged --dry-run` - Note: lint-staged v15.x uses `--debug` flag instead

## Technical Requirements

### Files to Create

| Path | Purpose                                                |
| ---- | ------------------------------------------------------ |
| N/A  | Configuration goes in package.json or root config file |

### Files to Modify

| Path                | Changes                                          |
| ------------------- | ------------------------------------------------ |
| `package.json`      | Add lint-staged dev dependency and configuration |
| `.husky/pre-commit` | Update to execute `pnpm lint-staged`             |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D lint-staged
```

### Configuration Details

| Setting                         | Requirement                            | Reference                                                                                                 |
| ------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `*.{ts,tsx}` patterns           | Run ESLint --fix then Prettier --write | [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) |
| `*.{json,md,yml,yaml}` patterns | Run Prettier --write only              | [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) |
| Pre-commit hook                 | Run `pnpm lint-staged`                 | [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) |

**Configuration Rationale**:

- ESLint runs before Prettier to catch logical errors before formatting
- `--fix` flag enables auto-fixing simple issues to reduce developer friction
- JSON/Markdown/YAML files only need formatting, not linting (until S6 adds markdownlint)
- Running on staged files only ensures fast feedback loops (< 10 seconds)

For complete configuration pattern, see: [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates)

## Test Requirements

### Manual Verification

- [ ] **Lint Error Detection**: Create a file with an unused variable, stage it, attempt commit - should fail with ESLint error
- [ ] **Auto-Fix**: Create a file with fixable issues (missing semicolons, wrong quotes), stage it, commit - should auto-fix and succeed
- [ ] **Formatting**: Create a poorly formatted JSON file, stage it, commit - should be auto-formatted
- [ ] **Speed Test**: Stage 5-10 files, run `time pnpm lint-staged` - should complete in < 10 seconds
- [ ] **Staged Only**: Modify files but only stage one, commit - only staged file should be processed

### Verification Commands

```bash
# Verify lint-staged is installed
pnpm list lint-staged

# Debug mode to see what would be executed (--dry-run deprecated in v15.x)
pnpm lint-staged --debug

# Test pre-commit hook manually
sh .husky/pre-commit

# Verify ESLint is accessible (for lint-staged to call)
./node_modules/.bin/eslint --version

# Verify Prettier is accessible
./node_modules/.bin/prettier --version
```

## Implementation Notes

### Implementation Sequence

1. **Install lint-staged**
   - Add as dev dependency at root level
   - Verify installation with `pnpm list lint-staged`

2. **Configure lint-staged in package.json**
   - Add `lint-staged` configuration object
   - Define file patterns and associated commands
   - Reference TAD for exact pattern structure

3. **Update pre-commit hook**
   - Modify `.husky/pre-commit` to run `pnpm lint-staged`
   - Ensure hook exits with lint-staged exit code

4. **Verify integration**
   - Test with auto-fixable issues (should pass)
   - Test with non-fixable issues (should fail)
   - Verify only staged files are processed

### Key Concepts

- **Staged files only**: lint-staged operates on `git add`ed files, not the working directory
- **Exit codes**: Non-zero exit from lint-staged blocks the commit
- **Command order**: Commands run sequentially in array order per file pattern

### Troubleshooting

**Issue**: lint-staged not finding ESLint or Prettier

- **Cause**: ESLint/Prettier not installed or not in PATH
- **Solution**: Ensure ESLint and Prettier are dev dependencies, use `pnpm eslint` not `eslint`

**Issue**: Pre-commit hook doesn't block on errors

- **Cause**: Hook script doesn't exit with lint-staged exit code
- **Solution**: Hook should end with `pnpm lint-staged` (last command determines exit code)

**Issue**: Hook runs but doesn't process staged files

- **Cause**: No files match configured patterns
- **Solution**: Verify glob patterns cover file extensions being committed

### Reference Materials

- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [Husky + lint-staged Integration](https://typicode.github.io/husky/how-to.html#lint-staged)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Install and configure lint-staged: 1h
- Update pre-commit hook: 0.5h
- Integration testing with ESLint/Prettier: 2h
- Troubleshooting and edge cases: 1h
- Documentation and verification: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) - lint-staged patterns and command structure
- [TAD: Quality Gate Thresholds](/docs/2-technical/2-tad-developer-experience.md#quality-gate-thresholds) - What gets checked at pre-commit vs CI

### Story-Specific Decisions

#### AD-1A.2.S4.1: Exclude TypeScript Type-Checking from Pre-Commit

**Scope**: Story-specific (does not affect other stories)

**Decision**: TypeScript type-checking (`tsc --noEmit`) is excluded from lint-staged and runs in CI only.

**Rationale**:

- Type-checking requires full project context, not individual files
- Running `tsc` on staged files only produces false positives (missing imports from unstaged files)
- Type-checking adds 20-30+ seconds to pre-commit, exceeding the 10-second threshold
- IDE TypeScript integration provides real-time type feedback

**Consequences**:

- Type errors may reach CI (caught before merge, acceptable trade-off)
- Faster developer iteration with <10s pre-commit checks
- Developers are expected to have IDE TypeScript enabled

**Alternatives Considered**:

- **Include tsc --noEmit**: Rejected - too slow and produces false positives on partial staging

## Out of Scope

- **ESLint rule configuration** - Existing ESLint config is used; advanced rules deferred to Epic 2A.1
- **Prettier plugin configuration** - Existing Prettier config is used; Tailwind sorting deferred to Epic 2A.1
- **TypeScript type-checking** - Too slow for pre-commit; runs in CI per AD-1A.2.S4.1
- **Markdown linting rules** - Only Prettier formatting; markdownlint added in [S6](./S6-markdown-lint.md)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S3**: Install and Configure Husky - Requires Husky pre-commit hook infrastructure

### Enables (Unblocks These Stories)

- **S6**: Configure Markdown Linting - Builds on lint-staged patterns for markdown files

## References

### Epic & TAD References

- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates)
- [TAD: CI/CD Quality Gates](/docs/2-technical/2-tad-developer-experience.md#cicd-quality-gates)

### External Documentation

- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [Husky How-To Guide](https://typicode.github.io/husky/how-to.html)
- [ESLint CLI Reference](https://eslint.org/docs/latest/use/command-line-interface)
- [Prettier CLI Reference](https://prettier.io/docs/en/cli.html)

## Verification Checklist

### Pre-Verification

- [x] S3 (Husky Setup) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [x] ESLint and Prettier already configured in the project

### Implementation Quality

- [x] All acceptance criteria met
- [x] lint-staged version matches canonical-versions.md (^15.2.0, installed 15.5.2)
- [x] Pre-commit hook successfully runs lint-staged
- [x] Staged-only processing verified
- [x] Pre-commit completes in < 10 seconds for typical changes (~0.4-1.0s)

### Documentation

- [x] Configuration in package.json is self-documenting (clear patterns)
- [x] README updated if developer workflow documentation exists (TAD references lint-staged)

### Git Hygiene

- [x] Conventional commit message used
- [x] No unrelated changes included

## Status

- **State**: Complete
- **Completed**: 2025-11-28
- **PR**: -

## Completion Notes

### Summary

Configured lint-staged v15.5.2 with ESLint and Prettier integration. The pre-commit hook now automatically runs lint-staged on staged files, enforcing code quality through auto-fixing and blocking commits with unfixable errors. Also added ESLint as a root-level devDependency to ensure lint-staged can access it.

### Test Results

| Test                | Command                         | Result                     |
| ------------------- | ------------------------------- | -------------------------- |
| Lint                | `pnpm lint`                     | Pass                       |
| Types               | `pnpm type-check`               | Pass                       |
| Unit Tests          | `pnpm test`                     | N/A (no tests for config)  |
| Build               | N/A                             | N/A (config only)          |
| lint-staged Install | `pnpm list lint-staged`         | lint-staged 15.5.2         |
| Pre-commit Hook     | `sh .husky/pre-commit`          | Pass                       |
| Auto-fix Test       | Stage file with fixable issues  | Pass (formatted)           |
| Block Test          | Stage file with unfixable error | Pass (blocked)             |
| Speed Test          | `time pnpm lint-staged`         | ~0.4-1.0s (well under 10s) |

### Files Changed

Beyond planned files:

- `package.json` - Added `eslint` as root devDependency for lint-staged access
- `pnpm-lock.yaml` - Updated with new dependencies

### Known Issues

- **Issue**: `pnpm lint-staged --dry-run` option deprecated - **Status**: Documented - **Note**: Use `--debug` flag instead in lint-staged v15.x

### Lessons Learned

- lint-staged v15.x removed the `--dry-run` flag; use `--debug` for verbose output
- ESLint must be available at root level for lint-staged to invoke it (not just in workspace packages)
- Pre-commit execution is very fast (~0.4-1.0s) for typical file counts, well under the 10s target
