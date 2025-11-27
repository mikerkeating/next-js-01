## Edge Middleware Architecture

### Overview

Edge middleware runs at the network edge (Vercel Edge Functions) before requests reach Next.js application code. This section covers Epics 2A.6 and 2B.6, detailing middleware chain composition, organisation context extraction, and route protection patterns.

**Key Principles**:
- **Lightweight Execution**: Minimal processing at the edge (cold start < 50ms)
- **Composable Middleware**: Build complex logic from simple, reusable functions
- **Early Validation**: Reject invalid requests before hitting application servers
- **Context Enrichment**: Add organisation and user context to requests
- **Route Protection**: Enforce authentication and authorization at the edge

**Edge Runtime Constraints**:
- No Node.js APIs (use Web APIs only)
- No file system access
- Limited execution time (30 seconds max)
- Maximum response size: 4MB
- Maximum middleware code size: 1MB

---

### Middleware Chain Composition

#### Middleware Composition Pattern

```typescript
// packages/middleware/src/composer.ts

import { NextRequest, NextResponse } from 'next/server';

export type MiddlewareFunction = (
  request: NextRequest,
  context: MiddlewareContext
) => Promise<NextResponse | void>;

export interface MiddlewareContext {
  userId?: string;
  organisationId?: string;
  role?: string;
  metadata: Record<string, unknown>;
}

/**
 * Compose multiple middleware functions into a single middleware
 * Executes middleware in order, short-circuits on response
 */
export function composeMiddleware(
  middlewares: MiddlewareFunction[]
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context: MiddlewareContext = {
      metadata: {},
    };

    for (const middleware of middlewares) {
      const response = await middleware(request, context);

      // If middleware returns a response, short-circuit
      if (response) {
        return response;
      }
    }

    // No middleware returned a response, continue to application
    return NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers),
          'x-user-id': context.userId || '',
          'x-organisation-id': context.organisationId || '',
          'x-user-role': context.role || '',
        }),
      },
    });
  };
}

/**
 * Create middleware that runs conditionally based on path matcher
 */
export function createConditionalMiddleware(
  matcher: (pathname: string) => boolean,
  middleware: MiddlewareFunction
): MiddlewareFunction {
  return async (request: NextRequest, context: MiddlewareContext) => {
    if (!matcher(request.nextUrl.pathname)) {
      return; // Skip this middleware
    }
    return middleware(request, context);
  };
}

/**
 * Create middleware that catches errors and returns error responses
 */
export function withErrorHandling(
  middleware: MiddlewareFunction
): MiddlewareFunction {
  return async (request: NextRequest, context: MiddlewareContext) => {
    try {
      return await middleware(request, context);
    } catch (error) {
      console.error('Middleware error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Internal server error',
            code: 'MIDDLEWARE_ERROR',
          },
        },
        { status: 500 }
      );
    }
  };
}
```

#### Example Middleware Chain

```typescript
// apps/routing/src/middleware.ts

import { composeMiddleware } from '@repo/middleware/composer';
import { loggingMiddleware } from '@repo/middleware/logging';
import { securityHeadersMiddleware } from '@repo/middleware/security-headers';
import { authMiddleware } from '@repo/middleware/auth';
import { orgContextMiddleware } from '@repo/middleware/org-context';
import { rateLimitMiddleware } from '@repo/middleware/rate-limit';
import { csrfMiddleware } from '@repo/middleware/csrf';

export default composeMiddleware([
  // 1. Logging - Track all requests
  loggingMiddleware,

  // 2. Security Headers - Set security headers on all responses
  securityHeadersMiddleware,

  // 3. Authentication - Verify user identity
  authMiddleware,

  // 4. Organisation Context - Extract and validate organisation
  orgContextMiddleware,

  // 5. CSRF Protection - Validate CSRF tokens on mutations
  csrfMiddleware,

  // 6. Rate Limiting - Prevent abuse
  rateLimitMiddleware,
]);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

---

### Logging Middleware

```typescript
// packages/middleware/src/logging.ts

import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';

export const loggingMiddleware: MiddlewareFunction = async (
  request: NextRequest,
  context: MiddlewareContext
) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // Add request ID to context
  context.metadata.requestId = requestId;

  // Log request
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Incoming request',
    service: 'edge-middleware',
    data: {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    },
  }));

  // Continue to next middleware
  return;
};
```

---

### Security Headers Middleware

```typescript
// packages/middleware/src/security-headers.ts

