# CDN Architecture - Detailed Implementation

## Document Information

| Field               | Value                                       |
| ------------------- | ------------------------------------------- |
| **Version**         | 1.0                                         |
| **Status**          | Draft                                       |
| **Owner**           | Technical Lead                              |
| **Last Updated**    | 2025-11-25                                  |
| **Parent Document** | [Technical Architecture Document](2-tad.md) |

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Vercel Edge Network](#vercel-edge-network)
4. [Caching Strategy](#caching-strategy)
5. [Asset Optimization](#asset-optimization)
6. [Cache Invalidation](#cache-invalidation)
7. [Configuration](#configuration)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Security Considerations](#security-considerations)
11. [Cost Optimization](#cost-optimization)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

This document provides detailed implementation guidance for the CDN architecture, covering caching strategies, asset optimization, invalidation patterns, and performance optimization techniques.

### Scope

- Multi-layer caching implementation
- Asset delivery and optimization
- Cache invalidation strategies
- Geographic distribution and routing
- Performance monitoring
- Cost optimization strategies

### Goals

- **Performance**: Achieve <50ms TTFB from edge globally (p95)
- **Cache Hit Ratio**: Maintain >90% edge cache hit ratio
- **Availability**: 99.99% uptime for static asset delivery
- **Cost Efficiency**: Optimize bandwidth and compute costs
- **User Experience**: Ensure fast, reliable content delivery worldwide

---

## Architecture Principles

### 1. Cache-First Delivery

**Principle**: Serve content from the closest edge location whenever possible.

**Implementation**:

- Static assets cached indefinitely at edge
- Dynamic content with stale-while-revalidate
- API responses with selective caching
- Database queries cached at application layer

### 2. Immutable Assets

**Principle**: Static assets with content-hashed filenames are immutable and cacheable forever.

**Benefits**:

- Aggressive caching without invalidation concerns
- Instant cache hits for repeat visitors
- Reduced origin bandwidth
- Simplified cache purging (not needed for static assets)

### 3. Smart Invalidation

**Principle**: Invalidate only what changed, when it changed.

**Strategies**:

- Tag-based invalidation for related content
- Path-based invalidation for specific routes
- Full cache purge only on deployment
- Selective purging for content updates

### 4. Progressive Enhancement

**Principle**: Deliver optimized assets based on client capabilities.

**Techniques**:

- WebP/AVIF for modern browsers, fallback to JPEG/PNG
- HTTP/3 for supported clients
- Brotli compression where supported, fallback to Gzip
- Responsive images with srcset for different viewport sizes

---

## Vercel Edge Network

### Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  North America (15+ POPs)                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ SFO     │ │ IAD     │ │ ORD     │ │ DFW     │              │
│  │ (US-W)  │ │ (US-E)  │ │ (US-C)  │ │ (US-S)  │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  Europe (10+ POPs)                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ LHR     │ │ FRA     │ │ AMS     │                           │
│  │ (UK)    │ │ (DE)    │ │ (NL)    │                           │
│  └─────────┘ └─────────┘ └─────────┘                           │
│                                                                 │
│  Asia-Pacific (10+ POPs)                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ SYD     │ │ SIN     │ │ HND     │                           │
│  │ (AU)    │ │ (SG)    │ │ (JP)    │                           │
│  └─────────┘ └─────────┘ └─────────┘                           │
│                                                                 │
│  South America (3+ POPs)                                        │
│  ┌─────────┐ ┌─────────┐                                       │
│  │ GRU     │ │ SCL     │                                       │
│  │ (BR)    │ │ (CL)    │                                       │
│  └─────────┘ └─────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ORIGIN REGION (US-EAST-1)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  Serverless     │  │  PostgreSQL     │                      │
│  │  Functions      │  │  (Neon/Supabase)│                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Request Routing

**1. Geographic Routing**

```
User Request (London, UK)
    ↓
DNS Resolution → Closest Edge POP (LHR - London)
    ↓
Edge POP Cache Check
    ↓
┌────────────┬────────────┐
│ Cache HIT  │ Cache MISS │
│     ↓      │     ↓      │
│  Return    │  Origin    │
│  from Edge │  Fetch     │
│     ↓      │     ↓      │
│  < 50ms    │  Cache &   │
│            │  Return    │
└────────────┴────────────┘
```

**2. Failover Routing**

- Primary edge POP unavailable → Route to next nearest POP
- Multiple POPs per region for redundancy
- Automatic health checks every 10 seconds
- <100ms failover time

**3. Smart Routing**

- Latency-based routing to fastest POP
- Load balancing across healthy POPs
- Traffic shaping during high load
- DDoS mitigation at edge

### Edge Capabilities

| Capability          | Implementation             | Use Case                         |
| ------------------- | -------------------------- | -------------------------------- |
| **Edge Middleware** | Vercel Edge Functions      | Auth, org context, rate limiting |
| **Edge Config**     | Key-value store at edge    | Feature flags, config lookups    |
| **Edge Cache**      | Distributed cache network  | Static assets, ISR pages         |
| **Edge Functions**  | Serverless compute at edge | Dynamic content generation       |
| **KV Storage**      | Redis-compatible at edge   | Rate limiting, session data      |

---

## Caching Strategy

### Three-Layer Cache Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 1: BROWSER CACHE                     │
├─────────────────────────────────────────────────────────────────┤
│  Cache-Control: public, max-age=31536000, immutable            │
│  Applied to: Static assets with content hash                    │
│  Duration: 1 year                                               │
│  Invalidation: Not needed (immutable)                           │
└─────────────────────────────────────────────────────────────────┘
                           ↓ (on cache miss)
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 2: EDGE CACHE                        │
├─────────────────────────────────────────────────────────────────┤
│  Cache-Control: s-maxage=31536000, stale-while-revalidate      │
│  Applied to: All static assets, ISR pages                       │
│  Duration: Until deployment or manual purge                     │
│  Invalidation: Tag-based, path-based, or full purge            │
└─────────────────────────────────────────────────────────────────┘
                           ↓ (on cache miss)
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 3: APPLICATION CACHE                    │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Data Cache, React Cache                               │
│  Applied to: Database queries, API calls, Server Components    │
│  Duration: Configurable per resource (60s - 1 hour typical)    │
│  Invalidation: Time-based revalidation or on-demand            │
└─────────────────────────────────────────────────────────────────┘
```

### Caching Rules by Content Type

#### 1. Static Assets (Images, Fonts, Icons)

**Cache Headers**:

```http
Cache-Control: public, max-age=31536000, immutable
```

**Characteristics**:

- Content-hashed filenames (e.g., `logo-abc123.png`)
- Never changes after deployment
- Cached indefinitely at all layers
- No invalidation needed

**Implementation**:

```typescript
// next.config.js
export default {
  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};
```

#### 2. Dynamic Pages (SSR)

**Cache Headers**:

```http
Cache-Control: private, no-cache, no-store, must-revalidate
```

**Characteristics**:

- Personalized content
- User-specific data
- Never cached at edge or browser
- Fresh on every request

**Use Cases**:

- User dashboards
- Account settings
- Shopping carts
- Admin panels

#### 3. Static Pages (SSG)

**Cache Headers**:

```http
Cache-Control: public, s-maxage=31536000, stale-while-revalidate
```

**Characteristics**:

- Generated at build time
- Same for all users
- Cached at edge indefinitely
- Revalidated on deployment

**Use Cases**:

- Marketing pages
- Blog posts
- Documentation
- Legal pages

#### 4. Incremental Static Regeneration (ISR)

**Cache Headers**:

```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

**Characteristics**:

- Cached for 60 seconds
- Stale content served while revalidating
- Background regeneration
- Eventual consistency

**Implementation**:

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return <Article post={post} />
}
```

**Use Cases**:

- Blog posts (with view counts)
- Product listings
- News articles
- Frequently updated content

#### 5. API Routes

**Cache Headers (default)**:

```http
Cache-Control: private, no-cache
```

**Cache Headers (with caching)**:

```http
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

**Selective Caching**:

```typescript
// app/api/products/route.ts
export async function GET() {
  const products = await db.query.products.findMany();

  return Response.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Cache-Tag": "products",
    },
  });
}
```

**Cache Tags for Invalidation**:

- `products` - All product data
- `product:123` - Specific product
- `category:electronics` - Category-specific
- `user:abc` - User-specific (edge case)

#### 6. Images (Next.js Image Optimization)

**Cache Headers**:

```http
Cache-Control: public, max-age=31536000, immutable
```

**Automatic Optimizations**:

- WebP/AVIF conversion for modern browsers
- Responsive image generation (multiple sizes)
- Lazy loading with intersection observer
- Automatic format selection based on browser support

**Configuration**:

```typescript
// next.config.js
export default {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
};
```

### Cache Key Strategy

**Default Cache Key**:

```
URL + Query String + Headers (Accept, Accept-Encoding)
```

**Custom Cache Keys**:

```typescript
// Vary by Organization
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Vary", "X-Organization-ID");
  return response;
}
```

**Cache Segmentation**:

- By Organization: Separate cache per org_id
- By user role: Different cache for admin vs. user
- By device: Mobile vs. desktop cache
- By location: Country/region-specific cache

---

## Asset Optimization

### Image Optimization

#### 1. Next.js Image Component

**Automatic Optimizations**:

```tsx
import Image from 'next/image'

// Optimized image with automatic format selection
<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  quality={85}
  priority // Load immediately (above fold)
  placeholder="blur" // Show blur while loading
  blurDataURL="data:image/jpeg;base64,..." // Tiny preview
/>

// Lazy-loaded image (below fold)
<Image
  src="/product.jpg"
  alt="Product"
  width={600}
  height={400}
  loading="lazy" // Default behavior
/>
```

**Benefits**:

- 40-60% smaller file size (WebP/AVIF vs. JPEG/PNG)
- Automatic responsive images
- Lazy loading by default
- Blur-up placeholder for better UX

#### 2. Image Formats

| Format   | Use Case                     | Compression                      | Browser Support       |
| -------- | ---------------------------- | -------------------------------- | --------------------- |
| **AVIF** | Modern browsers              | Best (50-60% smaller than JPEG)  | Chrome, Edge, Firefox |
| **WebP** | Fallback for modern browsers | Great (25-35% smaller than JPEG) | 95%+ browsers         |
| **JPEG** | Fallback for legacy browsers | Good baseline                    | 100% browsers         |
| **PNG**  | Transparency required        | Lossless                         | 100% browsers         |
| **SVG**  | Icons, logos, illustrations  | Vector (smallest)                | 100% browsers         |

**Format Selection Logic**:

```
1. Check Accept header
2. If supports AVIF → Serve AVIF
3. Else if supports WebP → Serve WebP
4. Else → Serve JPEG/PNG
```

#### 3. Responsive Images

**Implementation**:

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  width={1920}
  height={1080}
/>
```

**Generated Output**:

```html
<img
  srcset="
    /_next/image?url=/hero.jpg&w=640   640w,
    /_next/image?url=/hero.jpg&w=750   750w,
    /_next/image?url=/hero.jpg&w=1080 1080w,
    /_next/image?url=/hero.jpg&w=1920 1920w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="/_next/image?url=/hero.jpg&w=1920"
/>
```

### JavaScript/CSS Optimization

#### 1. Code Splitting

**Automatic Route-Based Splitting**:

```
apps/routing/
  app/
    page.tsx → home-page.js
    about/
      page.tsx → about-page.js
    blog/
      page.tsx → blog-page.js
```

**Manual Component Splitting**:

```typescript
import dynamic from 'next/dynamic'

// Heavy component loaded only when needed
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only component
})

// Lazy load when visible
const BelowFoldContent = dynamic(() => import('@/components/BelowFoldContent'), {
  loading: () => <div>Loading...</div>,
})
```

#### 2. Tree Shaking

**Eliminate Dead Code**:

```typescript
// ✅ Good: Named imports (tree-shakeable)
import { Button, Card } from "@repo/ui";

// ❌ Bad: Default import (entire library)
import * as UI from "@repo/ui";
```

**Verify Tree Shaking**:

```bash
# Analyze bundle
pnpm run build --analyze

# Check bundle size
pnpm run build
# Output: Page Size (First Load JS)
```

#### 3. Minification & Compression

**Minification** (automatic with Turbopack):

- Remove whitespace, comments
- Shorten variable names
- Inline small functions
- Remove unused code

**Compression**:

```http
Content-Encoding: br # Brotli (preferred)
Content-Encoding: gzip # Fallback
```

**Compression Ratios**:

- Brotli: 15-25% smaller than Gzip
- Gzip: 60-70% smaller than raw
- No compression: Baseline

### Font Optimization

#### 1. Self-Hosted Fonts

**Benefits**:

- No external requests to Google Fonts
- Better privacy (no tracking)
- Faster (same origin)
- Full control over caching

**Implementation**:

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Show fallback while loading
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

#### 2. Font Loading Strategy

**Preload Critical Fonts**:

```tsx
// app/layout.tsx
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

**Font Display Strategy**:

- `swap`: Show fallback immediately, swap when loaded (best UX)
- `optional`: Use font if cached, otherwise fallback (best performance)
- `fallback`: Brief block, then swap (balance)

#### 3. Subset Optimization

**Include Only Required Characters**:

```typescript
const inter = Inter({
  subsets: ["latin"], // Only Latin characters (no Cyrillic, Greek, etc.)
  weight: ["400", "600", "700"], // Only needed weights
});
```

**File Size Reduction**:

- Full font: ~500 KB
- Latin subset: ~100 KB (80% reduction)
- Specific weights: ~30 KB per weight

---

## Cache Invalidation

### Invalidation Strategies

#### 1. Deployment-Based Invalidation

**Trigger**: New deployment to production

**Behavior**:

- Automatic purge of all edge cache
- Browser cache remains (immutable assets)
- Application cache cleared on server restart

**Use Case**: Normal deployment flow

**Timeline**:

```
Deploy initiated → Build completes → Edge cache purged → New cache populated
     0s                30-120s            +5s                +60s
```

#### 2. Tag-Based Invalidation

**Concept**: Invalidate related content by tag

**Implementation**:

```typescript
// Set cache tags when serving
export async function GET() {
  const products = await db.query.products.findMany()

  return Response.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=300',
      'Cache-Tag': 'products,category:electronics',
    },
  })
}

// Purge by tag
import { purgeTag } from '@vercel/edge-config'

export async function POST() {
  // Update product in database
  await db.update(products).set({ ... }).where({ ... })

  // Invalidate related cache
  await purgeTag('products')
  await purgeTag('category:electronics')

  return Response.json({ success: true })
}
```

**Common Tags**:

- `products` - All products
- `product:123` - Specific product
- `category:electronics` - Category
- `user:abc` - User-specific (rare)
- `org:xyz` - Organization-specific

#### 3. Path-Based Invalidation

**Concept**: Invalidate specific URL paths

**Implementation**:

```typescript
import { purgePath } from "@vercel/edge-config";

// Purge specific path
await purgePath("/api/products");
await purgePath("/blog/my-post");

// Purge with wildcards
await purgePath("/api/products/*");
```

**Use Cases**:

- Content updates (blog post edited)
- Specific page changes
- Partial cache clear

#### 4. Time-Based Revalidation (ISR)

**Concept**: Automatic background revalidation

**Implementation**:

```typescript
// Revalidate every 60 seconds
export const revalidate = 60

export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

**Timeline**:

```
Request 1 (t=0s)   → Generate page → Cache for 60s
Request 2 (t=30s)  → Serve from cache (hit)
Request 3 (t=70s)  → Serve stale → Regenerate in background → Update cache
Request 4 (t=80s)  → Serve fresh (new version)
```

**Benefits**:

- Always fast (serve from cache)
- Automatic updates
- No manual invalidation
- Stale content acceptable

#### 5. On-Demand Revalidation

**Concept**: Manual revalidation triggered by event

**Implementation**:

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate specific path
export async function POST() {
  await updateContent();
  revalidatePath("/blog/my-post");
  return Response.json({ revalidated: true });
}

// Revalidate by tag
export async function POST() {
  await updateProducts();
  revalidateTag("products");
  return Response.json({ revalidated: true });
}
```

**Triggers**:

- Webhook from CMS (content updated)
- Admin action (product updated)
- Scheduled job (nightly refresh)
- Manual API call

### Invalidation Decision Matrix

| Scenario                           | Strategy         | Timing      | Scope          |
| ---------------------------------- | ---------------- | ----------- | -------------- |
| **New deployment**                 | Deployment-based | Automatic   | Full cache     |
| **Content update (blog post)**     | On-demand path   | Webhook/API | Single path    |
| **Product price change**           | Tag-based        | API call    | Tagged routes  |
| **Periodic refresh (every 5 min)** | Time-based ISR   | Automatic   | Specific pages |
| **Emergency cache clear**          | Full purge       | Manual      | Everything     |
| **User-specific data**             | No caching       | N/A         | Private only   |

### Invalidation API

**Vercel API Integration**:

```typescript
// packages/cache/src/invalidate.ts
import { EdgeConfig } from "@vercel/edge-config";

export async function purgeCache(options: { tags?: string[]; paths?: string[]; full?: boolean }) {
  const token = process.env.VERCEL_PURGE_TOKEN;

  if (options.full) {
    // Purge everything
    await fetch("https://api.vercel.com/v1/purge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (options.tags) {
    // Purge by tags
    await fetch("https://api.vercel.com/v1/purge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: options.tags }),
    });
  }

  if (options.paths) {
    // Purge by paths
    await fetch("https://api.vercel.com/v1/purge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paths: options.paths }),
    });
  }
}
```

**Usage**:

```typescript
// Webhook handler
export async function POST(request: Request) {
  const payload = await request.json();

  if (payload.event === "content.updated") {
    await purgeCache({
      tags: [`content:${payload.id}`],
      paths: [`/blog/${payload.slug}`],
    });
  }

  return Response.json({ success: true });
}
```

---

## Configuration

### Next.js Configuration

```typescript
// apps/routing/next.config.js
import type { NextConfig } from "next";

const config: NextConfig = {
  // Cache headers for static assets
  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true, // Enable Gzip/Brotli

  // Turbopack (development)
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

export default config;
```

### Vercel Configuration

```json
{
  "version": 2,
  "buildCommand": "pnpm turbo run build",
  "outputDirectory": "apps/routing/.next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/cache-warm",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-blog/:slug",
      "destination": "/blog/:slug",
      "permanent": true
    }
  ]
}
```

### Cache Configuration Package

```typescript
// packages/config/src/cache.ts
export const cacheConfig = {
  // Static assets
  static: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },

  // ISR pages
  isr: {
    revalidate: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
  },

  // API routes
  api: {
    default: {
      maxAge: 0,
      private: true,
    },
    cached: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 600, // 10 minutes
    },
  },

  // Images
  images: {
    maxAge: 31536000, // 1 year
    formats: ["avif", "webp"],
  },
} as const;

export function getCacheHeaders(type: keyof typeof cacheConfig): string {
  const config = cacheConfig[type];

  if (type === "static") {
    return `public, max-age=${config.maxAge}, immutable`;
  }

  if (type === "isr") {
    return `public, s-maxage=${config.revalidate}, stale-while-revalidate=${config.staleWhileRevalidate}`;
  }

  // ... other types
}
```

---

## Performance Optimization

### 1. Cache Warming

**Concept**: Pre-populate edge cache before traffic arrives

**Implementation**:

```typescript
// app/api/cron/cache-warm/route.ts
export async function GET() {
  const criticalUrls = ["/", "/pricing", "/features", "/docs"];

  // Fetch all critical pages to populate edge cache
  await Promise.all(
    criticalUrls.map((url) =>
      fetch(`https://example.com${url}`, {
        headers: { "X-Cache-Warm": "true" },
      })
    )
  );

  return Response.json({ warmed: criticalUrls.length });
}
```

**Triggers**:

- Post-deployment (automatic)
- Scheduled (every 6 hours via cron)
- Manual (API call)

### 2. Resource Hints

**Preload Critical Resources**:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Preload critical font */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.example.com" />
        <link rel="dns-prefetch" href="https://analytics.example.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Resource Hint Types**:

- `preload`: Load resource immediately
- `prefetch`: Load resource when idle
- `preconnect`: Establish connection early
- `dns-prefetch`: Resolve DNS early

### 3. Lazy Loading

**Below-Fold Content**:

```tsx
import dynamic from "next/dynamic";

