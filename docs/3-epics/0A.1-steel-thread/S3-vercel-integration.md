# Story 0A.1.S3: Configure Vercel Project Integration

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S1: Create GitHub Repository with Branch Protection](./S1-github-repository.md)
- **Blocks**: [S4: Implement Health Check Endpoint](./S4-health-endpoint.md), [S5: Configure Environment Variables](./S5-environment-variables.md)
- **Runs in Parallel With**: [S2: Create Minimal Next.js 16 Application](./S2-nextjs-app.md) (after S1 completes)

## User Story
**As a** developer
**I want** a Vercel project connected to the GitHub repository with automatic deployments
**So that** code changes are automatically deployed to preview and production environments with SSL

## Acceptance Criteria
- [ ] Vercel project created and linked to GitHub repository
- [ ] Production deployments trigger on push to `development` branch
- [ ] Preview deployments generate unique URLs for each PR
- [ ] SSL certificates auto-provisioned for Vercel domains
- [ ] Preview deployment URL appears as comment on PR within 2 minutes
- [ ] Build command uses pnpm and Next.js defaults
- [ ] Node.js version in Vercel matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `vercel.json` | Vercel project configuration (optional, only if defaults insufficient) |

### Files to Modify
| Path | Changes |
|------|---------|
| `README.md` | Add deployment status badge and preview URL information |

### Dependencies
No package dependencies - infrastructure configuration via Vercel dashboard and GitHub integration.

### Configuration Details

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Framework Preset | Next.js (auto-detected) | [TAD: Vercel Configuration](/docs/2-technical/2-tad-steel-thread-deployment.md#vercel-project-configuration) |
| Production Branch | `development` | [TAD: Vercel Configuration](/docs/2-technical/2-tad-steel-thread-deployment.md#vercel-project-configuration) |
| Node.js Version | Per canonical-versions.md | [Canonical Versions](/docs/2-technical/references/canonical-versions.md) |
| Install Command | `pnpm install` | [TAD: Vercel Configuration](/docs/2-technical/2-tad-steel-thread-deployment.md#vercel-project-configuration) |

## Test Requirements

### Manual Verification
- [ ] **Production Deploy**: Push to `development` triggers deployment in Vercel dashboard
- [ ] **Preview Deploy**: Test PR generates preview URL and comment on PR
- [ ] **SSL Valid**: Access preview URL via HTTPS, certificate is valid
- [ ] **Build Success**: pnpm install and Next.js build complete without errors

### Verification Commands
```bash
# Check deployment status via GitHub CLI
gh pr view --json statusCheckRollup

# Verify SSL certificate
curl -I https://<preview-url> | grep -i "HTTP/2 200"
```

## Implementation Notes

### Key Concepts
- **Preview Deployments**: Every PR gets a unique URL for testing before merge
- **Production Deployments**: Automatic deployment on merge to `development`
- **Zero-Config**: Vercel auto-detects Next.js settings; minimal configuration required

### Common Patterns
Reference [TAD: Vercel Project Configuration](/docs/2-technical/2-tad-steel-thread-deployment.md#vercel-project-configuration) for setup details.

### Troubleshooting

**Issue**: Build fails with "pnpm not found"
- **Solution**: Set Install Command to `pnpm install` in Vercel dashboard

**Issue**: Preview deployment not triggering
- **Solution**: Reinstall Vercel GitHub App with full repository access

**Issue**: Node.js version mismatch
- **Solution**: Set Node.js version in Project Settings → General

## Estimated Effort
**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions (reference only)
- [TAD: Vercel Configuration](/docs/2-technical/2-tad-steel-thread-deployment.md#vercel-project-configuration) - Deployment settings
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Platform selection

## Out of Scope
- **Custom Domain Configuration** - Vercel default domains sufficient for steel thread
- **Environment Variables** - Deferred to S5
- **Deployment Protection Rules** - Not required for MVP
- **Edge Config / KV Storage** - Deferred to later epics

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S1**: GitHub Repository - Repository must exist to import into Vercel

### Enables (Unblocks These Stories)
- **S4**: Health Check Endpoint - Needs deployment infrastructure
- **S5**: Environment Variables - Needs Vercel project to configure

## References

### Epic & TAD References
- [EPIC.md](./EPIC.md)
- [TAD: Steel Thread](/docs/2-technical/2-tad-steel-thread-deployment.md)

### ADR References
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation
- [Vercel Git Integration](https://vercel.com/docs/git)
- [Vercel Next.js Guide](https://vercel.com/docs/frameworks/nextjs)

## Verification Checklist

### Pre-Verification
- [ ] S1 (GitHub Repository) completed
- [ ] Vercel account created

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Production deployment succeeds on `development` push
- [ ] Preview deployment generates URL on PR creation
- [ ] SSL certificate valid

### Git Hygiene
- [ ] If `vercel.json` created, conventional commit message used
- [ ] No secrets committed

## Status
- **State**: Ready for Vercel Dashboard Setup
- **PR**: -
- **Completed**: -

## Vercel Dashboard Setup Instructions

The following steps must be completed manually in the Vercel dashboard:

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Connect to GitHub if not already connected
5. Find and import `mikerkeating/next-js-01`

### Step 2: Configure Project Settings

During import or in Project Settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `.` (project root) |
| **Build Command** | `pnpm build` (from vercel.json) |
| **Install Command** | `pnpm install` (from vercel.json) |
| **Node.js Version** | 24.x |

### Step 3: Configure Git Integration

In **Project Settings** → **Git**:

1. Set **Production Branch** to `development`
2. Enable **Preview Deployments** for all branches
3. Enable **Comments on Pull Requests**

### Step 4: Verify GitHub App Permissions

Ensure the Vercel GitHub App has:
- Read access to code
- Write access to pull requests (for comments)
- Write access to deployments

### Step 5: Test Deployment

1. Push any change to `development` branch
2. Verify deployment starts in Vercel dashboard
3. Create a test PR to verify preview deployment
4. Check that preview URL comment appears on PR

### Verification After Setup

Once Vercel dashboard setup is complete, mark the following as checked:

- [ ] Vercel project imported from GitHub
- [ ] Node.js version set to 24.x
- [ ] Production branch set to `development`
- [ ] Preview deployments enabled
- [ ] Test deployment to `development` succeeds
- [ ] Test PR creates preview deployment with URL comment
- [ ] SSL certificate auto-provisioned (check HTTPS works)

## Completion Notes

### Summary

Created `vercel.json` configuration file to specify pnpm as the package manager and added HSTS security header. Updated `README.md` with Vercel deployment badge and preview deployment documentation. The remaining work requires manual Vercel dashboard configuration which is documented above.

### Files Changed

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel project configuration with pnpm install/build commands and HSTS header |
| `README.md` | Added deployment badge and preview deployment documentation |
| `docs/3-epics/0A.1-steel-thread/S3-vercel-integration.md` | Added Vercel dashboard setup instructions |

### Implementation Notes

This story is primarily infrastructure configuration via the Vercel dashboard. The code changes provide:

1. **vercel.json**: Ensures Vercel uses pnpm for install/build and adds HSTS security header
2. **README.md updates**: Documents deployment workflow for developers

The manual Vercel dashboard steps must be completed to fully satisfy all acceptance criteria. The checklist above tracks completion of those manual steps.

### Known Issues

None - straightforward infrastructure configuration.
