## Developer Experience

> **Version Reference**: For exact tool versions and constraints, see [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md).

### Overview

Our developer experience (DX) strategy ensures developers can work efficiently with fast feedback loops, clear workflows, and automated quality gates. This section covers Epic 1A.2 requirements.

**Key Principles**:

- **Fast Feedback**: Catch issues early in development, not in CI
- **Automated Quality**: Pre-commit hooks enforce standards automatically
- **Clear Workflows**: Well-documented processes for common tasks
- **Consistent Environment**: Same setup across all developer machines
- **Progressive Enhancement**: Start simple, add complexity as needed

### Quality Gate Thresholds

#### Pre-Commit Quality Gates

Quality gates run automatically before each commit via Husky and lint-staged:

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

**What Gets Checked**:

- **Linting**: ESLint with project rules
- **Formatting**: Prettier with consistent config
- **Type Checking**: TypeScript compilation (via editor)
- **File Size**: Warn if files exceed 500 lines

**Bypass Policy**:

```bash
# Only use in emergencies (e.g., hotfix)
git commit --no-verify -m "emergency: fix critical bug"

# Document why in commit message
```

---

#### CI/CD Quality Gates

Quality gates that run in GitHub Actions for every PR:

| Gate                  | Tool                    | Threshold                | Blocks Merge?   |
| --------------------- | ----------------------- | ------------------------ | --------------- |
| **Linting**           | ESLint                  | 0 errors                 | ✅ Yes          |
| **Type Checking**     | TypeScript              | 0 errors                 | ✅ Yes          |
| **Unit Tests**        | Vitest                  | 100% pass, ≥80% coverage | ✅ Yes          |
| **Integration Tests** | Vitest                  | 100% pass                | ✅ Yes          |
| **Build**             | Turborepo               | Successful build         | ✅ Yes          |
| **E2E Smoke Tests**   | Playwright              | 100% pass                | ✅ Yes          |
| **Bundle Size**       | Next.js Bundle Analyzer | ≤200KB JS                | ⚠️ Warning only |
| **Security Audit**    | pnpm audit              | 0 high/critical          | ✅ Yes          |
| **Accessibility**     | axe-core                | 0 violations             | ⚠️ Warning only |

**Quality Gate Configuration**:

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # Gate 1: Linting
      - name: Lint
        run: pnpm run lint

      # Gate 2: Type checking
      - name: Type check
        run: pnpm run type-check

      # Gate 3: Unit tests with coverage
      - name: Unit tests
        run: pnpm run test:unit --coverage

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

      # Gate 4: Build
      - name: Build all packages
        run: pnpm run build

      # Gate 5: Security audit
      - name: Security audit
        run: pnpm audit --audit-level=high

      # Gate 6: Bundle size check (warning only)
      - name: Bundle size check
        continue-on-error: true
        run: |
          SIZE=$(du -sk apps/routing/.next/static/chunks | cut -f1)
          if [ $SIZE -gt 200 ]; then
            echo "::warning::Bundle size ${SIZE}KB exceeds 200KB threshold"
          fi
```

**Coverage Enforcement**:

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      exclude: ["**/*.test.ts", "**/*.spec.ts", "**/*.config.ts", "**/dist/**", "**/.next/**"],
    },
  },
});
```

---

### Local Development Setup

#### Prerequisites

Before starting development, ensure you have:

| Tool        | Version           | Purpose              |
| ----------- | ----------------- | -------------------- |
| **Node.js** | 24.x LTS          | Runtime environment  |
| **pnpm**    | 10.x              | Package manager      |
| **Git**     | 2.x+              | Version control      |
| **VS Code** | Latest            | Recommended IDE      |
| **Docker**  | Latest (optional) | For local PostgreSQL |

#### First-Time Setup

**Step 1: Clone Repository**

```bash
# Clone the repository
git clone https://github.com/your-org/next-js-2025-12-1.git
cd next-js-2025-12-1

# Checkout development branch
git checkout development
```

**Step 2: Install Dependencies**

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@10

# Install all dependencies
pnpm install
```

This installs:

- All workspace dependencies
- Husky git hooks
- TypeScript definitions
- Development tools

**Step 3: Environment Configuration**

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local  # or use your preferred editor
```