import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';

export const securityHeadersMiddleware: MiddlewareFunction = async (
  request: NextRequest,
  context: MiddlewareContext
) => {
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' *.clerk.com *.posthog.com *.sentry.io",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
};
```

---

### Organisation Context Extraction

#### Organisation Context Middleware

```typescript
// packages/middleware/src/org-context.ts

import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';

/**
 * Extract organisation context from request
 *
 * Organisation can be identified via:
 * 1. Header: X-Organisation-ID (for API requests)
 * 2. Subdomain: {org-slug}.example.com
 * 3. Path parameter: /org/{org-slug}/...
 * 4. Query parameter: ?org={org-slug}
 * 5. Cookie: org_id (last selected organisation)
 */
export const orgContextMiddleware: MiddlewareFunction = async (
  request: NextRequest,
  context: MiddlewareContext
) => {
  let organisationId: string | null = null;
  let organisationSlug: string | null = null;

  // 1. Check header (highest priority - for API)
  const headerOrgId = request.headers.get('x-organisation-id');
  if (headerOrgId) {
    organisationId = headerOrgId;
  }

  // 2. Check subdomain
  if (!organisationId) {
    const hostname = request.headers.get('host') || '';
    const subdomainMatch = hostname.match(/^([^.]+)\.example\.com$/);

    if (subdomainMatch && subdomainMatch[1] !== 'www' && subdomainMatch[1] !== 'api') {
      organisationSlug = subdomainMatch[1];
      // Would need to fetch org ID from database or cache
      // For edge middleware, we use slug directly
    }
  }

  // 3. Check path parameter
  if (!organisationId && !organisationSlug) {
    const pathMatch = request.nextUrl.pathname.match(/^\/org\/([^/]+)/);
    if (pathMatch) {
      organisationSlug = pathMatch[1];
    }
  }

  // 4. Check query parameter
  if (!organisationId && !organisationSlug) {
    const queryOrg = request.nextUrl.searchParams.get('org');
    if (queryOrg) {
      organisationSlug = queryOrg;
    }
  }

  // 5. Check cookie (lowest priority - fallback)
  if (!organisationId && !organisationSlug) {
    const cookieOrgId = request.cookies.get('org_id')?.value;
    if (cookieOrgId) {
      organisationId = cookieOrgId;
    }
  }

  // Validate organisation access (if user is authenticated)
  if (context.userId && (organisationId || organisationSlug)) {
    const hasAccess = await validateOrganisationAccess(
      context.userId,
      organisationId || organisationSlug
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Access denied to organisation',
            code: 'ORG_ACCESS_DENIED',
          },
        },
        { status: 403 }
      );
    }
  }

  // Add to context
  if (organisationId) {
    context.organisationId = organisationId;
  }
  if (organisationSlug) {
    context.metadata.organisationSlug = organisationSlug;
  }

  // No response = continue to next middleware
  return;
};

/**
 * Validate user has access to organisation
 * Uses Vercel Edge Config for fast lookups
 */
async function validateOrganisationAccess(
  userId: string,
  orgIdentifier: string
): Promise<boolean> {
  // In production, check against Edge Config or KV store
  // For now, we'll use a simple check

  try {
    // Check if user is member of organisation
    // This would typically hit a fast cache like Vercel Edge Config
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/internal/org-access`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          userId,
          orgIdentifier,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Organisation access check failed:', error);
    return false;
  }
}
```

#### Organisation Switcher Implementation

```typescript
// packages/org/src/switcher.ts

/**
 * Switch user's active organisation
 * Updates cookie and redirects to org-specific URL
 */
export async function switchOrganisation(
  organisationId: string,
  redirectPath?: string
): Promise<void> {
  // Update cookie
  document.cookie = `org_id=${organisationId}; path=/; max-age=31536000; secure; samesite=lax`;

  // Fetch organisation details
  const response = await fetch(`/api/v1/organisations/${organisationId}`);
  const { data: org } = await response.json();

  // Redirect to organisation-specific URL
  const targetUrl = redirectPath || '/dashboard';

  // Option 1: Subdomain approach
  if (org.slug) {
    window.location.href = `https://${org.slug}.example.com${targetUrl}`;
  }

  // Option 2: Path parameter approach
  // window.location.href = `/org/${org.slug}${targetUrl}`;

  // Option 3: Query parameter approach (simplest)
  // window.location.href = `${targetUrl}?org=${org.slug}`;
}

