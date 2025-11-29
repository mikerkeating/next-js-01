# Story 3A.1.S7: Integration Tests and Documentation

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: [S2: Image Optimisation Pipeline](./S2-image-optimisation.md), [S3: Image Transformation API](./S3-image-transformation.md), [S4: Cache Headers and Content-Hash URLs](./S4-cache-headers.md), [S5: File Upload Utilities](./S5-file-upload.md), [S6: Cache Invalidation API](./S6-cache-invalidation.md)
- **Blocks**: None (final story in epic)
- **Runs in Parallel With**: None (requires all feature stories to complete)

## User Story

**As a** Platform Engineer
**I want** comprehensive integration tests and clear documentation for the CDN application
**So that** I can confidently deliver optimized assets globally and troubleshoot issues effectively

## Acceptance Criteria

- [ ] Integration tests verify complete asset delivery pipeline (upload → optimization → edge delivery)
- [ ] Integration tests validate image transformation chain with multiple query parameters
- [ ] Integration tests confirm cache invalidation properly purges content
- [ ] End-to-end test validates global edge delivery with correct cache headers
- [ ] README.md provides deployment guide, configuration reference, and usage examples
- [ ] All API endpoints have comprehensive documentation
- [ ] Common usage patterns documented with code examples (image optimization, file upload, cache management)
- [ ] Troubleshooting guide covers CDN-specific issues (cache misses, slow delivery, format fallbacks)
- [ ] Test coverage reaches ≥80% across all CDN application modules
- [ ] CI pipeline runs all tests (unit + integration) on every commit
- [ ] Application builds successfully and passes all quality gates (lint, type-check, tests)
- [ ] Health check endpoint validates edge network connectivity

## Technical Requirements

### Files to Create

| Path                                                          | Purpose                                               |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/cdn/README.md`                                          | Application documentation with deployment and usage   |
| `apps/cdn/tests/integration/asset-delivery.test.ts`           | End-to-end asset delivery pipeline test               |
| `apps/cdn/tests/integration/image-transformation.test.ts`     | Image transformation chain integration test           |
| `apps/cdn/tests/integration/cache-invalidation.test.ts`       | Cache invalidation and purging integration test       |
| `apps/cdn/tests/integration/edge-delivery.test.ts`            | Global edge delivery and cache headers test           |
| `apps/cdn/tests/integration/file-upload.test.ts`              | File upload with validation integration test          |
| `apps/cdn/docs/TROUBLESHOOTING.md`                            | Common CDN issues and solutions                       |
| `apps/cdn/docs/DEPLOYMENT.md`                                 | Vercel deployment guide and configuration             |
| `apps/cdn/docs/API.md`                                        | API endpoint reference documentation                  |
| `apps/cdn/tests/e2e/global-delivery.spec.ts`                  | Playwright E2E test for global edge delivery          |

### Files to Modify

| Path                             | Changes                                             |
| -------------------------------- | --------------------------------------------------- |
| `apps/cdn/package.json`          | Add test scripts for integration and E2E tests      |
| `apps/cdn/vitest.config.ts`      | Configure integration test patterns and coverage    |
| `apps/cdn/playwright.config.ts`  | Configure E2E tests for edge delivery validation    |
| `turbo.json`                     | Add test tasks to CDN build pipeline                |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Test dependencies (from Epic 1A.3 - Testing Foundation):**
- `vitest` - Test runner for unit and integration tests
- `@testing-library/react` - React component testing utilities
- `playwright` - E2E testing for edge delivery validation
- `msw` - Mock Service Worker for API mocking (if needed)

**CDN-specific test utilities:**

```bash
# Navigate to apps/cdn
cd apps/cdn

# Add CDN-specific test utilities
pnpm add -D @vercel/edge-config-mock
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                     | Requirement                                                      | TAD Reference                                                     |
| --------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| Test coverage threshold     | ≥80% coverage required for statements, branches, functions       | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)  |
| Integration test pattern    | Files matching `*.integration.test.ts` in `tests/integration/`   | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)  |
| E2E test configuration      | Playwright tests validate edge delivery from multiple regions    | [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)  |
| Image test fixtures         | Sample images (JPEG, PNG, WebP) in `tests/fixtures/` directory   | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md)          |

**Configuration Rationale**:
- 80% coverage ensures critical CDN functionality (image optimization, cache headers, transformations) is tested
- Separate integration test pattern enables fast unit tests in development, full suite in CI
- Playwright E2E tests validate actual edge delivery from multiple geographic regions
- Image fixtures cover all supported formats (JPEG, PNG, WebP, GIF) for comprehensive testing

