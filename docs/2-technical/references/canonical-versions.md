# Canonical Technology Versions

> **Single Source of Truth**: This file defines the official versions for all technologies used in this project. All documentation, stories, and code should reference this file rather than specifying versions inline.

## Document Information

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Last Updated** | 2025-11-28 |
| **Owner** | Technical Lead |

---

## Core Runtime & Framework

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **Node.js** | 24.x LTS | `>=24.0.0 <25.0.0` | Current LTS, required for Next.js 16 |
| **pnpm** | 10.x | `>=10.22.0` | Workspace-native package manager |
| **Next.js** | 16.x | `^16.0.0` | App Router, Server Components |
| **React** | 19.x | `^19.0.0` | Latest stable with concurrent features |
| **React DOM** | 19.x | `^19.0.0` | Must match React version |
| **TypeScript** | 5.x | `^5.7.0` | Strict mode enabled |

### Engine Configuration

For `package.json` files:

```json
{
  "packageManager": "pnpm@10.22.0",
  "engines": {
    "node": ">=24.0.0 <25.0.0",
    "pnpm": ">=10.22.0"
  }
}
```

For `.nvmrc`:
```
24
```

---

## Database & ORM

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **PostgreSQL** | 16+ | `>=16.0` | Via Neon/Supabase |
| **Drizzle ORM** | Latest | `^0.29.0` | Type-safe ORM |
| **Drizzle Kit** | Latest | `^0.29.0` | Migration tooling |

---

## Authentication

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **@clerk/nextjs** | 6.x | `^6.9.0` | Next.js SDK |
| **@clerk/themes** | Latest | `^2.0.0` | UI theming |

---

## UI & Styling

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **Tailwind CSS** | 4.x | `^4.0.0` | Utility-first CSS |
| **shadcn/ui** | Latest | N/A | Copy-paste components |
| **Lucide React** | Latest | `^0.400.0` | Icon library |
| **class-variance-authority** | Latest | `^0.7.0` | Component variants |
| **clsx** | Latest | `^2.1.0` | Class name utility |
| **tailwind-merge** | Latest | `^2.2.0` | Tailwind class merging |

---

## Testing

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **Vitest** | 2.x | `^2.1.0` | Unit/integration testing |
| **@vitest/coverage-v8** | 2.x | `^2.1.0` | Coverage provider |
| **@vitest/ui** | 2.x | `^2.1.0` | Test UI |
| **Playwright** | 1.x | `^1.40.0` | E2E testing |
| **@testing-library/react** | 16.x | `^16.0.0` | Component testing |
| **@testing-library/jest-dom** | 6.x | `^6.1.0` | DOM matchers |
| **@testing-library/user-event** | 14.x | `^14.5.0` | User interaction |
| **happy-dom** | 14.x | `^14.0.0` | DOM implementation |
| **msw** | 2.x | `^2.0.0` | API mocking |
| **jest-axe** | 9.x | `^9.0.0` | Accessibility testing |
| **axe-core** | 4.x | `^4.8.0` | Accessibility engine |

---

## Observability & Analytics

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **@sentry/nextjs** | Latest | `^8.0.0` | Error tracking |
| **@vercel/analytics** | Latest | `^1.1.0` | Web analytics |
| **@vercel/speed-insights** | Latest | `^1.0.0` | Performance |
| **posthog-js** | Latest | `^1.100.0` | Product analytics |
| **web-vitals** | 4.x | `^4.0.0` | Core Web Vitals |

---

## Development Tools

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **Turborepo** | Latest | `^2.0.0` | Monorepo build |
| **ESLint** | 8.x | `^8.56.0` | Linting |
| **Prettier** | 3.x | `^3.2.0` | Formatting |
| **Husky** | 9.x | `^9.0.0` | Git hooks |
| **lint-staged** | 15.x | `^15.2.0` | Staged file linting |
| **commitlint** | 18.x | `^18.6.0` | Commit message linting |

---

## Component Development

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **Storybook** | 8.x | `^8.0.0` | Component docs |
| **@storybook/react** | 8.x | `^8.0.0` | React integration |
| **@storybook/react-vite** | 8.x | `^8.0.0` | Vite builder |
| **Chromatic** | Latest | N/A | Visual regression |

---

## Build Tools

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **Vite** | 5.x | `^5.0.0` | Build tool (Storybook) |
| **@vitejs/plugin-react** | 4.x | `^4.0.0` | React plugin |
| **tsup** | Latest | `^8.0.0` | Package bundling |

---

## Environment & Validation

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **@t3-oss/env-nextjs** | Latest | `^0.10.0` | Env validation |
| **zod** | 3.x | `^3.22.0` | Schema validation |

---

## Utilities

| Technology | Version | Constraint | Notes |
|------------|---------|------------|-------|
| **date-fns** | 2.x | `^2.30.0` | Date utilities |
| **recharts** | 2.x | `^2.10.0` | Charts |
| **@faker-js/faker** | 8.x | `^8.3.0` | Test data |
| **lighthouse** | 11.x | `^11.0.0` | Performance auditing |

---

## Version Update Process

When updating versions in this file:

1. **Test Locally**: Verify the new version works with all apps and packages
2. **Update This File**: Change the version here first
3. **Run CI/CD**: Ensure all tests pass with the new version
4. **Update package.json Files**: Use `pnpm up` to update dependencies
5. **Document Breaking Changes**: Note any migration steps needed

---

## Using This Reference

### In Documentation

Reference this file instead of hardcoding versions:

```markdown
<!-- Good -->
Node.js version per [canonical versions](/docs/2-technical/references/canonical-versions.md)

<!-- Avoid -->
Node.js 24.x LTS
```

### In Story Documents

Use the prerequisite section pattern:

```markdown
## Prerequisites

- Environment setup per `canonical versions` in docs/2-technical/references/canonical-versions.md
- Node.js and pnpm installed at specified versions
```

### In Package.json

Copy the exact constraint from this file:

```json
{
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

---

## ADR References

- [ADR-001: Monorepo with Turborepo](../adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](../adr/002-pnpm-package-manager.md)
- [ADR-003: Next.js 16 as Framework](../adr/003-nextjs-framework.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-28 | Updated Node.js from 22.x to 24.x LTS | Claude Code |
| 2025-11-27 | Initial version - consolidated all version references | Claude Code |
