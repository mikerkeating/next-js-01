# Story 2A.8.S5: Request Caching Utilities

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: [S1: Package Setup and Base Client](./S1-package-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Request Interceptors](./S2-request-interceptors.md), [S3: Response Interceptors](./S3-response-interceptors.md), [S4: Retry Logic](./S4-retry-logic.md), [S6: File Upload Support](./S6-file-upload.md)

## User Story

**As a** frontend developer
**I want** the API client to cache GET requests with configurable TTL
**So that** duplicate requests are avoided, improving application performance and reducing server load

## Acceptance Criteria

- [ ] GET requests with same URL and query parameters return cached responses within TTL period
- [ ] Cache respects HTTP Cache-Control headers (no-store, no-cache, max-age)
- [ ] Cache implements LRU eviction with configurable max size (default 100 entries)
- [ ] Cache can be manually invalidated by URL pattern or cache key
- [ ] Cache works correctly in both server components and client components
- [ ] Cache is isolated per API client instance (no cross-instance contamination)
- [ ] Non-GET requests (POST, PUT, DELETE, PATCH) are never cached
- [ ] Cache handles concurrent requests to same URL (deduplication)
- [ ] Cache integrates with Next.js cache when used in server components
- [ ] Cache key generation handles query parameters, headers, and request body consistently

## Technical Requirements

### Files to Create

| Path                                            | Purpose                            |
| ----------------------------------------------- | ---------------------------------- |
| `packages/api-client/src/cache/memory-cache.ts` | In-memory LRU cache implementation |
| `packages/api-client/src/cache/cache-key.ts`    | Cache key generation utilities     |
| `packages/api-client/src/cache/types.ts`        | Cache-related TypeScript types     |
| `packages/api-client/src/cache/index.ts`        | Cache module exports               |

### Files to Modify

| Path                                | Changes                           |
| ----------------------------------- | --------------------------------- |
| `packages/api-client/src/client.ts` | Integrate cache into request flow |
| `packages/api-client/src/types.ts`  | Add cache configuration options   |
| `packages/api-client/src/index.ts`  | Export cache utilities            |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required - uses native JavaScript Map for LRU cache implementation.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                     | Requirement                                                    | TAD Reference                                                                     |
| --------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `cache.enabled`             | Boolean flag to enable/disable caching (default: true)         | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `cache.maxSize`             | Maximum cache entries before LRU eviction (default: 100)       | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `cache.defaultTTL`          | Default time-to-live in milliseconds (default: 300000 = 5 min) | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| `cache.respectCacheHeaders` | Honor HTTP Cache-Control headers (default: true)               | [TAD: API Client](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) |

**Configuration Rationale**: These settings provide reasonable defaults while allowing developers to tune cache behavior for specific use cases. The default TTL of 5 minutes balances data freshness with performance gains. LRU eviction prevents unbounded memory growth.

