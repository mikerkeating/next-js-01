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
- [ ] markdownlint-cli2 is installed and configured at root level
- [ ] Markdown files (`.md`) are linted on pre-commit via lint-staged integration
- [ ] Documentation follows a consistent style (heading levels, list markers, line length)
- [ ] Common markdown errors are caught (multiple top-level headings, trailing spaces, inconsistent indentation)
- [ ] Project-specific rule overrides are documented (e.g., allowing HTML for complex layouts)
- [ ] Developers can run `pnpm lint:md` to check all markdown files manually
- [ ] Linting completes in under 5 seconds for typical documentation changes

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `.markdownlint.json` | markdownlint configuration with project rules |
| `.markdownlintignore` | Files/patterns to exclude from markdown linting |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` | Add markdownlint-cli2 dev dependency, add `lint:md` script, update lint-staged config |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

```bash
pnpm add -D markdownlint-cli2
```

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| `default: true` | Enable all rules by default | [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) |
| `MD013` (line-length) | Disable or set high limit (120+) for prose flexibility | Project convention |
| `MD033` (no-inline-html) | Allow specific HTML elements for badges/images | Project convention |
| `MD041` (first-line-heading) | Enforce first line is h1 heading | Documentation consistency |
| lint-staged pattern | Add `"*.md": ["markdownlint-cli2 --fix"]` | [TAD: Pre-Commit Quality Gates](/docs/2-technical/2-tad-developer-experience.md#pre-commit-quality-gates) |

**Configuration Rationale**:
- Default rules enabled provides comprehensive checking out of the box
- Line length disabled/relaxed as documentation prose shouldn't be artificially wrapped
- HTML allowed for badges, images with attributes, and complex layouts common in READMEs
- First-line heading ensures every doc has a clear title

## Test Requirements

### Manual Verification
- [ ] **Rule Violation Detection**: Create a markdown file with trailing whitespace, commit - should be auto-fixed
- [ ] **Heading Validation**: Create a file with two `#` headings, run lint - should fail
- [ ] **Auto-Fix**: Create file with fixable issues (trailing spaces, inconsistent list markers), commit - auto-fixed
- [ ] **Ignore Patterns**: Verify files matching `.markdownlintignore` patterns are skipped
- [ ] **Manual Run**: Execute `pnpm lint:md` - all docs should pass or show clear errors

### Verification Commands
```bash
# Verify markdownlint-cli2 is installed
pnpm list markdownlint-cli2

# Lint all markdown files manually
pnpm lint:md

# Lint specific file
pnpm exec markdownlint-cli2 "docs/**/*.md"

# Lint with auto-fix
pnpm exec markdownlint-cli2 --fix "**/*.md"

# Verify lint-staged includes markdown
pnpm lint-staged --dry-run
```

## Implementation Notes

### Implementation Sequence

1. **Install markdownlint-cli2**
   - Add as dev dependency at root level
   - Verify installation with `pnpm list markdownlint-cli2`

2. **Create configuration file**
   - Create `.markdownlint.json` with rule overrides
   - Document rationale for disabled/modified rules via comments (JSON5) or separate doc

3. **Create ignore file**
   - Create `.markdownlintignore` for generated/vendor files
   - Include `node_modules/`, `dist/`, `CHANGELOG.md` (auto-generated)

4. **Add npm script**
   - Add `lint:md` script to root `package.json`
   - Script should lint all markdown files in project

5. **Update lint-staged configuration**
   - Add markdown file pattern to lint-staged config
   - Use `markdownlint-cli2 --fix` for auto-fixing

6. **Verify integration**
   - Test pre-commit with markdown changes
   - Verify auto-fix functionality works

### Key Concepts
- **markdownlint-cli2**: CLI wrapper for markdownlint with better glob support and configuration
- **Rule IDs**: Rules are identified by codes (MD001, MD013, etc.) - see [Rules Reference](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- **Auto-fix**: Many rules support automatic fixing (trailing spaces, list markers, heading levels)

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

### Reference Materials
- [markdownlint Rules Reference](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [markdownlint-cli2 Documentation](https://github.com/DavidAnson/markdownlint-cli2)
- [markdownlint Configuration](https://github.com/DavidAnson/markdownlint#configuration)

## Estimated Effort
**Size**: S (2-4h)

**Breakdown**:
- Install and configure markdownlint-cli2: 1h
- Create ignore patterns and test rules: 0.5h
- Update lint-staged integration: 0.5h
- Fix existing markdown issues: 1h
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

- **Broken link detection** - markdownlint doesn't check link targets; consider separate tool (markdown-link-check) in CI
- **Spell checking** - Deferred to separate tool/story if needed (cspell)
- **Table of contents generation** - Documentation tooling, not linting
- **Custom markdownlint rules** - Use built-in rules only; custom rules if needed in future
- **Prose linting (write-good, alex)** - Deferred; only structural/format linting in this story

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
- [ ] S4 (lint-staged) completed
- [ ] S5 (commitlint) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] markdownlint-cli2 installed at root
- [ ] Configuration file created with documented rule overrides
- [ ] lint-staged updated to include markdown files
- [ ] `pnpm lint:md` script works correctly
- [ ] Pre-commit hook processes markdown files

### Documentation
- [ ] Rule overrides documented with rationale in config or separate doc
- [ ] `.markdownlintignore` includes appropriate exclusions

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] Existing markdown files pass linting (or issues tracked separately)

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
