# MK3 Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mikerkeating/next-js-01)

A Next.js 16 application built with TypeScript, React 19, and Tailwind CSS 4.

## Quick Start

Get running locally in under 5 minutes:

```bash
# Clone and enter directory
git clone https://github.com/mikerkeating/next-js-01.git
cd next-js-01

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Prerequisites

- **Node.js**: 24.x LTS (see `.nvmrc`)
- **pnpm**: 10.x (`npm install -g pnpm@10`)

For exact version constraints, see [canonical-versions.md](/docs/2-technical/references/canonical-versions.md).

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mikerkeating/next-js-01.git
cd next-js-01
```

### 2. Install Dependencies

```bash
pnpm install
```

Expected output: `Done in X.Xs`

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. For local development, the default `NEXT_PUBLIC_APP_URL=http://localhost:3000` is sufficient.

See [Environment Variables](#environment-variables) for details on all variables.

### 4. Start Development Server

```bash
pnpm dev
```

Expected output:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
✓ Starting...
✓ Ready in Xs
```

### 5. Verify Installation

```bash
# In a new terminal
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"healthy","timestamp":"...","version":"0.1.0"}
```

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm test` | Run tests |
| `pnpm test:e2e:smoke` | Run Playwright smoke tests |

### Quality Checks

Run before committing:

```bash
pnpm lint          # Must pass with 0 errors, 0 warnings
pnpm type-check    # Must pass with 0 errors
pnpm test          # Must pass all tests
pnpm build         # Must complete successfully
```

## Environment Variables