// Lazy load heavy components
const Comments = dynamic(() => import("@/components/Comments"), {
  loading: () => <CommentsSkeleton />,
});

const RelatedPosts = dynamic(() => import("@/components/RelatedPosts"), {
  loading: () => <RelatedPostsSkeleton />,
});

export default function BlogPost() {
  return (
    <article>
      <h1>Post Title</h1>
      <div>Post content...</div>

      {/* Load when scrolled into view */}
      <Comments postId="123" />
      <RelatedPosts postId="123" />
    </article>
  );
}
```

### 4. Bundle Size Optimization

**Analyze Bundle**:

```bash
pnpm run build
# Output shows size of each route

# Detailed analysis
ANALYZE=true pnpm run build
```

**Optimization Techniques**:

- Remove unused dependencies
- Use lighter alternatives (e.g., `dayjs` instead of `moment`)
- Lazy load heavy libraries
- Tree-shake properly
- Minimize third-party scripts

**Bundle Size Targets**:

- First Load JS: < 200 KB
- Route JS: < 50 KB per route
- Shared chunks: < 100 KB total

---

## Monitoring & Analytics

### Cache Performance Metrics

**Key Metrics**:

```typescript
// Track cache hit ratio
export function trackCacheMetrics() {
  return {
    cacheHitRatio: cacheHits / (cacheHits + cacheMisses),
    edgeCacheLatency: p95EdgeLatency,
    originCacheLatency: p95OriginLatency,
    bandwidthSaved: cachedBytes / totalBytes,
  };
}
```

**Monitoring Dashboard**:

- Cache hit ratio (target: >90%)
- Edge cache latency (target: <50ms p95)
- Origin requests (minimize)
- Bandwidth usage (optimize)
- Cache invalidation rate

### Vercel Analytics Integration

**Automatic Metrics**:

- Core Web Vitals (LCP, FID, CLS)
- TTFB (Time to First Byte)
- Cache hit/miss rates
- Edge function duration
- Bandwidth usage

**Custom Events**:

```typescript
import { track } from "@vercel/analytics";

