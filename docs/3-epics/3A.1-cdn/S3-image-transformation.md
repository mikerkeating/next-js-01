# Story 3A.1.S3: Image Transformation API

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: [S1: CDN Application Setup](./S1-cdn-app-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Image Optimisation Pipeline](./S2-image-optimisation.md), [S4: Cache Headers](./S4-cache-headers.md), [S5: File Upload Utilities](./S5-file-upload.md), [S6: Cache Invalidation API](./S6-cache-invalidation.md)

## User Story

**As a** Developer
**I want** to transform images via URL query parameters (width, height, quality, format)
**So that** I can request the exact image dimensions and format needed for different UI contexts without storing multiple versions

## Acceptance Criteria

- [ ] Image width adjustable via `?w={width}` query parameter (e.g., `?w=800`)
- [ ] Image height adjustable via `?h={height}` query parameter (e.g., `?h=600`)
- [ ] Quality adjustable via `?q={quality}` query parameter, range 1-100 (e.g., `?q=85`)
- [ ] Format selectable via `?fmt={format}` query parameter (webp, avif, jpeg, png)
- [ ] Maximum dimensions enforced at 4096x4096 pixels (Vercel limit)
- [ ] Transformed images cached at edge with appropriate cache headers
- [ ] Invalid parameters return 400 Bad Request with error details
- [ ] Aspect ratio preserved when only width or height specified
- [ ] Fit mode supported: cover (default), contain, fill, inside, outside
- [ ] Edge runtime compatible for low-latency transformations

## Technical Requirements

### Files to Create

| Path                                               | Purpose                                    |
| -------------------------------------------------- | ------------------------------------------ |
| `apps/cdn/lib/transform-params.ts`                 | Query parameter parsing and validation     |
| `apps/cdn/lib/image-transformer.ts`                | Core transformation logic                  |
| `apps/cdn/app/api/transform/route.ts`              | Transformation API endpoint (Edge runtime) |
| `apps/cdn/lib/__tests__/transform-params.test.ts`  | Unit tests for parameter validation        |
| `apps/cdn/lib/__tests__/image-transformer.test.ts` | Unit tests for transformation logic        |
| `apps/cdn/app/api/transform/route.test.ts`         | Integration tests for API endpoint         |

### Files to Modify

| Path                      | Changes                                          |
| ------------------------- | ------------------------------------------------ |
| `apps/cdn/next.config.js` | Add edge runtime configuration for API routes    |
| `apps/cdn/README.md`      | Document transformation API usage and parameters |
| `apps/cdn/lib/types.ts`   | Add transformation parameter types               |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
cd apps/cdn

