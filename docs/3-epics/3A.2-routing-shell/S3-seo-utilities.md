# Story 3A.2.S3: Build SEO Utilities

> **To implement this story:** Read the Technical Requirements, create the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Routing Application Shell](./EPIC.md)
- **Depends On**: [S1: Initialize Routing Application](./S1-initialize-routing-app.md)
- **Blocks**: [S6: Create Responsive Shell Layout](./S6-responsive-shell.md)
- **Runs in Parallel With**: [S2: Implement Rewrite Configuration Framework](./S2-rewrite-framework.md), [S4: Integrate Analytics](./S4-analytics-integration.md), [S5: Configure CDN Asset References](./S5-cdn-integration.md)

## User Story

**As a** Platform Engineer
**I want** comprehensive SEO utilities including meta tags, sitemap generation, and robots.txt configuration
**So that** the routing application achieves Lighthouse SEO scores > 90 and ranks well in search engines

## Acceptance Criteria

- [ ] Utility functions generate proper meta tags (title, description, Open Graph, Twitter Card)
- [ ] Sitemap.xml generates automatically with all routes and proper priority/frequency settings
- [ ] Robots.txt configures correctly for production and staging environments
- [ ] Metadata API generates structured data (JSON-LD) for organization and content
- [ ] Lighthouse SEO audit scores > 90 on all shell pages
- [ ] Meta tag utilities support environment-specific configuration (staging vs production URLs)
- [ ] Documentation explains how to add routes to sitemap and customize meta tags

## Technical Requirements

### Files to Create

| Path                                              | Purpose                                      |
| ------------------------------------------------- | -------------------------------------------- |
| `apps/routing/src/lib/seo/meta-tags.ts`           | Meta tag generation utilities                |
| `apps/routing/src/lib/seo/structured-data.ts`     | JSON-LD structured data generation           |
| `apps/routing/src/lib/seo/sitemap-config.ts`      | Sitemap route configuration                  |
| `apps/routing/app/sitemap.ts`                     | Dynamic sitemap generation                   |
| `apps/routing/app/robots.ts`                      | Dynamic robots.txt generation                |
| `apps/routing/src/config/seo-config.ts`           | SEO configuration (defaults, site info)      |
| `apps/routing/tests/seo/meta-tags.test.ts`        | Unit tests for meta tag utilities            |
| `apps/routing/tests/seo/structured-data.test.ts`  | Unit tests for structured data               |
| `apps/routing/tests/seo/sitemap.test.ts`          | Unit tests for sitemap generation            |
| `apps/routing/docs/SEO.md`                        | Documentation for SEO utilities              |

### Files to Modify

| Path                              | Changes                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `apps/routing/app/layout.tsx`     | Add default metadata export and viewport configuration    |
| `apps/routing/app/page.tsx`       | Add generateMetadata function for home page               |
| `apps/routing/next.config.js`     | Configure metadata base URL from environment variables    |
| `apps/routing/.env.local.example` | Add SEO-related environment variables (NEXT_PUBLIC_URL)   |
| `apps/routing/README.md`          | Add section linking to SEO.md                             |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Navigate to apps/routing
cd apps/routing