**Required Environment Variables**:

```bash
# Database (choose one)

# Option 1: Local PostgreSQL (Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev

# Option 2: Neon (free tier, recommended)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/myapp_dev

# Option 3: Supabase (free tier)
DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres

# Clerk Authentication (free development account)
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxx

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Leave empty for local dev
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
ENCRYPTION_KEY=
```

**Step 4: Database Setup**

```bash
# Generate a migration (if needed)
pnpm run db:generate

# Run migrations to create tables
pnpm run db:migrate

# Seed database with sample data (optional)
pnpm run db:seed
```

**Step 5: Start Development Server**

```bash
# Start all apps in development mode
pnpm run dev

# Or start specific app
pnpm run dev --filter=routing

# Or start with turbo watch mode
pnpm run dev --parallel
```

This starts:

- `apps/routing` at <http://localhost:3000>
- `apps/api` at <http://localhost:3001> (if configured)
- `apps/docs` at <http://localhost:3002> (if configured)

**Step 6: Verify Setup**

```bash
# Run tests to verify everything works
pnpm run test

# Check types
pnpm run type-check

# Lint code
pnpm run lint

# Build everything
pnpm run build
```

---

#### VS Code Setup (Recommended)

**Step 1: Install Extensions**

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

**Step 2: Configure Settings**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**Step 3: Configure Tasks**

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "pnpm run dev",
      "problemMatcher": [],
      "isBackground": true
    },
    {
      "label": "test",
      "type": "shell",
      "command": "pnpm run test",
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      }
    },
    {
      "label": "lint",
      "type": "shell",
      "command": "pnpm run lint --fix",
      "problemMatcher": ["$eslint-stylish"]
    }
  ]
}
```

---

#### Common Development Tasks

**Running Tests**:

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests for specific package
pnpm run test --filter=@repo/database

# Run tests with coverage
pnpm run test:coverage

# Run integration tests
pnpm run test:integration

# Run E2E tests
pnpm run test:e2e
```

**Database Operations**:

```bash
# Create a new migration
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:rollback

# Reset database (caution!)
pnpm run db:reset

# Open Drizzle Studio (database GUI)
pnpm run db:studio

# Seed database with test data
pnpm run db:seed
```

**Building & Linting**:

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm run build --filter=routing

# Lint and fix all files
pnpm run lint --fix

# Type check all packages
pnpm run type-check

# Format all files
pnpm run format
```

**Package Management**:

```bash
# Add dependency to specific package
pnpm add lodash --filter=@repo/database

# Add dev dependency to root
pnpm add -D vitest -w

# Update all dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

---

### PR Workflow and Branching Strategy

#### Branching Model

We use **GitHub Flow** with protected branches:

```
main (production)
  ↑
  └── development (staging)
        ↑
        ├── feature/add-user-profile
        ├── feature/implement-checkout
        ├── fix/login-error
        └── epic/0A.1-steel-thread
```

**Branch Types**:

| Type            | Pattern       | Purpose                    | Merges To              |
| --------------- | ------------- | -------------------------- | ---------------------- |
| **main**        | `main`        | Production code            | -                      |
| **development** | `development` | Staging/integration branch | `main`                 |
| **Feature**     | `feature/*`   | New features               | `development`          |
| **Fix**         | `fix/*`       | Bug fixes                  | `development`          |
| **Epic**        | `epic/*`      | Large feature sets         | `development`          |
| **Hotfix**      | `hotfix/*`    | Emergency production fixes | `main` + `development` |

---

#### Creating a New Branch

**Step 1: Ensure you're up to date**

```bash
# Switch to development branch
git checkout development

# Pull latest changes
git pull origin development
```

**Step 2: Create feature branch**

```bash
# For new features
git checkout -b feature/add-user-dashboard

# For bug fixes
git checkout -b fix/authentication-error

# For epics (large features)
git checkout -b epic/1A.1-user-management
```

**Branch Naming Convention**:

