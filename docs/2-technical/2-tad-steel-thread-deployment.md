## Steel Thread & Deployment Pipeline

### Overview

The Steel Thread is our Day 1 deployment pipeline that establishes the foundational infrastructure for continuous deployment. This is implemented before any feature development begins (Epic 0A.1) and serves as the skeleton upon which all subsequent development is built.

**Philosophy**: Deploy early, deploy often. The steel thread proves that code can flow from developer laptop to production in an automated, repeatable manner.

### Steel Thread Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      STEEL THREAD FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Developer                                                      │
│      ↓                                                          │
│  git push to branch                                            │
│      ↓                                                          │
│  GitHub Actions                                                 │
│      ├─→ Lint & Type Check                                     │
│      ├─→ Run Tests                                             │
│      └─→ Build Validation                                      │
│      ↓                                                          │
│  Vercel Preview Deployment                                     │
│      ├─→ Unique Preview URL                                    │
│      ├─→ SSL Auto-Provisioned                                  │
│      └─→ Comment Posted to PR                                  │
│      ↓                                                          │
│  E2E Smoke Test on Preview                                     │
│      └─→ Health Check Validation                               │
│      ↓                                                          │
│  PR Review & Approval                                          │
│      ↓                                                          │
│  Merge to development                                           │
│      ↓                                                          │
│  Production Deployment                                          │
│      ├─→ Deploy to staging.example.com                         │
│      ├─→ Smoke Tests on Staging                                │
│      └─→ Auto-promote to example.com                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Health Check Specification

#### Health Check Endpoint

**Endpoint**: `GET /api/health`

**Purpose**: Validates that the application is running and all critical dependencies are operational.

**Response Format**:

```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;  // ISO 8601 format
  version: string;    // Application version from package.json
  environment: 'development' | 'preview' | 'staging' | 'production';
  checks: {
    database: HealthCheckDetail;
    auth: HealthCheckDetail;
    cache: HealthCheckDetail;
  };
  uptime: number;  // Seconds since deployment
}

interface HealthCheckDetail {
  status: 'ok' | 'degraded' | 'error';
  responseTime?: number;  // Milliseconds
  message?: string;
  lastChecked: string;    // ISO 8601 format
}
```

**Example Response** (Healthy):

```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 12,
      "lastChecked": "2025-11-24T12:00:00.000Z"
    },
    "auth": {
      "status": "ok",
      "responseTime": 45,
      "lastChecked": "2025-11-24T12:00:00.000Z"
    },
    "cache": {
      "status": "ok",
      "responseTime": 3,
      "lastChecked": "2025-11-24T12:00:00.000Z"
    }
  },
  "uptime": 3600
}
```

**Example Response** (Degraded):

```json
{
  "status": "degraded",
  "timestamp": "2025-11-24T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 12,
      "lastChecked": "2025-11-24T12:00:00.000Z"
    },
    "auth": {
      "status": "degraded",
      "responseTime": 2500,
      "message": "Clerk API responding slowly",
      "lastChecked": "2025-11-24T12:00:00.000Z"
    },
    "cache": {
      "status": "ok",
      "responseTime": 3,
      "lastChecked": "2025-11-24T12:00:00.000Z"
    }
  },
  "uptime": 3600
}
```

**HTTP Status Codes**:

- `200 OK`: All systems healthy
- `503 Service Unavailable`: One or more critical systems unhealthy
- `500 Internal Server Error`: Health check itself failed

**Health Check Logic**:

```typescript
// apps/routing/src/app/api/health/route.ts

export async function GET() {
  const startTime = Date.now();

  const checks = await Promise.allSettled([
    checkDatabase(),
    checkAuth(),
    checkCache()
  ]);

  const healthStatus = {
    database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', message: checks[0].reason },
    auth: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', message: checks[1].reason },
    cache: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', message: checks[2].reason }
  };

  // Determine overall status
  const hasError = Object.values(healthStatus).some(check => check.status === 'error');
  const hasDegraded = Object.values(healthStatus).some(check => check.status === 'degraded');

  const overallStatus = hasError ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
  const httpStatus = hasError ? 503 : 200;

  return Response.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    environment: process.env.VERCEL_ENV || 'development',
    checks: healthStatus,
    uptime: process.uptime()
  }, { status: httpStatus });
}

async function checkDatabase(): Promise<HealthCheckDetail> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      status: 'ok',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      message: 'Database connection failed',
      lastChecked: new Date().toISOString()
    };
  }
}

async function checkAuth(): Promise<HealthCheckDetail> {
  const start = Date.now();
  try {
    // Verify Clerk API is reachable
    const response = await fetch('https://api.clerk.com/v1/health', {
      headers: { 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` }
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        status: 'error',
        responseTime,
        message: 'Clerk API returned error',
        lastChecked: new Date().toISOString()
      };
    }

    // Degraded if response time > 1s
    if (responseTime > 1000) {
      return {
        status: 'degraded',
        responseTime,
        message: 'Clerk API responding slowly',
        lastChecked: new Date().toISOString()
      };
    }

    return {
      status: 'ok',
      responseTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      message: 'Clerk API unreachable',
      lastChecked: new Date().toISOString()
    };
  }
}

