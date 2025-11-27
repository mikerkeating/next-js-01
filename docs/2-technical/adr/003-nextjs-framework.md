# ADR-003: Next.js 16 as Framework

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to select a modern React framework that can support our multi-application platform with server-side rendering, static site generation, API routes, and excellent developer experience. The framework must integrate seamlessly with our hosting platform (Vercel), support our monorepo architecture, and provide the performance and features needed for a production SaaS application.

### Key Requirements

1. **Modern React Features**: Support for React 19, Server Components, and Suspense
2. **Rendering Flexibility**: SSR, SSG, ISR, and client-side rendering options
3. **API Routes**: Built-in API route handling for backend functionality
4. **Performance**: Excellent Core Web Vitals, automatic optimization, code splitting
5. **Developer Experience**: Fast refresh, TypeScript support, clear error messages
6. **Routing**: File-based routing with support for dynamic routes and layouts
7. **Deployment**: First-class integration with Vercel
8. **Monorepo Support**: Works well in monorepo structure with Turborepo
9. **Scalability**: Can handle multiple independent applications
10. **Edge Computing**: Support for edge runtime and middleware

### Constraints

- Must support TypeScript 5.x
- Must work with our chosen monorepo tools (Turborepo + pnpm)
- Must deploy easily to Vercel
- Team needs to be productive quickly
- Must support our multi-tenant architecture

## Decision

We will use **Next.js 16** (App Router) as our primary React framework for all web applications in the monorepo.

### Configuration

**Key Features Enabled**:
- App Router (default in Next.js 16)
- React Server Components
- Server Actions
- Edge Runtime for middleware
- Turbopack for development (experimental)
- Incremental Static Regeneration (ISR)