For complete testing patterns, see: [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)

## Test Requirements

### Manual Verification

- [ ] **Deployment Verification**: Follow DEPLOYMENT.md to deploy to Vercel staging - verify application is accessible at CDN subdomain
- [ ] **Image Transformation Test**: Visit `/api/image?url=/test.jpg&w=800&h=600&fmt=webp` - verify WebP image returned with correct dimensions
- [ ] **Cache Header Validation**: Use browser DevTools Network tab to verify cache headers (`Cache-Control: public, max-age=31536000, immutable`)
- [ ] **Global Edge Delivery**: Use Vercel Analytics to verify requests served from multiple POPs globally
- [ ] **Health Check Endpoint**: Visit `/api/health` - verify 200 OK response with CDN service status

### Automated Tests

- [ ] Integration: `asset-delivery.test.ts` - Upload image → optimize → deliver with content-hash URL and cache headers
- [ ] Integration: `image-transformation.test.ts` - Transform image with multiple params (width, height, quality, format) → verify output
- [ ] Integration: `cache-invalidation.test.ts` - Purge cache by tag → verify fresh content served on next request
- [ ] Integration: `edge-delivery.test.ts` - Verify cache headers set correctly for static assets and images
- [ ] Integration: `file-upload.test.ts` - Upload file with validation → verify file stored and accessible
- [ ] E2E: `global-delivery.spec.ts` - Request asset from simulated global locations → verify <100ms edge latency
- [ ] Coverage: CDN application achieves ≥80% coverage threshold

### Integration Tests

- [ ] Verify image optimization pipeline converts JPEG to WebP/AVIF based on Accept header
- [ ] Verify image transformation API handles multiple simultaneous transformations correctly
- [ ] Verify content-hash URL generation produces consistent hashes for identical files
- [ ] Verify cache invalidation API purges content by tag, path, and full cache
- [ ] Verify file upload validates file size (max 100MB) and format (JPEG, PNG, GIF, WebP, AVIF)
- [ ] Verify responsive image generation creates multiple sizes (640w, 750w, 1080w, 1920w)
- [ ] Verify lazy loading and blur placeholder work correctly for below-fold images
- [ ] Verify security headers (X-Content-Type-Options, X-Frame-Options) applied to all responses
- [ ] Verify compression (Brotli/Gzip) applied to static assets and API responses
- [ ] Verify health check endpoint returns degraded status when Vercel Edge Network unreachable

### Verification Commands

> **Note**: Verification command blocks may be up to 25 lines to accommodate multiple test commands.

```bash
# Run all unit tests
pnpm --filter @repo/cdn test

# Run integration tests
pnpm --filter @repo/cdn test:integration

# Run E2E tests (requires deployment)
pnpm --filter @repo/cdn test:e2e

# Run tests with coverage report
pnpm --filter @repo/cdn test:coverage

# Type check
pnpm --filter @repo/cdn type-check

# Lint
pnpm --filter @repo/cdn lint

# Build application
pnpm --filter @repo/cdn build

# Run all quality gates
pnpm --filter @repo/cdn ci

# Deploy to staging
vercel --env=staging

# Test health endpoint (after deployment)
curl https://cdn-staging.example.com/api/health
# Expected: {"status":"healthy","timestamp":"...","service":"cdn"}
```

## Implementation Notes

### Implementation Sequence

1. **Create Test Fixtures**
   - Add sample images to `tests/fixtures/` (JPEG, PNG, WebP, large/small sizes)
   - Create mock configuration files for Vercel Edge Config
   - Set up MSW handlers for external API mocking (if needed)

2. **Write Integration Tests**
   - Start with `asset-delivery.test.ts` covering full pipeline
   - Add `image-transformation.test.ts` for transformation API validation
   - Write `cache-invalidation.test.ts` for cache purging scenarios
   - Create `edge-delivery.test.ts` for cache header verification
   - Add `file-upload.test.ts` for upload validation

3. **Configure E2E Tests**
   - Set up Playwright configuration for CDN testing
   - Write `global-delivery.spec.ts` simulating requests from multiple regions
   - Configure Playwright to run against deployed staging environment
   - Add geolocation mocking for edge delivery testing

4. **Write Application Documentation**
   - Create README.md with quick start and configuration guide
   - Write DEPLOYMENT.md with Vercel deployment instructions
   - Document API endpoints in API.md with request/response examples
   - Create TROUBLESHOOTING.md with common CDN issues and solutions

