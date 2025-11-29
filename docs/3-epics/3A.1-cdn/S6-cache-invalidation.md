# Story 3A.1.S6: Cache Invalidation API

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: [S1: CDN Application Setup](./S1-cdn-app-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Image Optimisation Pipeline](./S2-image-optimisation.md), [S3: Image Transformation API](./S3-image-transformation.md), [S4: Cache Headers and Content-Hash URLs](./S4-cache-headers.md), [S5: File Upload Utilities](./S5-file-upload.md)

## User Story

**As a** Developer
**I want** an API to programmatically invalidate cached content
**So that** I can clear stale cache entries when content updates without waiting for automatic expiration

## Acceptance Criteria

- [ ] Cache invalidation API endpoint accepts tag-based purge requests
- [ ] Cache invalidation API endpoint accepts path-based purge requests
- [ ] API supports full cache purge (with confirmation requirement)
- [ ] Purge requests integrate with Vercel's cache invalidation API
- [ ] API returns success/failure status and purge metadata
- [ ] Authenticated requests only (API token required)
- [ ] Rate limiting prevents abuse (max 100 purge requests/hour)
- [ ] Purge propagation completes within 60 seconds globally
- [ ] API logs all invalidation requests for audit trail
- [ ] Error handling for invalid tags, paths, and API failures

## Technical Requirements

### Files to Create

| Path                                                | Purpose                                  |
| --------------------------------------------------- | ---------------------------------------- |
| `apps/cdn/app/api/purge/route.ts`                   | Cache purge endpoint                     |
| `apps/cdn/lib/cache-purge.ts`                       | Vercel API integration for purging       |
| `apps/cdn/lib/purge-validator.ts`                   | Request validation for purge operations  |
| `apps/cdn/middleware/purge-auth.ts`                 | Authentication middleware for purge API  |
| `apps/cdn/lib/__tests__/cache-purge.test.ts`        | Unit tests for purge utilities           |
| `apps/cdn/lib/__tests__/purge-validator.test.ts`    | Unit tests for validation                |
| `apps/cdn/app/api/purge/route.test.ts`              | Integration tests for purge endpoint     |

### Files to Modify

| Path                      | Changes                                         |
| ------------------------- | ----------------------------------------------- |
| `apps/cdn/.env.local.example` | Add `VERCEL_PURGE_TOKEN` environment variable |
| `apps/cdn/README.md`      | Document cache invalidation API usage           |
| `apps/cdn/lib/types.ts`   | Add types for purge requests and responses      |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
cd apps/cdn