**Example next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/database', '@repo/auth'],

  experimental: {
    // Enable Turbopack for faster dev builds
    turbo: {
      resolveAlias: {
        '@': './src',
      },
    },
  },

  images: {
    domains: ['clerk.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable Edge Runtime for API routes when needed
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

**TypeScript Configuration**:
```json
{
  "extends": "@repo/config/nextjs.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@repo/*": ["../../packages/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Rationale

### Why Next.js 16?

1. **React 19 & Server Components**
   - First-class support for React Server Components
   - Dramatically reduces JavaScript sent to client
   - Improved performance and SEO
   - Better data fetching patterns

2. **App Router Architecture**
   - Modern file-based routing with layouts
   - Nested layouts and parallel routes
   - Built-in loading and error states
   - Streaming and Suspense support
   - Better code organization

3. **Rendering Flexibility**
   - **SSR**: Dynamic pages rendered on each request
   - **SSG**: Static pages at build time
   - **ISR**: Static pages with revalidation
   - **CSR**: Client-only rendering when needed
   - Mix strategies per route as needed

4. **Performance Optimizations**
   - Automatic code splitting
   - Image optimization (next/image)
   - Font optimization (next/font)
   - Script optimization (next/script)
   - Automatic bundle analysis
   - Route prefetching

5. **Developer Experience**
   - Fast Refresh for instant feedback
   - Excellent TypeScript support
   - Built-in ESLint configuration
   - Clear error messages
   - Great debugging experience
   - Extensive documentation

6. **Vercel Integration**
   - Built by Vercel, optimized for Vercel
   - Zero-config deployments
   - Automatic HTTPS
   - Preview deployments
   - Edge network optimization
   - Analytics built-in

7. **API Routes & Server Actions**
   - Collocated API routes with frontend
   - Server Actions for mutations
   - Edge runtime support
   - Middleware for authentication
   - Type-safe with TypeScript

8. **Monorepo Support**
   - Works seamlessly with Turborepo
   - Transpile packages from monorepo
   - Shared component libraries
   - Hot reload across packages

9. **Production Ready**
   - Used by major companies (Notion, TikTok, Twitch, etc.)
   - Battle-tested at scale
   - Active development and support
   - Large ecosystem
   - Security best practices

10. **Future Proof**
    - Aligned with React's future direction
    - Regular updates and improvements
    - Strong community adoption
    - Continuous innovation

### Alternatives Considered

#### Option 1: Create React App (CRA)

**Pros:**
- Simple setup
- Official React tool
- Good for simple SPAs

**Cons:**
- ❌ No SSR/SSG support
- ❌ No built-in routing
- ❌ No API routes
- ❌ Poor SEO for dynamic content
- ❌ No automatic code splitting
- ❌ Maintenance mode (not actively developed)
- ❌ Requires additional tools for production features

**Decision**: Rejected - Too basic for our needs and no longer actively maintained.

#### Option 2: Remix

**Pros:**
- Excellent developer experience
- Great data loading patterns
- Progressive enhancement focus
- Good TypeScript support
- Nested routing

**Cons:**
- ❌ Smaller ecosystem compared to Next.js
- ❌ Less mature image/font optimization
- ❌ Fewer deployment options
- ❌ Less tooling integration
- ❌ Server Components support still evolving
- ❌ Steeper learning curve for team

**Decision**: Rejected - While excellent, Next.js has better Vercel integration and larger ecosystem.

#### Option 3: Vite + React Router

**Pros:**
- Extremely fast development builds
- Modern tooling
- Flexible architecture
- Good plugin ecosystem

**Cons:**
- ❌ No built-in SSR (requires manual setup)
- ❌ No automatic code splitting
- ❌ No image optimization
- ❌ No API routes
- ❌ Requires more manual configuration
- ❌ More boilerplate needed

**Decision**: Rejected - Requires too much manual setup for features Next.js provides out of the box.

#### Option 4: Gatsby

**Pros:**
- Excellent for static sites
- Great plugin ecosystem
- GraphQL data layer
- Good image optimization

**Cons:**
- ❌ Primarily static site generator
- ❌ Slower builds at scale
- ❌ Complex data layer
- ❌ Less flexible for dynamic applications
- ❌ SSR support less mature
- ❌ Declining popularity

**Decision**: Rejected - Better suited for content sites, not dynamic SaaS applications.

#### Option 5: SvelteKit

**Pros:**
- Smaller bundle sizes
- Fast performance
- Modern developer experience
- Good TypeScript support

**Cons:**
- ❌ Different framework (not React)
- ❌ Team needs to learn Svelte
- ❌ Smaller ecosystem
- ❌ Fewer React component libraries available
- ❌ Less widespread enterprise adoption
- ❌ Different mental model

**Decision**: Rejected - Team expertise is in React, switching frameworks adds unnecessary risk.

#### Option 6: Next.js Pages Router (v13-15)

**Pros:**
- Mature and stable
- Large ecosystem
- Well-understood patterns

**Cons:**
- ❌ Older architecture
- ❌ No Server Components support
- ❌ Less efficient data fetching
- ❌ More boilerplate code
- ❌ Being phased out in favor of App Router

**Decision**: Rejected - App Router is the future of Next.js, better to start with it.

## Consequences

### Positive

1. **Excellent Performance**: Core Web Vitals targets easily achievable
2. **Great DX**: Fast development with hot reload and clear errors
3. **SEO Friendly**: SSR/SSG ensures excellent search engine indexing
4. **Scalability**: Can handle growth from MVP to enterprise scale
5. **Deployment Simplicity**: One-click deployments to Vercel
6. **Type Safety**: Full TypeScript support across client and server
7. **Modern Patterns**: Server Components reduce client-side JavaScript
8. **Future Proof**: Aligned with React's roadmap
9. **Team Productivity**: Large community means solutions are readily available
10. **Cost Efficiency**: Vercel's edge network reduces infrastructure costs

### Negative

1. **Learning Curve**: App Router patterns are new, team needs training
2. **Version Churn**: Next.js releases frequently, may require updates
3. **Vendor Lock-in**: Optimized for Vercel (though works elsewhere)
4. **Bundle Size**: Framework itself adds overhead compared to vanilla React
5. **Complexity**: More abstraction than simple React apps
6. **Server Components**: New paradigm requires rethinking data fetching

### Mitigation Strategies

1. **Training**: Conduct team workshops on App Router patterns
2. **Documentation**: Maintain internal docs on Next.js best practices
3. **Code Examples**: Create reference implementations for common patterns
4. **Version Strategy**: Stay on LTS versions when possible
5. **Gradual Adoption**: Start simple, adopt advanced features as needed
6. **Monitoring**: Track performance metrics to ensure optimizations work

## Implementation Plan

### Phase 1: Foundation (Week 1)

- [x] Install Next.js 16 in first app (routing)
- [ ] Configure TypeScript
- [ ] Set up ESLint and Prettier
- [ ] Create basic app structure
- [ ] Configure next.config.js for monorepo

### Phase 2: Core Features (Week 1-2)

- [ ] Implement layouts and navigation
- [ ] Set up middleware for authentication
- [ ] Create API route examples
- [ ] Configure image optimization
- [ ] Set up font loading

### Phase 3: Integration (Week 2-3)

- [ ] Integrate with Clerk authentication
- [ ] Connect to database via Drizzle
- [ ] Set up analytics (PostHog, GA4)
- [ ] Configure error tracking (Sentry)
- [ ] Test Server Components patterns

### Phase 4: Deployment (Week 3)

- [ ] Deploy to Vercel staging
- [ ] Configure environment variables
- [ ] Set up preview deployments
- [ ] Test production build
- [ ] Monitor performance metrics

### Phase 5: Optimization (Week 4+)

- [ ] Implement ISR where beneficial
- [ ] Optimize bundle sizes
- [ ] Add edge middleware where needed
- [ ] Fine-tune caching strategies
- [ ] Document patterns for team

## Validation

### Success Metrics

- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Build time < 2 minutes for full production build
- [ ] Development server starts < 10 seconds
- [ ] Hot reload < 1 second for most changes
- [ ] Lighthouse score > 90 for all pages
- [ ] TypeScript compilation with zero errors
- [ ] All apps successfully deploy to Vercel

### Testing Checklist

1. **Development Experience**:
   - [ ] Fast Refresh works for all components
   - [ ] TypeScript errors show clearly
   - [ ] Console errors are helpful
   - [ ] Dev server is stable

2. **Build & Deploy**:
   - [ ] Production builds complete successfully
   - [ ] All static assets are optimized
   - [ ] Bundle sizes are reasonable
   - [ ] Deployments to Vercel succeed

3. **Performance**:
   - [ ] Initial page load < 3s
   - [ ] Navigation feels instant
   - [ ] Images load progressively
   - [ ] No layout shift issues

4. **Features**:
   - [ ] Server Components render correctly
   - [ ] Client Components hydrate properly
   - [ ] API routes work as expected
   - [ ] Middleware functions correctly
   - [ ] Authentication flow works
   - [ ] Error boundaries catch errors

## App Router Key Concepts

### Server Components (Default)

```typescript
// app/dashboard/page.tsx
// This is a Server Component by default
import { db } from '@repo/database'

export default async function DashboardPage() {
  // Data fetching happens on the server
  const data = await db.query.users.findMany()

  return (
    <div>
      <h1>Dashboard</h1>
      {data.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  )
}
```

### Client Components (When Needed)

```typescript
// components/counter.tsx
'use client'  // This marks it as a Client Component

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Layouts

```typescript
// app/layout.tsx
import { Header } from '@/components/header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
```

### Server Actions

```typescript
// app/actions.ts
'use server'

import { db } from '@repo/database'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name')

  await db.insert(users).values({ name })

  revalidatePath('/users')
}
```

### Loading States

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}
```

### Error Boundaries

```typescript
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## Best Practices

1. **Use Server Components by Default**: Only mark components with `'use client'` when necessary
2. **Collocate Data Fetching**: Fetch data in the component that needs it
3. **Use Suspense Boundaries**: Stream content as it loads
4. **Optimize Images**: Always use `next/image` for images
5. **Font Optimization**: Use `next/font` for web fonts
6. **TypeScript Everywhere**: Leverage type safety across client and server
7. **Error Boundaries**: Add error.tsx for graceful error handling
8. **Loading States**: Add loading.tsx for better UX
9. **Metadata API**: Use generateMetadata for SEO
10. **Route Groups**: Organize routes with route groups

## Common Patterns

### Data Fetching Pattern

```typescript
// Server Component - fetch on server
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // ISR with 1 hour revalidation
  })
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
```

### Authentication Middleware

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/login', '/signup', '/']
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js with Turborepo](https://turbo.build/repo/docs/handbook/next-js)
- [Vercel Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

## Related ADRs

- [ADR-001: Monorepo with Turborepo](001-monorepo-turborepo.md) - Next.js apps in monorepo structure
- [ADR-002: pnpm as Package Manager](002-pnpm-package-manager.md) - Package management for Next.js
- [ADR-004: Vercel as Hosting Platform](004-vercel-hosting.md) - Next.js deployment target

## Notes

Next.js 16 with the App Router represents a significant shift in how we build React applications. While there's a learning curve, the benefits of Server Components, improved performance, and better developer experience make it the right choice for our platform.

The framework's tight integration with Vercel ensures we can deploy with confidence, while the large community means we'll have support and resources as we build.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: Frontend Lead, Engineering Team
**Last Updated**: 2025-11-24
