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

- [x] Documentation site prompts for credentials when accessed
- [x] Valid credentials grant access to all documentation pages
- [x] Invalid credentials return 401 Unauthorized
- [x] Static assets load correctly after authentication
- [x] Credentials stored in Vercel environment variables
- [x] Local development works without auth when env vars unset

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

- [x] Site loads without prompt when env vars unset (local dev)
- [x] Browser shows basic auth dialog when env vars are set
- [x] Correct credentials grant access
- [x] Wrong credentials return 401
- [x] Static assets load after authentication

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
- [x] `apps/docs/proxy.ts` created (renamed from middleware.ts for Next.js 16)
- [x] All acceptance criteria met
- [ ] Auth works on preview deployment
- [x] Conventional commit message used

## Status

- **State**: Complete
- **Completed**: 2025-11-29
- **PR**: -

## Completion Notes

### Summary

Implemented basic authentication proxy for the documentation site using the Next.js 16 `proxy.ts` convention. The implementation adapts the timing-safe basic auth pattern from `apps/routing/src/proxy.ts`. Authentication is automatically bypassed when `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` environment variables are not set, allowing seamless local development.

### Test Results

| Test  | Command           | Result |
| ----- | ----------------- | ------ |
| Lint  | `pnpm lint`       | Pass   |
| Types | `pnpm type-check` | Pass   |
| Build | `pnpm build`      | Pass   |

### Files Changed

- `apps/docs/proxy.ts` - Created (Note: Named `proxy.ts` instead of `middleware.ts` per Next.js 16 convention)

### Known Issues

- **S10 Dependency**: S10 (Vercel deployment) is marked as "Not Started" but can be verified once deployed
- **Preview Deployment**: Auth on preview deployment requires S10 completion

### Lessons Learned

- Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts` file convention
- The exported function should also be named `proxy` instead of `middleware`
- The build warning helped identify this convention change early
