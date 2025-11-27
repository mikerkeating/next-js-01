# Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Type (Required)

- `feat`: New feature for the user
- `fix`: Bug fix for the user
- `docs`: Documentation only changes
- `style`: Formatting changes (whitespace, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `build`: Build system or dependency changes
- `ci`: CI configuration changes
- `chore`: Maintenance tasks that don't modify src or test files
- `revert`: Reverts a previous commit

## Scope (Optional)

Provides context about what area is affected.

Examples: `api`, `auth`, `ui`, `db`, `content`, `analytics`

## Description (Required)

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period at the end
- Limit to 72 characters

## Body (Optional)

- Separate from description with a blank line
- Explain what and why vs. how
- Wrap at 72 characters

## Footer (Optional)

- Breaking changes: `BREAKING CHANGE:` or `!` after type/scope
- Issue references: `Fixes #123`, `Closes #456`
- Co-authors: `Co-authored-by: Name <email@example.com>`

## Examples

### Simple feature

```
feat: add user authentication
```

### Feature with scope

```
feat(auth): add JWT token validation
```

### Bug fix with issue reference

```
fix(api): handle null response in user endpoint

Fixes #234
```

### Breaking change

```
feat(api)!: change user endpoint response format

BREAKING CHANGE: User endpoint now returns nested object instead of flat structure.
```

### Detailed commit

```
refactor(db): optimize query performance for user lookup

The previous implementation was doing a full table scan.
Changed to use indexed query with proper WHERE clause.

Reduces average query time from 450ms to 12ms.
```

## Best Practices

### Good

- `feat(auth): add password reset functionality`
- `fix(ui): correct button alignment on mobile`
- `docs(api): update authentication examples`

### Bad

- `fixed stuff` (too vague)
- `feat: Added feature and fixed bugs` (not atomic)
- `WIP` (should be squashed before merge)

## Multi-Commit Workflows

Break larger features into logical commits:

```
feat(auth): add user model
feat(auth): implement login endpoint
feat(auth): add JWT middleware
test(auth): add authentication tests
docs(auth): document authentication flow
```

## Semantic Versioning

Commits map to version bumps:

- `feat:` → MINOR (0.x.0)
- `fix:` → PATCH (0.0.x)
- `BREAKING CHANGE:` → MAJOR (x.0.0)

## Common Pitfalls

- ❌ Mixing multiple types in one commit
- ❌ Using past tense ("added", "fixed")
- ❌ Overly long descriptions (>72 characters)
- ❌ Missing issue references for bug fixes
- ❌ Not marking breaking changes
- ❌ Including "WIP" commits in main branch

## Quick Reference

```
User-facing functionality added        → feat
User-facing bug fixed                  → fix
Internal code improvement              → refactor
Performance improvement                → perf
Documentation change                   → docs
Test addition/modification             → test
Build or dependency change             → build
CI/CD configuration                    → ci
Maintenance tasks                      → chore
```
