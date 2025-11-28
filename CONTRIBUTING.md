# Contributing to MK3 Platform

Thank you for your interest in contributing to the MK3 Platform. This guide covers the development workflow, coding standards, and pull request process.

## Prerequisites

Before contributing, ensure you have:

- **Node.js**: 24.x LTS (check with `node --version`)
- **pnpm**: 10.x (check with `pnpm --version`)

For exact version constraints, see [canonical-versions.md](/docs/2-technical/references/canonical-versions.md).

### Setup

```bash
# Clone the repository
git clone https://github.com/mikerkeating/next-js-01.git
cd next-js-01

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Verify setup
pnpm dev
```

## Development Workflow

### Branch Strategy

Create branches from `development` using this naming convention:

| Prefix      | Purpose          | Example                       |
| ----------- | ---------------- | ----------------------------- |
| `feature/`  | New features     | `feature/user-authentication` |
| `fix/`      | Bug fixes        | `fix/login-redirect-loop`     |
| `docs/`     | Documentation    | `docs/api-reference-update`   |
| `refactor/` | Code refactoring | `refactor/database-queries`   |
| `test/`     | Test additions   | `test/auth-integration-tests` |
| `epic/`     | Epic-level work  | `epic/1A.2-authentication`    |

### Creating a Branch

```bash
# Ensure you're on development
git checkout development
git pull origin development

# Create your branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write your code following the [coding standards](/docs/2-technical/references/coding-standards.md)
2. Run quality checks frequently during development
3. Commit changes using [conventional commits](/docs/2-technical/references/commit-guidelines.md)

## Coding Standards

All contributions must follow our [coding standards](/docs/2-technical/references/coding-standards.md). Key requirements:

### Type Safety

- Never use `as any` type assertions
- Use discriminated unions with type narrowing
- All functions must have explicit parameter and return types
- Use `z.ZodType` (not `z.ZodTypeAny`) for Zod schemas

### Code Style

- Use named exports for React components
- Separate import groups with blank lines
- External imports, then `@repo/*` packages, then relative imports

### Quality Checks

Run before committing:

```bash
pnpm lint          # Must pass with 0 errors, 0 warnings
pnpm type-check    # Must pass with 0 errors
pnpm test          # Must pass all tests
pnpm build         # Must complete successfully
```

### Documentation Quality Checks

The project has documentation quality gates that run automatically:

```bash
pnpm lint:md       # Markdown linting
pnpm check:readmes # Verify all packages have README.md
pnpm check:jsdoc   # JSDoc coverage check (80% threshold)
pnpm check:docs    # Run all documentation checks
```

Pre-commit hooks automatically run markdown linting on staged files.

### Bypassing Quality Gates (Emergency Only)

In rare emergency situations, you can bypass pre-commit hooks:

```bash
git commit --no-verify -m "fix(critical): emergency fix for production issue"
```

**Important guidelines for emergency bypasses:**

- Only use `--no-verify` for genuine emergencies (production outages, security fixes)
- Create a follow-up commit or PR to address any quality issues bypassed
- Document the emergency in the commit message body
- Never bypass for convenience - quality gates exist to prevent issues

Example emergency commit:

```bash
git commit --no-verify -m "fix(auth): emergency patch for authentication bypass

EMERGENCY: Production authentication was broken.
TODO: Follow-up PR needed to fix linting warnings introduced."
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. See [commit-guidelines.md](/docs/2-technical/references/commit-guidelines.md) for details.

### Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types

| Type       | Description                     |
| ---------- | ------------------------------- |
| `feat`     | New feature for the user        |
| `fix`      | Bug fix for the user            |
| `docs`     | Documentation changes           |
| `refactor` | Code change without feature/fix |
| `test`     | Adding or correcting tests      |
| `chore`    | Maintenance tasks               |

### Examples

```text
feat(auth): add password reset functionality
fix(ui): correct button alignment on mobile
docs(api): update authentication examples
```

## Pull Request Process

### Before Opening a PR

1. Ensure all quality checks pass locally
2. Rebase on latest `development` if needed
3. Write meaningful commit messages
4. Update documentation for any public API changes

### PR Checklist

Your PR should include:

- [ ] Clear, descriptive title following conventional commit format
- [ ] Description explaining what changes were made and why
- [ ] Link to related issue or story (if applicable)
- [ ] All CI checks passing
- [ ] Documentation updated (if applicable)
- [ ] Tests added/updated for new functionality

### PR Title Format

Use the same format as commit messages:

```text
feat(auth): add multi-factor authentication support
fix(database): resolve connection pool exhaustion
docs(readme): add troubleshooting section
```

### Review Process

1. Request review from at least one team member
2. Address review feedback promptly
3. Re-request review after making changes
4. Merge after approval and all checks pass

## Testing Requirements

### Writing Tests

- Write tests alongside implementation code
- Use test helpers from `packages/*/src/test/types.ts` for mocking
- Follow patterns in existing tests
- Cover both success and error cases

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific workspace
pnpm turbo test --filter=@repo/routing

# Run tests in watch mode (within workspace)
cd apps/routing && pnpm test --watch
```

## Documentation Requirements

When your changes affect public APIs or user-facing functionality:

1. **Code Comments**: Add JSDoc comments for public functions
2. **Package README**: Update if package API changes
3. **User Guides**: Update relevant guides in `/docs/guides/`
4. **ADRs**: Create an [Architecture Decision Record](/docs/2-technical/adr/) for significant architectural changes

## Getting Help

- **Questions**: Open a discussion or reach out to the team
- **Bug Reports**: Open an issue with reproduction steps
- **Feature Requests**: Open an issue describing the use case

## Reference Documents

| Document                                                                 | Purpose               |
| ------------------------------------------------------------------------ | --------------------- |
| [Coding Standards](/docs/2-technical/references/coding-standards.md)     | Code quality rules    |
| [Commit Guidelines](/docs/2-technical/references/commit-guidelines.md)   | Commit message format |
| [Canonical Versions](/docs/2-technical/references/canonical-versions.md) | Dependency versions   |
| [Process Guide](/docs/0-process/0-process.md)                            | Development process   |
| [Technical Architecture](/docs/2-technical/2-tad.md)                     | System architecture   |