```
<type>/<description>

Examples:
✅ feature/user-profile
✅ fix/login-timeout
✅ epic/2A.3-observability
✅ hotfix/critical-security-patch

❌ myfeature (no type prefix)
❌ feature/Add-User-Profile (no capitals)
❌ fix-login (wrong separator)
```

---

#### Making Changes

**Step 1: Make your changes**

```bash
# Edit files
code apps/routing/src/app/profile/page.tsx

# Run dev server to test
pnpm run dev --filter=routing
```

**Step 2: Test your changes**

```bash
# Run relevant tests
pnpm run test --filter=routing

# Run type checking
pnpm run type-check

# Lint your changes
pnpm run lint --fix
```

**Step 3: Commit your changes**

```bash
# Stage files
git add apps/routing/src/app/profile/page.tsx

# Commit with conventional commit message
git commit -m "feat(routing): add user profile page

- Add profile page with user information
- Implement edit profile functionality
- Add profile tests with 85% coverage

Closes #123"
```

**Commit Message Format** (Conventional Commits):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```bash
# Feature
git commit -m "feat(auth): add OAuth login support"

# Bug fix
git commit -m "fix(api): resolve race condition in user creation"

# Breaking change
git commit -m "feat(database)!: change user schema

BREAKING CHANGE: user table now requires email verification"

# Multiple scopes
git commit -m "test(routing,api): add integration tests for auth flow"
```

---

#### Opening a Pull Request

**Step 1: Push your branch**

```bash
# Push branch to remote
git push origin feature/add-user-dashboard

# First time push
git push -u origin feature/add-user-dashboard
```

**Step 2: Create PR on GitHub**

1. Navigate to repository on GitHub
2. Click "Compare & pull request"
3. Fill out PR template:

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Related Issues

Closes #123
Relates to #456
```

**Step 3: Request Review**

- Assign yourself
- Add relevant reviewers (minimum 1)
- Add labels (`feature`, `bug`, `documentation`)
- Link related issues

---

#### PR Review Process

**Review Checklist for Reviewers**:

- [ ] **Functionality**: Does it work as intended?
- [ ] **Tests**: Adequate test coverage (≥80%)?
- [ ] **Code Quality**: Clean, readable, maintainable?
- [ ] **Performance**: No obvious performance issues?
- [ ] **Security**: No security vulnerabilities?
- [ ] **Accessibility**: Meets WCAG AA standards?
- [ ] **Documentation**: Code/API changes documented?
- [ ] **Breaking Changes**: Called out and justified?

**Review Commands**:

```bash
# Check out PR locally
gh pr checkout 123

# Run tests on PR
pnpm run test

# Build PR
pnpm run build

# Run E2E tests on PR preview deployment
pnpm run test:e2e
```

**Providing Feedback**:

```markdown
# Requesting changes

Please update the error handling to catch the specific exception type.

# Suggesting improvements

Consider using `useMemo` here to avoid unnecessary recalculations.

# Nitpicks (optional)

nit: Consider renaming `data` to `userData` for clarity.

# Blocking issues

🚫 This introduces a security vulnerability. Please sanitize user input.

# Approving

✅ LGTM! Great work on the test coverage.
```

---

#### Merging a Pull Request

**Prerequisites**:

- ✅ All CI checks pass
- ✅ At least 1 approval
- ✅ No unresolved conversations
- ✅ Branch is up to date with base branch

**Merge Strategies**:

| Strategy             | When to Use                  | Command                        |
| -------------------- | ---------------------------- | ------------------------------ |
| **Squash and Merge** | Default for feature branches | Combines all commits into one  |
| **Rebase and Merge** | For clean linear history     | Replays commits on base branch |
| **Merge Commit**     | For epic branches            | Preserves commit history       |

**Recommended**: Use **Squash and Merge** for most PRs to keep history clean.

```bash
# Via GitHub UI: Click "Squash and merge"

