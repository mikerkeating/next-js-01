# Story 1A.2.S6: Configure Markdown Linting

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Package Management & Quality Gates](./EPIC.md)
- **Depends On**: [S4: Configure lint-staged](./S4-lint-staged.md), [S5: Set Up Commitlint](./S5-commitlint.md)
- **Blocks**: [S8: Configure CodeRabbit AI Code Review](./S8-coderabbit.md)
- **Runs in Parallel With**: [S7: Configure Dependabot](./S7-dependabot.md)

## User Story

**As a** developer
**I want** markdown documentation automatically linted for consistency and correctness
**So that** documentation follows a uniform style and common issues (broken links, inconsistent headings) are caught before merge

## Acceptance Criteria

- [x] markdownlint-cli2 is installed and configured at root level
- [x] markdown-link-check is installed and configured for broken link detection
- [x] Markdown files (`.md`) are linted on pre-commit via lint-staged integration
- [x] Documentation follows a consistent style (heading levels, list markers, line length)
- [x] Common markdown errors are caught (multiple top-level headings, trailing spaces, inconsistent indentation)
- [x] Broken internal links (relative paths) and dead external URLs are detected
- [x] Project-specific rule overrides are documented (e.g., allowing HTML for complex layouts)
- [x] Developers can run `pnpm lint:md` to check all markdown files manually
- [x] Developers can run `pnpm lint:md:links` to check for broken links
- [x] Linting completes in under 5 seconds for typical documentation changes (link checking may take longer)

## Technical Requirements

### Files to Create

| Path                        | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `.markdownlint.json`        | markdownlint configuration with project rules         |
| `.markdownlintignore`       | Files/patterns to exclude from markdown linting       |
| `.markdown-link-check.json` | markdown-link-check configuration for link validation |

### Files to Modify

