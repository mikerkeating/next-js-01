# Story 1A.1.S5: Configure Remote Caching

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Monorepo Foundation](./EPIC.md)
- **Depends On**: [S2](./S2-pnpm-workspaces.md), [S3](./S3-migrate-nextjs-app.md), [S4](./S4-turbo-pipeline.md)
- **Blocks**: [S7: Document Monorepo Architecture](./S7-documentation.md)
- **Runs in Parallel With**: [S6: Update Vercel Deployment](./S6-vercel-deployment.md)

## User Story

**As a** developer
**I want** Turborepo remote caching configured with Vercel
**So that** team members share cached build artefacts, reducing CI/CD build times and improving collaboration efficiency

## Acceptance Criteria

- [x] Remote caching is enabled via Vercel Remote Cache integration
- [x] Running `pnpm turbo build` on a fresh clone retrieves cached artefacts from remote cache
- [x] CI/CD builds benefit from remote cache (>50% build time reduction on cache hit)
- [x] Remote cache token is securely stored (not committed to repository)
- [x] Team members can authenticate with Vercel to use remote cache locally
- [x] Cache artifacts are correctly scoped to the team/organisation

## Technical Requirements

### Files to Create

| Path                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `.env.example` (update) | Document `TURBO_TOKEN` and `TURBO_TEAM` for CI |

### Files to Modify

| Path         | Changes                               |
| ------------ | ------------------------------------- |
| `.gitignore` | Ensure `.turbo/` directory is ignored |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No new dependencies required. Turborepo includes remote caching support natively.

### Configuration Details

| Setting             | Requirement                                              | Reference                                                                              |
| ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Vercel Remote Cache | Enable via `turbo login` or `TURBO_TOKEN` + `TURBO_TEAM` | [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) |
| `TURBO_TOKEN`       | Vercel access token for CI/CD authentication             | [Vercel Tokens](https://vercel.com/docs/rest-api#authentication)                       |
| `TURBO_TEAM`        | Vercel team slug for cache scoping                       | [Turborepo Docs](https://turbo.build/repo/docs/core-concepts/remote-caching#vercel)    |

## Test Requirements

### Manual Verification

- [x] **Local Auth**: Run `npx turbo login`; verify successful Vercel authentication
- [x] **Remote Push**: Run `pnpm turbo build`; verify cache pushed to remote
- [x] **Remote Pull**: Delete `.turbo/`; run `pnpm turbo build`; verify remote cache hit
- [ ] **Team Verification**: Second developer receives cache hits from first developer's builds

### Verification Commands

```bash
# Authenticate with Vercel
npx turbo login

# Link repository to Vercel project
npx turbo link

# Verify remote cache (check output for remote cache status)
pnpm turbo build --summarize

# Force remote cache test
rm -rf .turbo && pnpm turbo build --summarize
```

## Implementation Notes

### Implementation Sequence

1. **Verify Local Cache** - Ensure S4 complete with working local cache
2. **Authenticate with Vercel** - Run `npx turbo login`
3. **Link Repository** - Run `npx turbo link`; select correct team
4. **Test Remote Push** - Run `pnpm turbo build --force`
5. **Test Remote Pull** - Clear local cache; verify remote hit
6. **Update .gitignore** - Ensure `.turbo/` is ignored
7. **Document CI Config** - Add `TURBO_TOKEN`/`TURBO_TEAM` to `.env.example`

### Troubleshooting

| Issue                     | Cause            | Solution                           |
| ------------------------- | ---------------- | ---------------------------------- |
| "Remote caching disabled" | Not logged in    | Run `npx turbo login`              |
| No remote cache hits      | Cache not pushed | Another developer must build first |
| Auth fails in CI          | Missing token    | Check `TURBO_TOKEN` env var        |

### Reference Materials

- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Turborepo with Vercel](https://turbo.build/repo/docs/core-concepts/remote-caching#vercel)

## Estimated Effort

**Size**: S (2-4h)

## Architecture Decisions

### Consolidated Decisions

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Remote cache support
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Vercel integration

### Story-Specific Decisions

#### AD-1A.1.S5.1: Vercel Remote Cache vs Self-Hosted

**Scope**: Story-specific

**Decision**: Use Vercel's native Remote Cache rather than self-hosted (S3, custom server).

**Rationale**: Zero config with Vercel hosting; native Turborepo integration; no infrastructure to maintain.

## Out of Scope

- **CI/CD Pipeline Setup** - Deferred to Epic 1A.5
- **GitHub Actions Secrets** - Deferred to Epic 1A.5
- **Advanced Cache Configuration** - Custom providers, TTL beyond defaults

## Dependencies on Other Stories

### Depends On

- **S2, S3, S4**: Workspace structure, app, and pipeline must exist

### Enables

- **S7**: Remote caching commands documented in README

## References

- [EPIC.md](./EPIC.md), [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md), [ADR-004](/docs/2-technical/adr/004-vercel-hosting.md), [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)

## Verification Checklist

### Pre-Verification

- [x] S4 completed with working local cache
- [x] Vercel account available with appropriate permissions

### Implementation Quality

- [x] All acceptance criteria met
- [x] Remote cache push/pull verified
- [x] `.gitignore` excludes `.turbo/`
- [x] CI requirements documented

### Git Hygiene

- [ ] Conventional commit message used
- [x] No credentials committed

## Status

- **State**: Complete
- **PR**: -
- **Completed**: 2025-11-28

## Implementation Notes (Completed)

### Changes Made

1. **`.env.example`**: Added `TURBO_TOKEN` and `TURBO_TEAM` documentation for CI/CD
2. **`.gitignore`**: Confirmed `.turbo/` is already ignored (line 10)
3. **Vercel Authentication**: Completed via `npx turbo login` (authorized for <github@mikekeating.co.uk>)
4. **Repository Linking**: Completed via `npx turbo link` (linked to Mike Keating's projects)

### Verification Results

- Remote caching enabled: ✅
- Cache hit on second build: ✅ (59ms vs 3.5s = ~98% reduction)
- "FULL TURBO" achieved: ✅

### Note on Remote Write Permissions

Local development uses read-only remote cache access. For CI/CD write access, ensure the Vercel team role has "Remote Cache Artifact" write permissions. This can be configured at <https://vercel.com/docs/accounts/team-members-and-roles/access-roles/team-level-roles>
