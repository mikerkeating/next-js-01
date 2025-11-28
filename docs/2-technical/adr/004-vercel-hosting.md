# ADR-004: Vercel as Hosting Platform

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to select a hosting platform for our Next.js-based monorepo that can deploy multiple applications, provide excellent performance globally, support our CI/CD requirements, and scale with our growth. The platform must integrate seamlessly with our technology stack (Next.js 16, Turborepo, pnpm) and provide a great developer experience.

### Key Requirements

1. **Next.js Optimization**: First-class support for Next.js features (SSR, SSG, ISR, Edge Runtime)
2. **Global Performance**: CDN with edge locations worldwide for low latency
3. **Developer Experience**: Easy deployments, preview URLs, instant rollbacks
4. **Monorepo Support**: Deploy multiple apps from a single repository
5. **Scalability**: Auto-scaling to handle traffic spikes
6. **Zero-Config Deployments**: Minimal configuration required
7. **Preview Deployments**: Automatic preview URLs for pull requests
8. **Edge Capabilities**: Edge Functions and Middleware support
9. **Observability**: Built-in analytics and logging
10. **Cost Efficiency**: Pricing that scales with usage

### Constraints

- Must work with our monorepo structure (Turborepo + pnpm)
- Must support TypeScript and modern build tools
- Must handle multiple environments (development, staging, production)
- Must provide HTTPS by default
- Team needs to deploy frequently without DevOps overhead

## Decision

We will use **Vercel** as our primary hosting platform for all Next.js applications in the monorepo.

### Deployment Strategy

**Environment Mapping**:

- **Production**: Deploy from `main` branch → `example.com`
- **Staging**: Deploy from `staging` branch → `staging.example.com`
- **Preview**: Automatic deploys on PR creation/update → `*-preview.vercel.app`

**Monorepo Configuration (vercel.json)**:

```json
{
  "version": 2,
  "buildCommand": "pnpm turbo run build --filter={apps/routing}...",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Per-App Configuration**:
Each Next.js app has its own Vercel project with specific settings:

- Root Directory: `apps/{app-name}`
- Build Command: `cd ../.. && pnpm turbo run build --filter={apps/{app-name}}...`
- Install Command: `pnpm install --frozen-lockfile`
- Output Directory: `.next`

### Environment Variables Strategy

**Shared Variables** (via Vercel Project Settings):

```bash
# Database
DATABASE_URL=<from_neon_or_supabase>

# Authentication
CLERK_SECRET_KEY=<clerk_secret>
CLERK_PUBLISHABLE_KEY=<clerk_public>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_public>

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=<posthog_key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking
SENTRY_DSN=<sentry_dsn>
SENTRY_AUTH_TOKEN=<sentry_token>

