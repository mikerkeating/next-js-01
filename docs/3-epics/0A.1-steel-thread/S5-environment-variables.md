# Story 0A.1.S5: Configure Environment Variables

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S3: Configure Vercel Project Integration](./S3-vercel-integration.md)
- **Blocks**: [S4: Implement Health Check Endpoint](./S4-health-endpoint.md), [S6: Create Playwright Smoke Test Suite](./S6-smoke-tests.md)
- **Runs in Parallel With**: [S2: Create Minimal Next.js 16 Application](./S2-nextjs-app.md) (after S3 completes)

## User Story
**As a** developer
**I want** a type-safe environment variable configuration with validation
**So that** runtime errors from missing or malformed environment variables are caught at build time

## Acceptance Criteria
- [ ] Environment variables validated at build time using `@t3-oss/env-nextjs`
- [ ] `.env.example` file documents all required and optional environment variables
- [ ] `.env.local` is gitignored and not committed
- [ ] Environment validation fails build if required variables are missing
- [ ] Public variables prefixed with `NEXT_PUBLIC_` are accessible in client code
- [ ] Server-only variables are not exposed to client bundles
- [ ] Vercel environment variables configured for Preview and Production environments

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `src/env.ts` | Type-safe environment variable definitions using @t3-oss/env-nextjs |
| `.env.example` | Template documenting all environment variables |

### Files to Modify
| Path | Changes |
|------|---------|
| `.gitignore` | Ensure `.env.local` and `.env*.local` are ignored |
| `package.json` | Add @t3-oss/env-nextjs and zod dependencies |
| `README.md` | Document environment setup process |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**
```bash
pnpm add @t3-oss/env-nextjs zod
```

### Configuration Details

| Setting | Requirement |
|---------|-------------|
| Server variables | Validated with Zod schemas, never exposed to client |
| Client variables | Prefixed with `NEXT_PUBLIC_`, available in browser |
| Skip validation | `SKIP_ENV_VALIDATION` flag for CI builds without secrets |

For complete patterns, see [TAD: Environment Variables Strategy](/docs/2-technical/2-tad-steel-thread-deployment.md#environment-variables-strategy).

## Test Requirements

### Manual Verification
- [ ] **Build Without Env**: Remove required variable, verify build fails with error
- [ ] **Build With Env**: All required variables present, build succeeds
- [ ] **Client Safety**: Verify server variables not in client bundle

### Verification Commands
```bash
# Test build fails without required variables
unset DATABASE_URL && pnpm build

# Verify no server variables leaked to client bundle
grep -r "CLERK_SECRET_KEY" .next/static/
```

## Implementation Notes

### Key Concepts
- **Build-Time Validation**: Environment variables validated at build, not runtime
- **Server/Client Separation**: Server variables only accessible in server code

Reference [TAD: Environment Configuration](/docs/2-technical/2-tad-steel-thread-deployment.md#environment-configuration) for implementation patterns.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with "Invalid environment variables" | Check value matches Zod schema format |
| Variable undefined at runtime | Add to runtimeEnv object in env.ts |
| Server variable in client code | Remove `NEXT_PUBLIC_` prefix |

## Estimated Effort
**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions
- [TAD: Environment Variables Strategy](/docs/2-technical/2-tad-steel-thread-deployment.md#environment-variables-strategy)

### Story-Specific Decisions

#### AD-0A.1.S5.1: Minimal Environment Variables for Steel Thread
**Scope**: Story-specific

**Decision**: Configure only essential environment variables; defer Database/Auth/Analytics variables as optional in schema.

**Rationale**: Steel thread needs minimal config to prove deployment pipeline. Future stories will make variables required as dependencies are added.

## Out of Scope

- **Database/Auth/Analytics variables** - Optional in schema, required later
- **Encryption Keys / Custom Domains** - Not needed for steel thread

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S3**: Vercel project must exist to configure environment variables

### Enables (Unblocks These Stories)
- **S4**: Health Check Endpoint - Needs `VERCEL_ENV` access pattern
- **S6**: Smoke Tests - Needs environment configuration patterns

## References

- [EPIC.md](./EPIC.md)
- [TAD: Environment Variables Strategy](/docs/2-technical/2-tad-steel-thread-deployment.md#environment-variables-strategy)
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [@t3-oss/env-nextjs Documentation](https://env.t3.gg/docs/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## Verification Checklist

### Pre-Verification
- [ ] S3 (Vercel Integration) completed
- [ ] Access to Vercel project dashboard

### Implementation Quality
- [ ] All acceptance criteria met
- [ ] Environment schema defined with Zod validation
- [ ] `.env.example` documents all variables
- [ ] Vercel environment variables configured
- [ ] `pnpm lint` and `pnpm type-check` pass

### Git Hygiene
- [ ] Conventional commit message used
- [ ] No secrets or `.env.local` committed

## Status
- **State**: Not Started
- **PR**: -
- **Completed**: -
