# Story 3A.1.S1: CDN Application Setup

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: Epic 2A.8 (API Client Package) - Required for file upload utilities
- **Blocks**: S2 (Image Optimisation Pipeline), S3 (Image Transformation API), S4 (Cache Headers), S5 (File Upload Utilities), S6 (Cache Invalidation API)
- **Runs in Parallel With**: None (foundation story)

## User Story

**As a** Platform Engineer
**I want** a CDN application deployed to Vercel with basic configuration
**So that** subsequent stories can build image optimization, transformations, and asset delivery features on a solid foundation

## Acceptance Criteria

- [ ] `/apps/cdn` Next.js application created with App Router structure
- [ ] Application deploys successfully to Vercel
- [ ] Basic health check endpoint returns 200 OK with CDN status
- [ ] Vercel Edge Network configuration is active (global distribution enabled)
- [ ] TypeScript compilation succeeds with no errors
- [ ] All build scripts execute successfully via Turborepo
- [ ] Application is accessible at configured subdomain

## Technical Requirements

### Files to Create

| Path                                    | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| `apps/cdn/package.json`                 | Application dependencies and scripts     |
| `apps/cdn/next.config.js`               | Next.js configuration for CDN            |
| `apps/cdn/tsconfig.json`                | TypeScript configuration                 |
| `apps/cdn/app/layout.tsx`               | Root layout component                    |
| `apps/cdn/app/page.tsx`                 | Home page (minimal landing)              |
| `apps/cdn/app/api/health/route.ts`      | Health check endpoint                    |
| `apps/cdn/.env.local.example`           | Environment variable template            |
| `apps/cdn/README.md`                    | Application documentation                |
| `apps/cdn/public/.gitkeep`              | Public directory placeholder             |
| `apps/cdn/.eslintrc.js`                 | ESLint configuration                     |
| `apps/cdn/vercel.json`                  | Vercel deployment configuration          |

### Files to Modify

| Path                     | Changes                                |
| ------------------------ | -------------------------------------- |
| `turbo.json`             | Add `@repo/apps/cdn#build` task        |
| `pnpm-workspace.yaml`    | Already includes `apps/*` (verify)     |
| `.github/workflows/ci.yml` | Add CDN build to CI workflow (if separate) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/cdn
cd apps/cdn

# Core dependencies
pnpm add next react react-dom