async function checkCache(): Promise<HealthCheckDetail> {
  const start = Date.now();
  try {
    // Simple in-memory cache check for now
    // Will be replaced with Redis/Vercel KV in production
    return {
      status: 'ok',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - start,
      message: 'Cache check failed',
      lastChecked: new Date().toISOString()
    };
  }
}
```

**Health Check Monitoring**:

- **Uptime Monitoring**: External service (e.g., Better Uptime, UptimeRobot) pings `/api/health` every 60 seconds
- **Alerting**: Alert if health check returns non-200 status for 2 consecutive checks
- **Slack Notification**: Post to #alerts channel on degraded or unhealthy status
- **PagerDuty**: Escalate to on-call if unhealthy for > 5 minutes

### Deployment Pipeline Details

#### GitHub Repository Configuration

**Branch Protection Rules** (for `main` branch):

```yaml
Require pull request before merging: ✓
Require approvals: 1
Dismiss stale approvals: ✓
Require status checks to pass: ✓
  - lint
  - type-check
  - test
  - build
  - e2e-smoke
Require branches to be up to date: ✓
Require conversation resolution: ✓
Include administrators: ✓
```

**Branch Naming Convention**:

- `main` - Production branch (protected)
- `staging` - Staging branch (protected, optional)
- `feature/*` - Feature branches (e.g., `feature/auth-setup`)
- `fix/*` - Bug fix branches (e.g., `fix/login-error`)
- `epic/*` - Epic-level branches (e.g., `epic/0A.1-steel-thread`)

#### Vercel Project Configuration

**Project Settings**:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/routing` |
| **Build Command** | `cd ../.. && pnpm run build --filter=routing` |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install` |
| **Node.js Version** | 22.x |

**Git Integration**:

- **Production Branch**: `main`
- **Preview Branches**: All branches (automatic preview deployments)
- **Preview for Pull Requests**: Enabled
- **Auto-deploy**: Enabled for development branch
- **Deployment Protection**: Production requires approval (optional, can be disabled for MVP)

**Environment Variables**:

Environment variables are configured per environment in Vercel dashboard:

```bash
# All Environments (Development, Preview, Production)
DATABASE_URL=<postgres-connection-string>
CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
CLERK_SECRET_KEY=<clerk-secret-key>
NEXT_PUBLIC_API_URL=<api-base-url>

# Production & Preview Only
NEXT_PUBLIC_POSTHOG_KEY=<posthog-key>
SENTRY_DSN=<sentry-dsn>
SENTRY_ORG=<sentry-org>
SENTRY_PROJECT=<sentry-project>

# Production Only
ENCRYPTION_KEY=<aes-256-encryption-key>
SLACK_WEBHOOK_URL=<slack-webhook-url>
```

**Preview Deployment URLs**:

Format: `<app>-<git-branch>-<team>.vercel.app`

Examples:
- `routing-feature-auth-setup-mkcubed.vercel.app`
- `routing-fix-login-error-mkcubed.vercel.app`
- `routing-pr-123-mkcubed.vercel.app`

**Custom Domains** (Production):

| Domain | Purpose | SSL |
|--------|---------|-----|
| `example.com` | Main application | Auto (Vercel) |
| `www.example.com` | Redirect to example.com | Auto (Vercel) |
| `api.example.com` | API endpoints | Auto (Vercel) |
| `cdn.example.com` | Static assets | Auto (Vercel) |
| `staging.example.com` | Staging environment | Auto (Vercel) |

#### SSL Certificate Management

**Automatic SSL**:

- Vercel automatically provisions SSL certificates via Let's Encrypt
- Certificates auto-renew before expiration
- Wildcard certificates supported for `*.example.com`
- No manual configuration required

**SSL Configuration**:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

#### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main, staging]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
        env:
          # Use preview environment variables for build
          DATABASE_URL: ${{ secrets.DATABASE_URL_PREVIEW }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}

  e2e-smoke:
    name: E2E Smoke Tests
    runs-on: ubuntu-latest
    needs: [lint, type-check, test, build]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: vercel-preview
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300
      - name: Run Playwright smoke tests
        run: pnpm run test:e2e:smoke
        env:
          BASE_URL: ${{ steps.vercel-preview.outputs.url }}
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-results
          path: playwright-report/
```

#### Deployment Smoke Tests

**Smoke Test Suite**:

```typescript
// tests/e2e/smoke.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Deployment Smoke Tests', () => {
  test('health check returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.checks.database.status).toBe('ok');
  });

  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MK3/);

    // Verify critical elements are present
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('API responds correctly', async ({ request }) => {
    const response = await request.get('/api/v1/metadata/config');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('static assets load', async ({ page }) => {
    await page.goto('/');

    // Verify favicon loads
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(favicon).toBeTruthy();

    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('authentication flow is accessible', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify Clerk sign-in UI loads
    await expect(page.locator('[data-clerk-sign-in]')).toBeVisible({ timeout: 10000 });
  });
});
```

### Environment Configuration

#### Environment Variables Strategy

**Variable Types**:

1. **Public Variables** (`NEXT_PUBLIC_*`): Available in browser, safe to expose
2. **Server Variables**: Only available on server, kept secret
3. **Build Variables**: Only used during build time

**Environment-Specific Configuration**:

```typescript
// packages/config/src/env.ts

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url(),

    // Authentication
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Encryption
    ENCRYPTION_KEY: z.string().length(44), // Base64 encoded 32 bytes

    // Monitoring
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

    // Notifications
    SLACK_WEBHOOK_URL: z.string().url().optional(),

    // Node Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  client: {
    // Public configuration
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },

  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
```

**Usage**:

```typescript
// Import validated environment variables
import { env } from '@repo/config/env';

// Type-safe access
const dbUrl = env.DATABASE_URL;  // string (validated)
const apiUrl = env.NEXT_PUBLIC_API_URL;  // string (validated, public)
```

#### Local Development Setup

**`.env.local`** (gitignored, developer creates from `.env.example`):

```bash
# Database (Neon free tier for local dev)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Clerk (free development instance)
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Analytics (disabled in local dev)
# NEXT_PUBLIC_POSTHOG_KEY=
# SENTRY_DSN=
```

**`.env.example`** (committed to repo):

```bash
# ============================================
# Environment Variables Template
# ============================================
# Copy this file to .env.local and fill in the values

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Analytics (Optional for local dev)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Monitoring (Optional for local dev)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Encryption (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
ENCRYPTION_KEY=

# Notifications (Optional)
SLACK_WEBHOOK_URL=
```

### Deployment Checklist

**Pre-Deployment** (Day 1 Setup):

- [ ] GitHub repository created with main branch protection
- [ ] Vercel project created and linked to GitHub
- [ ] Environment variables configured in Vercel (all environments)
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates auto-provisioned
- [ ] Health check endpoint implemented (`/api/health`)
- [ ] Smoke test suite created
- [ ] GitHub Actions CI workflow configured
- [ ] Uptime monitoring configured (Better Uptime / UptimeRobot)
- [ ] Slack notifications configured

**Deployment Validation** (Every Deploy):

- [ ] GitHub Actions CI passes (lint, type-check, test, build)
- [ ] Preview deployment succeeds
- [ ] E2E smoke tests pass on preview
- [ ] Health check returns 200 OK
- [ ] No console errors in browser
- [ ] SSL certificate valid
- [ ] Response times < 2s

**Post-Deployment** (Production):

- [ ] Health check monitored for 5 minutes
- [ ] Uptime monitor shows green status
- [ ] No error spikes in Sentry
- [ ] Core Web Vitals within acceptable range
- [ ] Team notified via Slack

### Rollback Procedure

**Automatic Rollback** (via Vercel Dashboard):

1. Navigate to Vercel project dashboard
2. Go to "Deployments" tab
3. Find previous successful deployment
4. Click "..." menu → "Promote to Production"
5. Confirm rollback
6. **Result**: Instant rollback (< 30 seconds)

**Manual Rollback** (via Git):

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or revert to specific commit
git revert <commit-hash>
git push origin main

# Vercel auto-deploys the revert
```

**Database Rollback** (if needed):

```bash
# Rollback last migration
pnpm run db:rollback

# Or rollback to specific migration
pnpm run db:rollback --to 20250115000000
```

**Maximum Downtime Target**: 5 minutes for critical issues

---


