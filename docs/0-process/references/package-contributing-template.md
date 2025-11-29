# Package CONTRIBUTING.md Template

> **Usage**: Copy this template to `packages/{name}/docs/CONTRIBUTING.md` when creating a new package. Replace placeholders (in `{braces}`) with actual content.
>
> **Audience**: Package maintainers and contributors
>
> **TAD Reference**: [Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy) | [Documentation Layers](/docs/2-technical/2-tad-documentation.md#documentation-layers)

---

# Contributing to @repo/{package-name}

Guidelines for contributing to the {package-name} package.

## Quick Start for Contributors

1. **Read the architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Understand the testing approach**: [TESTING.md](./TESTING.md)
3. **Review coding standards**: [Coding Standards](/docs/2-technical/references/coding-standards.md)
4. **Check open issues**: {Link to filtered issues for this package}

---

## Development Setup

### Prerequisites

- Node.js per [canonical versions](/docs/2-technical/references/canonical-versions.md)
- pnpm per [canonical versions](/docs/2-technical/references/canonical-versions.md)
- {Any package-specific prerequisites}

### Local Development

```bash
# Clone the monorepo (if not already done)
git clone {repo-url}
cd {repo-name}

# Install all dependencies
pnpm install

# Navigate to this package
cd packages/{package-name}

# Start development mode (if applicable)
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Build the package
pnpm build
```

### Environment Setup

{If the package requires environment variables or special configuration for development, document here.}

```bash
# Copy example env file (if applicable)
cp .env.example .env.local

# Required environment variables:
# {VAR_NAME}={description}
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Ensure you're on the latest development branch
git checkout development
git pull origin development

# Create a feature branch
git checkout -b feat/{package-name}/{brief-description}
# or for bug fixes
git checkout -b fix/{package-name}/{brief-description}
```

### 2. Make Changes

- Follow the [coding standards](/docs/2-technical/references/coding-standards.md)
- Write tests for new functionality (TDD preferred)
- Update documentation if public API changes
- Keep commits focused and atomic

### 3. Validate Changes

```bash
# Run linting
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test

# Build to verify no compilation errors
pnpm build
```

### 4. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat({package-name}): add {description}"

# Bug fix
git commit -m "fix({package-name}): resolve {description}"

# Documentation
git commit -m "docs({package-name}): update {description}"

# Refactor
git commit -m "refactor({package-name}): {description}"
```

### 5. Create Pull Request

- Push your branch: `git push -u origin {branch-name}`
- Open PR against `development` branch
- Fill out the PR template completely
- Request review from package maintainers

---

## Code Standards

### Package-Specific Standards

{Document any standards specific to this package that go beyond the general coding standards.}

- {Standard 1}
- {Standard 2}

### Type Safety

- No `as any` type assertions (use type-safe helpers from `test/types.ts`)
- All public APIs must have explicit TypeScript types
- Use discriminated unions and type narrowing

### Public API Guidelines

- Export only what consumers need from `src/index.ts`
- All public functions must have JSDoc documentation
- Breaking changes require discussion before implementation

---

## Testing Requirements

See [TESTING.md](./TESTING.md) for detailed testing documentation.

### Minimum Requirements

- [ ] All new code has unit tests
- [ ] Tests follow existing patterns in `tests/` directory
- [ ] Coverage does not decrease
- [ ] Integration tests for cross-module functionality

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test {test-file-path}
```

---

## Documentation Requirements

When contributing, update documentation as needed:

### For New Features

- [ ] Update README.md if public API changes
- [ ] Add JSDoc to new public functions
- [ ] Add usage examples if appropriate
- [ ] Update ARCHITECTURE.md if internal structure changes

### For Bug Fixes

- [ ] Add to Troubleshooting section if user-facing
- [ ] Update any incorrect documentation discovered

### For Breaking Changes

- [ ] Document migration path in README
- [ ] Update all examples to reflect changes
- [ ] Note breaking change in PR description

---

## Pull Request Process

### PR Checklist

Before requesting review:

- [ ] All tests pass (`pnpm test`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No type errors (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventional commits
- [ ] PR description explains the change

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** from at least one package maintainer
3. **Documentation review** if public API changed
4. **Final approval** from maintainer

### Merge Strategy

- PRs are squash-merged to keep history clean
- Branch is deleted after merge
- Maintainer handles the merge

---

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Package version**: `pnpm list @repo/{package-name}`
2. **Environment**: Node.js version, OS
3. **Reproduction steps**: Minimal code to reproduce
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Error messages**: Full error output

### Feature Requests

When requesting features:

1. **Use case**: Why is this needed?
2. **Proposed solution**: How might it work?
3. **Alternatives**: Other approaches considered
4. **Scope**: Does it belong in this package?

---

## Package Maintainers

{List the maintainers responsible for this package.}

| Maintainer | Role                 | Contact        |
| ---------- | -------------------- | -------------- |
| {Name}     | Primary maintainer   | {email/github} |
| {Name}     | Secondary maintainer | {email/github} |

---

## Getting Help

- **Architecture questions**: Review [ARCHITECTURE.md](./ARCHITECTURE.md) first
- **Testing questions**: Review [TESTING.md](./TESTING.md) first
- **General questions**: {Slack channel, discussion forum, or issue tracker}
- **Urgent issues**: Contact maintainers directly

---

## Related Documentation

- [README.md](../README.md) - Package overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Internal structure
- [TESTING.md](./TESTING.md) - Testing strategy
- [Coding Standards](/docs/2-technical/references/coding-standards.md) - Monorepo coding standards
- [Commit Guidelines](/docs/2-technical/references/commit-guidelines.md) - Commit message format

---

> **Template Version**: 1.0
> **Template Source**: [package-contributing-template.md](/docs/0-process/references/package-contributing-template.md)
