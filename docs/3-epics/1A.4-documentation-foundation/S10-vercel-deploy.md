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

- [ ] Documentation app deploys to Vercel production from main branch
- [ ] Preview deployments are created automatically for pull requests
- [ ] Deployment completes successfully with all documentation pages
- [ ] Documentation site is accessible at the configured Vercel URL
- [ ] Build caching works correctly with Turborepo integration
- [ ] Deployment status is reported back to GitHub PR checks

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

- [ ] S2 completed and docs app builds locally
- [ ] Vercel account with repository access available
- [ ] All acceptance criteria met
- [ ] Production deployment accessible
- [ ] Preview deployment works for PRs
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
