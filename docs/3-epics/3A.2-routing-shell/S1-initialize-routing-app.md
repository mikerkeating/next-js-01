# Story 3A.2.S1: Initialize Routing Application

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: Epic 3A.1 (CDN & Asset Management Application), Epic 2A.8 (API Client Package)
- **Blocks**: S2 (Rewrite Configuration Framework), S3 (SEO Utilities), S4 (Analytics Integration), S5 (CDN Asset References)
- **Runs in Parallel With**: None (foundation story)

## User Story

**As a** Platform Engineer
**I want** a routing application deployed to Vercel with Next.js 16 App Router
**So that** subsequent stories can build rewrite framework, SEO utilities, analytics, and CDN integration on a solid foundation

## Acceptance Criteria

- [ ] `/apps/routing` Next.js application created with App Router structure
- [ ] Application deploys successfully to Vercel
- [ ] Health check endpoint returns 200 OK with routing service status
- [ ] TypeScript compilation succeeds with no errors
- [ ] All build scripts execute successfully via Turborepo
- [ ] Application serves a minimal home page with proper HTML structure
- [ ] Application is accessible at configured primary domain

## Technical Requirements

### Files to Create

| Path                                   | Purpose                                   |
| -------------------------------------- | ----------------------------------------- |
| `apps/routing/package.json`            | Application dependencies and scripts      |
| `apps/routing/next.config.js`          | Next.js configuration for routing app     |
| `apps/routing/tsconfig.json`           | TypeScript configuration                  |
| `apps/routing/app/layout.tsx`          | Root layout component                     |
| `apps/routing/app/page.tsx`            | Home page (minimal landing)               |
| `apps/routing/app/api/health/route.ts` | Health check endpoint                     |
| `apps/routing/.env.local.example`      | Environment variable template             |
| `apps/routing/README.md`               | Application documentation                 |
| `apps/routing/public/.gitkeep`         | Public directory placeholder              |
| `apps/routing/.eslintrc.js`            | ESLint configuration                      |
| `apps/routing/vercel.json`             | Vercel deployment configuration           |
| `apps/routing/middleware.ts`           | Edge middleware entry point (placeholder) |

### Files to Modify

| Path                       | Changes                                        |
| -------------------------- | ---------------------------------------------- |
| `turbo.json`               | Add `@repo/apps/routing#build` task            |
| `pnpm-workspace.yaml`      | Already includes `apps/*` (verify)             |
| `.github/workflows/ci.yml` | Add routing build to CI workflow (if separate) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/routing
cd apps/routing

# Core dependencies
pnpm add next react react-dom