// Track cache performance
track("cache_miss", {
  url: request.url,
  reason: "expired",
});

track("cache_hit", {
  url: request.url,
  latency: 45,
});
```

### Performance Monitoring

**Real User Monitoring (RUM)**:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Custom Performance Tracking**:

```typescript
// Track custom metrics
export function trackPerformance(metric: string, value: number) {
  if (typeof window !== "undefined" && "performance" in window) {
    performance.mark(`${metric}-start`);
    // ... operation
    performance.mark(`${metric}-end`);
    performance.measure(metric, `${metric}-start`, `${metric}-end`);
  }
}
```

---

## Security Considerations

### 1. Cache Poisoning Prevention

**Risk**: Malicious content cached at edge

**Mitigation**:

- Validate all user input before caching
- Sanitize cache keys (no user-controlled values)
- Use `Vary` header carefully
- Implement cache key normalization

**Example**:

```typescript
// ❌ Vulnerable to cache poisoning
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userInput = url.searchParams.get("page"); // User-controlled

  // Cached with user input in key
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}

// ✅ Safe implementation
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  // Validate and normalize
  const safePage = Math.max(1, Math.min(100, page));

  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
```

### 2. Sensitive Data in Cache

**Risk**: Personal information cached at edge

**Mitigation**:

- Never cache user-specific data at edge
- Use `private` cache-control for personalized content
- Implement proper `Vary` headers
- Audit cached responses for PII

**Implementation**:

```typescript
// User-specific data
export async function GET(request: Request) {
  const user = await getCurrentUser(request);

  return Response.json(user, {
    headers: {
      "Cache-Control": "private, no-cache", // Never cached at edge
    },
  });
}