/**
 * Get current organisation from context
 */
export async function getCurrentOrganisation(): Promise<Organisation | null> {
  // Server-side: Read from request headers
  if (typeof window === 'undefined') {
    const { headers } = await import('next/headers');
    const headersList = headers();
    const orgId = headersList.get('x-organisation-id');

    if (!orgId) return null;

    // Fetch from database
    const { getOrganisationById } = await import('@repo/database');
    return getOrganisationById(orgId);
  }

  // Client-side: Read from cookie
  const cookieOrgId = document.cookie
    .split('; ')
    .find(row => row.startsWith('org_id='))
    ?.split('=')[1];

  if (!cookieOrgId) return null;

  // Fetch from API
  const response = await fetch(`/api/v1/organisations/${cookieOrgId}`);
  const { data: org } = await response.json();
  return org;
}
```

---

### Route Protection Patterns

#### Authentication Middleware

```typescript
// packages/middleware/src/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';

/**
 * Authentication middleware
 * Verifies Clerk session and extracts user information
 */
export const authMiddleware: MiddlewareFunction = async (
  request: NextRequest,
  context: MiddlewareContext
) => {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/health',
    '/api/webhooks/clerk',
  ];

  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return; // Skip authentication
  }

  // Extract session token from cookie
  const sessionToken = request.cookies.get('__session')?.value;

  if (!sessionToken) {
    // No session - redirect to sign in
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname);

    return NextResponse.redirect(signInUrl);
  }

  // Verify session with Clerk
  try {
    const session = await clerkClient.sessions.verifySession(
      sessionToken,
      request.headers.get('user-agent') || undefined
    );

    if (!session || session.status !== 'active') {
      // Invalid session - redirect to sign in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname);

      return NextResponse.redirect(signInUrl);
    }

    // Add user info to context
    context.userId = session.userId;
    context.metadata.sessionId = session.id;

    // Fetch user role (from database or cache)
    const role = await getUserRole(session.userId);
    context.role = role;

    return; // Continue to next middleware
  } catch (error) {
    console.error('Session verification failed:', error);

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname);

    return NextResponse.redirect(signInUrl);
  }
};