# No additional dependencies required - Next.js provides built-in SEO APIs
# Metadata API, sitemap, and robots.txt are built into Next.js 16
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                 | Requirement                                       | TAD Reference                                                               |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| Metadata Base URL       | Environment-specific base URL for absolute links  | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture) |
| Open Graph Images       | Default og:image, Twitter Card image              | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md)                     |
| Sitemap Priority        | Route-specific priority values (0.0 - 1.0)        | [EPIC: Technical Constraints](./EPIC.md#technical-constraints)              |
| Sitemap Change Frequency| Route-specific update frequency                   | [EPIC: Technical Constraints](./EPIC.md#technical-constraints)              |
| Robots.txt Rules        | Environment-specific crawl permissions            | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md) |
| Structured Data         | Organization, WebSite, WebPage schemas            | [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture) |

**Configuration Rationale**:
- Next.js 16 Metadata API provides type-safe, built-in SEO support
- Environment-specific URLs prevent staging content from being indexed
- Structured data improves search engine understanding and rich snippets
- Sitemap priority and frequency guide search engine crawling behavior
- Open Graph and Twitter Card metadata improve social sharing

For complete Next.js metadata patterns, see: [Next.js Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

## Test Requirements

### Manual Verification

- [ ] **Lighthouse SEO Audit**: Run Lighthouse audit on home page and verify score > 90
- [ ] **Meta Tag Validation**: Inspect home page HTML and verify all required meta tags are present
- [ ] **Open Graph Preview**: Test Open Graph tags using Facebook Sharing Debugger or similar tool
- [ ] **Sitemap Accessibility**: Visit `/sitemap.xml` and verify valid XML with all routes
- [ ] **Robots.txt Accessibility**: Visit `/robots.txt` and verify proper directives for environment
- [ ] **Structured Data Validation**: Use Google Rich Results Test to validate JSON-LD markup

### Automated Tests

- [ ] Unit: `meta-tags.test.ts` - Generates correct meta tag objects for various page types
- [ ] Unit: `meta-tags.test.ts` - Handles missing optional metadata gracefully
- [ ] Unit: `structured-data.test.ts` - Generates valid JSON-LD for Organization schema
- [ ] Unit: `structured-data.test.ts` - Generates valid JSON-LD for WebPage schema
- [ ] Unit: `sitemap.test.ts` - Generates valid sitemap XML structure
- [ ] Unit: `sitemap.test.ts` - Includes all configured routes with correct priority and frequency

### Integration Tests

- [ ] Sitemap.xml endpoint returns valid XML that passes W3C sitemap validator
- [ ] Robots.txt endpoint returns correct directives based on environment (staging vs production)
- [ ] Metadata resolves correctly for pages using generateMetadata async function
- [ ] Structured data appears in page HTML and validates with Google's validator
- [ ] Environment variable changes correctly update metadata base URL

### Verification Commands

```bash
# Build application to verify SEO configuration
cd apps/routing
pnpm build

# Type check
pnpm type-check

# Run tests
pnpm test

# Start development server
pnpm dev

# Test sitemap endpoint
curl http://localhost:3000/sitemap.xml | head -50

# Test robots.txt endpoint
curl http://localhost:3000/robots.txt

# Run Lighthouse audit (requires Chrome)
pnpm lighthouse http://localhost:3000 --only-categories=seo --view

# Validate structured data (requires running server)
# Visit: https://search.google.com/test/rich-results
# Enter: http://localhost:3000
```

## Implementation Notes

### Implementation Sequence

1. **Create SEO Configuration**
   - Define default SEO settings (site name, description, default OG image)
   - Create configuration file with environment-aware URL handling
   - Define constants for structured data organization info

2. **Implement Meta Tag Utilities**
   - Create utility function to generate Next.js Metadata objects
   - Support page-specific overrides (title, description, images)
   - Handle Open Graph and Twitter Card metadata
   - Support canonical URLs and alternate language tags

3. **Implement Structured Data Utilities**
   - Create JSON-LD generator for Organization schema
   - Create JSON-LD generator for WebPage schema
   - Create JSON-LD generator for BreadcrumbList schema
   - Ensure all structured data validates against schema.org

4. **Configure Sitemap Generation**
   - Define sitemap route configuration (paths, priority, changefreq)
   - Implement dynamic sitemap generation using Next.js sitemap API
   - Support environment-specific base URLs
   - Include lastmod timestamps for routes

5. **Configure Robots.txt**
   - Implement dynamic robots.txt using Next.js robots API
   - Block crawlers on staging environments
   - Allow crawlers on production
   - Include sitemap reference

6. **Update Application Layout**
   - Add default metadata export to root layout
   - Configure viewport settings
   - Add favicon and app icon configuration
   - Include structured data in layout

7. **Update Home Page**
   - Add generateMetadata function for home page
   - Include page-specific meta tags
   - Add home page structured data

8. **Create Documentation**
   - Document how to add routes to sitemap
   - Provide examples for custom meta tags
   - Explain environment variable configuration
   - Include troubleshooting guide for common SEO issues

9. **Write Tests**
   - Unit tests for meta tag generation
   - Unit tests for structured data
   - Integration tests for sitemap and robots.txt
   - Lighthouse audit integration

### Key Concepts

- **Next.js Metadata API**: Built-in API for generating HTML meta tags from metadata objects or async functions
- **Open Graph Protocol**: Meta tags that control how URLs are displayed when shared on social media
- **Twitter Cards**: Similar to Open Graph, specifically for Twitter sharing
- **Structured Data (JSON-LD)**: Machine-readable data embedded in pages to help search engines understand content
- **Sitemap.xml**: XML file listing all URLs on a site with metadata for search engine crawlers
- **Robots.txt**: Text file instructing search engine crawlers which pages to crawl or avoid

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference Next.js documentation for implementation patterns:

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Sitemap Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

Key pattern notes for this story:

- Use static metadata export for routes that don't need dynamic data
- Use generateMetadata async function for routes requiring server-side data
- Prefer generateMetadata over template for complex meta tag logic
- Include absolute URLs in Open Graph tags using metadataBase config
- Validate all structured data against schema.org specifications

### Troubleshooting

| Issue                                      | Cause                                          | Solution                                                     |
| ------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| Meta tags not appearing in HTML            | Missing metadata export from layout or page    | Ensure metadata or generateMetadata is exported              |
| Open Graph images show relative URLs       | metadataBase not configured                    | Set metadataBase in next.config.js using NEXT_PUBLIC_URL     |
| Sitemap.xml returns 404                    | File not in app directory root                 | Ensure sitemap.ts is at apps/routing/app/sitemap.ts          |
| Robots.txt returns 404                     | File not in app directory root                 | Ensure robots.ts is at apps/routing/app/robots.ts            |
| Lighthouse SEO score < 90                  | Missing meta description or title tags         | Verify all pages have title and description metadata         |
| Structured data validation fails           | Invalid JSON-LD syntax or missing required fields | Validate against schema.org and use Google Rich Results Test |
| Staging site appears in Google search      | Robots.txt allows crawling on staging          | Ensure robots.ts blocks crawlers when not in production      |
| Sitemap shows incorrect URLs               | Wrong base URL in environment variable         | Verify NEXT_PUBLIC_URL matches deployment domain             |

### Reference Materials

- [Next.js Metadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Open Graph Protocol Specification](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Structured Data](https://schema.org/)
- [Google Lighthouse SEO Audit](https://developer.chrome.com/docs/lighthouse/seo/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- SEO configuration setup: 1h
- Meta tag and structured data utilities: 2h
- Sitemap and robots.txt implementation: 1.5h
- Layout and page metadata integration: 1h
- Documentation and testing: 1.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Next.js provides built-in Metadata API
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md) - Environment variables for base URL configuration
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture) - Multi-app routing affects sitemap organization

### Story-Specific Decisions

#### AD-3A.2.S3.1: Environment-Specific Robots.txt

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement dynamic robots.txt that blocks all crawlers on non-production environments using environment detection.

**Rationale**:
- Prevents staging and preview environments from being indexed by search engines
- Avoids duplicate content penalties from search engines
- Protects unreleased features from public discovery
- Follows SEO best practices for staging environments
- Simple environment variable check (production vs. non-production)

**Consequences**:
- Production environment must set environment variable correctly
- Staging deployments are protected from search engine indexing
- Preview deployments on Vercel are automatically protected
- Developers must test SEO on production or production-like environments

**Alternatives Considered**:
- **Option 1**: Static robots.txt file - Rejected because it can't adapt to environment
- **Option 2**: Manual robots.txt per environment - Rejected because it's error-prone and requires manual deployment steps

#### AD-3A.2.S3.2: Sitemap Generation Strategy

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use static sitemap generation with manually configured routes rather than dynamic route discovery.

**Rationale**:
- Routing shell has minimal routes (home, health endpoint, placeholder pages)
- Product-specific routes are added in Epic 3B.3, which can extend sitemap config
- Static configuration provides explicit control over which routes appear
- Simpler implementation with no database or file system scanning required
- Clear extension path for future dynamic route additions

**Consequences**:
- New routes must be manually added to sitemap configuration
- Documentation must explain how to add routes to sitemap
- Sitemap config becomes source of truth for public routes
- Future epics will extend sitemap config with their routes

**Alternatives Considered**:
- **Option 1**: Dynamic route discovery via file system - Rejected because it would include API routes and internal pages
- **Option 2**: Database-driven sitemap - Rejected because routing shell doesn't have content database

#### AD-3A.2.S3.3: Structured Data Scope

**Scope**: Story-specific (does not affect other stories)

**Decision**: Implement Organization and WebSite structured data only; defer page-specific schemas (Article, BreadcrumbList) to content epics.

**Rationale**:
- Routing shell is generic infrastructure without specific content
- Organization and WebSite schemas apply site-wide and belong in shell
- Content-specific schemas (Article, Product, etc.) belong with content apps
- Keeps story focused on shell-level SEO infrastructure
- Clear separation between infrastructure and content concerns

**Consequences**:
- Basic structured data available immediately for organization branding
- Content apps will add their own schema markup in future epics
- No schema duplication between shell and content apps
- Each app owns its content-specific structured data

**Alternatives Considered**:
- **Option 1**: Implement all schema types in shell - Rejected because shell doesn't have content to describe
- **Option 2**: No structured data in shell - Rejected because Organization schema is fundamental and site-wide

## Out of Scope

The following items are explicitly NOT part of this story:

- **Page-Specific SEO Content** - Content-specific meta tags and descriptions handled in Epic 3B.3 (Routing Configuration)
- **Dynamic Sitemap from Database** - Database-driven sitemap for content pages deferred to content management epics
- **Multi-Language SEO** - Internationalization and alternate language tags deferred to future phases
- **Advanced Structured Data** - Article, Product, Review schemas belong with content apps, not routing shell
- **SEO Analytics and Reporting** - Search Console integration and SEO metrics tracked separately in analytics infrastructure
- **Schema.org BreadcrumbList** - Breadcrumb navigation not implemented until content apps exist
- **Automatic Image Optimization for OG** - CDN image transformation for social cards handled in Epic 3A.1
- **SEO A/B Testing** - Title/description testing deferred to analytics and experimentation phase

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Initialize Routing Application - Requires Next.js App Router structure, layout.tsx, and page.tsx

### Enables (Unblocks These Stories)

- **S6**: Create Responsive Shell Layout - Requires SEO utilities to be integrated with complete shell
- **Epic 3B.3**: Routing Configuration (Product Routes) - SEO utilities will be extended with product-specific meta tags
- **Epic 3B.4**: Documentation Application - Docs app will use SEO utilities for content pages

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview)
- [EPIC.md: Key Deliverables](./EPIC.md#overview)
- [EPIC.md: Acceptance Criteria](./EPIC.md#acceptance-criteria)
- [TAD: System Architecture](/docs/2-technical/2-tad.md#system-architecture)

### ADR References

- [ADR-003: Next.js 16 Framework](/docs/2-technical/adr/003-nextjs-framework.md)
- [ADR-004: Vercel Hosting](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org Organization](https://schema.org/Organization)
- [Google Lighthouse SEO](https://developer.chrome.com/docs/lighthouse/seo/)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Initialize Routing Application) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] NEXT_PUBLIC_URL environment variable configured

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] TypeScript compiles successfully with strict mode
- [ ] Lighthouse SEO score > 90 verified
- [ ] All SEO tests passing (unit + integration)
- [ ] Sitemap.xml validates against XML schema
- [ ] Structured data validates with Google Rich Results Test

### Documentation

- [ ] SEO.md created with comprehensive examples
- [ ] README.md updated with link to SEO documentation
- [ ] Code comments added for SEO utility functions
- [ ] Environment variable documentation updated
- [ ] Architecture decisions documented in this story

### Git Hygiene

- [ ] Conventional commit message used
- [ ] No unrelated changes included
- [ ] PR description references this story
- [ ] PR title follows format: `feat(3A.2.S3): build seo utilities`

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -

## Appendix A: Default Metadata Structure

Example structure for default site metadata:

```typescript
// apps/routing/src/config/seo-config.ts
export const defaultSEO = {
  siteName: "MK3 Platform",
  siteDescription: "Marketing technology and transformation services platform",
  siteUrl: process.env.NEXT_PUBLIC_URL || "https://platform.mk3.com",
  defaultOGImage: "/images/og-default.png",
  twitterHandle: "@mk3platform",
  organization: {
    name: "MK3",
    legalName: "MK3 Consulting Ltd",
    url: "https://mk3.com",
    logo: "/images/logo.png",
  },
};
```

## Appendix B: Sitemap Configuration Example

Example sitemap route configuration:

```typescript
// apps/routing/src/lib/seo/sitemap-config.ts
export const sitemapRoutes = [
  {
    path: "/",
    priority: 1.0,
    changeFrequency: "weekly",
  },
  {
    path: "/about",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  // Additional routes added by future epics
];
```

## Appendix C: Structured Data Example

Example Organization JSON-LD schema:

```typescript
// apps/routing/src/lib/seo/structured-data.ts
export function generateOrganizationSchema(config: SEOConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.organization.name,
    "legalName": config.organization.legalName,
    "url": config.organization.url,
    "logo": config.organization.logo,
    "description": config.siteDescription,
  };
}
```
