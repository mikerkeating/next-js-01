# Story 3A.1.S4: Cache Headers and Content-Hash URLs

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: [S1: CDN Application Setup](./S1-cdn-app-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Image Optimisation Pipeline](./S2-image-optimisation.md), [S3: Image Transformation API](./S3-image-transformation.md), [S5: File Upload Utilities](./S5-file-upload.md), [S6: Cache Invalidation API](./S6-cache-invalidation.md)

## User Story

**As a** Developer
**I want** static assets to have content-hash URLs and long-term cache headers
**So that** I can achieve maximum cache performance while supporting instant updates through cache busting

## Acceptance Criteria

- [ ] Static assets return `Cache-Control: public, max-age=31536000, immutable` headers
- [ ] Content-hash filenames generated for all uploaded assets (e.g., `logo-abc123.png`)
- [ ] Content-hash utility creates SHA-256 hashes of file contents
- [ ] Hash changes when file content changes, remains same when content unchanged
- [ ] Next.js static assets (`/_next/static/*`) cached with 1-year max-age
- [ ] Custom static assets (`/images/*`, `/fonts/*`) cached with 1-year max-age
- [ ] API routes for asset metadata return appropriate cache headers
- [ ] Browser cache and edge cache both leverage long-term caching
- [ ] Zero cache invalidation needed for immutable assets
- [ ] Documentation includes cache header strategy and content-hash usage

## Technical Requirements

### Files to Create

| Path                                          | Purpose                                 |
| --------------------------------------------- | --------------------------------------- |
| `apps/cdn/lib/content-hash.ts`                | Content-hash generation utility         |
| `apps/cdn/lib/cache-headers.ts`               | Cache header constants and utilities    |
| `apps/cdn/app/api/assets/[hash]/route.ts`     | Asset delivery endpoint with headers    |
| `apps/cdn/lib/__tests__/content-hash.test.ts` | Unit tests for hash generation          |
| `apps/cdn/lib/__tests__/cache-headers.test.ts`| Unit tests for header utilities         |
| `apps/cdn/app/api/assets/[hash]/route.test.ts`| Integration tests for asset delivery    |

### Files to Modify

| Path                      | Changes                                              |
| ------------------------- | ---------------------------------------------------- |
| `apps/cdn/next.config.js` | Add cache header configurations for static paths     |
| `apps/cdn/README.md`      | Document content-hash strategy and cache headers     |
| `apps/cdn/lib/types.ts`   | Add types for content-hash and cache configurations  |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
cd apps/cdn