# Environment-specific
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://example.com
```

**Per-Environment Configuration**:

- Development: Uses `.env.local` (not committed)
- Preview: Uses Vercel Preview environment variables
- Production: Uses Vercel Production environment variables

## Rationale

### Why Vercel?

1. **Built for Next.js**
   - Created by the same team that builds Next.js
   - Zero-config deployments for Next.js apps
   - All Next.js features work out of the box
   - Optimized for React Server Components
   - Early access to Next.js features

2. **Global Edge Network**
   - 100+ edge locations worldwide
   - Automatic static asset optimization
   - Edge middleware execution
   - Sub-100ms response times globally
   - Intelligent routing and caching

3. **Developer Experience**
   - Git integration with GitHub/GitLab/Bitbucket
   - Automatic HTTPS with custom domains
   - Instant rollbacks to previous deployments
   - Real-time deployment logs
   - CLI for local testing and deployment
   - Preview URLs for every PR

4. **Monorepo Excellence**
   - Native Turborepo support
   - Multiple projects from one repository
   - Shared environment variables
   - Cross-project dependencies handled
   - Efficient caching across deployments

5. **Performance & Optimization**
   - Automatic image optimization
   - Code splitting and lazy loading
   - Brotli compression
   - HTTP/3 support
   - Smart CDN invalidation

6. **Scalability**
   - Automatic scaling to zero
   - Handles traffic spikes automatically
   - No capacity planning needed
   - Serverless architecture
   - Edge Functions for low latency

7. **Built-in Analytics**
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - Performance insights
   - Traffic analytics
   - Error tracking integration

8. **Security**
   - Automatic HTTPS/TLS 1.3
   - DDoS protection
   - Web Application Firewall (WAF)
   - Secure environment variables
   - SOC 2 Type II certified

9. **Cost Efficiency**
   - Free tier for hobby projects
   - Pro plan reasonable for startups
   - Enterprise plan for scale
   - Pay for what you use
   - No infrastructure management overhead

10. **Ecosystem Integration**
    - Works with all our tools (pnpm, Turborepo, TypeScript)
    - Integrations with monitoring tools (Sentry, PostHog)
    - Database integrations (Neon, Supabase, Vercel Postgres)
    - Edge Config for feature flags
    - Vercel KV for edge caching

### Alternatives Considered

#### Option 1: AWS (Amplify/Elastic Beanstalk/ECS)

**Pros:**

- Full control over infrastructure
- Wide range of services
- Enterprise-grade reliability
- Flexible pricing options
- Good for complex architectures

**Cons:**

- ❌ Significant DevOps overhead
- ❌ Complex configuration for Next.js
- ❌ Slower deployment process
- ❌ More expensive for our use case
- ❌ Requires infrastructure management
- ❌ Steeper learning curve
- ❌ No automatic preview deployments

**Decision**: Rejected - Too much complexity and DevOps overhead for our team size.

#### Option 2: Netlify

**Pros:**

- Good Next.js support
- Automatic preview deployments
- Edge Functions
- Form handling
- Good developer experience

**Cons:**

- ❌ Less optimized for Next.js than Vercel
- ❌ Slower builds for large projects
- ❌ Edge Functions more limited
- ❌ Less mature monorepo support
- ❌ Image optimization requires plugins
- ❌ Less frequent Next.js feature updates

**Decision**: Rejected - While good, not as optimized for Next.js as Vercel.

#### Option 3: Cloudflare Pages

**Pros:**

- Excellent global network
- Generous free tier
- Fast edge locations
- Good pricing
- Workers for serverless functions

**Cons:**

- ❌ Limited Next.js SSR support
- ❌ Primarily for static sites
- ❌ Server Components support incomplete
- ❌ More complex configuration needed
- ❌ Less integrated deployment experience
- ❌ Smaller community for Next.js

**Decision**: Rejected - Not optimized for full-featured Next.js applications with SSR.

#### Option 4: Railway/Render

**Pros:**

- Simple deployment process
- Docker support
- Database hosting included
- Reasonable pricing
- Good for fullstack apps

**Cons:**

- ❌ Not specialized for Next.js
- ❌ No global edge network
- ❌ Manual configuration required
- ❌ Less mature platform
- ❌ Limited analytics
- ❌ No automatic image optimization

**Decision**: Rejected - Lacks the Next.js-specific optimizations we need.

#### Option 5: Self-Hosted (VPS/Docker/Kubernetes)

**Pros:**

- Complete control
- Potentially lower cost at scale
- No vendor lock-in
- Custom configurations possible

**Cons:**

- ❌ Significant DevOps overhead
- ❌ Manual scaling required
- ❌ No automatic optimizations
- ❌ Security management burden
- ❌ Monitoring setup required
- ❌ High maintenance cost
- ❌ Slower iteration speed

**Decision**: Rejected - Team needs to focus on product, not infrastructure.

#### Option 6: Fly.io

**Pros:**

- Good for fullstack apps
- Edge deployment
- Good pricing
- Docker support

**Cons:**

- ❌ Less Next.js-specific optimization
- ❌ More complex setup
- ❌ Smaller community
- ❌ Manual configuration needed
- ❌ No built-in preview deployments
- ❌ Less mature analytics

**Decision**: Rejected - Lacks the streamlined Next.js experience of Vercel.

## Consequences

### Positive

1. **Rapid Deployment**: Push to deploy, no build configuration needed
2. **Global Performance**: Users get fast load times worldwide
3. **Zero DevOps**: Team can focus on features, not infrastructure
4. **Preview Environments**: Every PR gets a unique URL for testing
5. **Instant Rollbacks**: Revert to previous deployment in seconds
6. **Built-in Monitoring**: Analytics and performance metrics included
7. **Cost Predictable**: Clear pricing, no surprise infrastructure costs
8. **Automatic Scaling**: Handles traffic spikes without manual intervention
9. **Security Included**: HTTPS, DDoS protection, WAF included
10. **Great DX**: Developers love the deployment experience

### Negative

1. **Vendor Lock-in**: Tightly coupled to Vercel's platform
2. **Cost at Scale**: Can become expensive with very high traffic
3. **Limited Customization**: Less control than self-hosted solutions
4. **Cold Starts**: Serverless functions can have cold start latency
5. **Regional Limits**: Primary compute region selection limited
6. **Build Time Limits**: Long builds may hit timeout limits

### Mitigation Strategies

1. **Vendor Lock-in Mitigation**:
   - Keep business logic in separate packages
   - Use environment variables for configuration
   - Maintain Docker fallback deployment option
   - Document migration path to alternatives

2. **Cost Management**:
   - Monitor usage dashboards regularly
   - Set up billing alerts
   - Optimize bundle sizes
   - Use ISR to reduce server load
   - Cache aggressively at edge

3. **Cold Start Mitigation**:
   - Keep functions warm with periodic pings
   - Use Edge Functions for critical paths
   - Optimize function bundle sizes
   - Consider upgrading to dedicated compute

4. **Build Time Optimization**:
   - Use Turborepo caching effectively
   - Optimize dependencies
   - Split large apps if needed
   - Use incremental builds

## Implementation Plan

### Phase 1: Initial Setup (Day 1)

- [x] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Set up first project (routing app)
- [ ] Configure build settings for monorepo
- [ ] Add production domain

### Phase 2: Configuration (Day 1-2)

- [ ] Configure environment variables
- [ ] Set up staging environment
- [ ] Configure custom domains
- [ ] Test preview deployments
- [ ] Set up deployment notifications

### Phase 3: Additional Apps (Week 1)

- [ ] Deploy API app
- [ ] Deploy CDN app
- [ ] Deploy docs app
- [ ] Deploy marketing app
- [ ] Deploy tools apps

### Phase 4: Optimization (Week 2)

- [ ] Enable Vercel Analytics
- [ ] Configure Edge Config
- [ ] Set up cron jobs
- [ ] Optimize build caching
- [ ] Fine-tune edge regions

### Phase 5: Monitoring (Week 2-3)

- [ ] Set up Sentry integration
- [ ] Configure uptime monitoring
- [ ] Set up billing alerts
- [ ] Document deployment procedures
- [ ] Train team on Vercel platform

## Validation

### Success Metrics

- [ ] Deployment time < 3 minutes for typical changes
- [ ] Preview URL generation < 30 seconds after PR creation
- [ ] Global p95 latency < 200ms
- [ ] Uptime > 99.9%
- [ ] Build success rate > 95%
- [ ] Zero manual deployment steps required
- [ ] Core Web Vitals in "Good" range

### Testing Checklist

1. **Deployment Pipeline**:
   - [ ] Push to main triggers production deployment
   - [ ] Push to staging triggers staging deployment
   - [ ] PRs create preview deployments
   - [ ] Build failures prevent deployment

2. **Environment Configuration**:
   - [ ] Production env vars work correctly
   - [ ] Staging env vars work correctly
   - [ ] Preview env vars work correctly
   - [ ] Sensitive data not exposed

3. **Performance**:
   - [ ] Static assets cached properly
   - [ ] Images optimized automatically
   - [ ] API routes respond quickly
   - [ ] Edge Middleware works

4. **Custom Domains**:
   - [ ] Production domain works
   - [ ] Staging domain works
   - [ ] HTTPS works automatically
   - [ ] Redirects work correctly

5. **Rollbacks**:
   - [ ] Can rollback to previous deployment
   - [ ] Rollback completes in < 1 minute
   - [ ] No data loss on rollback

## Vercel Features We'll Use

### Core Features

1. **Deployments**
   - Git integration
   - Preview deployments
   - Production deployments
   - Instant rollbacks

2. **Edge Network**
   - Global CDN
   - Edge Functions
   - Edge Middleware
   - Intelligent routing

3. **Build System**
   - Turborepo integration
   - Build caching
   - Incremental builds
   - Parallel builds

4. **Analytics**
   - Web Vitals
   - Real User Monitoring
   - Audience insights
   - Top pages

5. **Environment Variables**
   - Per-environment configuration
   - Encrypted storage
   - Team sharing
   - Type-safe access

6. **Custom Domains**
   - Automatic HTTPS
   - Custom redirects
   - Apex domains
   - Wildcard domains

### Advanced Features

1. **Edge Config**
   - Feature flags
   - A/B testing
   - Dynamic configuration
   - Low-latency reads

2. **Cron Jobs**
   - Scheduled tasks
   - Background jobs
   - Maintenance scripts

3. **Protection**
   - Password protection
   - SSO integration
   - IP allowlists
   - Custom authentication

4. **Integrations**
   - Sentry for errors
   - PostHog for analytics
   - Slack for notifications
   - GitHub for CI/CD

## Deployment Workflow

### Standard Deployment Flow

```
Developer pushes to branch
        ↓