async function getUserRole(userId: string): Promise<string> {
  // Fetch from cache or database
  // For edge middleware, use Edge Config or KV store
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/internal/user-role/${userId}`,
      {
        headers: {
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
      }
    );

    if (response.ok) {
      const { role } = await response.json();
      return role;
    }
  } catch (error) {
    console.error('Failed to fetch user role:', error);
  }

  return 'client'; // Default role
}
```

#### Role-Based Route Protection

```typescript
// packages/middleware/src/rbac-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';
import { createConditionalMiddleware } from './composer';

/**
 * Create middleware that requires specific role
 */
export function requireRole(allowedRoles: string[]): MiddlewareFunction {
  return async (request: NextRequest, context: MiddlewareContext) => {
    if (!context.role) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
          },
        },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(context.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    return; // Role check passed
  };
}

/**
 * Create middleware that requires specific permission
 */
export function requirePermission(permission: string): MiddlewareFunction {
  return async (request: NextRequest, context: MiddlewareContext) => {
    if (!context.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
          },
        },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermission(
      context.userId,
      context.organisationId || '',
      permission
    );

    if (!hasPermission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 }
      );
    }

    return; // Permission check passed
  };
}

async function checkPermission(
  userId: string,
  organisationId: string,
  permission: string
): Promise<boolean> {
  // Check permission via API or cache
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/internal/check-permission`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          userId,
          organisationId,
          permission,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Example usage: Protect admin routes
 */
export const adminRouteProtection = createConditionalMiddleware(
  (pathname) => pathname.startsWith('/admin'),
  requireRole(['internal'])
);

/**
 * Example usage: Protect organisation management routes
 */
export const orgManagementProtection = createConditionalMiddleware(
  (pathname) => pathname.startsWith('/org/') && pathname.includes('/settings'),
  requireRole(['internal', 'product-seller'])
);
```

#### API Route Protection

```typescript
// apps/routing/src/middleware.ts (with route-specific protection)

import { composeMiddleware, createConditionalMiddleware } from '@repo/middleware/composer';
import { authMiddleware } from '@repo/middleware/auth';
import { requireRole, requirePermission } from '@repo/middleware/rbac-middleware';

export default composeMiddleware([
  // Global middleware
  loggingMiddleware,
  securityHeadersMiddleware,
  authMiddleware,
  orgContextMiddleware,

  // Route-specific protection
  createConditionalMiddleware(
    (pathname) => pathname.startsWith('/admin'),
    requireRole(['internal'])
  ),

  createConditionalMiddleware(
    (pathname) => pathname.startsWith('/api/v1/organisations'),
    requirePermission('organisations:write')
  ),

  createConditionalMiddleware(
    (pathname) => pathname.startsWith('/api/v1/content') &&
                  (pathname.includes('DELETE') || pathname.includes('PUT')),
    requirePermission('content:write')
  ),

  // Rate limiting (always last)
  rateLimitMiddleware,
]);
```

---

### CSRF Protection Middleware

```typescript
// packages/middleware/src/csrf.ts

import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';

/**
 * CSRF protection middleware
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE, PATCH)
 */
export const csrfMiddleware: MiddlewareFunction = async (
  request: NextRequest,
  context: MiddlewareContext
) => {
  // Only check CSRF on mutations
  const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutationMethods.includes(request.method)) {
    return; // Skip CSRF check
  }

  // Skip CSRF check for webhooks (verified via signature)
  if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
    return;
  }

  // Skip CSRF check for public API endpoints
  if (request.nextUrl.pathname.startsWith('/api/public')) {
    return;
  }

  // Extract CSRF token from header
  const csrfToken = request.headers.get('x-csrf-token');

  if (!csrfToken) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'CSRF token missing',
          code: 'CSRF_MISSING',
        },
      },
      { status: 403 }
    );
  }

  // Extract session ID from cookie
  const sessionId = request.cookies.get('__session')?.value;

  if (!sessionId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Session missing',
          code: 'SESSION_MISSING',
        },
      },
      { status: 403 }
    );
  }

  // Validate CSRF token
  const isValid = await validateCSRFToken(csrfToken, sessionId);

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid CSRF token',
          code: 'CSRF_INVALID',
        },
      },
      { status: 403 }
    );
  }

  return; // CSRF check passed
};

async function validateCSRFToken(
  token: string,
  sessionId: string
): Promise<boolean> {
  // Validate token via API
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/internal/validate-csrf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          token,
          sessionId,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('CSRF validation failed:', error);
    return false;
  }
}
```

---

### Rate Limiting Middleware

```typescript
// packages/middleware/src/rate-limit.ts

import { NextRequest, NextResponse } from 'next/server';
import { MiddlewareFunction, MiddlewareContext } from './composer';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // Per user limits
  user: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
  },

  // Per organisation limits
  organisation: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 1000,        // 1000 requests per minute
  },

  // Anonymous (no auth) limits
  anonymous: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 20,          // 20 requests per minute
  },
};

/**
 * Rate limiting middleware
 * Uses Vercel KV for distributed rate limiting
 */
export const rateLimitMiddleware: MiddlewareFunction = async (
  request: NextRequest,
  context: MiddlewareContext
) => {
  // Determine rate limit key
  const identifier = context.userId ||
                    context.organisationId ||
                    request.ip ||
                    'anonymous';

  const config = context.userId
    ? DEFAULT_LIMITS.user
    : context.organisationId
      ? DEFAULT_LIMITS.organisation
      : DEFAULT_LIMITS.anonymous;

  // Check rate limit
  const rateLimitResult = await checkRateLimit(
    identifier,
    config,
    request.nextUrl.pathname
  );

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimitResult.retryAfter,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  }

  return; // Rate limit check passed
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter: number;
}