This project uses [@t3-oss/env-nextjs](https://env.t3.gg/docs/nextjs) for type-safe environment variable validation. Variables are validated at build time using Zod schemas.

### Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values

3. The required variable for local development is:
   - `NEXT_PUBLIC_APP_URL` - Your application URL (default: `http://localhost:3000`)

### Variable Categories

| Category | Required | Description |
|----------|----------|-------------|
| Application | Yes | Base URL for the application |
| Basic Auth | No | Pre-release access protection |
| Database | Future | PostgreSQL connection via Neon/Supabase |
| Authentication | Future | Clerk authentication keys |
| Analytics | No | PostHog product analytics |
| Monitoring | No | Sentry error tracking |

### Build-Time Validation

Environment variables are validated when the application builds. If a required variable is missing or malformed, the build will fail with a descriptive error.

To skip validation during CI builds without secrets:
```bash
SKIP_ENV_VALIDATION=true pnpm build
```

### Server vs Client Variables

- **Server variables**: Only available in server-side code (API routes, Server Components)
- **Client variables**: Must be prefixed with `NEXT_PUBLIC_` and are safe to expose in the browser

### Usage in Code

```typescript
import { env } from "@/env";

// Type-safe access to validated variables
const appUrl = env.NEXT_PUBLIC_APP_URL;
```

## Basic Authentication

For pre-release deployments, basic HTTP authentication can be enabled to protect the application from unauthorized access.

### Enabling Basic Auth

Set the following environment variables in your deployment:

```bash
BASIC_AUTH_USERNAME=your-username
BASIC_AUTH_PASSWORD=your-secure-password
```

When both variables are set, all routes (except health check and static assets) will require authentication.

### Behavior

| Scenario | Result |
|----------|--------|
| Variables not set | Auth disabled (convenient for local dev) |
| Both variables set | Auth enabled, browser prompts for credentials |
| Invalid credentials | 401 Unauthorized, re-prompts |
| Valid credentials | Access granted |

### Bypassed Routes

The following routes bypass authentication:

- `/api/health` - Health check endpoint (for monitoring services)
- `/_next/*` - Next.js static assets
- `/favicon.ico` - Favicon
- Static files (`.svg`, `.png`, `.jpg`, etc.)

### Testing Basic Auth

```bash
# Test without credentials (should return 401 when auth enabled)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

# Test with credentials (should return 200)
curl -s -o /dev/null -w "%{http_code}" -u "username:password" http://localhost:3000/

# Health endpoint always bypasses auth
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
```

### Vercel Configuration

To enable basic auth on Vercel deployments:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`
4. Select the environments to protect (Preview, Production, or both)
5. Redeploy for changes to take effect

## API Endpoints

### Health Check

**Endpoint**: `GET /api/health`

Returns application health status for monitoring and uptime services.

**Response Format**:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-27T12:00:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 5,
      "lastChecked": "2025-11-27T12:00:00.000Z"
    },
    "auth": {
      "status": "ok",
      "responseTime": 3,
      "lastChecked": "2025-11-27T12:00:00.000Z"
    },
    "cache": {
      "status": "ok",
      "responseTime": 1,
      "lastChecked": "2025-11-27T12:00:00.000Z"
    }
  },
  "uptime": 3600
}
```

**Status Values**:
- `healthy`: All systems operational
- `degraded`: Some systems experiencing issues but functional
- `unhealthy`: Critical systems unavailable

**HTTP Status Codes**:
- `200 OK`: System is healthy or degraded
- `503 Service Unavailable`: System is unhealthy

**Usage**:

```bash
# Check health locally
curl http://localhost:3000/api/health

# Check response time
curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/api/health
```

## Smoke Tests

Automated smoke tests validate deployments using Playwright. These tests run against any deployment URL to verify critical functionality works.

### Running Smoke Tests

```bash
# Run against local development server
pnpm dev &
pnpm test:e2e:smoke

# Run against a specific deployment URL
BASE_URL=https://preview-url.vercel.app pnpm test:e2e:smoke

# View HTML test report
npx playwright show-report
```

### What Smoke Tests Verify

- Health endpoint returns 200 OK with "healthy" status
- Homepage loads successfully with correct title
- No console errors on page load
- Static assets and metadata load correctly
- Page responds within acceptable time

### Test Reports

Test results are output to:
- `playwright-report/` - HTML report (open with `npx playwright show-report`)
- `test-results/` - Test artifacts (screenshots on failure)

### First-Time Setup

Install Playwright browsers:
```bash
npx playwright install chromium
```

## Deployment

This project uses a fully automated CI/CD pipeline with Vercel for hosting.

### Pipeline Overview

```
Developer → Git Push → GitHub Actions CI → Vercel Deploy → Production
                ↓              ↓                ↓
           PR Created    Lint/Test/Build   Preview URL
                ↓              ↓                ↓
           Code Review    E2E Smoke Tests   PR Comment
                ↓              ↓                ↓
             Merge     All Checks Pass    Auto-Deploy
```

### Vercel Integration

**Production**: Deploys automatically on push to `development` branch

**Preview Deployments**: Each pull request receives a unique preview URL

When you create a pull request:
1. Vercel automatically builds and deploys a preview
2. A unique URL is generated (format: `project-branch-team.vercel.app`)
3. The preview URL is posted as a comment on the PR
4. SSL certificates are automatically provisioned

### GitHub Actions CI

The CI workflow (`.github/workflows/ci.yml`) runs on every PR and push to `development`:

| Job | Description | Runs On |
|-----|-------------|---------|
| `lint` | ESLint code validation | PR + Push |
| `type-check` | TypeScript compilation | PR + Push |
| `test` | Unit/integration tests | PR + Push |
| `build` | Production build | PR + Push |
| `e2e-smoke` | Playwright smoke tests | PR only |

All jobs run in parallel for faster feedback. E2E smoke tests wait for Vercel preview deployment before running.

### Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | Local | `localhost:3000` | Local development |
| Preview | Any PR | `*.vercel.app` | PR review and testing |
| Production | `development` | Production URL | Live application |

### Rollback Procedure

**Via Vercel Dashboard** (Recommended - instant rollback):
1. Navigate to Vercel project dashboard
2. Go to "Deployments" tab
3. Find previous successful deployment
4. Click "..." menu → "Promote to Production"
5. Confirm rollback

**Via Git** (triggers new deployment):
```bash
# Revert last commit
git revert HEAD
git push origin development

# Or revert to specific commit
git revert <commit-hash>
git push origin development
```

**Maximum Downtime Target**: 5 minutes for critical issues

## Branch Strategy

| Branch | Purpose | Protection |
|--------|---------|------------|
| `development` | Production branch | Protected - requires PR |
| `feature/*` | New features | None |
| `fix/*` | Bug fixes | None |
| `epic/*` | Epic-level work | None |
| `hotfix/*` | Emergency fixes | None |

All changes must go through pull requests with:
- At least 1 approval required
- All CI status checks passing
- Conversations resolved

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `pnpm install` fails | Verify Node.js 24.x and pnpm 10.x are installed |
| `pnpm dev` port in use | Kill process on port 3000 or use `PORT=3001 pnpm dev` |
| Environment validation fails | Check `.env.local` has all required variables from `.env.example` |
| Type errors on build | Run `pnpm type-check` locally to see specific errors |
| Vercel preview not deploying | Verify Vercel GitHub integration is connected |
| E2E tests timing out | Ensure dev server is running before tests |

### Build Failures

If the build fails:

1. Check build logs for specific error messages
2. Run `pnpm build` locally to reproduce
3. Most common causes:
   - Missing environment variables
   - TypeScript type errors
   - ESLint violations (run `pnpm lint`)
   - Import errors

### Health Check Issues

If `/api/health` returns unhealthy status:

```bash
# Check individual service status
curl http://localhost:3000/api/health | jq '.checks'
```

Review the `checks` object to identify which service is failing.

## Documentation

| Document | Purpose |
|----------|---------|
| [Process Guide](/docs/0-process/0-process.md) | Development process |
| [Technical Architecture](/docs/2-technical/2-tad.md) | System architecture |
| [Coding Standards](/docs/2-technical/references/coding-standards.md) | Code quality rules |
| [Canonical Versions](/docs/2-technical/references/canonical-versions.md) | Dependency versions |

## License

Private - All rights reserved.