# Development dependencies
pnpm add -D @repo/typescript-config @repo/eslint-config typescript @types/react @types/react-dom @types/node
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting              | Requirement                                   | TAD Reference                                                                  |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| Next.js App Router   | Must use App Router (not Pages Router)        | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)     |
| Server Components    | Default to Server Components                  | [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)   |
| TypeScript Strict    | Enable strict mode                            | [TAD: Technology Stack](/docs/2-technical/2-tad.md#technology-stack)           |
| ESLint Configuration | Extend `@repo/eslint-config`                  | [Coding Standards](/docs/2-technical/references/coding-standards.md)           |
| Vercel Edge Network  | Enable global edge distribution               | [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)         |
| Security Headers     | X-Content-Type-Options, X-Frame-Options, etc. | [TAD: Security Architecture](/docs/2-technical/2-tad.md#security-architecture) |

**Configuration Rationale**:

- App Router provides better performance with Server Components and streaming SSR
- Server Components reduce client bundle size and improve initial page load
- Strict TypeScript mode catches more errors at compile time
- Edge network ensures low latency globally for all routing operations

For complete configuration templates, see: [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)

## Test Requirements

### Manual Verification

- [ ] **Deployment Success**: Navigate to Vercel dashboard and verify deployment is successful with green status
- [ ] **Health Endpoint**: Visit `/api/health` in browser and verify JSON response with status "healthy"
- [ ] **Home Page Rendering**: Visit root URL and verify minimal home page renders with proper HTML structure
- [ ] **TypeScript Compilation**: Run `pnpm type-check` and verify no errors
- [ ] **Build Success**: Run `pnpm build` and verify successful build output

### Automated Tests

- [ ] Unit: `app/api/health/route.test.ts` - Health endpoint returns correct JSON structure
- [ ] Unit: `app/page.test.tsx` - Home page renders without errors
- [ ] Unit: `next.config.test.js` - Configuration validates required settings

### Integration Tests

- [ ] Health endpoint responds within 100ms from origin
- [ ] Deployment process completes without errors
- [ ] Application serves pages from Vercel Edge Network
- [ ] TypeScript compilation succeeds in CI/CD pipeline

### Verification Commands

```bash
# Build application locally
cd apps/routing
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint

# Run development server
pnpm dev

# Test health endpoint (after local dev server starts)
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"2025-11-29T...", "service":"routing"}

# Build from workspace root
pnpm --filter @repo/routing build
```

## Implementation Notes

### Implementation Sequence

1. **Create Application Structure**
   - Initialize `/apps/routing` directory
   - Create `package.json` with Next.js 16 dependencies
   - Set up TypeScript configuration extending `@repo/typescript-config`

2. **Configure Next.js**
   - Create `next.config.js` with App Router settings
   - Set up App Router structure (`app/` directory)
   - Create root layout with basic HTML structure and metadata
   - Create minimal home page component

3. **Implement Health Check**
   - Create `/api/health` route handler
   - Return JSON with status, timestamp, and service name
   - Ensure response time <100ms

4. **Set Up Middleware Placeholder**
   - Create `middleware.ts` with basic structure
   - Export empty config to prepare for rewrite framework in S2

5. **Configure Build System**
   - Update `turbo.json` to include routing app build task
   - Verify `pnpm-workspace.yaml` includes `apps/*`
   - Add routing app to CI/CD workflow

6. **Configure Vercel Deployment**
   - Create `vercel.json` with deployment settings
   - Configure edge network settings
   - Set environment variables template

7. **Create Documentation**
   - Write comprehensive README with setup instructions
   - Document environment variables
   - Add getting started guide

### Key Concepts

- **Next.js App Router**: Modern routing system with Server Components, streaming, and improved performance
- **Server Components**: Default component type that renders on server, reducing client bundle size
- **Edge Middleware**: Lightweight functions that run on Vercel Edge Network before requests reach the application
- **Turborepo Tasks**: Monorepo build orchestration with caching and parallelization

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Next.js App Router Structure](/docs/2-technical/2-tad.md#system-architecture)
- [TAD: Health Check Pattern](/docs/2-technical/2-tad-steel-thread-deployment.md#health-check-specification)
- [TAD: Vercel Configuration](/docs/2-technical/2-tad.md#infrastructure)

Key pattern notes for this story:

- Use Server Components by default; only add `"use client"` when interactivity is required
- Health check should be lightweight and respond in <100ms
- Middleware file is a placeholder for S2 rewrite framework implementation

### Troubleshooting

| Issue                               | Cause                                 | Solution                                              |
| ----------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| Build fails with module not found   | Missing workspace dependencies        | Run `pnpm install` from workspace root                |
| TypeScript errors in Next.js config | Using .ts instead of .js for config   | Use `next.config.js` (JavaScript file)                |
| App Router routes not working       | Using Pages Router structure          | Ensure using `app/` directory, not `pages/`           |
| Vercel deployment fails             | Missing vercel.json or invalid config | Validate vercel.json syntax and deployment settings   |
| Health endpoint returns 404         | Route handler not in correct location | Ensure file is at `app/api/health/route.ts`           |
| Middleware not executing            | middleware.ts not in root or invalid  | Place middleware.ts in app root, export config object |

### Reference Materials

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Turborepo Task Configuration](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Application structure setup: 1h
- Next.js configuration: 1h
- Health endpoint and home page: 1h
- Build system integration: 1h
- Vercel deployment configuration: 1h
- Documentation and testing: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Framework choice for all applications
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md) - Hosting platform with edge network
- [TAD: App Router vs Pages Router](/docs/2-technical/2-tad.md#system-architecture) - Use App Router exclusively

### Story-Specific Decisions

#### AD-3A.2.S1.1: Minimal Home Page Content

**Scope**: Story-specific (does not affect other stories)

**Decision**: The initial home page will contain only a minimal "Coming Soon" message without product-specific content or navigation.

**Rationale**:

- This is a foundation story focused on infrastructure setup
- Product-specific routes and content are handled in Epic 3B.3 (Routing Configuration)
- Separation of concerns: routing shell infrastructure vs. product routes
- Prevents scope creep and keeps story focused

**Consequences**:

- Home page will need to be updated in Epic 3B.3 with actual product routing logic
- Initial deployment will have a basic landing page
- Clear separation between infrastructure setup and product implementation

**Alternatives Considered**:

- **Option 1**: Include basic navigation and product links - Rejected because product routes are out of scope for this epic
- **Option 2**: Empty page with no content - Rejected because it would fail accessibility and SEO requirements

#### AD-3A.2.S1.2: Middleware Placeholder Implementation

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create `middleware.ts` with minimal placeholder structure rather than implementing full middleware logic in this story.

**Rationale**:

- Middleware configuration framework is the responsibility of S2
- This story focuses on application initialization and deployment
- Placeholder allows file structure to be complete while deferring implementation
- Prevents premature implementation of features belonging to dependent stories

**Consequences**:

- Middleware file exists but doesn't perform any routing logic until S2
- S2 will add rewrite configuration logic to the placeholder
- Clear dependency: S1 creates structure, S2 implements functionality

**Alternatives Considered**:

- **Option 1**: No middleware file in S1 - Rejected because S2 would need to modify file structure, creating confusion
- **Option 2**: Implement basic rewrites in S1 - Rejected because it violates story boundaries and S2 scope

## Out of Scope

The following items are explicitly NOT part of this story:

- **Rewrite Configuration Framework** - Handled in S2 (Rewrite Configuration Framework)
- **SEO Meta Tags and Utilities** - Handled in S3 (SEO Utilities)
- **Analytics Integration** - Handled in S4 (Analytics Integration)
- **CDN Asset References** - Handled in S5 (CDN Asset References)
- **Product-Specific Routes** - Handled in Epic 3B.3 (Routing Configuration)
- **Authentication Middleware** - Handled in Epic 2A.7 (Auth Infrastructure)
- **Organization Context Middleware** - Handled in Epic 2B.6 (Product Middleware)
- **Responsive Shell Layout** - Handled in S6 (Responsive Shell Layout)
- **Comprehensive Testing Suite** - Handled in S7 (Testing and Documentation)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **Epic 3A.1**: CDN & Asset Management Application - Provides asset delivery infrastructure that routing app will reference
- **Epic 2A.8**: API Client Package - Provides HTTP client utilities for future server-side data fetching

### Enables (Unblocks These Stories)

- **S2**: Rewrite Configuration Framework - Requires routing app foundation and middleware placeholder
- **S3**: SEO Utilities - Requires Next.js app structure and layout components
- **S4**: Analytics Integration - Requires application framework and layout for analytics provider
- **S5**: CDN Asset References - Requires Next.js configuration to integrate with CDN
- **S6**: Responsive Shell Layout - Requires complete application with all middleware and utilities

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)
- [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md)
- [TAD: Steel Thread & Deployment](/docs/2-technical/2-tad-steel-thread-deployment.md)

### ADR References

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments)
- [Turborepo Running Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)

## Verification Checklist

### Pre-Verification

- [ ] Epic 3A.1 (CDN & Asset Management Application) completed
- [ ] Epic 2A.8 (API Client Package) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Node.js 24.x LTS installed
- [ ] pnpm 10.x installed

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully with strict mode
- [ ] Health endpoint responds in <100ms
- [ ] Application deploys successfully to Vercel
- [ ] Edge Network configuration verified

### Documentation

- [ ] README.md created with setup instructions
- [ ] Environment variables documented in .env.local.example
- [ ] Code comments added where logic isn't self-evident
- [ ] Architecture decisions documented in this story

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `feat(3A.2.S1): initialize routing application`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Sample Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T12:34:56.789Z",
  "service": "routing",
  "version": "1.0.0",
  "uptime": 123456
}
```

## Appendix B: Minimal Home Page Structure

The home page should render a simple, accessible HTML structure:

- Proper semantic HTML5 elements
- h1 heading: "MK3 Platform"
- Paragraph: "Routing application - Coming soon"
- Footer with copyright notice
- WCAG 2.1 Level AA compliant
- Mobile responsive (320px - 2560px viewport range)
