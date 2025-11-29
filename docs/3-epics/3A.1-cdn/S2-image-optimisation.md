# Story 3A.1.S2: Image Optimisation Pipeline

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: [S1: CDN Application Setup](./S1-cdn-app-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S3: Image Transformation API](./S3-image-transformation.md), [S4: Cache Headers](./S4-cache-headers.md), [S5: File Upload Utilities](./S5-file-upload.md), [S6: Cache Invalidation API](./S6-cache-invalidation.md)

## User Story

**As a** Content Manager
**I want** images automatically optimized to modern formats (WebP/AVIF) based on browser support
**So that** transformation frameworks load quickly with 40-60% smaller file sizes while maintaining visual quality

## Acceptance Criteria

- [ ] Images automatically convert to AVIF for browsers with support (Chrome, Edge, Firefox)
- [ ] Images fallback to WebP for browsers without AVIF support
- [ ] Images fallback to JPEG/PNG for legacy browsers
- [ ] Format selection based on `Accept` header detection
- [ ] Optimized images cached with 1-year TTL and immutable directive
- [ ] Image quality configurable via query parameter (default: 85)
- [ ] Responsive image sizes generated automatically (640w, 750w, 1080w, 1920w)
- [ ] Lazy loading enabled by default for below-fold images
- [ ] Blur placeholder option available for better UX
- [ ] Image optimization works for both static imports and dynamic URLs

## Technical Requirements

### Files to Create

| Path                                                 | Purpose                                      |
| ---------------------------------------------------- | -------------------------------------------- |
| `apps/cdn/lib/image-optimizer.ts`                    | Core image optimization utilities            |
| `apps/cdn/lib/format-selector.ts`                    | Browser capability detection and selection   |
| `apps/cdn/components/OptimizedImage.tsx`             | Wrapper component for Next.js Image          |
| `apps/cdn/app/api/image/route.ts`                    | Image optimization API endpoint              |
| `apps/cdn/lib/__tests__/image-optimizer.test.ts`     | Unit tests for optimizer                     |
| `apps/cdn/lib/__tests__/format-selector.test.ts`     | Unit tests for format selector               |
| `apps/cdn/components/__tests__/OptimizedImage.test.tsx` | Component tests                          |

### Files to Modify

| Path                            | Changes                                     |
| ------------------------------- | ------------------------------------------- |
| `apps/cdn/next.config.js`       | Add image optimization configuration        |
| `apps/cdn/app/page.tsx`         | Add example usage of OptimizedImage         |
| `apps/cdn/package.json`         | Add sharp dependency for image processing   |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
cd apps/cdn

# Image processing library
pnpm add sharp