5. **Add Test Scripts and Configuration**
   - Add `test:integration` script to run integration tests
   - Add `test:e2e` script to run Playwright tests
   - Add `test:coverage` script with 80% threshold
   - Update `ci` script to run all quality gates
   - Configure vitest to separate unit and integration tests

6. **Verify Coverage and Quality Gates**
   - Run coverage report and identify uncovered code
   - Add tests to reach 80% threshold
   - Verify all tests pass in local environment
   - Deploy to staging and run E2E tests
   - Verify CI pipeline passes all checks

### Key Concepts

- **Edge Delivery**: Content delivered from geographically distributed edge servers (POPs) closest to users for minimal latency
- **Content-Hash URL**: URL containing hash of file content (e.g., `logo-abc123.png`), enabling aggressive caching with immutable directive
- **Cache Invalidation**: Process of purging stale content from edge cache to serve fresh content on next request
- **Image Transformation**: On-the-fly image processing (resize, format conversion, quality adjustment) via URL query parameters
- **E2E Testing**: End-to-end tests validating complete user journey from request to response across real infrastructure

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: CDN Testing Patterns](/docs/2-technical/2-tad-cdn.md#testing-patterns)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)
- [TAD: Image Optimization](/docs/2-technical/2-tad-cdn.md#image-optimization)

Key pattern notes for this story:

- Integration tests should use real Next.js Image component to validate optimization behavior
- Use `node-fetch` to validate cache headers and response content in integration tests
- E2E tests should validate edge delivery from multiple simulated geographic locations
- Mock Vercel Edge Config for cache invalidation API testing to avoid production dependencies

### Troubleshooting

| Issue                                | Cause                                     | Solution                                                  |
| ------------------------------------ | ----------------------------------------- | --------------------------------------------------------- |
| Integration tests fail with 404      | Next.js dev server not running            | Start dev server before tests: `pnpm dev`                 |
| Image transformation test timeout    | Large image taking too long to process    | Use smaller test fixtures (<1MB), increase test timeout   |
| E2E tests fail with network error    | Application not deployed to staging       | Deploy to staging before running E2E: `vercel --env=staging` |
| Coverage below 80%                   | API routes and components not tested      | Add integration tests for uncovered API routes            |
| Cache invalidation test flaky        | Cache purge propagation delay             | Add 2-second wait after purge before verification         |
| Playwright tests fail with timeout   | Edge delivery slower than expected        | Increase Playwright timeout, check Vercel Analytics       |

### Reference Materials

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Edge Network Documentation](https://vercel.com/docs/edge-network/overview)
- [Vercel Image Optimization API](https://vercel.com/docs/image-optimization)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Vitest Integration Testing](https://vitest.dev/guide/)

## Estimated Effort

**Size**: M (8h)

**Breakdown**:

- Test fixtures and setup: 1h
- Integration tests (5 test files): 3h
- E2E tests with Playwright: 1.5h
- Documentation (README, DEPLOYMENT, API, TROUBLESHOOTING): 2h
- Coverage improvements and quality gates: 0.5h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: CDN Testing Patterns](/docs/2-technical/2-tad-cdn.md#testing-patterns) - Testing strategy for CDN-specific functionality
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md) - General testing strategy and coverage requirements
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Deployment platform and edge network provider

### Story-Specific Decisions

#### AD-3A.1.S7.1: E2E Tests Target Staging Environment

**Scope**: Story-specific (does not affect other stories)

**Decision**: Playwright E2E tests run against deployed staging environment on Vercel rather than local development server.

**Rationale**:

- **Edge Network Validation**: E2E tests must validate actual edge delivery from Vercel's global POPs, which isn't available in local dev
- **Cache Behavior**: Local dev server doesn't replicate Vercel's three-layer cache architecture (browser, edge, application)
- **Real Performance**: Testing against real edge network provides accurate latency measurements (<100ms p95 target)
- **Production Parity**: Staging environment matches production configuration (region, security headers, compression)

**Consequences**:

- E2E tests require staging deployment before running (can't run offline)
- Tests are slower due to network latency (acceptable for E2E vs integration tests)
- CI pipeline must deploy to staging before running E2E tests
- Developers can still run fast integration tests locally without deployment

**Alternatives Considered**:

- **Local dev server**: Run E2E against localhost - Rejected because edge network behavior can't be replicated locally
- **Mock Vercel Edge**: Simulate edge behavior locally - Rejected because complexity of accurate simulation outweighs benefits
- **Skip E2E tests**: Only run integration tests - Rejected because edge delivery is critical CDN functionality requiring E2E validation

#### AD-3A.1.S7.2: Integration Tests Use Real Image Processing

**Scope**: Story-specific (does not affect other stories)

**Decision**: Integration tests process real images with Next.js Image component rather than mocking image optimization.

**Rationale**:

- **Real Behavior**: Tests validate actual Next.js image optimization (WebP/AVIF conversion, responsive sizing)
- **Regression Prevention**: Catches breaking changes in Next.js image optimization behavior across upgrades
- **Format Validation**: Verifies browser capability detection and format fallback logic with real images
- **Performance Baseline**: Validates image processing completes within acceptable timeframe (<2s for typical images)

**Consequences**:

- Integration tests are slower (~500ms per image transformation vs <10ms for mocked tests)
- Tests require image fixtures in repository (~5MB total for comprehensive test suite)
- Tests depend on Next.js Image Optimization API behavior (acceptable for integration tests)
- CI environment must support image processing dependencies (Node canvas libraries)

**Alternatives Considered**:

- **Mock image processing**: Use `vi.fn()` to mock transformations - Rejected because misses real optimization bugs
- **Snapshot testing**: Compare processed images to snapshots - Rejected because brittle across platforms/Node versions
- **External image service**: Use Cloudinary/imgix for tests - Rejected because introduces external dependency and cost

## Out of Scope

The following items are explicitly NOT part of this story:

- **Visual Regression Testing** - Screenshot comparison testing for image quality; deferred to future optimization
- **Performance Benchmarks** - Comparative CDN performance vs competitors (Cloudflare, CloudFront); deferred to optimization phase
- **Load Testing** - Stress testing with millions of requests; deferred to Epic 4 (Scalability & Performance)
- **Video Optimization** - Video transcoding and delivery testing; deferred to post-MVP (video out of scope for MVP)
- **Interactive Documentation** - CodeSandbox/StackBlitz demos; deferred to Epic 7 (Documentation Delivery)
- **Migration Scripts** - Tools for migrating from existing CDN; not needed for greenfield project
- **Cost Monitoring Dashboard** - Bandwidth and compute cost tracking UI; deferred to Epic 6 (Admin Tools)
- **Multi-CDN Failover** - Automatic failover to backup CDN provider; not required for Vercel Edge Network (99.99% SLA)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Image Optimisation Pipeline** - Integration tests require image optimization functionality to validate WebP/AVIF conversion
- **S3: Image Transformation API** - Integration tests verify transformation chain with multiple query parameters
- **S4: Cache Headers and Content-Hash URLs** - Integration tests validate cache headers and content-hash URL generation
- **S5: File Upload Utilities** - Integration tests verify file upload with size and format validation
- **S6: Cache Invalidation API** - Integration tests confirm cache purging by tag, path, and full cache

### Enables (Unblocks These Epics)

- **Epic 3A.2: Routing Application Shell** - Complete CDN application ready for integration with routing app
- **Epic 3B.3: Routing Configuration (Product Routes)** - CDN proxy rules and asset delivery can be configured
- **Epic 3B.4: Documentation Application** - Optimized image delivery and static asset hosting available
- **Epic 3B.5: Demo & Marketing Application** - Asset management for marketing images and media ready

## References

### Epic & TAD References

- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: CDN Architecture (Detailed)](/docs/2-technical/2-tad-cdn.md)
- [TAD: Testing Architecture](/docs/2-technical/2-tad-testing.md)

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md)
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Vercel Image Optimization](https://vercel.com/docs/image-optimization)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)

## Verification Checklist

### Pre-Verification

- [ ] All dependent stories completed (S2, S3, S4, S5, S6)
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] All unit tests from previous stories passing
- [ ] Vercel account access available for staging deployment

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] All tests passing (`pnpm test`, `pnpm test:integration`, `pnpm test:e2e`)
- [ ] Coverage ≥80% for all modules (`pnpm test:coverage`)

### Documentation

- [ ] README.md complete with quick start and configuration reference
- [ ] DEPLOYMENT.md provides step-by-step Vercel deployment guide
- [ ] API.md documents all endpoints with request/response examples
- [ ] TROUBLESHOOTING.md covers common CDN issues and solutions
- [ ] Code examples in docs are tested and working

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): add integration tests and documentation`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 3A.1 and all completed stories

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