// Organization-scoped data
export async function GET(request: Request) {
  const orgId = getOrgId(request);
  const data = await getOrgData(orgId);

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300",
      Vary: "X-Organization-ID", // Separate cache per org
    },
  });
}
```

### 3. Cache Timing Attacks

**Risk**: Timing differences reveal cached vs. uncached content

**Mitigation**:

- Consistent response times
- No different behavior for cache hit/miss
- Rate limiting at edge

---

## Cost Optimization

### Bandwidth Reduction

**Strategies**:

1. **Aggressive Caching**: Reduce origin bandwidth
2. **Compression**: 60-70% size reduction
3. **Image Optimization**: 40-60% size reduction
4. **Code Splitting**: Only load what's needed

**Expected Savings**:

- Cache hit ratio 90% → 90% bandwidth reduction
- Brotli compression → 20% additional reduction
- Image optimization → 50% image bandwidth reduction
- Total: ~95% bandwidth reduction vs. no optimization

### Compute Cost Reduction

**Edge Cache Benefits**:

- Fewer origin function invocations
- Reduced database queries
- Lower compute costs

**Cost Model**:

```
Without Edge Cache:
- 1M requests → 1M function invocations → $50/month

With 90% Cache Hit Ratio:
- 1M requests → 100K function invocations → $5/month