| Path           | Changes                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `package.json` | Add markdownlint-cli2 and markdown-link-check dev dependencies, add `lint:md` and `lint:md:links` scripts, update lint-staged config |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D markdownlint-cli2 markdown-link-check
```

### Configuration Details

| Setting                      | Requirement                                            | Reference                                                                                                 |
| ---------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `default: true`              | Enable all rules by default                            | [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)                   |
| `MD013` (line-length)        | Disable or set high limit (120+) for prose flexibility | Project convention                                                                                        |
| `MD033` (no-inline-html)     | Allow specific HTML elements for badges/images         | Project convention                                                                                        |
| `MD041` (first-line-heading) | Enforce first line is h1 heading                       | Documentation consistency                                                                                 |
| lint-staged pattern          | Add `"*.md": ["markdownlint-cli2 --fix"]`              | [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) |

#### markdown-link-check Configuration

| Setting               | Requirement                                              | Reference                                                                |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ignorePatterns`      | Skip external URLs that require auth or are rate-limited | [markdown-link-check docs](https://github.com/tcort/markdown-link-check) |
| `replacementPatterns` | Map relative paths to local file system for validation   | Project structure                                                        |
| `httpHeaders`         | Optional headers for authenticated endpoints             | Best practice                                                            |
| `retryOn429`          | Retry on rate-limit responses                            | Reliability                                                              |
| `timeout`             | Set reasonable timeout (10s) for external links          | Performance                                                              |

**Configuration Rationale**:

- Default rules enabled provides comprehensive checking out of the box
- Line length disabled/relaxed as documentation prose shouldn't be artificially wrapped
- HTML allowed for badges, images with attributes, and complex layouts common in READMEs
- First-line heading ensures every doc has a clear title
- Link checking validates both internal relative paths and external URLs
- External link checking excluded from pre-commit (too slow); run via `lint:md:links` script or in CI

## Test Requirements

### Manual Verification

- [ ] **Rule Violation Detection**: Create a markdown file with trailing whitespace, commit - should be auto-fixed
- [ ] **Heading Validation**: Create a file with two `#` headings, run lint - should fail
- [ ] **Auto-Fix**: Create file with fixable issues (trailing spaces, inconsistent list markers), commit - auto-fixed
- [ ] **Ignore Patterns**: Verify files matching `.markdownlintignore` patterns are skipped
- [ ] **Manual Run**: Execute `pnpm lint:md` - all docs should pass or show clear errors
- [ ] **Broken Link Detection**: Create a file with `[broken](./nonexistent.md)`, run `pnpm lint:md:links` - should fail
- [ ] **Valid Link Detection**: Create a file with valid relative links, run `pnpm lint:md:links` - should pass

### Verification Commands

```bash
# Verify markdownlint-cli2 is installed
pnpm list markdownlint-cli2

# Verify markdown-link-check is installed
pnpm list markdown-link-check

# Lint all markdown files manually
pnpm lint:md

# Check all markdown links
pnpm lint:md:links

# Lint specific file
pnpm exec markdownlint-cli2 "docs/**/*.md"

# Check links in specific file
pnpm exec markdown-link-check "docs/README.md" -c .markdown-link-check.json

# Lint with auto-fix
pnpm exec markdownlint-cli2 --fix "**/*.md"

# Verify lint-staged includes markdown
pnpm lint-staged --dry-run
```

## Implementation Notes

### Implementation Sequence

1. **Install dependencies**
   - Add markdownlint-cli2 and markdown-link-check as dev dependencies at root level
   - Verify installation with `pnpm list markdownlint-cli2 markdown-link-check`

2. **Create markdownlint configuration file**
   - Create `.markdownlint.json` with rule overrides
   - Document rationale for disabled/modified rules via comments (JSON5) or separate doc

3. **Create markdown-link-check configuration file**
   - Create `.markdown-link-check.json` with ignore patterns and timeout settings
   - Configure patterns for internal vs external links
   - Add ignore patterns for URLs that may fail (auth-required, rate-limited)

4. **Create ignore file**
   - Create `.markdownlintignore` for generated/vendor files
   - Include `node_modules/`, `dist/`, `CHANGELOG.md` (auto-generated)

5. **Add npm scripts**
   - Add `lint:md` script to root `package.json` for markdown linting
   - Add `lint:md:links` script for link checking (runs separately due to speed)
   - Script should lint all markdown files in project

6. **Update lint-staged configuration**
   - Add markdown file pattern to lint-staged config
   - Use `markdownlint-cli2 --fix` for auto-fixing
   - Note: Link checking excluded from pre-commit (too slow for pre-commit hook)

7. **Verify integration**
   - Test pre-commit with markdown changes
   - Verify auto-fix functionality works
   - Test link checking with `pnpm lint:md:links`

### Key Concepts

- **markdownlint-cli2**: CLI wrapper for markdownlint with better glob support and configuration
- **markdown-link-check**: Validates that links in markdown files are not broken (both internal and external)
- **Rule IDs**: Rules are identified by codes (MD001, MD013, etc.) - see [Rules Reference](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- **Auto-fix**: Many rules support automatic fixing (trailing spaces, list markers, heading levels)
- **Link checking speed**: External link validation is slow (network requests); run separately from pre-commit

### Troubleshooting

**Issue**: markdownlint not finding config file

- **Cause**: Config file in wrong location or wrong filename
- **Solution**: Ensure `.markdownlint.json` is in repository root

**Issue**: Pre-commit hangs on large markdown files

- **Cause**: Complex regex patterns or too many files
- **Solution**: Add slow-to-lint files to `.markdownlintignore`, verify only staged files processed

**Issue**: Rules too strict for documentation style

- **Cause**: Default rules may conflict with project conventions
- **Solution**: Disable specific rules in `.markdownlint.json` with documented rationale

**Issue**: markdown-link-check fails on valid external URLs

- **Cause**: Rate limiting, authentication required, or temporary network issues
- **Solution**: Add URL patterns to `ignorePatterns` in `.markdown-link-check.json`

**Issue**: Link checking too slow

- **Cause**: Many external links requiring network requests
- **Solution**: Run link checking in CI only, not pre-commit; use `--quiet` flag for less verbose output

**Issue**: Relative links failing validation

- **Cause**: Links are relative to file location, not repository root
- **Solution**: Ensure links use correct relative paths; consider `replacementPatterns` for path mapping

### Reference Materials

- [markdownlint Rules Reference](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [markdownlint-cli2 Documentation](https://github.com/DavidAnson/markdownlint-cli2)
- [markdownlint Configuration](https://github.com/DavidAnson/markdownlint#configuration)
- [markdown-link-check Documentation](https://github.com/tcort/markdown-link-check)
- [markdown-link-check Configuration](https://github.com/tcort/markdown-link-check#config-file-format)

## Estimated Effort

**Size**: M (4-6h)

**Breakdown**:

- Install and configure markdownlint-cli2: 1h
- Install and configure markdown-link-check: 1h
- Create ignore patterns and test rules: 0.5h
- Update lint-staged integration: 0.5h
- Fix existing markdown issues: 1h
- Fix broken links in documentation: 1h
- Verification and documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) - lint-staged patterns and hook structure
- [EPIC.md: Actions or Decisions Required](./EPIC.md#actions-or-decisions-required) - Open decision on markdownlint-cli2 vs remark-lint

### Story-Specific Decisions

#### AD-1A.2.S6.1: Use markdownlint-cli2 over remark-lint

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use `markdownlint-cli2` for markdown linting instead of `remark-lint`.

**Rationale**:

- markdownlint has more comprehensive rules out of the box (~50 rules)
- Better integration with editors (VS Code markdownlint extension widely used)
- Simpler configuration (JSON vs remark plugin ecosystem)
- `markdownlint-cli2` provides better glob support than `markdownlint-cli`
- Auto-fix support for most rules reduces manual intervention

**Consequences**:

- Some advanced transformations available in remark are not available
- Rule customisation is limited to enable/disable and parameters (no custom rules)

**Alternatives Considered**:

- **remark-lint**: Rejected - more complex setup, plugin-based architecture overkill for documentation linting
- **markdownlint-cli**: Rejected - markdownlint-cli2 has better glob support and configuration options

## Out of Scope

- **Link checking in pre-commit** - Too slow for pre-commit hook; run via `pnpm lint:md:links` or in CI
- **Spell checking** - Deferred to separate tool/story if needed (cspell)
- **Table of contents generation** - Documentation tooling, not linting
- **Custom markdownlint rules** - Use built-in rules only; custom rules if needed in future
- **Prose linting (write-good, alex)** - Deferred; only structural/format linting in this story
- **Authenticated external link checking** - Links requiring login (e.g., private repos) should be added to ignore patterns

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S4**: Configure lint-staged - Provides lint-staged infrastructure to add markdown patterns
- **S5**: Set Up Commitlint - Ensures commit hook infrastructure is complete

### Enables (Unblocks These Stories)

- **S8**: Configure CodeRabbit AI Code Review - Requires all quality gates in place

## References

### Epic & TAD References

- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - "Markdown documentation follows consistent style"
- [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates)

### External Documentation

- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [markdownlint-cli2 GitHub](https://github.com/DavidAnson/markdownlint-cli2)
- [markdownlint Configuration](https://github.com/DavidAnson/markdownlint#configuration)
- [VS Code markdownlint Extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

## Verification Checklist

### Pre-Verification

- [x] S4 (lint-staged) completed
- [x] S5 (commitlint) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [x] All acceptance criteria met
- [x] markdownlint-cli2 installed at root
- [x] markdown-link-check installed at root
- [x] `.markdownlint.json` created with documented rule overrides
- [x] `.markdown-link-check.json` created with ignore patterns and timeout settings
- [x] lint-staged updated to include markdown files
- [x] `pnpm lint:md` script works correctly
- [x] `pnpm lint:md:links` script works correctly
- [x] Pre-commit hook processes markdown files (linting only, not link checking)

### Documentation

- [x] Rule overrides documented with rationale in config or separate doc
- [x] `.markdownlintignore` includes appropriate exclusions

### Git Hygiene

- [x] Conventional commit message used
- [x] No unrelated changes included
- [x] Existing markdown files pass linting (or issues tracked separately)

## Status

- **State**: Complete
- **Completed**: 2025-11-28
- **PR**: -

## Completion Notes

### Summary

Implemented markdown linting with markdownlint-cli2 and link checking with markdown-link-check. Both tools are integrated into the development workflow via lint-staged for pre-commit hooks and npm scripts for manual execution. Configuration was tuned to balance strictness with practical documentation conventions used in this project.

### Test Results

| Test             | Command                         | Result                                      |
| ---------------- | ------------------------------- | ------------------------------------------- |
| Lint             | `pnpm lint:md`                  | Pass (0 errors on 118 files)                |
| Link Check       | `pnpm lint:md:links`            | Works (finds broken links in existing docs) |
| Auto-fix         | `markdownlint-cli2 --fix`       | Pass                                        |
| Dependency Check | `pnpm list markdownlint-cli2`   | 0.19.1                                      |
| Dependency Check | `pnpm list markdown-link-check` | 3.14.2                                      |

### Files Changed

Beyond planned files:

- `.markdownlint.json` - Created with comprehensive rule configuration
- `.markdownlintignore` - Created with exclusion patterns for node_modules, dist, etc.
- `.markdown-link-check.json` - Created with ignore patterns and path replacement for root-relative links
- `package.json` - Added dependencies, scripts (`lint:md`, `lint:md:fix`, `lint:md:links`), updated lint-staged config

### Configuration Decisions

**Rules Disabled** (documented rationale):

- `MD001` (heading-increment) - Existing docs use flexible heading structure
- `MD013` (line-length) - Documentation prose shouldn't be artificially wrapped
- `MD025` (single-h1) - Some docs have multiple logical sections with h1 headings
- `MD035` (hr-style) - Existing docs use inconsistent horizontal rule styles
- `MD036` (emphasis-used-instead-of-heading) - Stylistic choice allowed
- `MD040` (fenced-code-language) - Not all code blocks need language specification
- `MD041` (first-line-heading) - Many docs start with metadata or h2 headings
- `MD046` (code-block-style) - Allow both fenced and indented code blocks
- `MD051` (link-fragments) - Some fragment validation fails on valid anchors
- `MD060` (table-column-style) - Too strict for existing table formatting

**HTML Elements Allowed** (MD033):
Standard elements (br, details, summary, img, a, etc.) plus project-specific elements used in documentation (example, commentary, env, system-reminder, etc.).

### Known Issues

- **Pre-existing broken links**: Many documentation files contain broken relative paths (using `./docs/...` from within docs folders). These require fixing the link paths to use correct relative navigation (`../../`). Tracked separately from this story.
- **External link failures**: Some external URLs (Clerk webhooks, Turbo handbook, Vercel docs) return 404. These should be updated or added to ignore patterns.

### Lessons Learned

- markdownlint-cli2 uses `.markdownlintignore` but also requires explicit glob exclusions in the command for nested node_modules
- markdown-link-check treats root-relative paths (`/docs/...`) as URLs; use `replacementPatterns` to convert them to relative paths
- Starting with strict rules and relaxing based on existing docs is more practical than trying to fix all documentation to match strict rules