GitHub webhook triggers Vercel
        ↓
Vercel clones repository
        ↓
Runs pnpm install
        ↓
Runs Turborepo build
        ↓
Deploys to edge network
        ↓
Generates preview URL (if PR)
        ↓
Updates production (if main)
        ↓
Sends notification (Slack/GitHub)
```

### Rollback Flow

```
User clicks "Rollback" in dashboard
        ↓
Vercel switches DNS to previous deployment
        ↓
Previous build becomes active
        ↓
Notification sent
        ↓
Complete in < 60 seconds
```

## Common Commands

### Vercel CLI

```bash
# Install CLI
pnpm add -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Environment variables
vercel env pull
vercel env add
vercel env rm

# List deployments
vercel ls

# Inspect deployment
vercel inspect <url>

# Rollback
vercel rollback <url>
```

### Environment Setup

```bash
# Pull environment variables locally
vercel env pull .env.local

# Link to project
vercel link

# Test build locally
vercel build

# Run production build locally
vercel dev
```

## Best Practices

1. **Environment Variables**
   - Use Vercel dashboard for sensitive data
   - Never commit secrets to git
   - Use `NEXT_PUBLIC_` prefix for client-side vars
   - Document all required variables

2. **Deployments**
   - Always review preview deployments
   - Test on preview before merging to main
   - Use staging for testing integrations
   - Keep deployment size under 50MB

3. **Performance**
   - Leverage ISR for dynamic content
   - Use Edge Functions for critical paths
   - Optimize images with next/image
   - Enable compression

4. **Monitoring**
   - Set up Vercel Analytics
   - Monitor Web Vitals
   - Track deployment success rate
   - Review error logs regularly

5. **Cost Optimization**
   - Monitor bandwidth usage
   - Cache aggressively
   - Optimize bundle sizes
   - Use ISR to reduce compute

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Monorepos on Vercel](https://vercel.com/docs/monorepos)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

## Related ADRs

- [ADR-001: Monorepo with Turborepo](001-monorepo-turborepo.md) - Vercel integrates with Turborepo
- [ADR-002: pnpm as Package Manager](002-pnpm-package-manager.md) - Vercel supports pnpm
- [ADR-003: Next.js 16 as Framework](003-nextjs-framework.md) - Vercel is built for Next.js

## Notes

Vercel's tight integration with Next.js and exceptional developer experience make it the clear choice for hosting our platform. While there's some vendor lock-in risk, the productivity gains and reduced operational overhead far outweigh the concerns.

The platform's automatic scaling, global edge network, and zero-config deployments allow our team to focus on building features rather than managing infrastructure. This aligns perfectly with our startup's need to move quickly and iterate rapidly.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: DevOps Lead, Engineering Team, Finance
**Last Updated**: 2025-11-24