Savings: $45/month (90% reduction)
```

### Cost Monitoring

**Track Costs**:

- Bandwidth usage (GB transferred)
- Function invocations
- Image optimizations
- Edge function executions

**Budget Alerts**:

```typescript
// Set up budget alerts via Vercel API
{
  "bandwidth": {
    "limit": 1000, // GB
    "alert": 800,  // Alert at 80%
  },
  "functions": {
    "limit": 1000000, // Invocations
    "alert": 800000,
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Cache Not Working

**Symptoms**:

- Low cache hit ratio
- Slow response times
- High origin requests

**Debugging**:

```bash
# Check cache headers
curl -I https://example.com/page

# Response:
Cache-Control: public, s-maxage=300
X-Vercel-Cache: MISS # Should be HIT on second request
Age: 0 # Should increase
```

**Solutions**:

- Verify cache headers are set
- Check for cache-busting query params
- Ensure consistent cache keys
- Review `Vary` header usage

#### 2. Stale Content Served

**Symptoms**:

- Old content displayed
- Updates not reflected

**Debugging**:

```typescript
// Check cache age
const cacheAge = response.headers.get("Age");
console.log(`Cache age: ${cacheAge} seconds`);

// Check last modified
const lastModified = response.headers.get("Last-Modified");
```

**Solutions**:

- Reduce cache TTL
- Implement on-demand revalidation
- Use shorter ISR intervals
- Purge cache after updates

#### 3. Cache Invalidation Not Working

**Symptoms**:

- Purge API called but old content still served
- Tag-based invalidation ineffective

**Debugging**:

```typescript
// Verify purge request
await fetch("https://api.vercel.com/v1/purge", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ tags: ["products"] }),
});

// Check propagation time
console.log("Purge initiated at:", new Date().toISOString());
```

**Solutions**:

- Wait 60 seconds for global propagation
- Verify API token has purge permissions
- Check tag names match exactly
- Use path-based purge as fallback

#### 4. High Bandwidth Costs

**Symptoms**:

- Unexpected bandwidth charges
- High data transfer

**Analysis**:

```typescript
// Analyze top bandwidth consumers
const analytics = await getVercelAnalytics();
console.log("Top routes by bandwidth:", analytics.routes);
console.log("Top assets by size:", analytics.assets);
```

**Solutions**:

- Enable compression
- Optimize images
- Increase cache TTL
- Implement lazy loading
- Audit large assets

### Debugging Tools

**1. Vercel CLI**:

```bash
# Inspect deployment
vercel inspect https://example.com

# View logs
vercel logs

# Check edge cache
vercel edge-config list
```

**2. Browser DevTools**:

```javascript
// Network tab → Headers
Cache-Control: public, s-maxage=300
X-Vercel-Cache: HIT
Age: 123
Vary: Accept-Encoding
```

**3. Cache Headers Inspector**:

```typescript
// Debug middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add debug headers (development only)
  if (process.env.NODE_ENV === "development") {
    response.headers.set("X-Cache-Debug", "enabled");
    response.headers.set("X-Request-ID", crypto.randomUUID());
  }

  return response;
}
```

---

## Document History

| Version | Date       | Author      | Changes                           |
| ------- | ---------- | ----------- | --------------------------------- |
| 1.0     | 2025-11-25 | Claude Code | Initial CDN architecture document |

---

## Related Documents

- [Technical Architecture Document (TAD)](2-tad.md)
- [Edge Middleware Architecture](2-tad-edge-middleware.md)
- [Observability Architecture](2-tad-observability.md)
- [Performance Targets](2-tad.md#performance-targets)
