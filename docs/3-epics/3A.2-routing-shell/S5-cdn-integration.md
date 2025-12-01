# Story 3A.2.S5: Configure CDN Asset References

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: [S1: Initialize Routing Application](./S1-initialize-routing-app.md)
- **Blocks**: [S6: Create Responsive Shell Layout](./S6-responsive-shell.md)
- **Runs in Parallel With**: [S2: Rewrite Configuration Framework](./S2-rewrite-framework.md), [S3: SEO Utilities](./S3-seo-utilities.md), [S4: Analytics Integration](./S4-analytics-integration.md)

## User Story

**As a** Platform Engineer
**I want** the routing application to reference static assets from the CDN with optimized delivery
**So that** images, fonts, and static files are served with minimal latency and proper caching from the edge network

## Acceptance Criteria

- [ ] Next.js image configuration references CDN domain for optimized image delivery
- [ ] Static assets (fonts, icons) are served from CDN with content-hashed URLs
- [ ] Image components use Next.js Image Optimization with automatic format selection (WebP/AVIF)
- [ ] Cache headers for static assets include 1-year max-age and immutable directive
- [ ] CDN image transformations work via Next.js Image component (width, height, quality)
- [ ] Font files are preloaded from CDN for critical rendering path
- [ ] All static assets return proper CORS headers for cross-origin requests
- [ ] Lighthouse performance audit shows optimized asset delivery (score > 90)

## Technical Requirements

### Files to Create

| Path                                         | Purpose                             |
| -------------------------------------------- | ----------------------------------- |
| `apps/routing/lib/cdn.ts`                    | CDN URL utilities and helpers       |
| `apps/routing/components/OptimizedImage.tsx` | Wrapper component for Next.js Image |
| `apps/routing/public/fonts/.gitkeep`         | Font directory placeholder          |

### Files to Modify

| Path                              | Changes                                          |
| --------------------------------- | ------------------------------------------------ |
| `apps/routing/next.config.js`     | Add image domain configuration, asset prefix     |
| `apps/routing/app/layout.tsx`     | Add font preload links, configure font loading   |
| `apps/routing/package.json`       | Add @vercel/analytics dependency for CDN metrics |
| `apps/routing/.env.local.example` | Add CDN_DOMAIN environment variable example      |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
cd apps/routing
pnpm add @vercel/analytics
pnpm add next-fonts
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting               | Requirement                                            | TAD Reference                                                                         |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Image Domains         | Configure allowed CDN domains for image optimization   | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#configuration)                 |
| Image Formats         | Enable AVIF and WebP with JPEG/PNG fallback            | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#image-formats)                 |
| Image Sizes           | Configure responsive breakpoints (640-3840px)          | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#responsive-images)             |
| Cache Control Headers | Set 1-year max-age with immutable for static assets    | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#caching-rules-by-content-type) |
| Font Loading Strategy | Use font-display: swap with preload for critical fonts | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#font-loading-strategy)         |

**Configuration Rationale**:

- Image domain configuration is required for Next.js Image Optimization to work with external CDN
- Modern image formats (AVIF/WebP) reduce bandwidth by 40-60% compared to JPEG/PNG
- Responsive image sizes ensure appropriate images are served for each viewport
- Immutable cache headers enable aggressive browser caching without revalidation
- Font preloading prevents FOIT (Flash of Invisible Text) and improves LCP scores

