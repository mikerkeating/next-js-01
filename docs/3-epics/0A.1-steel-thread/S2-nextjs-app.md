# Story 0A.1.S2: Create Minimal Next.js 16 Application

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S1: Create GitHub Repository with Branch Protection](./S1-github-repository.md)
- **Blocks**: [S3: Configure Vercel Project Integration](./S3-vercel-integration.md), [S4: Implement Health Check Endpoint](./S4-health-endpoint.md)
- **Runs in Parallel With**: [S3: Configure Vercel Project Integration](./S3-vercel-integration.md) (after S1 completes)

## User Story

**As a** developer
**I want** a minimal Next.js 16 application with TypeScript and Tailwind CSS
**So that** I have a foundation for building features and can verify the deployment pipeline works end-to-end

## Acceptance Criteria

- [x] Next.js 16 application initializes and runs locally via `pnpm dev`
- [x] Application uses TypeScript with strict mode enabled
- [x] Tailwind CSS 4.x is configured and functional
- [x] Homepage (`/`) renders with basic content
- [x] Application builds successfully via `pnpm build`
- [x] `package.json` includes correct engine constraints per canonical versions
- [x] ESLint and Prettier are configured with Next.js recommended rules
- [x] Application passes `pnpm lint` without errors
- [x] Application passes `pnpm type-check` without errors

## Technical Requirements

### Files to Create

| Path                  | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| `package.json`        | Root package configuration with dependencies and scripts    |
| `pnpm-workspace.yaml` | pnpm workspace configuration (minimal, for future monorepo) |
| `tsconfig.json`       | TypeScript configuration with strict mode                   |
| `next.config.ts`      | Next.js configuration                                       |
| `tailwind.config.ts`  | Tailwind CSS configuration                                  |
| `postcss.config.js`   | PostCSS configuration for Tailwind                          |
| `src/app/layout.tsx`  | Root layout component                                       |
| `src/app/page.tsx`    | Homepage component                                          |
| `src/app/globals.css` | Global styles with Tailwind directives                      |
| `.eslintrc.json`      | ESLint configuration                                        |
| `.prettierrc`         | Prettier configuration                                      |
| `.prettierignore`     | Prettier ignore patterns                                    |
| `.env.example`        | Environment variables template                              |

### Files to Modify

| Path         | Changes                                    |
| ------------ | ------------------------------------------ |
| `.gitignore` | Add Next.js specific patterns if needed    |
| `README.md`  | Update with local development instructions |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Core dependencies
pnpm add next react react-dom

# Development dependencies
pnpm add -D typescript @types/node @types/react @types/react-dom
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D eslint eslint-config-next prettier
```

### Configuration Details

| Setting             | Requirement                      | TAD Reference                                                                                 |
| ------------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| TypeScript `strict` | `true`                           | [TAD: Technology Stack](/docs/2-technical/2-tad.md#framework--runtime)                        |
| Next.js App Router  | Use `src/app` directory          | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)                    |
| Tailwind CSS        | Version 4.x with PostCSS         | [TAD: UI & Styling](/docs/2-technical/2-tad.md#ui--styling)                                   |
| Package Manager     | pnpm with `packageManager` field | [Canonical Versions](/docs/2-technical/references/canonical-versions.md#engine-configuration) |

**Configuration Rationale**: The minimal application establishes the foundation patterns that all subsequent development will follow. Strict TypeScript and linting from day one prevents technical debt accumulation.

## Test Requirements

### Manual Verification

- [x] **Dev Server Starts**: `pnpm dev` starts server on port 3000 without errors
- [x] **Homepage Renders**: Navigate to `http://localhost:3000` shows styled content
- [x] **Hot Reload Works**: Edit `page.tsx`, changes reflect in browser without full refresh
- [x] **Build Succeeds**: `pnpm build` completes without errors

### Automated Tests

No automated tests in this story - testing infrastructure added in S6 and later epics.

### Verification Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Production build
pnpm build

# Start production server
pnpm start
```

## Implementation Notes

### Implementation Sequence

1. **Initialize Package Configuration** (~30min) - Create `package.json`, `pnpm-workspace.yaml`
2. **Configure TypeScript** (~30min) - Create `tsconfig.json` with strict settings
3. **Setup Next.js Application** (~1h) - Create `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
4. **Configure Tailwind CSS** (~30min) - Create configs, `globals.css` with directives
5. **Setup Linting & Formatting** (~30min) - Create `.eslintrc.json`, `.prettierrc`
6. **Documentation & Cleanup** (~30min) - Update `README.md`, create `.env.example`

### Key Concepts

- **App Router**: Next.js 16 uses the App Router by default, with file-based routing in `src/app`
- **Server Components**: React components in `src/app` are Server Components by default
- **Strict Mode**: TypeScript strict mode catches more errors at compile time

### Common Patterns

Reference the TAD for implementation patterns:

