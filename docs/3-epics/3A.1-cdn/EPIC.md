# Epic 3A.1: CDN & Asset Management Application

> **To create stories for this epic:** Define the epic scope and acceptance criteria first, then break down into stories following the [story template](../../0-process/references/story-details-template.md). Each story should be independently implementable and testable.

## Context

- **PRD Reference**: [PRD: Feature C.2 - Advanced File Management & CDN](/docs/1-product/1-prd.md#feature-c2-advanced-file-management--cdn)
- **TAD Reference**: [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- **Detailed TAD**: [TAD: CDN Architecture (Detailed)](/docs/2-technical/2-tad-cdn.md)
- **Phase**: 3A - Platform Applications
- **Type**: Foundation

## Dependencies

### Requires (Must Complete First)

| Epic | Title | Reason |
|------|-------|--------|
| 2A.8 | [API Client Package](../2A.8-api-client/EPIC.md) | Provides type-safe HTTP client for CDN API interactions and file uploads |

### Blocks (Enables These Epics)

| Epic | Title | What This Provides |
|------|-------|-------------------|
| 3A.2 | Routing Application Shell | CDN asset references for static files, images, and optimized delivery |
| 3B.3 | Routing Configuration (Product Routes) | CDN proxy rules and asset delivery integration |
| 3B.4 | Documentation Application | Optimized image delivery and static asset hosting |
| 3B.5 | Demo & Marketing Application | Asset management for marketing images and media |

### Can Run in Parallel With

| Epic | Title | Notes |
|------|-------|-------|
| 2B.1 | Product Database Schema | No shared dependencies; CDN is infrastructure-only |
| 2B.2 | Multi-Tenant Organisation Model | No shared dependencies |
| 2B.3 | Product Analytics Events & Taxonomy | No shared dependencies |

## Overview

Create the CDN & Asset Management application (`/apps/cdn`) that provides static asset delivery with automatic optimisation, global edge distribution, and comprehensive caching. This application leverages Vercel's Edge Network to deliver images, fonts, and static files with minimal latency worldwide. It includes image transformation utilities, content-hash URL generation, and cache management APIs.

**Key Deliverables:**

- `/apps/cdn` Next.js application deployed to Vercel
- Image optimisation pipeline (WebP/AVIF conversion, responsive sizing)
- Image transformation via URL query parameters (width, height, quality, format)
- Long-term caching headers with content-hash URLs
- Vercel Edge distribution configuration
- DDoS protection and rate limiting at edge
- File upload utilities with validation
- Cache invalidation API for programmatic purging
- Health check endpoint for CDN status monitoring

## Acceptance Criteria

> **Note**: Epic acceptance criteria should be high-level outcomes. Story-level criteria provide the detailed verification.

- [ ] CDN application is deployed and accessible at configured subdomain (e.g., `cdn.example.com`)
- [ ] Images are automatically converted to WebP/AVIF format based on browser support
- [ ] Image transformations are available via query params (`?w=800&h=600&q=85&fmt=webp`)
- [ ] Static assets return cache headers with 1-year max-age and immutable directive
- [ ] Content-hash URLs are generated for all uploaded assets
- [ ] Global edge delivery achieves <100ms latency (p95) for cached assets
- [ ] DDoS protection automatically filters malicious traffic at edge
- [ ] File uploads support drag-and-drop with size validation (max 100MB)
- [ ] Cache invalidation API allows programmatic purging by path or tag
- [ ] Health check endpoint (`/api/health`) responds within 100ms
- [ ] Package has ≥80% test coverage
- [ ] All stories complete and verified
- [ ] Documentation updated (README, API reference, usage examples)

## Stories

| ID | Title | Size | Status | Depends On | Blocks |
|----|-------|------|--------|------------|--------|
| S1 | [CDN Application Setup](./S1-cdn-app-setup.md) | M | ⬜ | - | S2, S3, S4, S5, S6 |
| S2 | [Image Optimisation Pipeline](./S2-image-optimisation.md) | M | ⬜ | S1 | S7 |
| S3 | [Image Transformation API](./S3-image-transformation.md) | M | ⬜ | S1 | S7 |
| S4 | [Cache Headers and Content-Hash URLs](./S4-cache-headers.md) | S | ⬜ | S1 | S7 |
| S5 | [File Upload Utilities](./S5-file-upload.md) | M | ⬜ | S1 | S7 |
| S6 | [Cache Invalidation API](./S6-cache-invalidation.md) | S | ⬜ | S1 | S7 |
| S7 | [Integration Tests and Documentation](./S7-integration-tests.md) | M | ⬜ | S2, S3, S4, S5, S6 | - |

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

## Story Dependency Graph

```
S1 (CDN application setup)
 ├──→ S2 (Image optimisation pipeline)
 ├──→ S3 (Image transformation API)
 ├──→ S4 (Cache headers & content-hash)
 ├──→ S5 (File upload utilities)
 └──→ S6 (Cache invalidation API)
       ↓
      S7 (Integration tests & documentation)
```

**Parallel Execution Notes:**

- S2, S3, S4, S5, and S6 can all run in parallel after S1 completes
- S7 requires all feature implementations (S2-S6) to complete before integration testing

## Technical Constraints

### Required Patterns

- **Next.js Image Component**: Use Next.js Image Optimization for automatic format conversion and responsive images - [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#asset-optimization)
- **Cache-First Delivery**: All static assets must use cache-first strategy with immutable headers - [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#caching-strategy)
- **Edge Distribution**: Leverage Vercel Edge Network for global distribution - [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#vercel-edge-network)
- **Monorepo Application**: Application must follow `/apps/*` structure - [ADR-001](/docs/2-technical/adr/001-monorepo-turborepo.md)

### Technology Decisions

| Decision | Choice | Reference |
|----------|--------|-----------|
| Hosting Platform | Vercel | [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) |
| Image Formats | WebP/AVIF with JPEG/PNG fallback | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#image-formats) |
| Caching Strategy | Three-layer (browser, edge, application) | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#three-layer-cache-architecture) |
| Monorepo Tool | Turborepo | [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) |

### Constraints

- **Vercel Image Optimization**: Must use Next.js built-in image optimization (not external services like Cloudinary or imgix)
- **File Size Limits**: Maximum 100MB per file upload (Vercel deployment limit)
- **Supported Formats**: Input images must be JPEG, PNG, GIF, WebP, or AVIF
- **Edge Runtime**: Image transformation API routes must be compatible with Edge runtime
- **Cache TTL**: Static assets with content-hash URLs must use 1-year cache (31536000 seconds)
- **Response Time**: Cached asset delivery must be <100ms globally (p95)

## Out of Scope

The following items are explicitly NOT part of this epic:

- **Video Transcoding** - Video processing deferred to post-MVP; CDN delivers videos as-is
- **Audio Processing** - No audio manipulation; pass-through delivery only
- **Asset Management UI** - UI for managing assets deferred to Epic 3B.6 (Authenticated Tools)
- **Asset Metadata Database** - Asset tracking stored in product database (Epic 2B.1)
- **Organisation-Scoped Assets** - Multi-tenant asset isolation implemented in product layer (Epic 3B.6)
- **External CDN Providers** - Cloudflare, CloudFront, etc. not used; Vercel Edge Network only
- **Custom Domain SSL** - SSL managed automatically by Vercel; no custom certificate management

## Actions or Decisions Required

> **Note**: Flag decisions that need resolution before or during implementation.

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| CDN subdomain naming | `cdn.example.com` vs `assets.example.com` | Affects URL structure and configuration | ⬜ Open |
| Image transformation security | Signed URLs vs rate limiting only | Prevents abuse of transformation API | ⬜ Open |
| Maximum image dimensions | 4096x4096 vs 8192x8192 | Affects memory usage and processing time | ✅ Resolved: 4096x4096 per Vercel limits |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| High bandwidth costs from large images | Medium | Medium | Implement aggressive caching, image size limits, and format conversion to reduce file sizes |
| Image transformation abuse | Medium | High | Implement rate limiting per IP and signed URLs for transformations |
| Cache invalidation delays | Low | Medium | Document 60-second propagation time; provide instant purge for critical paths |
| Edge function cold start latency | Low | Low | Pre-warm critical paths; use ISR for frequently accessed images |

## Estimated Effort

| Metric | Value |
|--------|-------|
| Total Stories | 7 |
| Total Hours | 36h |
| Calendar Days | 3-5 days |
| Parallel Tracks | 5 (S2-S6 can run in parallel) |

### Story Breakdown

| Size | Count | Hours |
|------|-------|-------|
| XS (1-2h) | 0 | 0h |
| S (2-4h) | 2 | 8h |
| M (4-8h) | 5 | 28h |
| L (8-16h) | 0 | 0h |

## References

### Internal Documentation

- [PRD: Feature C.2 - Advanced File Management & CDN](/docs/1-product/1-prd.md#feature-c2-advanced-file-management--cdn)
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: CDN Architecture (Detailed)](/docs/2-technical/2-tad-cdn.md)
- [Roadmap: Phase 3A](/docs/1-product/3-roadmap.md#phase-3a-platform-applications-week-4)

### ADRs

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Vercel Image Optimization](https://vercel.com/docs/image-optimization)
- [Cache-Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

## Status

- **State**: Not Started
- **Started**: -
- **Completed**: -
- **Stories Complete**: 0/7