For complete configuration templates, see: [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#next-js-configuration)

## Test Requirements

### Manual Verification

- [ ] **Image Optimization**: Open DevTools Network tab, verify images are served in WebP/AVIF format from CDN
- [ ] **Cache Headers**: Inspect response headers for static assets, verify `Cache-Control: public, max-age=31536000, immutable`
- [ ] **Font Loading**: Check Network tab, verify font files are preloaded and served from CDN
- [ ] **Lighthouse Audit**: Run Lighthouse performance audit, verify score > 90 with optimized images
- [ ] **Image Transformations**: Test Next.js Image component with different sizes, verify correct transformations

### Automated Tests

- [ ] Unit: `lib/cdn.test.ts` - CDN URL utilities generate correct paths
- [ ] Unit: `components/OptimizedImage.test.tsx` - Image component renders with correct props
- [ ] Unit: `next.config.test.js` - Image configuration includes required domains and formats

### Integration Tests

- [ ] CDN domain resolves correctly and serves assets with <100ms latency
- [ ] Next.js Image Optimization API returns transformed images with correct dimensions
- [ ] Font files are accessible from CDN and return correct MIME types
- [ ] CORS headers are present on CDN responses for cross-origin requests

### Verification Commands

```bash
# Build application
cd apps/routing
pnpm build

# Start production server
pnpm start

# Test image optimization endpoint (in separate terminal)
curl -I "http://localhost:3000/_next/image?url=/test-image.jpg&w=800&q=75"

# Expected response headers:
# Content-Type: image/webp
# Cache-Control: public, max-age=31536000, immutable

# Test CDN URL utility
pnpm vitest run lib/cdn.test.ts

# Run Lighthouse audit
pnpm lighthouse http://localhost:3000 --only-categories=performance
```

## Implementation Notes

### Implementation Sequence

1. **Configure Next.js Image Optimization**
   - Update `next.config.js` with image domains and formats
   - Configure device sizes and image sizes for responsive images
   - Set minimum cache TTL to 1 year (31536000 seconds)
   - Enable AVIF and WebP formats with fallback

2. **Create CDN Utility Functions**
   - Implement `getCdnUrl()` function for asset URL generation
   - Add `getImageUrl()` helper for image-specific URLs
   - Create `getFontUrl()` helper for font file references
   - Include content-hash URL generation utilities

3. **Build Optimized Image Component**
   - Create `OptimizedImage` wrapper around Next.js Image
   - Add default props for quality, priority, and loading strategy
   - Include automatic srcset generation for responsive images
   - Add blur placeholder support for better UX

4. **Configure Font Loading**
   - Update root layout with font preload links
   - Configure `next/font` for self-hosted Google Fonts
   - Set `font-display: swap` to prevent FOIT
   - Add font files to public directory or CDN reference

5. **Set Up Environment Variables**
   - Add `CDN_DOMAIN` to environment configuration
   - Update `.env.local.example` with CDN configuration
   - Ensure CDN domain is configurable per environment (dev, staging, prod)

6. **Add Response Headers**
   - Configure cache headers in `next.config.js`
   - Add security headers (X-Content-Type-Options, etc.)
   - Set CORS headers for cross-origin asset access

### Key Concepts

- **Next.js Image Optimization**: Automatic image transformation, format conversion, and responsive image generation at request time
- **Content-Hash URLs**: URLs include file content hash for cache-busting and immutable caching
- **Font Preloading**: Loading critical fonts early in page load to improve rendering performance
- **Edge Network**: Vercel's global CDN that serves assets from locations closest to users
- **Modern Image Formats**: AVIF and WebP provide superior compression compared to JPEG/PNG

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Next.js Image Component Usage](/docs/2-technical/2-tad-cdn.md#next-js-image-component)
- [TAD: Font Optimization Patterns](/docs/2-technical/2-tad-cdn.md#font-optimization)
- [TAD: Cache Header Configuration](/docs/2-technical/2-tad-cdn.md#next-js-configuration)

Key pattern notes for this story:

- Use Next.js `next/image` for all images; avoid standard `<img>` tags
- Self-host fonts via `next/font/google` rather than external Google Fonts CDN
- Always specify width and height for images to prevent layout shift (CLS)
- Use `priority` prop for above-the-fold images to improve LCP

### Troubleshooting

| Issue                                 | Cause                                  | Solution                                                            |
| ------------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Images not loading from CDN           | CDN domain not in image domains config | Add CDN domain to `next.config.js` images.domains or remotePatterns |
| Images served in JPEG instead of WebP | Browser doesn't support WebP/AVIF      | Verify `formats: ['image/avif', 'image/webp']` in next.config.js    |
| Font flash of unstyled text (FOUT)    | Font not preloaded                     | Add `<link rel="preload">` for critical fonts in layout             |
| Image transformation errors           | Invalid image dimensions or format     | Validate image dimensions are within Vercel limits (4096x4096)      |
| Cache headers not applied             | Headers configuration missing          | Add headers configuration to next.config.js for static assets       |
| CORS errors on CDN assets             | Missing CORS headers                   | Configure CORS headers in Vercel CDN settings or next.config.js     |

### Reference Materials

- [Next.js Image Optimization Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Vercel Image Optimization](https://vercel.com/docs/image-optimization)
- [Web.dev: Optimize Images](https://web.dev/fast/#optimize-your-images)
- [Web.dev: Font Best Practices](https://web.dev/font-best-practices/)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Next.js image configuration: 45 minutes
- CDN utility functions: 30 minutes
- OptimizedImage component: 45 minutes
- Font loading configuration: 30 minutes
- Testing and verification: 30 minutes

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Image Format Selection](/docs/2-technical/2-tad-cdn.md#image-formats) - Use AVIF/WebP with JPEG/PNG fallback
- [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-strategy) - Three-layer caching with 1-year TTL for static assets
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md) - Use Vercel Edge Network for global distribution

### Story-Specific Decisions

#### AD-3A.2.S5.1: Self-Hosted Fonts via next/font

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use Next.js `next/font/google` to self-host Google Fonts rather than loading from Google's CDN.

**Rationale**:

- Eliminates external request to Google Fonts CDN, reducing latency
- Improves privacy by not sending user data to Google
- Enables better caching control (same-origin assets)
- Automatic font subsetting and optimization by Next.js
- Prevents layout shift with automatic font-display configuration

**Consequences**:

- Font files are bundled with application deployment
- Slightly larger deployment size (fonts included)
- Better performance and privacy for end users
- No external dependencies for font loading

**Alternatives Considered**:

- **Option 1**: Use Google Fonts CDN directly - Rejected due to privacy concerns and external dependency
- **Option 2**: Manually self-host font files - Rejected because next/font provides automatic optimization and subsetting

#### AD-3A.2.S5.2: OptimizedImage Wrapper Component

**Scope**: Story-specific (does not affect other stories)

**Decision**: Create an `OptimizedImage` wrapper component around Next.js Image rather than using `next/image` directly throughout the app.

**Rationale**:

- Provides consistent default props (quality, loading strategy)
- Enables project-wide image optimization standards
- Simplifies developer experience with sensible defaults
- Allows for centralized image tracking and analytics
- Easier to update image optimization strategy in future

**Consequences**:

- Developers use `<OptimizedImage>` instead of `<Image>` from next/image
- Additional abstraction layer (minimal overhead)
- Consistent image behavior across entire application
- Easier to enforce accessibility requirements (alt text validation)

**Alternatives Considered**:

- **Option 1**: Use next/image directly everywhere - Rejected due to lack of consistent defaults and harder to enforce standards
- **Option 2**: ESLint rule to enforce image props - Rejected because wrapper component provides better DX and flexibility

## Out of Scope

The following items are explicitly NOT part of this story:

- **Video Optimization** - Video processing and CDN delivery handled in future epic (post-MVP)
- **Custom Image Transformations** - Advanced image manipulation (filters, effects) beyond Next.js built-in transformations
- **Asset Management UI** - User interface for uploading and managing CDN assets (handled in Epic 3B.6)
- **Image Upload Functionality** - File upload utilities are part of CDN application (Epic 3A.1)
- **Organization-Scoped Assets** - Multi-tenant asset isolation (handled in Epic 2B.6)
- **Advanced Cache Invalidation** - Programmatic cache purging (handled in CDN application Epic 3A.1)
- **SVG Optimization** - SVG processing and optimization (deferred to post-MVP)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Initialize Routing Application - Requires Next.js application structure and configuration foundation

### Enables (Unblocks These Stories)

- **S6**: Create Responsive Shell Layout - Provides optimized image and asset delivery for responsive components

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md)
- [TAD: Asset Optimization](/docs/2-technical/2-tad-cdn.md#asset-optimization)
- [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-strategy)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Vercel Image Optimization](https://vercel.com/docs/image-optimization)
- [Web.dev: Optimize Images Guide](https://web.dev/fast/#optimize-your-images)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Initialize Routing Application) completed
- [ ] Epic 3A.1 (CDN & Asset Management Application) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] CDN domain configured and accessible

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully
- [ ] All images use OptimizedImage component or next/image
- [ ] Lighthouse performance score > 90
- [ ] Cache headers verified on static assets
- [ ] Image format conversion working (WebP/AVIF)
- [ ] Font preloading implemented

### Documentation

- [ ] CDN utility functions documented with JSDoc comments
- [ ] OptimizedImage component props documented
- [ ] Environment variable (.env.local.example) updated with CDN_DOMAIN
- [ ] Architecture decisions documented in this story

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `feat(3A.2.S5): configure cdn asset references`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Sample next.config.js Image Configuration

```javascript
// apps/routing/next.config.js
const config = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.CDN_DOMAIN || "cdn.example.com",
        pathname: "/**",
      },
    ],
  },
};
```

## Appendix B: Sample OptimizedImage Component Usage

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Above-the-fold image (priority load)
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero section"
  width={1920}
  height={1080}
  priority
/>

// Below-the-fold image (lazy load)
<OptimizedImage
  src="/feature-image.jpg"
  alt="Feature showcase"
  width={800}
  height={600}
  loading="lazy"
/>
```

## Appendix C: Font Preload Example

```tsx
// apps/routing/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```