# Testing utilities
pnpm add -D @testing-library/react @testing-library/jest-dom
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                    | Requirement                                                  | TAD Reference                                                                  |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Image Formats              | Enable AVIF and WebP with JPEG/PNG fallback                  | [TAD: Image Formats](/docs/2-technical/2-tad-cdn.md#image-formats)            |
| Device Sizes               | Support 640, 750, 828, 1080, 1200, 1920, 2048, 3840 widths   | [TAD: Responsive Images](/docs/2-technical/2-tad-cdn.md#responsive-images)    |
| Image Sizes                | Support 16, 32, 48, 64, 96, 128, 256, 384 for small images   | [TAD: Image Configuration](/docs/2-technical/2-tad-cdn.md#image-optimization) |
| Minimum Cache TTL          | Set to 31536000 seconds (1 year)                             | [TAD: Caching Rules](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type) |
| Quality                    | Default 85 for good balance of size vs quality               | [TAD: Image Optimization](/docs/2-technical/2-tad-cdn.md#image-optimization)  |
| Dangerous Allow SVG        | Disabled for security (prevent XSS)                          | [TAD: Security](/docs/2-technical/2-tad-cdn.md#security-considerations)       |
| Content Security Policy    | Restrict SVG execution with sandbox                          | [TAD: Security Headers](/docs/2-technical/2-tad-cdn.md#security-considerations) |

**Configuration Rationale**:
- AVIF provides 50-60% smaller files than JPEG with same quality
- WebP provides 25-35% smaller files as fallback
- Multiple device sizes ensure optimal image for each viewport
- 1-year cache reduces bandwidth and improves performance
- Quality 85 is sweet spot: imperceptible quality loss with significant size savings

For complete configuration templates, see: [TAD: Next.js Image Configuration](/docs/2-technical/2-tad-cdn.md#next-js-configuration)

## Test Requirements

### Manual Verification

- [ ] **Format Selection**: Open DevTools Network tab, verify AVIF served in Chrome, WebP in Safari, JPEG in IE11 polyfill
- [ ] **Responsive Sizes**: Resize browser window and verify different image sizes loaded via `srcset` attribute
- [ ] **Lazy Loading**: Scroll page and verify below-fold images only load when visible in viewport
- [ ] **Cache Headers**: Verify optimized images return `Cache-Control: public, max-age=31536000, immutable`
- [ ] **Quality Setting**: Test `?q=50` and `?q=95` query params and verify file size differences

### Automated Tests

- [ ] Unit: `lib/__tests__/format-selector.test.ts` - Format selection logic based on Accept header
- [ ] Unit: `lib/__tests__/image-optimizer.test.ts` - Image optimization utilities and quality settings
- [ ] Component: `components/__tests__/OptimizedImage.test.tsx` - Component rendering with various props
- [ ] Integration: Image optimization API returns correct format based on request headers

### Integration Tests

- [ ] Browser sends `Accept: image/avif` → Server responds with AVIF image
- [ ] Browser sends `Accept: image/webp` → Server responds with WebP image
- [ ] No modern format support → Server responds with JPEG/PNG original
- [ ] Optimized image file size is 40-60% smaller than original
- [ ] Multiple concurrent image requests handled without performance degradation

### Verification Commands

```bash
# Build application and verify image config
cd apps/cdn
pnpm build

# Type check
pnpm type-check

# Run tests
pnpm test

# Test format selection (requires deployment)
# AVIF support (Chrome)
curl -H "Accept: image/avif,image/webp,*/*" https://cdn.example.com/api/image?url=/test.jpg -I

# Expected headers:
# Content-Type: image/avif
# Cache-Control: public, max-age=31536000, immutable

# WebP fallback (Safari)
curl -H "Accept: image/webp,*/*" https://cdn.example.com/api/image?url=/test.jpg -I

# Expected headers:
# Content-Type: image/webp
# Cache-Control: public, max-age=31536000, immutable

# Verify responsive sizes
curl https://cdn.example.com/api/image?url=/test.jpg&w=640 -I
curl https://cdn.example.com/api/image?url=/test.jpg&w=1920 -I
```

## Implementation Notes

### Implementation Sequence

1. **Configure Next.js Image Optimization**
   - Update `next.config.js` with image formats, sizes, and cache settings
   - Configure security policies for SVG handling
   - Set minimum cache TTL for optimized images

2. **Implement Format Selection Logic**
   - Create `format-selector.ts` utility to parse `Accept` header
   - Implement fallback chain: AVIF → WebP → JPEG/PNG
   - Add browser capability detection

3. **Create Image Optimizer Utilities**
   - Implement `image-optimizer.ts` with quality adjustment logic
   - Add responsive size calculation helpers
   - Create blur placeholder generation utility

4. **Build OptimizedImage Component**
   - Wrap Next.js Image component with sensible defaults
   - Add lazy loading configuration
   - Implement blur placeholder option
   - Add responsive sizing presets

5. **Test and Validate**
   - Write unit tests for format selection and optimization
   - Add component tests for OptimizedImage
   - Test across different browsers and devices
   - Verify cache headers and file sizes

### Key Concepts

- **Format Selection**: Browser sends `Accept` header indicating supported formats (e.g., `Accept: image/avif,image/webp,*/*`); server selects best format from supported list
- **Responsive Images**: Multiple image sizes generated at build time; browser selects appropriate size based on viewport width using `srcset` attribute
- **Lazy Loading**: Images below viewport ("below fold") defer loading until user scrolls; uses Intersection Observer API
- **Blur Placeholder**: Tiny (< 1KB) base64-encoded preview shown while full image loads; improves perceived performance

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Next.js Image Component](/docs/2-technical/2-tad-cdn.md#next-js-image-component)
- [TAD: Image Format Selection](/docs/2-technical/2-tad-cdn.md#image-formats)
- [TAD: Responsive Images Implementation](/docs/2-technical/2-tad-cdn.md#responsive-images)

Key pattern notes for this story:

- Use Next.js built-in Image component rather than custom implementation
- Format selection happens automatically based on `Accept` header
- Responsive sizes use `sizes` prop to optimize for different viewports
- Priority prop for above-fold images to preload immediately
- Default to lazy loading for below-fold images

### Troubleshooting

| Issue                               | Cause                                      | Solution                                           |
| ----------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| Images not converting to AVIF/WebP  | Missing `formats` config in next.config.js | Add `formats: ['image/avif', 'image/webp']`        |
| Sharp dependency installation fails | Missing system libraries                   | Install libvips: `brew install vips` (macOS)       |
| Images not lazy loading             | `priority` prop set on all images          | Only use `priority` for above-fold images          |
| Large file sizes                    | Quality too high                           | Reduce quality to 75-85 range                      |
| Blur placeholder not working        | Missing blur data URL                      | Use `placeholder="blur"` with `blurDataURL` prop   |
| Cache headers incorrect             | `minimumCacheTTL` not set                  | Set `minimumCacheTTL: 31536000` in image config    |

### Reference Materials

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [WebP Format Specification](https://developers.google.com/speed/webp)
- [AVIF Format Specification](https://aomediacodec.github.io/av1-avif/)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Next.js image configuration and format setup: 1.5h
- Format selection logic implementation: 1h
- OptimizedImage component development: 1.5h
- Unit and component tests: 1.5h
- Manual verification and documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Image Formats](/docs/2-technical/2-tad-cdn.md#image-formats) - AVIF/WebP format selection strategy
- [TAD: Next.js Image Optimization](/docs/2-technical/2-tad-cdn.md#image-optimization) - Use of Next.js built-in optimization vs external services
- [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type) - 1-year immutable cache for optimized images

### Story-Specific Decisions

#### AD-3A.1.S2.1: Default Image Quality of 85

**Scope**: Story-specific (applies to this CDN app but could be adjusted per use case)

**Decision**: Set default image quality to 85 instead of Next.js default (75) or maximum quality (100)

**Rationale**:
- Quality 85 provides imperceptible quality loss for most images
- 40-60% file size reduction compared to original JPEG
- Balances visual fidelity with bandwidth optimization
- Can be overridden via query parameter for specific use cases
- Industry best practice for web delivery (Google PageSpeed recommends 85)

**Consequences**:
- Smaller file sizes improve page load performance
- Reduced bandwidth costs for both origin and edge delivery
- Quality adequate for transformation framework images and general web use
- High-resolution product photography may need quality override (e.g., `?q=95`)

**Alternatives Considered**:
- **Quality 75 (Next.js default)**: Rejected because slightly more visible compression artifacts for important client-facing content
- **Quality 95**: Rejected because file sizes 2-3x larger with minimal perceptible quality improvement
- **Adaptive quality based on image type**: Deferred to future optimization; adds complexity without clear ROI

#### AD-3A.1.S2.2: Disable SVG by Default

**Scope**: Story-specific (security decision for this CDN app)

**Decision**: Set `dangerouslyAllowSVG: false` in Next.js image configuration

**Rationale**:
- SVG files can contain embedded JavaScript (XSS vulnerability)
- CDN should serve raster images primarily (photos, screenshots)
- Icons and illustrations should use dedicated icon library or inlined SVGs
- Security-first approach prevents accidental SVG uploads with malicious code

**Consequences**:
- SVG uploads via image optimizer will be rejected
- Icons must be handled separately (e.g., via icon library like Lucide)
- Reduces attack surface for XSS vulnerabilities
- May require separate workflow for legitimate SVG assets

**Alternatives Considered**:
- **Enable SVG with sanitization**: Rejected because sanitization is complex and error-prone; prefer defense-in-depth
- **Enable SVG with strict CSP**: Rejected because CSP can be bypassed; better to disable entirely

## Out of Scope

The following items are explicitly NOT part of this story:

- **Image Transformation API** - Query parameter transformations (resize, crop, rotate) handled in S3
- **File Upload Interface** - Upload functionality and validation handled in S5
- **Cache Invalidation** - Programmatic cache purging handled in S6
- **Video Optimization** - Video transcoding deferred to post-MVP; not supported in this story
- **Custom Domain Configuration** - CDN domain setup assumed complete from S1
- **Image Metadata Extraction** - EXIF data extraction and storage deferred to Epic 3B.6 (Asset Management UI)
- **AI-Powered Image Optimization** - Smart cropping and content-aware compression deferred to future enhancement

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: CDN Application Setup** - Requires Next.js app structure, configuration, and deployment pipeline

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Image optimization must be complete to validate end-to-end CDN functionality

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Asset Optimization](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: Image Optimization (Detailed)](/docs/2-technical/2-tad-cdn.md#image-optimization)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Image Optimization](https://vercel.com/docs/image-optimization)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

## Verification Checklist

### Pre-Verification

- [ ] S1 (CDN Application Setup) completed
- [ ] Local environment has Sharp dependencies installed
- [ ] Browser DevTools Network tab available for manual testing

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing (≥80% coverage)
- [ ] Manual verification in multiple browsers (Chrome, Safari, Firefox)

### Documentation

- [ ] Code comments explain format selection logic
- [ ] JSDoc comments on public functions
- [ ] Architecture decisions documented

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): implement image optimization pipeline`)
- [ ] No unrelated changes included
- [ ] PR description complete with before/after file size comparisons

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