# No additional dependencies required
# Node.js crypto module provides hash functionality
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                       | Requirement                                | TAD Reference                                                                             |
| ----------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Static Asset Cache TTL        | 1 year (31536000 seconds)                  | [TAD: Caching Rules](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type)       |
| Immutable Directive           | Must include `immutable` for static assets | [TAD: Immutable Assets](/docs/2-technical/2-tad-cdn.md#2-immutable-assets)               |
| Hash Algorithm                | SHA-256 for content-hash generation        | [TAD: Asset Optimization](/docs/2-technical/2-tad-cdn.md#asset-optimization)             |
| Cache-Control Scope           | `public` for all static assets             | [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type)    |
| Content-Hash Filename Format  | `{name}-{hash}.{ext}` (e.g., `logo-abc123.png`) | [TAD: Cache Key Strategy](/docs/2-technical/2-tad-cdn.md#cache-key-strategy)        |

**Configuration Rationale**:
- 1-year cache TTL maximizes browser and edge cache hit ratio
- Immutable directive tells browsers never to revalidate cached assets
- Content-hash URLs enable cache busting without invalidation
- SHA-256 provides collision resistance for hash uniqueness
- Public scope allows edge caching for all users

For complete configuration templates, see: [TAD: Caching Rules by Content Type](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type)

## Test Requirements

### Manual Verification

- [ ] **Static Asset Headers**: Request `/_next/static/image.png` and verify `Cache-Control: public, max-age=31536000, immutable`
- [ ] **Content-Hash Stability**: Upload same file twice and verify identical hash generated
- [ ] **Content-Hash Changes**: Modify file content and verify hash changes
- [ ] **Browser Cache**: Verify browser uses cached asset on second page load (network shows "from disk cache")
- [ ] **Edge Cache**: Verify `X-Vercel-Cache: HIT` header on subsequent requests
- [ ] **Immutable Directive**: Verify browsers don't send revalidation requests for immutable assets

### Automated Tests

- [ ] Unit: `lib/__tests__/content-hash.test.ts` - Hash generation from buffer and file
- [ ] Unit: `lib/__tests__/cache-headers.test.ts` - Header utility functions
- [ ] Integration: `app/api/assets/[hash]/route.test.ts` - Asset delivery with correct headers

### Integration Tests

- [ ] Asset uploaded with content-hash returns same hash on subsequent requests
- [ ] Asset with same content but different filename produces identical hash
- [ ] Modified asset content produces different hash
- [ ] Cache headers correctly set for all static asset routes
- [ ] Browser and edge cache both utilize long-term caching
- [ ] Asset delivery endpoint returns appropriate content-type headers

### Verification Commands

```bash
# Build and test
cd apps/cdn
pnpm build
pnpm type-check
pnpm test

# Test cache headers (requires deployment)
# Static assets from Next.js
curl -I https://cdn.example.com/_next/static/chunks/main.js

# Expected headers:
# Cache-Control: public, max-age=31536000, immutable
# Content-Type: application/javascript
# X-Vercel-Cache: HIT (on second request)

# Custom static assets
curl -I https://cdn.example.com/images/logo-abc123.png

# Expected headers:
# Cache-Control: public, max-age=31536000, immutable
# Content-Type: image/png
# Age: 123 (increases on subsequent requests)

# Test content-hash generation
node -e "
const crypto = require('crypto');
const fs = require('fs');
const content = fs.readFileSync('test.png');
const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
console.log('Content hash:', hash);
"

# Verify hash stability (same file)
node -e "
const crypto = require('crypto');
const fs = require('fs');
const hash1 = crypto.createHash('sha256').update(fs.readFileSync('test.png')).digest('hex').slice(0, 8);
const hash2 = crypto.createHash('sha256').update(fs.readFileSync('test.png')).digest('hex').slice(0, 8);
console.log('Hashes match:', hash1 === hash2);
"
```

## Implementation Notes

### Implementation Sequence

1. **Create Content-Hash Utility**
   - Implement SHA-256 hash generation from file buffer
   - Add filename formatting function (`{name}-{hash}.{ext}`)
   - Support both Buffer and file path inputs
   - Extract hash from existing content-hash filenames

2. **Build Cache Header Utilities**
   - Define cache header constants for static assets
   - Create utility functions for header generation
   - Support different asset types (images, fonts, scripts)
   - Implement header validation

3. **Configure Next.js Headers**
   - Add header rules for `/_next/static/*` paths
   - Add header rules for `/images/*` paths
   - Add header rules for `/fonts/*` paths
   - Verify headers in build output

4. **Create Asset Delivery Endpoint**
   - Implement `/api/assets/[hash]/route.ts`
   - Parse content-hash from URL parameter
   - Retrieve asset by hash from storage
   - Set appropriate cache headers
   - Handle 404 for missing assets

5. **Test and Validate**
   - Write unit tests for hash generation
   - Test hash stability and collision resistance
   - Verify cache headers on all routes
   - Test browser and edge cache behavior

### Key Concepts

- **Content-Hash**: Hash of file contents (SHA-256) used in filename for cache busting
- **Immutable**: Cache directive indicating asset never changes (safe to cache forever)
- **max-age**: Number of seconds browser/edge should cache asset (31536000 = 1 year)
- **Cache Busting**: Technique where filename changes when content changes, forcing new fetch
- **Edge Cache**: Vercel's global CDN cache layer between browser and origin

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Cache-First Delivery](/docs/2-technical/2-tad-cdn.md#1-cache-first-delivery)
- [TAD: Immutable Assets](/docs/2-technical/2-tad-cdn.md#2-immutable-assets)
- [TAD: Cache Key Strategy](/docs/2-technical/2-tad-cdn.md#cache-key-strategy)

Key pattern notes for this story:

- Use first 8 characters of SHA-256 hash for filename (e.g., `abc12345`)
- Hash should be hex-encoded lowercase
- Preserve original file extension in hashed filename
- Cache headers set via `next.config.js` for static paths
- Asset delivery endpoint sets headers programmatically

### Troubleshooting

| Issue                                  | Cause                                | Solution                                          |
| -------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| Cache headers not applied              | Next.js config not loaded            | Restart dev server; verify config syntax          |
| Different hashes for same file         | Inconsistent hash algorithm or input | Use consistent SHA-256 implementation             |
| Browser revalidates immutable assets   | Missing `immutable` directive        | Add `immutable` to Cache-Control header           |
| Assets not cached at edge              | Missing `s-maxage` or wrong scope    | Use `public` scope and `s-maxage=31536000`        |
| Old asset served after update          | Old hash still in use                | Deploy with new hash; update references           |
| Hash collisions                        | Insufficient hash length             | Use at least 8 characters from SHA-256 hash       |

### Reference Materials

- [HTTP Cache-Control Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Cache-Control: immutable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#immutable)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options)
- [Vercel Edge Caching](https://vercel.com/docs/edge-network/caching)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Content-hash utility implementation: 1h
- Cache header configuration: 0.5h
- Asset delivery endpoint: 0.5h
- Unit and integration tests: 0.75h
- Documentation and verification: 0.25h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Immutable Assets](/docs/2-technical/2-tad-cdn.md#2-immutable-assets) - Static assets with content-hash are immutable
- [TAD: Three-Layer Cache Architecture](/docs/2-technical/2-tad-cdn.md#three-layer-cache-architecture) - Browser, edge, and application caching
- [TAD: Cache Key Strategy](/docs/2-technical/2-tad-cdn.md#cache-key-strategy) - Content-hash included in URL path

### Story-Specific Decisions

#### AD-3A.1.S4.1: SHA-256 with 8-Character Truncation

**Scope**: Story-specific (content-hash format for this CDN application)

**Decision**: Use SHA-256 hash algorithm with 8-character hex truncation for content-hash filenames

**Rationale**:
- SHA-256 provides strong collision resistance
- 8 characters (32 bits of entropy) sufficient for asset library size (2^32 = 4.3 billion unique hashes)
- Shorter filenames improve readability and debugging
- Hex encoding is standard, URL-safe, and widely supported
- Matches industry conventions (Webpack, Vite use similar truncation)

**Consequences**:
- Extremely low collision probability (1 in 4.3 billion for random files)
- Filenames remain readable: `logo-a1b2c3d4.png` vs `logo-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.png`
- Hash length consistent across all assets
- Easy to extract and validate hash from filename

**Alternatives Considered**:
- **Full SHA-256 (64 characters)**: Rejected due to excessively long filenames with no practical benefit
- **MD5 hash**: Rejected due to known collision vulnerabilities
- **4-character truncation**: Rejected due to higher collision probability (1 in 65,536)
- **12-character truncation**: Rejected as unnecessary for expected asset volume

#### AD-3A.1.S4.2: Filename Format `{name}-{hash}.{ext}`

**Scope**: Story-specific (filename convention for this CDN)

**Decision**: Use format `{name}-{hash}.{extension}` (e.g., `logo-abc12345.png`) instead of `{hash}.{ext}` or `{name}.{hash}.{ext}`

**Rationale**:
- Preserves original filename for developer clarity
- Single hyphen separator is clean and conventional
- Extension preserved for MIME type detection
- Easy to parse programmatically: `const [name, hash] = filename.split('-'); const ext = hash.split('.')[1];`
- Matches Webpack/Vite conventions

**Consequences**:
- Filenames include both semantic name and hash for debugging
- Developers can identify asset purpose from filename
- Hash extraction requires parsing hyphen-separated segments
- Original filename spaces must be normalized (replace with hyphens or underscores)

**Alternatives Considered**:
- **`{hash}.{ext}` only**: Rejected because loses filename context (hard to identify asset)
- **`{name}.{hash}.{ext}` (dot separator)**: Rejected due to confusion with extension (e.g., `logo.abc.png` vs `logo.abc.tar.gz`)
- **`{hash}-{name}.{ext}` (hash first)**: Rejected because less readable when alphabetically sorted

## Out of Scope

The following items are explicitly NOT part of this story:

- **Cache Invalidation** - Handled by S6 (Cache Invalidation API); immutable assets don't need invalidation
- **Image Transformation Cache Headers** - Handled by S3 (Image Transformation API)
- **File Upload Hash Generation** - Implemented in S5 (File Upload Utilities); this story provides the hash utility
- **Dynamic Content Caching** - Only static assets with content-hash; dynamic routes excluded
- **Cache Warming** - Pre-population of edge cache deferred to S7 (Integration Tests)
- **Client-Side Cache API** - Service worker caching not required for MVP
- **Cache Analytics** - Monitoring and metrics deferred to observability epic (2A.3)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: CDN Application Setup** - Requires Next.js app structure and base configuration

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Cache headers must be complete to validate end-to-end caching behavior

## References

### Epic & TAD References

- [EPIC.md: Key Deliverables](./EPIC.md#overview) - "Long-term caching headers with content-hash URLs"
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria) - "Content-hash URLs generated for all uploaded assets"
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-strategy)
- [TAD: Immutable Assets](/docs/2-technical/2-tad-cdn.md#2-immutable-assets)
- [TAD: Cache Key Strategy](/docs/2-technical/2-tad-cdn.md#cache-key-strategy)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Vercel: Edge Caching](https://vercel.com/docs/edge-network/caching)
- [Node.js: Crypto API](https://nodejs.org/api/crypto.html)

## Verification Checklist

### Pre-Verification

- [ ] S1 (CDN Application Setup) completed
- [ ] Local environment has Node.js crypto module available
- [ ] Test assets available for hash generation testing

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing (≥80% coverage)
- [ ] Cache headers verified in deployed environment

### Documentation

- [ ] Code comments explain hash algorithm choice
- [ ] README includes content-hash strategy
- [ ] Architecture decisions documented
- [ ] Cache header examples provided

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): implement content-hash URLs and cache headers`)
- [ ] No unrelated changes included
- [ ] PR description includes cache header examples

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
