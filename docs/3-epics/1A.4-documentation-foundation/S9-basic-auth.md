# Story 1A.4.S9: Protect Documentation App with Basic Auth

> **To implement this story:** Implement basic auth middleware using the proxy pattern from [apps/routing/src/proxy.ts](../../../apps/routing/src/proxy.ts).

## Context

- **Epic**: [Documentation Foundation](./EPIC.md)
- **Depends On**: [S10](./S10-vercel-deploy.md)
- **Blocks**: None (final story)
- **Runs in Parallel With**: None

## User Story

**As a** project owner
**I want** the documentation site protected with basic authentication
**So that** pre-release documentation is not publicly accessible

## Acceptance Criteria

- [ ] Documentation site prompts for credentials when accessed
- [ ] Valid credentials grant access to all documentation pages
- [ ] Invalid credentials return 401 Unauthorized
- [ ] Static assets load correctly after authentication
- [ ] Credentials stored in Vercel environment variables
- [ ] Local development works without auth when env vars unset

## Technical Requirements

### Files to Create

| Path                      | Purpose                        |
| ------------------------- | ------------------------------ |
| `apps/docs/middleware.ts` | Edge middleware for basic auth |

### Files to Modify

N/A - Environment variables configured in Vercel dashboard

### Dependencies

No new dependencies. Uses Next.js middleware (built-in).

### Configuration Details

| Setting               | Requirement                                            |
| --------------------- | ------------------------------------------------------ |
| `BASIC_AUTH_USERNAME` | Username env var in Vercel                             |
| `BASIC_AUTH_PASSWORD` | Password env var in Vercel                             |
| Matcher config        | Exclude `_next/static`, `_next/image`, file extensions |
| Timing-safe compare   | Use pattern from apps/routing for security             |

Reference implementation: [apps/routing/src/proxy.ts](../../../apps/routing/src/proxy.ts)

## Test Requirements

### Manual Verification

- [ ] Site loads without prompt when env vars unset (local dev)
- [ ] Browser shows basic auth dialog when env vars are set
- [ ] Correct credentials grant access
- [ ] Wrong credentials return 401
- [ ] Static assets load after authentication

### Verification Commands

```bash
# Test locally without auth
pnpm --filter docs dev
curl -I http://localhost:3001  # Should return 200

# Test with auth enabled
BASIC_AUTH_USERNAME=test BASIC_AUTH_PASSWORD=secret pnpm --filter docs dev
curl -I http://localhost:3001  # Should return 401
curl -u test:secret -I http://localhost:3001  # Should return 200
```

## Implementation Notes

1. **Copy Proxy Pattern**: Adapt `apps/routing/src/proxy.ts` for middleware.ts
2. **Configure Matcher**: Exclude static assets and Nextra internals
3. **Test Locally**: Verify with and without env vars
4. **Configure Vercel**: Add env vars in Vercel dashboard
5. **Test Deployment**: Verify protection on preview/production

### Troubleshooting

| Issue              | Solution                                   |
| ------------------ | ------------------------------------------ |
| Infinite auth loop | Check matcher excludes `_next/static`      |
| Static assets 401  | Ensure file extensions excluded in matcher |
| Auth not prompting | Verify env vars set in Vercel              |

## Estimated Effort

**Size**: S (2h)

## Architecture Decisions

### Consolidated Decisions

- [apps/routing/src/proxy.ts](../../../apps/routing/src/proxy.ts) - Basic auth proxy pattern

### Story-Specific Decisions

#### AD-1A.4.S9.1: Middleware-based Basic Auth

**Scope**: Story-specific

**Decision**: Use Next.js Edge Middleware with existing proxy pattern

**Rationale**: Consistent with apps/routing, no dependencies, runs at edge

**Alternatives Considered**: Vercel Password Protection (requires Pro plan)

## Out of Scope

- **User Management UI** - Single shared credential sufficient
- **Role-based Access** - All authenticated users have full access
- **OAuth/SSO** - Deferred to production public launch

## Dependencies on Other Stories

- **Depends On**: S10 (Deploy Documentation App to Vercel)
- **Enables**: None (final story)

## References

- [EPIC.md](./EPIC.md), [apps/routing/src/proxy.ts](../../../apps/routing/src/proxy.ts)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Verification Checklist

- [ ] S10 completed and docs deployed
- [ ] `apps/docs/middleware.ts` created
- [ ] All acceptance criteria met
- [ ] Auth works on preview deployment
- [ ] Conventional commit message used

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