For complete API client configuration patterns, see: [TAD: Package Architecture](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

## Test Requirements

### Manual Verification

- [ ] **Cache Hit Verification**: Make two identical GET requests within TTL and verify the second returns cached data (network tab shows no second request)
- [ ] **Cache Expiration**: Make a GET request, wait for TTL to expire, make same request again and verify fresh data is fetched
- [ ] **Cache Invalidation**: Make a GET request, manually invalidate cache, make same request again and verify fresh fetch
- [ ] **LRU Eviction**: Create 101 cached entries and verify oldest entry is evicted when cache size exceeds maxSize
- [ ] **Server vs Client**: Verify cache works in both server component and client component contexts

### Automated Tests

- [ ] Unit: `cache/memory-cache.test.ts` - LRU cache implementation (set, get, delete, eviction)
- [ ] Unit: `cache/cache-key.test.ts` - Cache key generation consistency
- [ ] Unit: `client.test.ts` - Cache integration with request flow
- [ ] Unit: `cache/memory-cache.test.ts` - TTL expiration behavior
- [ ] Unit: `cache/memory-cache.test.ts` - Cache-Control header parsing
- [ ] Unit: `client.test.ts` - Request deduplication for concurrent identical requests
- [ ] Unit: `client.test.ts` - POST/PUT/DELETE requests are never cached

### Integration Tests

- [ ] Verify cache correctly handles concurrent requests to same URL (only one network request made)
- [ ] Verify cache respects Cache-Control: no-store header by not caching response
- [ ] Verify cache respects Cache-Control: max-age header by using it as TTL
- [ ] Verify manual cache invalidation by URL pattern correctly clears matching entries
- [ ] Verify cache isolation between different API client instances

### Verification Commands

```bash
# Run cache-specific unit tests
pnpm test packages/api-client/src/cache

# Run client integration tests including cache behavior
pnpm test packages/api-client/src/client.test.ts

# Run all API client tests with coverage
pnpm --filter @repo/api-client test:coverage

# Type check
pnpm --filter @repo/api-client type-check

# Lint
pnpm --filter @repo/api-client lint
```

## Implementation Notes

### Implementation Sequence

1. **Create Cache Types and Interfaces**
   - Define `CacheEntry` interface with value, expiry, metadata
   - Define `CacheConfig` interface for configuration options
   - Define cache key generation function signature

2. **Implement Cache Key Generation**
   - Create `generateCacheKey()` function that hashes URL + query params + relevant headers
   - Handle URL normalization (trailing slashes, parameter order)
   - Include relevant request headers in cache key (e.g., Accept, Accept-Language)

3. **Implement In-Memory LRU Cache**
   - Create `MemoryCache` class with Map-based storage
   - Implement `get(key)`, `set(key, value, ttl)`, `delete(key)`, `clear()` methods
   - Implement LRU eviction when size exceeds maxSize
   - Add TTL expiration checking in `get()` method

4. **Integrate Cache into API Client**
   - Modify `client.ts` to check cache before making GET requests
   - Parse Cache-Control headers from responses
   - Store successful GET responses in cache with appropriate TTL
   - Skip caching for non-GET methods and no-store responses

5. **Add Request Deduplication**
   - Track in-flight requests by cache key
   - Return existing Promise if same request is already in progress
   - Store result in cache when Promise resolves

6. **Add Cache Invalidation**
   - Implement `invalidateCache(pattern)` method to clear specific entries
   - Support wildcard patterns (e.g., `/api/users/*`)
   - Expose `clearCache()` method to clear all entries

### Key Concepts

- **LRU (Least Recently Used)**: Eviction algorithm that removes oldest accessed entries when cache is full
- **TTL (Time To Live)**: Duration in milliseconds before cached entry expires
- **Cache Key**: Unique identifier for cached response, generated from request parameters
- **Request Deduplication**: Preventing multiple identical requests from being sent simultaneously
- **Cache-Control Headers**: HTTP headers that control caching behavior (no-store, max-age, etc.)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: API Client - Cache Integration](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

Key pattern notes for this story:

- Use native JavaScript Map for LRU cache to avoid external dependencies
- Integrate with Next.js `fetch` cache when in server component context
- Generate cache keys by hashing normalized request parameters for consistency
- Check TTL expiration on every `get()` call and remove expired entries

### Troubleshooting

| Issue                                          | Cause                            | Solution                                                          |
| ---------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| Cache not working in server components         | Next.js has built-in fetch cache | Use Next.js cache API via `fetch` options instead of custom cache |
| Memory leak from unbounded cache growth        | No LRU eviction implemented      | Implement maxSize limit with LRU eviction                         |
| Cache returning stale data                     | TTL not being checked on get     | Check entry.expiry timestamp in `get()` method                    |
| Different cache keys for same request          | URL parameter order varies       | Normalize URL parameters by sorting before hashing                |
| Concurrent requests creating duplicate fetches | No request deduplication         | Track in-flight requests and return existing Promise              |

### Reference Materials

- [HTTP Caching - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cache-Control Header - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Next.js Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)
- [LRU Cache Algorithm](<https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)>)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Cache types and interfaces: 0.5h
- Cache key generation: 1h
- LRU cache implementation: 2h
- Client integration: 1.5h
- Request deduplication: 0.5h
- Testing and documentation: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.
> See [Architecture Decision Format](../../0-process/references/story-details-template.md#architecture-decision-format) for consolidation guidelines.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Native Fetch Wrapper](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) - Use native fetch for maximum Next.js compatibility
- [ADR-003: Next.js Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Server component caching uses Next.js cache

### Story-Specific Decisions

#### AD-2A.8.S5.1: In-Memory Map Instead of External Cache Library

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use native JavaScript Map for in-memory LRU cache instead of external libraries like `lru-cache` or `node-cache`.

**Rationale**:

- Reduces package dependencies and bundle size
- Map provides sufficient performance for typical cache sizes (100-1000 entries)
- Full control over implementation for Next.js server/client compatibility
- Avoids Node.js-specific APIs that don't work in Edge runtime

**Consequences**:

- Must manually implement LRU eviction logic
- Slightly more code to maintain vs using external library
- Better Edge runtime compatibility
- Zero dependency overhead

**Alternatives Considered**:

- **lru-cache package**: Popular LRU cache library - Rejected because it adds dependency and may have Node.js-specific code incompatible with Edge runtime
- **node-cache package**: Simple cache library - Rejected because it's Node.js-only and won't work in browser or Edge runtime

#### AD-2A.8.S5.2: Dual Cache Strategy for Server vs Client

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use Next.js `fetch` cache for server components and in-memory cache for client components.

**Rationale**:

- Next.js App Router has built-in fetch caching for server components
- Using both provides optimal performance in each environment
- Avoids fighting Next.js cache and creating inconsistent behavior
- Client components don't have access to Next.js cache

**Consequences**:

- Different cache implementations based on runtime environment
- Must detect server vs client context to choose cache strategy
- Server component caching leverages Next.js infrastructure
- Client component caching reduces redundant network requests

**Alternatives Considered**:

- **Unified in-memory cache only**: Single implementation - Rejected because it ignores Next.js built-in caching capabilities in server components
- **Next.js cache only**: Use Next.js cache everywhere - Rejected because client components don't have access to Next.js cache

## Out of Scope

The following items are explicitly NOT part of this story:

- **Persistent Cache Storage** - Only in-memory caching is implemented; persistent storage (Redis, localStorage) is deferred to future enhancement
- **Cache Warming** - Proactively fetching and caching data; deferred to future optimization
- **Cache Analytics** - Tracking cache hit/miss rates; deferred to observability package enhancements
- **Distributed Cache** - Cross-instance cache sharing in server environments; deferred to future scalability work
- **Conditional Requests** - Using ETags and If-None-Match headers; deferred to future optimization
- **Cache Compression** - Compressing cached responses; not required for in-memory cache with typical response sizes
- **Background Cache Refresh** - Refreshing cache entries before expiry; deferred to future enhancement

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup and Base Client** - Provides base API client structure that cache integrates into

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Requires all features (including cache) to be complete for comprehensive testing

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: API Client Package](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

### ADR References

- [ADR-003: Next.js Framework](/docs/2-technical/adr/003-nextjs-framework.md)

### External Documentation

- [HTTP Caching - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cache-Control Header - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/caching)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (S1)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Base API client from S1 available for integration

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage ≥ 80% for new code

### Documentation

- [ ] Code comments where logic isn't self-evident
- [ ] JSDoc comments for public cache methods
- [ ] Cache configuration options documented
- [ ] Architecture decisions documented

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