async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  pathname: string
): Promise<RateLimitResult> {
  // Use Vercel KV for rate limiting
  const key = `rate-limit:${identifier}:${pathname}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Fetch current count from KV
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/internal/rate-limit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          key,
          windowStart,
          windowMs: config.windowMs,
          maxRequests: config.maxRequests,
        }),
      }
    );

    if (!response.ok) {
      // On error, allow request (fail open)
      return {
        allowed: true,
        remaining: config.maxRequests,
        reset: now + config.windowMs,
        retryAfter: 0,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Rate limit check failed:', error);

    // Fail open on error
    return {
      allowed: true,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
      retryAfter: 0,
    };
  }
}
```

---

### Middleware Testing

```typescript
// packages/middleware/tests/integration/middleware.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { composeMiddleware } from '@repo/middleware/composer';
import { authMiddleware } from '@repo/middleware/auth';
import { orgContextMiddleware } from '@repo/middleware/org-context';

describe('Middleware Chain', () => {
  it('executes middleware in order', async () => {
    const executionOrder: string[] = [];

    const middleware1 = async () => {
      executionOrder.push('middleware1');
    };

    const middleware2 = async () => {
      executionOrder.push('middleware2');
    };

    const middleware3 = async () => {
      executionOrder.push('middleware3');
    };

    const composed = composeMiddleware([middleware1, middleware2, middleware3]);

    const request = new NextRequest('https://example.com/test');
    await composed(request);

    expect(executionOrder).toEqual(['middleware1', 'middleware2', 'middleware3']);
  });

  it('short-circuits on response', async () => {
    const executionOrder: string[] = [];

    const middleware1 = async () => {
      executionOrder.push('middleware1');
    };

    const middleware2 = async () => {
      executionOrder.push('middleware2');
      return NextResponse.json({ blocked: true });
    };

    const middleware3 = async () => {
      executionOrder.push('middleware3');
    };

    const composed = composeMiddleware([middleware1, middleware2, middleware3]);

    const request = new NextRequest('https://example.com/test');
    const response = await composed(request);

    expect(executionOrder).toEqual(['middleware1', 'middleware2']);
    expect(response.status).toBe(200);
  });

  it('passes context between middleware', async () => {
    let capturedContext: any;

    const middleware1 = async (req, context) => {
      context.userId = 'user_123';
    };

    const middleware2 = async (req, context) => {
      capturedContext = context;
    };

    const composed = composeMiddleware([middleware1, middleware2]);

    const request = new NextRequest('https://example.com/test');
    await composed(request);

    expect(capturedContext.userId).toBe('user_123');
  });
});

describe('Organisation Context Middleware', () => {
  it('extracts org from subdomain', async () => {
    const context = { metadata: {} };

    const request = new NextRequest('https://acme.example.com/dashboard', {
      headers: {
        host: 'acme.example.com',
      },
    });

    await orgContextMiddleware(request, context);

    expect(context.metadata.organisationSlug).toBe('acme');
  });

  it('extracts org from path parameter', async () => {
    const context = { metadata: {} };

    const request = new NextRequest('https://example.com/org/acme/dashboard');

    await orgContextMiddleware(request, context);

    expect(context.metadata.organisationSlug).toBe('acme');
  });

  it('denies access to unauthorised organisation', async () => {
    const context = {
      userId: 'user_123',
      metadata: {},
    };

    const request = new NextRequest('https://example.com/org/restricted/dashboard');

    const response = await orgContextMiddleware(request, context);

    expect(response?.status).toBe(403);
  });
});
```

---

### Performance Optimization

**Middleware Performance Targets**:

| Metric | Target | Maximum |
|--------|--------|---------|
| **Cold Start** | < 30ms | 50ms |
| **Warm Execution** | < 5ms | 10ms |
| **Total Middleware Chain** | < 20ms | 50ms |
| **Database Lookups** | 0 (use cache) | 1 |
| **External API Calls** | 0-1 | 2 |

**Optimization Techniques**:

1. **Edge Config for Fast Lookups**:
   ```typescript
   import { get } from '@vercel/edge-config';

   // Cache user roles in Edge Config
   const userRole = await get(`user:${userId}:role`);
   ```

2. **Lazy Loading**:
   ```typescript
   // Only import heavy dependencies when needed
   if (requiresComplexValidation) {
     const { validateComplex } = await import('./validation');
     await validateComplex(data);
   }
   ```

3. **Request Coalescing**:
   ```typescript
   // Batch multiple lookups into single request
   const [userRole, orgAccess, permissions] = await Promise.all([
     getUserRole(userId),
     getOrgAccess(userId, orgId),
     getPermissions(userId, orgId),
   ]);
   ```

4. **Early Returns**:
   ```typescript
   // Return early for public routes
   if (isPublicRoute) {
     return NextResponse.next();
   }
   ```

---