# No additional dependencies required
# Next.js and sharp (from S2) provide transformation capabilities
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting            | Requirement                                      | TAD Reference                                                                         |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Edge Runtime       | Transformation API must run on Edge runtime      | [TAD: Edge Capabilities](/docs/2-technical/2-tad-cdn.md#edge-capabilities)            |
| Maximum Dimensions | Enforce 4096x4096 pixel limit                    | [TAD: Constraints](/docs/2-technical/2-tad-cdn.md#constraints)                        |
| Supported Formats  | JPEG, PNG, WebP, AVIF                            | [TAD: Image Formats](/docs/2-technical/2-tad-cdn.md#image-formats)                    |
| Quality Range      | 1-100, default 85                                | [TAD: Image Optimization](/docs/2-technical/2-tad-cdn.md#image-optimization)          |
| Fit Modes          | cover, contain, fill, inside, outside            | [TAD: Image Transformation](/docs/2-technical/2-tad-cdn.md#image-optimization)        |
| Cache Control      | Public, s-maxage=31536000 for transformed images | [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type) |

**Configuration Rationale**:

- Edge runtime provides low-latency transformations globally (<50ms)
- 4096x4096 limit prevents memory exhaustion and abuse
- Multiple fit modes support different UI layout requirements
- Aggressive caching reduces transformation compute costs

For complete configuration templates, see: [TAD: Image Transformation Implementation](/docs/2-technical/2-tad-cdn.md#image-optimization)

## Test Requirements

### Manual Verification

- [ ] **Width Transformation**: Request `?w=800` and verify image is exactly 800px wide
- [ ] **Height Transformation**: Request `?h=600` and verify image is exactly 600px tall
- [ ] **Quality Adjustment**: Compare file sizes for `?q=50` vs `?q=95` (95 should be 2-3x larger)
- [ ] **Format Conversion**: Request `?fmt=webp` and verify Content-Type header is `image/webp`
- [ ] **Parameter Validation**: Request `?w=9999` and verify 400 error with clear message
- [ ] **Aspect Ratio**: Request `?w=800` (no height) and verify aspect ratio preserved

### Automated Tests

- [ ] Unit: `lib/__tests__/transform-params.test.ts` - Parameter parsing and validation logic
- [ ] Unit: `lib/__tests__/image-transformer.test.ts` - Transformation operations
- [ ] Integration: `app/api/transform/route.test.ts` - API endpoint responses and headers

### Integration Tests

- [ ] Valid transformation request returns transformed image with correct dimensions
- [ ] Invalid width parameter (>4096) returns 400 error
- [ ] Missing source URL returns 400 error with helpful message
- [ ] Concurrent transformation requests handled without rate limiting
- [ ] Transformed images cached at edge with correct cache headers
- [ ] Edge runtime executes transformations within <100ms (p95)

### Verification Commands

```bash
# Build and test
cd apps/cdn
pnpm build
pnpm type-check
pnpm test

# Test transformations (requires deployment)
# Resize to width 800
curl https://cdn.example.com/api/transform?url=/test.jpg&w=800 -I

# Expected headers:
# Content-Type: image/webp (or avif based on Accept header)
# Cache-Control: public, s-maxage=31536000, immutable
# Content-Length: [smaller than original]

# Resize with quality
curl https://cdn.example.com/api/transform?url=/test.jpg&w=800&q=50 -o test-low.jpg
curl https://cdn.example.com/api/transform?url=/test.jpg&w=800&q=95 -o test-high.jpg

# Verify file sizes (high quality should be 2-3x larger)
ls -lh test-*.jpg

# Test error handling
curl https://cdn.example.com/api/transform?w=10000 -v
# Expected: 400 Bad Request with error JSON

# Test format conversion
curl https://cdn.example.com/api/transform?url=/test.jpg&fmt=webp -I
# Expected: Content-Type: image/webp

# Test edge runtime performance
curl -w "@curl-format.txt" https://cdn.example.com/api/transform?url=/test.jpg&w=800
# Expected: time_total < 0.100 seconds
```

## Implementation Notes

### Implementation Sequence

1. **Create Parameter Validation**
   - Implement `transform-params.ts` with parsing and validation
   - Define TypeScript types for transformation parameters
   - Add validation rules for dimensions, quality, format

2. **Build Transformation Logic**
   - Create `image-transformer.ts` with core transformation functions
   - Implement resize logic with aspect ratio preservation
   - Add format conversion utilities
   - Implement quality adjustment

3. **Create Edge Runtime API**
   - Build `/api/transform/route.ts` with Edge runtime configuration
   - Integrate parameter validation and transformation logic
   - Add proper error handling with descriptive messages
   - Set appropriate cache headers

4. **Implement Fit Modes**
   - Add cover mode (default): crop to fill dimensions
   - Add contain mode: fit within dimensions (letterbox)
   - Add fill mode: stretch to exact dimensions
   - Add inside/outside modes for flexible sizing

5. **Test and Validate**
   - Write unit tests for parameter validation
   - Add tests for transformation operations
   - Test edge cases (invalid params, extreme dimensions)
   - Verify performance and cache behavior

### Key Concepts

- **Edge Runtime**: Lightweight JavaScript runtime at Vercel Edge Network that executes code globally with minimal latency; subset of Node.js APIs
- **Fit Modes**: Different strategies for resizing images to target dimensions while handling aspect ratio mismatches
- **Query Parameters**: URL parameters that modify resource behavior without changing the resource path (e.g., `?w=800&h=600`)
- **Content-Hash Caching**: Transformed images with identical parameters produce identical output, enabling aggressive caching

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Edge Runtime Implementation](/docs/2-technical/2-tad-cdn.md#edge-capabilities)
- [TAD: Image Transformation](/docs/2-technical/2-tad-cdn.md#image-optimization)
- [TAD: Parameter Validation](/docs/2-technical/2-tad-cdn.md#security-considerations)

Key pattern notes for this story:

- Use Zod or similar for runtime parameter validation
- Transform parameters should be parsed and normalized before transformation
- Invalid parameters return 400 with JSON error (not 500)
- Edge runtime limits require lightweight transformation logic
- Cache keys must include all transformation parameters

### Troubleshooting

| Issue                                  | Cause                                  | Solution                                               |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| Transformation fails with memory error | Image dimensions exceed runtime limits | Enforce 4096x4096 limit in validation                  |
| Edge runtime timeout                   | Transformation too complex for edge    | Reduce image size or use Node.js runtime for large ops |
| Wrong aspect ratio                     | Both width and height specified        | Use fit mode to control aspect ratio behavior          |
| Cache not working                      | Query params not in cache key          | Ensure cache key includes all transformation params    |
| Poor quality results                   | Quality setting too low                | Adjust default quality or document quality param usage |
| 400 errors for valid requests          | Overly strict validation               | Review validation rules and error messages             |

### Reference Materials

- [Next.js Image Optimization API](https://nextjs.org/docs/app/api-reference/components/image#loader-configuration)
- [Sharp Resize Options](https://sharp.pixelplumbing.com/api-resize)
- [Vercel Edge Runtime Limits](https://vercel.com/docs/functions/edge-functions/limitations)
- [Image Fit Strategies](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- Parameter validation logic: 1h
- Transformation implementation: 2h
- Edge runtime API endpoint: 1.5h
- Unit and integration tests: 1h
- Documentation and verification: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Edge Runtime for Transformations](/docs/2-technical/2-tad-cdn.md#edge-capabilities) - Use edge for low-latency global transformations
- [TAD: Maximum Image Dimensions](/docs/2-technical/2-tad-cdn.md#constraints) - 4096x4096 limit based on Vercel constraints
- [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type) - Aggressive caching for transformed images

### Story-Specific Decisions

#### AD-3A.1.S3.1: Cover as Default Fit Mode

**Scope**: Story-specific (applies to this transformation API)

**Decision**: Use "cover" as the default fit mode when both width and height are specified

**Rationale**:

- Cover mode crops to fill dimensions, most common use case for responsive images
- Prevents letterboxing/pillarboxing which creates awkward whitespace
- Matches CSS `object-fit: cover` behavior, familiar to developers
- Better UX for hero images, thumbnails, and cards
- Can override with `?fit=contain` for cases where full image must be visible

**Consequences**:

- Images may be cropped when aspect ratios don't match
- Developers must explicitly request `?fit=contain` for letterboxed images
- Consistent behavior across all transformation requests
- Aligns with Next.js Image component default behavior

**Alternatives Considered**:

- **Contain as default**: Rejected because letterboxing creates visual inconsistency in most UIs
- **Preserve aspect ratio (ignore one dimension)**: Rejected because developers expect both w and h to be honored
- **No default (require fit parameter)**: Rejected because adds unnecessary complexity for common case

#### AD-3A.1.S3.2: Quality Parameter Overrides Format-Specific Defaults

**Scope**: Story-specific (applies to this transformation API)

**Decision**: When `?q={quality}` is specified, it overrides format-specific quality defaults

**Rationale**:

- Provides explicit control for performance-critical scenarios
- Allows developers to optimize for specific use cases (thumbnails vs hero images)
- Predictable behavior: explicit parameter always wins
- Simplifies API documentation and testing

**Consequences**:

- Quality parameter applies uniformly regardless of format
- Developers can create very low quality images if desired (e.g., `?q=10`)
- No automatic quality adjustment based on format characteristics
- May result in suboptimal quality if developers don't understand format differences

**Alternatives Considered**:

- **Format-specific quality ranges**: Rejected because adds complexity and reduces predictability
- **Ignore quality for certain formats**: Rejected because limits developer control

## Out of Scope

The following items are explicitly NOT part of this story:

- **Advanced Transformations** - Crop, rotate, flip, blur, watermark deferred to future enhancement
- **Face Detection / Smart Crop** - AI-powered cropping deferred to post-MVP
- **Signed URLs** - Authentication/authorization for transformations deferred to Epic 3B.6
- **Rate Limiting** - DDoS protection handled at Vercel edge layer; app-level rate limiting not required for S3
- **Batch Transformations** - Single image per request; batch operations not supported
- **Transformation Presets** - Named presets (e.g., "thumbnail", "hero") deferred to future enhancement
- **EXIF Preservation** - Metadata stripped during transformation; preservation not required
- **Animation Support** - Animated GIF/WebP transformation not supported (static frames only)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: CDN Application Setup** - Requires Next.js app structure and API route foundation

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Transformation API must be complete to validate end-to-end CDN functionality

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Key Deliverables](./EPIC.md#overview) - "Image transformation via URL query parameters"
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: Image Optimization (Detailed)](/docs/2-technical/2-tad-cdn.md#image-optimization)
- [TAD: Edge Capabilities](/docs/2-technical/2-tad-cdn.md#edge-capabilities)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

## Verification Checklist

### Pre-Verification

- [ ] S1 (CDN Application Setup) completed
- [ ] Local environment has Sharp and Next.js configured
- [ ] Test images available for transformation testing

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing (≥80% coverage)
- [ ] Edge runtime compatibility verified

### Documentation

- [ ] Code comments explain transformation logic
- [ ] API parameters documented in README
- [ ] Architecture decisions documented
- [ ] Error messages are clear and actionable

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): implement image transformation API`)
- [ ] No unrelated changes included
- [ ] PR description includes transformation examples

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
