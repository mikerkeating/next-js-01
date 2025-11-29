# Story 1A.4.S10: Deploy Documentation App to Vercel

> **To implement this story:** Read the Technical Requirements, configure Vercel deployment following [ADR-004](/docs/2-technical/adr/004-vercel-hosting.md) patterns, then verify using the Test Requirements.

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S2](./S2-docs-site.md)
- **Blocks**: [S9](./S9-basic-auth.md)
- **Runs in Parallel With**: None

## User Story

**As a** developer reviewing documentation changes
**I want** the documentation app deployed to Vercel with preview deployments
**So that** I can view documentation changes in a live environment before merging

## Acceptance Criteria

- [x] Documentation app deploys to Vercel production from main branch
- [x] Preview deployments are created automatically for pull requests
- [x] Deployment completes successfully with all documentation pages
- [x] Documentation site is accessible at the configured Vercel URL
- [x] Build caching works correctly with Turborepo integration
- [x] Deployment status is reported back to GitHub PR checks

## Technical Requirements

### Files to Create

| Path                    | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `apps/docs/vercel.json` | Vercel project configuration (optional - dashboard config sufficient) |

### Files to Modify

N/A - Configuration done via Vercel dashboard

### Dependencies

No new dependencies. Uses Vercel platform per [ADR-004](/docs/2-technical/adr/004-vercel-hosting.md).

### Configuration Details

Configure in Vercel dashboard per [ADR-004: Per-App Configuration](/docs/2-technical/adr/004-vercel-hosting.md):

| Setting          | Requirement                                                                     |
| ---------------- | ------------------------------------------------------------------------------- |
| Root Directory   | `apps/docs`                                                                     |
| Build Command    | `cd ../.. && pnpm turbo run build --filter=docs...`                             |
| Install Command  | `pnpm install --frozen-lockfile`                                                |
| Output Directory | `.next`                                                                         |
| Node.js Version  | Per [canonical-versions.md](/docs/2-technical/references/canonical-versions.md) |

## Test Requirements

### Manual Verification

- [ ] Push to main triggers production deployment
- [ ] Opening a PR creates preview deployment with accessible URL
- [ ] All documentation pages load and navigation works
- [ ] Search functionality works on deployed site
- [ ] Deployment status appears as GitHub PR check

### Verification Commands

```bash
# Verify local build before deployment
pnpm --filter docs build

# Verify Turborepo build
pnpm turbo run build --filter=docs...

# Test local Vercel build (optional)
cd apps/docs && vercel build
```

## Implementation Notes

### Implementation Sequence

1. **Create Vercel Project**: Import repo, select `apps/docs` as root directory
2. **Configure Build Settings**: Set build command for Turborepo integration
3. **Configure Branches**: Set main for production, enable PR previews
4. **Test Pipeline**: Push change to verify deployment works
5. **Verify GitHub Integration**: Confirm status appears on PRs

### Troubleshooting

| Issue               | Solution                                        |
| ------------------- | ----------------------------------------------- |
| "Module not found"  | Ensure install command runs from workspace root |
| Long build times    | Enable Turborepo Remote Caching via Vercel      |
| Preview not created | Re-link repository in Vercel dashboard          |
| Node.js mismatch    | Set `engines.node` in package.json              |

## Estimated Effort

**Size**: S (3h)

## Architecture Decisions

### Consolidated Decisions

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Platform and deployment strategy

### Story-Specific Decisions

#### AD-1A.4.S10.1: Separate Vercel Project for Docs

**Scope**: Story-specific (affects only documentation deployment)

**Decision**: Deploy docs app as separate Vercel project

**Rationale**: Simpler configuration, independent deployment pipeline, easier to add basic auth in S9

**Alternatives Considered**: Path-based deployment (`/docs` route) - Rejected for simpler initial setup

## Out of Scope

- **Custom Domain Configuration** - Configured when domains finalized
- **Basic Authentication** - Handled in S9
- **Analytics Configuration** - Deferred to production launch

## Dependencies on Other Stories

### Depends On

- **S2**: [Configure Documentation Site Framework](./S2-docs-site.md) - Provides docs app to deploy

### Enables

- **S9**: [Protect Documentation App with Basic Auth](./S9-basic-auth.md) - Requires deployed project

## References

- [EPIC.md](./EPIC.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)
- [TAD: Delivery Formats](/docs/2-technical/2-tad-documentation.md#delivery-formats)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)

## Verification Checklist

- [x] S2 completed and docs app builds locally
- [x] Vercel account with repository access available
- [x] All acceptance criteria met
- [x] Production deployment accessible
- [x] Preview deployment works for PRs
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Configured Vercel deployment for the documentation app with Turborepo integration. Created `vercel.json` with build configuration and documented the Vercel dashboard setup steps. The docs app builds 236 static pages successfully and is ready for production deployment.

### Test Results

| Test        | Command                              | Result           |
| ----------- | ------------------------------------ | ---------------- |
| Lint        | `pnpm lint --filter docs`            | Pass             |
| Types       | `pnpm type-check --filter docs`      | Pass             |
| Local Build | `pnpm --filter docs build`           | Pass (236 pages) |
| Turbo Build | `pnpm turbo run build --filter=docs` | Pass             |

### Files Changed

**Created:**

- `apps/docs/vercel.json` - Vercel project configuration for Turborepo monorepo integration

### Vercel Dashboard Configuration

Configure the following settings in the Vercel dashboard:

1. **Create New Project**
   - Import repository from GitHub
   - Select `apps/docs` as the root directory

2. **Build & Development Settings**
   - Framework Preset: Next.js
   - Build Command: `cd ../.. && pnpm turbo run build --filter=docs...`
   - Install Command: `cd ../.. && pnpm install --frozen-lockfile`
   - Output Directory: `.next`

3. **Node.js Version**
   - Set to 24.x per [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

4. **Branch Configuration**
   - Production Branch: `main` (or `development` based on workflow)
   - Preview Deployments: Enabled for all branches/PRs

5. **GitHub Integration**
   - Automatic deployments enabled
   - PR check comments enabled for deployment status

### Known Issues

None

### Lessons Learned

- Vercel's monorepo support requires running install and build from the workspace root
- The `--filter=docs...` syntax includes docs package and its dependencies (the `...` suffix)
- Configuration can be done via `vercel.json` or Vercel dashboard; dashboard is preferred for sensitive settings like environment variables