# Via CLI
gh pr merge 123 --squash --delete-branch
```

**Squash Commit Message Template**:

```
feat(routing): add user profile page (#123)

* Add profile page component
* Implement edit functionality
* Add comprehensive tests
* Update documentation

Co-authored-by: Teammate <teammate@example.com>
```

---

#### Post-Merge Cleanup

```bash
# Switch back to development branch
git checkout development

# Pull latest changes (includes your merged PR)
git pull origin development

# Delete local feature branch
git branch -d feature/add-user-dashboard

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/add-user-dashboard
```

---

### Development Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Create Branch                                          │
│     git checkout -b feature/my-feature                     │
│     ↓                                                       │
│  2. Make Changes                                           │
│     code, test, iterate                                     │
│     ↓                                                       │
│  3. Pre-commit Checks (Husky)                              │
│     ├─→ ESLint (auto-fix)                                  │
│     ├─→ Prettier (auto-format)                             │
│     └─→ TypeScript (editor check)                          │
│     ↓                                                       │
│  4. Commit                                                  │
│     git commit -m "feat: add feature"                      │
│     ↓                                                       │
│  5. Push to Remote                                         │
│     git push origin feature/my-feature                     │
│     ↓                                                       │
│  6. Create Pull Request                                    │
│     gh pr create --fill                                     │
│     ↓                                                       │
│  7. CI Quality Gates                                       │
│     ├─→ Lint ✅                                            │
│     ├─→ Type Check ✅                                      │
│     ├─→ Tests (80% coverage) ✅                            │
│     ├─→ Build ✅                                           │
│     └─→ E2E Smoke Tests ✅                                 │
│     ↓                                                       │
│  8. Code Review                                            │
│     ├─→ Reviewer 1: Approved ✅                            │
│     └─→ Reviewer 2: Approved ✅                            │
│     ↓                                                       │
│  9. Merge to Development                                   │
│     Squash and merge via GitHub                            │
│     ↓                                                       │
│  10. Auto-Deploy to Staging                                │
│      Vercel deploys to staging.example.com                 │
│      ↓                                                      │
│  11. Smoke Tests on Staging                                │
│      Automated E2E tests run                                │
│      ↓                                                      │
│  12. Ready for Production Release                          │
│      Merge development → main when ready                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Troubleshooting Common Issues

#### Issue: Pre-commit hooks not running

**Solution**:

```bash
# Reinstall Husky hooks
pnpm run prepare

# Verify hooks are executable
ls -la .husky/pre-commit

# Make executable if needed
chmod +x .husky/pre-commit
```

---

#### Issue: TypeScript errors in IDE but not in terminal

**Solution**:

```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"

# Or reload VS Code workspace
# CMD/CTRL + Shift + P → "Developer: Reload Window"

# Verify using correct TypeScript version
# Check .vscode/settings.json has:
# "typescript.tsdk": "node_modules/typescript/lib"
```

---

#### Issue: Database connection fails locally

**Solution**:

```bash
# Check DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL

# Test connection with psql
psql $DATABASE_URL

# For Docker PostgreSQL
docker ps  # Verify container is running
docker start postgres-dev  # Start if stopped

# For Neon/Supabase
# Verify connection string from dashboard
# Check IP is whitelisted (Neon requires this)
```

---

#### Issue: Port already in use

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in package.json
# "dev": "next dev -p 3001"
```

---

#### Issue: pnpm install fails

**Solution**:

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# If still failing, check pnpm version
pnpm --version  # Should be 9.x

# Update pnpm
npm install -g pnpm@latest
```

---

### Developer Experience Metrics

We track these metrics to ensure good DX:

| Metric                  | Target       | Current | Status |
| ----------------------- | ------------ | ------- | ------ |
| **Time to First Run**   | < 10 min     | TBD     | 🟡     |
| **Dev Server Start**    | < 10s        | TBD     | 🟡     |
| **Hot Reload Time**     | < 2s         | TBD     | 🟡     |
| **Test Execution**      | < 30s (unit) | TBD     | 🟡     |
| **Build Time**          | < 2 min      | TBD     | 🟡     |
| **CI Pipeline**         | < 5 min      | TBD     | 🟡     |
| **PR Review Time**      | < 24 hours   | TBD     | 🟡     |
| **Merge to Production** | < 15 min     | TBD     | 🟡     |

**Improvement Actions**:

- Monitor metrics weekly
- Optimize slow build steps
- Parallelize CI jobs where possible
- Review and improve documentation based on feedback

---