# No additional dependencies required
# Uses native fetch API for Vercel API calls
# Uses Next.js middleware for authentication
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                    | Requirement                                    | TAD Reference                                                                           |
| -------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Authentication             | API token required for all purge requests      | [TAD: Security Considerations](/docs/2-technical/2-tad-cdn.md#security-considerations)  |
| Rate Limiting              | Max 100 purge requests per hour per token      | [TAD: Cache Invalidation](/docs/2-technical/2-tad-cdn.md#cache-invalidation)            |
| Purge API Integration      | Vercel Purge API v1 for cache invalidation     | [TAD: Invalidation API](/docs/2-technical/2-tad-cdn.md#invalidation-api)                |
| Propagation Time           | 60 seconds max for global edge propagation     | [TAD: Tag-Based Invalidation](/docs/2-technical/2-tad-cdn.md#2-tag-based-invalidation) |
| Supported Purge Strategies | Tag-based, path-based, and full purge          | [TAD: Invalidation Strategies](/docs/2-technical/2-tad-cdn.md#invalidation-strategies)  |

**Configuration Rationale**:
- API token authentication prevents unauthorized cache purging
- Rate limiting prevents abuse and accidental mass cache clearing
- Vercel API integration provides reliable edge cache invalidation
- 60-second propagation ensures timely content updates
- Multiple purge strategies support different invalidation use cases

For complete configuration templates, see: [TAD: Cache Invalidation](/docs/2-technical/2-tad-cdn.md#cache-invalidation)

## Test Requirements

### Manual Verification

- [ ] **Tag-Based Purge**: Purge cache by tag and verify tagged content is revalidated
- [ ] **Path-Based Purge**: Purge specific path and verify only that path is invalidated
- [ ] **Full Purge**: Trigger full cache purge and verify all content is revalidated
- [ ] **Authentication**: Verify requests without valid token return 401 Unauthorized
- [ ] **Rate Limiting**: Exceed rate limit and verify 429 Too Many Requests response
- [ ] **Propagation**: Purge cache and verify invalidation propagates globally within 60 seconds

### Automated Tests

- [ ] Unit: `lib/__tests__/cache-purge.test.ts` - Vercel API integration
- [ ] Unit: `lib/__tests__/purge-validator.test.ts` - Request validation logic
- [ ] Integration: `app/api/purge/route.test.ts` - End-to-end purge operations

### Integration Tests

- [ ] Tag-based purge invalidates all routes with matching cache tag
- [ ] Path-based purge invalidates specific path without affecting others
- [ ] Full purge clears entire edge cache
- [ ] Purge API returns correct status codes and metadata
- [ ] Rate limiting blocks excessive requests
- [ ] Invalid tokens rejected with 401 status
- [ ] Audit logs capture all purge requests

### Verification Commands

```bash
# Build and test
cd apps/cdn && pnpm build && pnpm type-check && pnpm test

# Tag-based purge (requires VERCEL_PURGE_TOKEN)
curl -X POST https://cdn.example.com/api/purge \
  -H "Authorization: Bearer ${PURGE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["products"]}'
# Expected: {"success": true, "purged": {"tags": ["products"]}, ...}

# Path-based purge
curl -X POST https://cdn.example.com/api/purge \
  -H "Authorization: Bearer ${PURGE_TOKEN}" \
  -d '{"paths": ["/api/products"]}'
# Expected: {"success": true, "purged": {"paths": [...]}, ...}

# Full cache purge
curl -X POST https://cdn.example.com/api/purge \
  -H "Authorization: Bearer ${PURGE_TOKEN}" \
  -d '{"full": true, "confirm": "PURGE_ALL"}'
# Expected: {"success": true, "purged": "full", ...}

# Verify authentication fails without token (expect 401)
curl -X POST https://cdn.example.com/api/purge -d '{"tags": ["products"]}'

# Verify rate limiting after 100 requests (expect 429)
```

## Implementation Notes

### Implementation Sequence

1. **Create Purge Validator**
   - Validate purge request structure (tags, paths, full)
   - Enforce mutual exclusivity (only one strategy per request)
   - Validate tag and path format
   - Require confirmation token for full purge

2. **Build Cache Purge Utility**
   - Integrate with Vercel Purge API
   - Implement tag-based purge
   - Implement path-based purge
   - Implement full cache purge
   - Handle API errors and retries

3. **Create Authentication Middleware**
   - Validate API token from Authorization header
   - Check token against environment variable
   - Return 401 for missing or invalid tokens
   - Support Bearer token format

4. **Implement Rate Limiting**
   - Track purge requests per token
   - Enforce 100 requests/hour limit
   - Return 429 with Retry-After header
   - Reset counters hourly

5. **Create Purge API Endpoint**
   - Parse and validate request body
   - Apply authentication and rate limiting
   - Execute purge operation
   - Return success/failure response
   - Log purge requests for audit

6. **Test and Validate**
   - Write unit tests for validation and purge logic
   - Test authentication and rate limiting
   - Verify purge propagation time
   - Test error handling

### Key Concepts

- **Tag-Based Purge**: Invalidate all cached responses with specific cache tag (e.g., `products`)
- **Path-Based Purge**: Invalidate specific URL paths (e.g., `/api/products`, `/blog/post-1`)
- **Full Purge**: Clear entire edge cache (use sparingly due to performance impact)
- **Propagation**: Time for invalidation to reach all global edge POPs (typically 30-60 seconds)
- **Rate Limiting**: Prevents abuse by limiting purge requests per time window

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Tag-Based Invalidation](/docs/2-technical/2-tad-cdn.md#2-tag-based-invalidation)
- [TAD: Path-Based Invalidation](/docs/2-technical/2-tad-cdn.md#3-path-based-invalidation)
- [TAD: Invalidation API](/docs/2-technical/2-tad-cdn.md#invalidation-api)

Key pattern notes for this story:

- Purge requests should be idempotent (multiple purges have same effect as one)
- Use Vercel API `https://api.vercel.com/v1/purge` endpoint
- Set cache tags when serving responses to enable tag-based purging
- Limit full purge to emergency scenarios (require explicit confirmation)

### Troubleshooting

| Issue                                | Cause                                  | Solution                                         |
| ------------------------------------ | -------------------------------------- | ------------------------------------------------ |
| Purge requests return 401            | Invalid or missing API token           | Verify `VERCEL_PURGE_TOKEN` environment variable |
| Cache not invalidated after purge    | Purge propagation delay                | Wait 60 seconds for global propagation           |
| Tag-based purge doesn't work         | Cache tags not set on responses        | Add `Cache-Tag` header when serving content      |
| Rate limit hit unexpectedly          | Multiple clients using same token      | Use separate tokens per client/service           |
| Full purge fails                     | Missing confirmation token             | Include `confirm: "PURGE_ALL"` in request        |
| 403 Forbidden from Vercel API        | Invalid Vercel API token permissions   | Regenerate token with purge permissions          |

### Reference Materials

- [Vercel Cache Purging API](https://vercel.com/docs/rest-api/endpoints#purge-cache)
- [Cache-Tag Header Specification](https://www.w3.org/TR/edge-arch/)
- [HTTP 429 Rate Limiting](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Purge validator and authentication: 0.75h
- Vercel API integration: 1h
- Rate limiting implementation: 0.5h
- API endpoint and error handling: 0.5h
- Testing and documentation: 0.25h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Cache Invalidation](/docs/2-technical/2-tad-cdn.md#cache-invalidation) - Invalidation strategies and propagation times
- [TAD: Invalidation Decision Matrix](/docs/2-technical/2-tad-cdn.md#invalidation-decision-matrix) - When to use each strategy
- [TAD: Security Considerations](/docs/2-technical/2-tad-cdn.md#security-considerations) - Authentication and authorization

### Story-Specific Decisions

#### AD-3A.1.S6.1: API Token Authentication vs. Signed URLs

**Scope**: Story-specific (authentication method for purge API)

**Decision**: Use API token authentication (Bearer token) instead of signed URLs for purge requests

**Rationale**:
- API tokens simpler to implement and manage
- Purge API is server-to-server (not user-facing), so token auth sufficient
- Easier to rotate and revoke tokens
- Standard pattern for administrative APIs
- Signed URLs add unnecessary complexity for internal API

**Consequences**:
- Tokens must be securely stored (environment variables)
- Token rotation requires deployment to update
- Single token compromise could allow unauthorized purges
- Rate limiting by token is straightforward

**Alternatives Considered**:
- **Signed URLs with expiration**: Rejected due to complexity; overkill for server-to-server API
- **IP whitelist**: Rejected because IPs may change (cloud functions, CI/CD)
- **OAuth 2.0**: Rejected as too complex for internal administrative API
- **No authentication**: Rejected due to security risk (anyone could purge cache)

#### AD-3A.1.S6.2: Rate Limit of 100 Requests/Hour

**Scope**: Story-specific (rate limit threshold for this CDN)

**Decision**: Set rate limit at 100 purge requests per hour per API token

**Rationale**:
- Prevents accidental mass cache clearing from misconfigured scripts
- Allows reasonable operational use (1-2 purges per minute)
- Protects edge network from excessive invalidation load
- Can be increased if legitimate use case requires higher limit
- Industry standard for similar APIs (Cloudflare: 30/min, Fastly: 200/sec burst)

**Consequences**:
- Legitimate high-frequency purge scenarios may be blocked
- Developers must implement retry logic with exponential backoff
- Rate limit enforced per token (multiple tokens = multiple limits)
- Audit logs will capture rate limit violations

**Alternatives Considered**:
- **No rate limit**: Rejected due to abuse risk (runaway scripts, DoS)
- **10 requests/hour**: Rejected as too restrictive for normal operations
- **1000 requests/hour**: Rejected as too permissive (allows abuse)
- **Per-path rate limit**: Rejected due to implementation complexity

## Out of Scope

The following items are explicitly NOT part of this story:

- **Automatic Cache Warming** - Pre-population of cache after purge deferred to S7
- **Purge Scheduling** - Scheduled/recurring purges not required for MVP
- **Purge UI** - Web interface for cache management deferred to Epic 3B.6
- **Purge Analytics** - Metrics and monitoring deferred to Epic 2A.3 (Observability)
- **Multi-Environment Purge** - Purging across dev/staging/prod handled per environment
- **Granular Permissions** - Different tokens with different purge scopes (future enhancement)
- **Wildcard Path Purge** - Purging `/blog/*` patterns deferred (use tags instead)
- **Cache Warming API** - Separate endpoint for pre-populating cache (future enhancement)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: CDN Application Setup** - Requires API route structure and Vercel deployment

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Cache invalidation must be complete to test end-to-end workflows

## References

### Epic & TAD References

- [EPIC.md: Key Deliverables](./EPIC.md#overview) - "Cache invalidation API for programmatic purging"
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - "Cache invalidation API allows programmatic purging by path or tag"
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: Cache Invalidation](/docs/2-technical/2-tad-cdn.md#cache-invalidation)
- [TAD: Invalidation Strategies](/docs/2-technical/2-tad-cdn.md#invalidation-strategies)
- [TAD: Invalidation API](/docs/2-technical/2-tad-cdn.md#invalidation-api)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Vercel Cache API](https://vercel.com/docs/rest-api/endpoints#purge-cache)
- [Next.js Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [HTTP 401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401)
- [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)

## Verification Checklist

### Pre-Verification

- [ ] S1 (CDN Application Setup) completed
- [ ] `VERCEL_PURGE_TOKEN` environment variable configured
- [ ] Test content with cache tags deployed

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing (≥80% coverage)
- [ ] Purge propagation verified in production

### Documentation

- [ ] Code comments explain purge strategies
- [ ] README includes API usage examples
- [ ] Architecture decisions documented
- [ ] Error responses documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): implement cache invalidation API`)
- [ ] No unrelated changes included
- [ ] PR description includes purge API examples

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
