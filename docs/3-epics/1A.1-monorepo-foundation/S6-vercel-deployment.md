# Story 1A.1.S6: Update Vercel Deployment Configuration

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Monorepo Foundation](./EPIC.md)
- **Depends On**: [S3: Migrate Next.js App](./S3-migrate-nextjs-app.md), [S4: Turbo Pipeline](./S4-turbo-pipeline.md)
- **Blocks**: [S7: Document Monorepo Architecture](./S7-documentation.md)
- **Runs in Parallel With**: [S5: Configure Remote Caching](./S5-remote-caching.md)

## User Story
**As a** developer
**I want** Vercel deployment configured for the monorepo structure with correct root directory and build commands
**So that** the routing app deploys successfully from the new `apps/routing/` workspace location with optimised monorepo builds

## Acceptance Criteria
- [ ] Vercel project settings updated to use `apps/routing` as the root directory
- [ ] Build command uses Turborepo with appropriate filter: `cd ../.. && pnpm turbo run build --filter=@repo/routing...`
- [ ] Install command uses `pnpm install --frozen-lockfile`
- [ ] Output directory is correctly set to `.next`
- [ ] Preview deployments work for pull requests targeting the routing app
- [ ] Production deployment succeeds from the `development` branch
- [ ] Vercel correctly detects the Next.js framework
- [ ] Environment variables are accessible in the deployed application
- [ ] Deployment completes without errors

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `vercel.json` (root) | Monorepo build configuration for Vercel |
| `apps/routing/vercel.json` | App-specific Vercel settings (optional, if root config insufficient) |

### Files to Modify
| Path | Changes |
|------|---------|
| None | Configuration done via Vercel Dashboard and vercel.json |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new package dependencies required. Vercel CLI can be installed globally for local testing:

```bash
pnpm add -g vercel
```

### Configuration Details

> **Note**: This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| Root directory | `apps/routing` for routing app project | [ADR-004](/docs/2-technical/adr/004-vercel-hosting.md) |
| Build command | `cd ../.. && pnpm turbo run build --filter=@repo/routing...` | [ADR-004](/docs/2-technical/adr/004-vercel-hosting.md) |
| Install command | `pnpm install --frozen-lockfile` | [ADR-002](/docs/2-technical/adr/002-pnpm-package-manager.md) |
| Output directory | `.next` | Next.js default |
| Framework preset | Next.js (auto-detected) | [ADR-003](/docs/2-technical/adr/003-nextjs-framework.md) |
| Node.js version | Per [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) | Engine requirements |

**Configuration Rationale**:
- Root directory points to the workspace app location within the monorepo
- Build command navigates to repo root and uses Turborepo filter for correct dependency resolution
- `--filter=@repo/routing...` includes the app and all its dependencies (the `...` suffix)
- `--frozen-lockfile` ensures reproducible builds matching local development
- Next.js framework preset enables Vercel's optimisations (image optimisation, edge functions, ISR)

## Test Requirements

### Manual Verification
- [ ] **Dashboard Configuration**: Verify Vercel project settings show correct root directory and commands
- [ ] **Preview Deployment**: Create a PR with a minor change; verify preview URL is generated and app works
- [ ] **Production Deployment**: Merge to `development` branch; verify production deployment succeeds
- [ ] **Environment Variables**: Verify `NEXT_PUBLIC_*` variables are accessible in the deployed app
- [ ] **Build Logs**: Review Vercel build logs; verify Turborepo is used and cache messages appear

### Automated Tests
N/A - Deployment configuration is verified through Vercel's own build and deployment process.

### Integration Tests
- [ ] Deployed app renders correctly (homepage loads without errors)
- [ ] API routes (if any) respond correctly on deployed environment
- [ ] Static assets are served correctly with proper caching headers

### Verification Commands
```bash
# Verify vercel.json is valid JSON
node -e "require('./vercel.json')"

# Link local project to Vercel (if not already linked)
vercel link

# Test build locally with Vercel
vercel build

# Deploy to preview environment
vercel

# Check deployment status
vercel ls

# Pull environment variables locally for testing
vercel env pull .env.local
```

## Implementation Notes

### Implementation Sequence

1. **Update Vercel Project Settings (Dashboard)**
   - Navigate to Project Settings > General
   - Set Root Directory to `apps/routing`
   - Set Build Command to `cd ../.. && pnpm turbo run build --filter=@repo/routing...`
   - Set Install Command to `pnpm install --frozen-lockfile`
   - Verify Framework Preset is Next.js
   - Set Node.js version per canonical-versions.md