# Development dependencies
pnpm add -D @repo/typescript-config @repo/eslint-config typescript @types/react @types/react-dom @types/node
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting              | Requirement                                   | TAD Reference                                                                              |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Next.js App Router   | Must use App Router (not Pages Router)        | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#next-js-configuration)              |
| Image Optimization   | Enable built-in Next.js image optimization    | [TAD: Asset Optimization](/docs/2-technical/2-tad-cdn.md#image-optimization)               |
| Compression          | Enable Gzip/Brotli compression                | [TAD: Performance Optimization](/docs/2-technical/2-tad-cdn.md#minification--compression) |
| Vercel Region        | Deploy to `iad1` (US East) as origin          | [TAD: Vercel Edge Network](/docs/2-technical/2-tad-cdn.md#network-topology)                |
| Edge Network         | Enable global edge distribution               | [TAD: Vercel Edge Network](/docs/2-technical/2-tad-cdn.md#vercel-edge-network)             |
| Security Headers     | X-Content-Type-Options, X-Frame-Options, etc. | [TAD: Security Considerations](/docs/2-technical/2-tad-cdn.md#security-considerations)     |

**Configuration Rationale**:
- App Router provides better performance with Server Components and streaming
- Image optimization reduces bandwidth costs by 40-60%
- Edge distribution ensures <100ms latency globally
- Security headers prevent common web vulnerabilities

For complete configuration templates, see: [TAD: CDN Configuration](/docs/2-technical/2-tad-cdn.md#configuration)

## Test Requirements

### Manual Verification

- [ ] **Deployment Success**: Navigate to Vercel dashboard and verify deployment is successful with green status
- [ ] **Health Endpoint**: Visit `/api/health` in browser and verify JSON response with status "healthy"
- [ ] **Edge Network**: Use Vercel Analytics to confirm requests are being served from multiple global POPs

### Automated Tests

- [ ] Unit: `app/api/health/route.test.ts` - Health endpoint returns correct JSON structure
- [ ] Unit: `next.config.test.js` - Configuration validates required settings

### Integration Tests

- [ ] Health endpoint responds within 100ms from origin
- [ ] Deployment process completes without errors
- [ ] Application serves static assets from edge network

### Verification Commands

```bash
# Build application locally
cd apps/cdn
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint

# Test health endpoint (after deployment)
curl https://cdn.example.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"2025-11-29T...", "service":"cdn"}
```

## Implementation Notes

### Implementation Sequence

1. **Create Application Structure**
   - Initialize `/apps/cdn` directory
   - Create `package.json` with Next.js dependencies
   - Set up TypeScript configuration extending `@repo/typescript-config`

2. **Configure Next.js**
   - Create `next.config.js` with compression and image settings
   - Set up App Router structure (`app/` directory)
   - Create root layout and minimal home page

3. **Implement Health Check**
   - Create `/api/health` route handler
   - Return JSON with status, timestamp, and service name
   - Ensure response time <100ms

4. **Configure Vercel Deployment**
   - Create `vercel.json` with region and header configuration
   - Set up environment variables (if needed)
   - Configure Turborepo build task

5. **Test and Deploy**
   - Run build and type check locally
   - Deploy to Vercel via git push or CLI
   - Verify health endpoint and global distribution

### Key Concepts

- **Edge Network**: Vercel's global CDN with 40+ POPs that automatically caches and serves static assets from locations closest to users
- **App Router**: Next.js 13+ routing paradigm using the `app/` directory with built-in support for Server Components, streaming, and layouts
- **Health Check Endpoint**: API route that returns application status for monitoring and load balancer health checks

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Next.js Configuration](/docs/2-technical/2-tad-cdn.md#next-js-configuration)
- [TAD: Vercel Configuration](/docs/2-technical/2-tad-cdn.md#vercel-configuration)
- [TAD: Health Check Specification](/docs/2-technical/2-tad-cdn.md#monitoring--analytics)

Key pattern notes for this story:

- Health endpoint should use standard JSON structure with status, timestamp, and service fields
- Image configuration will be enhanced in S2; basic setup suffices here
- Security headers are set via `vercel.json` rather than middleware for performance

### Troubleshooting

| Issue                              | Cause                                     | Solution                                  |
| ---------------------------------- | ----------------------------------------- | ----------------------------------------- |
| Build fails with module not found  | Missing dependency in `package.json`      | Run `pnpm install` and verify imports     |
| TypeScript errors on build         | Config mismatch with monorepo             | Extend `@repo/typescript-config/nextjs.json` |
| Health endpoint returns 404        | Route file not in `app/api/health/`       | Verify file is `route.ts` not `index.ts`  |
| Deployment fails on Vercel         | Invalid `vercel.json` configuration       | Check JSON syntax and required fields     |
| Slow response times                | Not using edge network                    | Verify `vercel.json` has correct region   |

### Reference Materials

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Vercel Edge Network Overview](https://vercel.com/docs/edge-network/overview)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Application scaffolding and configuration: 2h
- Health check endpoint implementation: 1h
- Vercel deployment setup: 2h
- Testing and documentation: 1h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - CDN app follows monorepo structure under `/apps/cdn`
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Deployment platform and edge network provider
- [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#architecture-principles) - Cache-first delivery and immutable assets principles

### Story-Specific Decisions

#### AD-3A.1.S1.1: Health Endpoint Response Format

**Scope**: Story-specific (does not affect other stories)

**Decision**: Health endpoint returns a simple JSON object with `{status, timestamp, service}` fields rather than a comprehensive health check with dependency status.

**Rationale**:
- S1 establishes foundation only; comprehensive health checks not yet needed
- No external dependencies (database, cache, auth) exist at this stage
- Keeps implementation simple and fast (<100ms response)
- Can be enhanced later when dependencies are added

**Consequences**:
- Health endpoint is functional but minimal
- Later stories may need to extend health check with dependency status
- Current implementation meets monitoring requirements for basic uptime checks

**Alternatives Considered**:
- **Comprehensive health check**: Include database, cache, and auth status - Rejected because these dependencies don't exist yet in S1
- **Static JSON file**: Serve health status from static file - Rejected because dynamic endpoint allows future enhancements

## Out of Scope

The following items are explicitly NOT part of this story:

- **Image Optimization Pipeline** - Handled in S2 (Image Optimisation Pipeline)
- **Image Transformation API** - Handled in S3 (Image Transformation API)
- **Cache Headers Configuration** - Handled in S4 (Cache Headers and Content-Hash URLs)
- **File Upload Functionality** - Handled in S5 (File Upload Utilities)
- **Cache Invalidation API** - Handled in S6 (Cache Invalidation API)
- **Comprehensive Health Checks** - Current endpoint is minimal; enhanced checks deferred until dependencies exist
- **Custom Domain Configuration** - DNS and domain setup assumed to be handled via Vercel dashboard
- **Asset Management UI** - Deferred to Epic 3B.6 (Authenticated Tools)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **Epic 2A.8**: API Client Package - Provides type-safe HTTP client for file upload utilities (used in S5)

### Enables (Unblocks These Stories)

- **S2**: Image Optimisation Pipeline - Requires Next.js app and configuration from S1
- **S3**: Image Transformation API - Requires API route structure from S1
- **S4**: Cache Headers and Content-Hash URLs - Requires Next.js config and build system from S1
- **S5**: File Upload Utilities - Requires application structure and dependencies from S1
- **S6**: Cache Invalidation API - Requires API route structure from S1

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: CDN Architecture (Detailed)](/docs/2-technical/2-tad-cdn.md)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing)

## Verification Checklist

### Pre-Verification

- [ ] Epic 2A.8 (API Client Package) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Vercel account access available

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Build succeeds via Turborepo

### Documentation

- [ ] Code comments where logic isn't self-evident
- [ ] README created with setup instructions
- [ ] Architecture decisions documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): initialize CDN application`)
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