- [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack)
- [TAD: Monorepo Structure](/docs/2-technical/2-tad.md#monorepo-structure)

Key pattern notes for this story:

- Use `src/` directory convention for application code
- Follow Next.js 16 App Router conventions
- Keep homepage minimal - it will be enhanced in later stories

### Troubleshooting

**Issue**: TypeScript errors about missing types

- **Cause**: Missing `@types/*` packages
- **Solution**: Ensure all type packages installed per dependencies section

**Issue**: Tailwind styles not applying

- **Cause**: `globals.css` not imported in layout or missing Tailwind directives
- **Solution**: Verify `@tailwind` directives present and CSS imported in `layout.tsx`

**Issue**: pnpm install fails

- **Cause**: Node.js version mismatch or missing pnpm
- **Solution**: Verify Node.js and pnpm versions match canonical versions

## Estimated Effort

**Size**: M (4-8h)

## Architecture Decisions

### Consolidated Decisions (reference only)

- [TAD: App Router Structure](/docs/2-technical/2-tad.md#monorepo-structure) - Using `src/app` directory convention
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md) - Package management approach
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Framework selection rationale

### Story-Specific Decisions

None - all decisions are cross-cutting and documented in TAD/ADRs.

## Out of Scope

- **Monorepo/Turborepo Configuration** - Deferred to Epic 1A.1 (Monorepo Foundation)
- **Testing Infrastructure (Vitest)** - Deferred to Epic 1A.3 (Testing Foundation)
- **Health Check Endpoint** - Deferred to S4 (requires Vercel integration context)
- **Environment Variable Validation** - Deferred to S5 (Configure Environment Variables)
- **Component Library (shadcn/ui)** - Deferred to later epics
- **Database Integration** - Deferred to Epic 2A.2 (Database Infrastructure)
- **Authentication** - Deferred to Epic 2A.7 (Auth Infrastructure)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Create GitHub Repository with Branch Protection - Repository must exist to commit code

### Enables (Unblocks These Stories)

- **S3**: Configure Vercel Project Integration - Needs application code to deploy
- **S4**: Implement Health Check Endpoint - Needs application structure to add endpoint

## References

### Epic & TAD References

- [EPIC.md](./EPIC.md)
- [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack)
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)

### ADR References

- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs) | [Tailwind CSS](https://tailwindcss.com/docs) | [pnpm](https://pnpm.io/)

## Verification Checklist

### Pre-Verification

- [x] S1 (GitHub Repository) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [x] Node.js and pnpm installed at specified versions

### Implementation Quality

- [x] All acceptance criteria met
- [x] `pnpm dev` starts without errors
- [x] `pnpm build` completes successfully
- [x] `pnpm lint` passes without errors
- [x] `pnpm type-check` passes without errors
- [x] Homepage renders with Tailwind styling

### Documentation

- [x] README.md updated with getting started instructions
- [x] `.env.example` created with documented variables

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(app): initialize Next.js 16 application`)
- [ ] No unrelated changes included
- [ ] No secrets or `.env.local` committed

## Status

- **State**: Complete
- **PR**: -
- **Completed**: 2025-11-27

## Implementation Notes (Post-Implementation)

### Tailwind CSS 4.x Configuration

Tailwind CSS 4.x requires a different setup than v3:

- Use `@tailwindcss/postcss` instead of `tailwindcss` directly in PostCSS
- Use `@import "tailwindcss";` instead of `@tailwind base/components/utilities` directives
- The `tailwind.config.ts` file is still used for content paths and customizations

### Files Created

| File                  | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| `package.json`        | Root package with Next.js 16, React 19, Tailwind CSS 4, TypeScript 5.x |
| `pnpm-workspace.yaml` | Workspace config for future monorepo expansion                         |
| `tsconfig.json`       | TypeScript strict mode configuration                                   |
| `next.config.ts`      | Minimal Next.js config with React strict mode                          |
| `tailwind.config.ts`  | Tailwind content paths for src directory                               |
| `postcss.config.js`   | PostCSS with @tailwindcss/postcss plugin                               |
| `src/app/layout.tsx`  | Root layout with Inter font and globals.css                            |
| `src/app/page.tsx`    | Homepage with Tailwind styling                                         |
| `src/app/globals.css` | Tailwind v4 import directive                                           |
| `.eslintrc.json`      | ESLint with next/core-web-vitals and typescript                        |
| `.prettierrc`         | Prettier formatting configuration                                      |
| `.prettierignore`     | Files to exclude from formatting                                       |
| `.env.example`        | Environment variable template                                          |

### Dependencies Installed

- **Core**: next@16, react@19, react-dom@19
- **Dev**: <typescript@5.x>, @types/node, @types/react, @types/react-dom
- **Styling**: tailwindcss@4, @tailwindcss/postcss, postcss, autoprefixer
- **Quality**: eslint@8, eslint-config-next, prettier@3