2. **Create Root vercel.json (Optional)**
   - Only if dashboard settings are insufficient
   - Configure build command, install command, and region

3. **Verify Environment Variables**
   - Ensure all required environment variables exist in Vercel project
   - Verify variables are scoped correctly (Production/Preview/Development)

4. **Test Preview Deployment**
   - Create a test branch with a minor change
   - Open a PR to trigger preview deployment
   - Verify preview URL works correctly

5. **Test Production Deployment**
   - Merge changes to `development` branch
   - Verify production deployment succeeds
   - Check deployed app functionality

### Key Concepts
- **Root Directory**: Vercel builds from this directory; must point to the workspace app
- **Turborepo Filter**: `--filter=@repo/routing...` builds the app and all its workspace dependencies
- **Framework Detection**: Vercel auto-detects Next.js and applies optimisations
- **Preview Deployments**: Automatic deployments for PRs with unique URLs

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails with "Cannot find module" | Root directory incorrect | Verify root directory is `apps/routing` |
| pnpm not found | Node version mismatch | Set Node.js version in Vercel settings |
| Turborepo not found | Build command not navigating to root | Ensure build command starts with `cd ../..` |
| Missing dependencies | Install command wrong | Use `pnpm install --frozen-lockfile` |
| Cache not working | Turborepo not enabled | Verify Turborepo remote caching (S5) |

### Reference Materials
- [Vercel Monorepos Guide](https://vercel.com/docs/monorepos)
- [Vercel Project Configuration](https://vercel.com/docs/projects/project-configuration)
- [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo)

## Estimated Effort
**Size**: S (2-4h)

**Breakdown**:
- Dashboard configuration: 0.5h
- vercel.json creation (if needed): 0.5h
- Preview deployment testing: 1h
- Production deployment verification: 0.5h
- Troubleshooting buffer: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Complete Vercel deployment strategy and configuration patterns
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Turborepo build integration with Vercel
- [TAD: Infrastructure](/docs/2-technical/2-tad.md#infrastructure) - Deployment architecture overview

### Story-Specific Decisions

None - all deployment configuration decisions are covered by ADR-004. This story implements the monorepo-specific settings documented there.

## Out of Scope

The following items are explicitly NOT part of this story:

- **Remote Caching Configuration** - Handled in S5; S6 focuses on deployment, not build caching
- **Custom Domain Configuration** - Already configured in Epic 0A.1 (Steel Thread); no changes needed
- **Environment Variable Setup** - Assumes existing environment variables from Epic 0A.1
- **Multiple App Deployments** - Only the routing app; additional apps deployed in future phases
- **CI/CD Pipeline Integration** - Deferred to Epic 1A.5 (Basic CI/CD Pipeline)
- **Edge Functions Configuration** - Future enhancement; not required for initial monorepo deployment
- **Cron Jobs Setup** - Deferred to later phases when background tasks are needed

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S3**: Migrate Next.js App - App must be in `apps/routing/` for Vercel to find it
- **S4**: Turbo Pipeline - Build tasks must be properly configured for Turborepo filter to work

### Enables (Unblocks These Stories)
- **S7**: Documentation - Deployment process can be documented once configuration is verified

## References

### Epic & TAD References
- [EPIC.md: Monorepo Foundation](./EPIC.md)
- [TAD: Infrastructure](/docs/2-technical/2-tad.md#infrastructure)
- [TAD: Deployment Architecture](/docs/2-technical/2-tad.md#deployment-architecture)

### ADR References
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-002: pnpm as Package Manager](/docs/2-technical/adr/002-pnpm-package-manager.md)

### External Documentation
- [Vercel Monorepos Guide](https://vercel.com/docs/monorepos)
- [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo)
- [Vercel Project Configuration](https://vercel.com/docs/projects/project-configuration)

## Verification Checklist

### Pre-Verification
- [ ] S3 and S4 completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Vercel account access available
- [ ] GitHub repository connected to Vercel

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Preview deployment generates working URL
- [ ] Production deployment completes successfully
- [ ] Deployed app renders correctly
- [ ] Build logs show Turborepo execution

### Documentation
- [ ] vercel.json documented (if created)
- [ ] Configuration changes noted for S7 documentation

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
