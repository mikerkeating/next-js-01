## Integration Points

### Third-Party Services

| Service | Purpose | Integration Type | Documentation |
|---------|---------|------------------|---------------|
| **Clerk** | Authentication | SDK + Webhooks | [Clerk Docs](https://clerk.com/docs) |
| **Neon / Supabase** | Database | Connection string | [Neon Docs](https://neon.tech/docs) |
| **PostHog** | Product Analytics | JavaScript SDK | [PostHog Docs](https://posthog.com/docs) |
| **Google Analytics 4** | Web Analytics | gtag.js | [GA4 Docs](https://developers.google.com/analytics/devguides/collection/ga4) |
| **Sentry** | Error Tracking | SDK | [Sentry Docs](https://docs.sentry.io) |
| **Vercel** | Hosting & Edge | Native Next.js | [Vercel Docs](https://vercel.com/docs) |

### API Contracts

#### Clerk Webhooks

Webhook endpoint: `POST /api/webhooks/clerk`

Events handled:
- `user.created`: Sync user to database
- `user.updated`: Update user data
- `user.deleted`: Soft delete user
- `organization.created`: Create org record
- `organizationMembership.created`: Add user to org

#### PostHog Events

Event format:
```typescript
{
  event: 'content_created',
  properties: {
    org_id: 'uuid',
    content_type: 'page',
    user_role: 'product-seller'
  },
  timestamp: '2025-11-24T12:00:00Z'
}
```

### Webhook Strategy

#### Security

- Webhook signature verification (HMAC)
- IP allowlisting where available
- Rate limiting per endpoint
- Idempotency keys for retry safety

#### Retry Handling

- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Maximum retries: 5
- Dead letter queue for failed events

### CSRF Protection (Epic 6A.1)

#### CSRF Token Strategy

Next.js App Router provides built-in CSRF protection for Server Actions, but API routes require explicit protection:

**Token Generation and Validation:**

```typescript
// packages/security/src/csrf.ts

import { randomBytes, createHmac } from 'crypto';
import { env } from '@repo/config/env';

export class CSRFProtection {
  private static SECRET = env.CSRF_SECRET; // 32-byte secret key

  /**
   * Generate CSRF token for session
   */
  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const randomValue = randomBytes(16).toString('hex');
    const payload = `${sessionId}:${timestamp}:${randomValue}`;

    const signature = createHmac('sha256', this.SECRET)
      .update(payload)
      .digest('hex');

    return Buffer.from(`${payload}:${signature}`).toString('base64');
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string, sessionId: string, maxAge: number = 3600000): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [sid, timestamp, random, signature] = decoded.split(':');

      // Verify session matches
      if (sid !== sessionId) {
        return false;
      }

      // Verify not expired (default 1 hour)
      const age = Date.now() - parseInt(timestamp);
      if (age > maxAge) {
        return false;
      }

      // Verify signature
      const payload = `${sid}:${timestamp}:${random}`;
      const expectedSignature = createHmac('sha256', this.SECRET)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }
}
```

**Middleware Implementation:**

```typescript
// apps/api/src/middleware/csrf.ts

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@repo/security/csrf';

export async function csrfMiddleware(request: NextRequest) {
  const { method, cookies } = request;

  // Only validate state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const sessionId = cookies.get('sessionId')?.value;
    const csrfToken = request.headers.get('X-CSRF-Token');

    if (!sessionId || !csrfToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing CSRF token', code: 'CSRF_MISSING' } },
        { status: 403 }
      );
    }

    const isValid = CSRFProtection.validateToken(csrfToken, sessionId);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid CSRF token', code: 'CSRF_INVALID' } },
        { status: 403 }
      );
    }
  }

  // Token is valid, proceed
  return NextResponse.next();
}
```

**Frontend Integration:**

```typescript
// packages/api-client/src/csrf.ts

export class APIClient {
  private csrfToken: string | null = null;

  async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    const response = await fetch('/api/csrf-token');
    const { token } = await response.json();
    this.csrfToken = token;
    return token;
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      const token = await this.getCsrfToken();
      headers.set('X-CSRF-Token', token);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage
const api = new APIClient();
await api.request('/api/users', { method: 'POST', body: JSON.stringify(data) });
```

**CSRF Token Endpoint:**

```typescript
// apps/api/src/app/api/csrf-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@repo/security/csrf';
import { getSessionId } from '@repo/auth';

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId(request);

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: { message: 'No session', code: 'NO_SESSION' } },
      { status: 401 }
    );
  }

  const token = CSRFProtection.generateToken(sessionId);

  return NextResponse.json({
    success: true,
    data: { token }
  });
}
```

**Double Submit Cookie Pattern (Alternative):**

For stateless CSRF protection:

```typescript
// Middleware sets CSRF cookie
export function setCSRFCookie(response: NextResponse, token: string) {
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Needs to be readable by JavaScript
    secure: true,
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
  });
}

// Client reads cookie and sends as header
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf-token='))
  ?.split('=')[1];
```

### Input Validation Patterns (Epic 6A.1)

#### Zod Validation Schema Architecture

```typescript
// packages/validation/src/schemas/user.ts

import { z } from 'zod';

/**
 * Reusable validation primitives
 */
export const ValidationPrimitives = {
  uuid: z.string().uuid(),
  email: z.string().email().max(255),
  url: z.string().url().max(2048),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(100),
  safeString: z.string().max(1000).refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    { message: 'Potentially unsafe content detected' }
  ),
  htmlContent: z.string().max(1000000).transform((val) => sanitizeHtml(val, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    allowedAttributes: { 'a': ['href', 'target'] },
  })),
};

/**
 * User input validation
 */
export const CreateUserSchema = z.object({
  email: ValidationPrimitives.email,
  name: z.string().min(1).max(100),
  role: z.enum(['internal', 'product-seller', 'agency-seller', 'client']),
  organisationId: ValidationPrimitives.uuid.optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();

/**
 * Content validation
 */
export const CreateContentSchema = z.object({
  title: z.string().min(1).max(255),
  slug: ValidationPrimitives.slug,
  type: z.enum(['landing-page', 'blog-post', 'doc-page', 'product-template']),
  data: z.record(z.unknown()), // Type-specific validation in nested schemas
});

/**
 * Query parameter validation
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().regex(/^[a-z_]+$/).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

**Validation Middleware:**

```typescript
// packages/api/src/middleware/validation.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { Logger } from '@repo/logger';

const logger = new Logger('validation-middleware');

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest, handler: (req: NextRequest, body: T) => Promise<NextResponse>) => {
    try {
      const rawBody = await request.json();
      const validatedBody = schema.parse(rawBody);

      return handler(request, validatedBody);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', {
          data: {
            path: request.nextUrl.pathname,
            errors: error.errors,
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      throw error;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest, handler: (req: NextRequest, query: T) => Promise<NextResponse>) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryObject = Object.fromEntries(searchParams.entries());
      const validatedQuery = schema.parse(queryObject);

      return handler(request, validatedQuery);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Invalid query parameters',
              code: 'QUERY_VALIDATION_ERROR',
              details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      throw error;
    }
  };
}
```

**Usage in API Routes:**

```typescript
// apps/api/src/app/api/users/route.ts

import { NextRequest } from 'next/server';
import { CreateUserSchema } from '@repo/validation/schemas/user';
import { validateBody } from '@repo/api/middleware/validation';

export async function POST(request: NextRequest) {
  return validateBody(CreateUserSchema)(request, async (req, body) => {
    // body is now typed and validated
    const user = await createUser(body);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  });
}
```

**SQL Injection Prevention:**

```typescript
// Always use parameterized queries with Drizzle ORM

// ✅ SAFE - Parameterized query
const users = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, userEmail));

// ❌ DANGEROUS - Never do this!
// const users = await db.execute(sql`SELECT * FROM users WHERE email = '${userEmail}'`);

// ✅ SAFE - Use sql.raw only with validated identifiers
const sortColumn = validatedQuery.sortBy; // Already validated via Zod
const users = await db
  .select()
  .from(usersTable)
  .orderBy(sql.raw(sortColumn)); // Only safe if sortColumn is validated
```

**File Upload Validation:**

```typescript
// packages/validation/src/file.ts

export const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type), {
      message: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF',
    })
    .refine(async (file) => {
      // Verify file signature (magic bytes) matches extension
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer).slice(0, 4);
      return isValidFileSignature(bytes, file.type);
    }, {
      message: 'File signature does not match file type',
    }),
});

function isValidFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  };

  const validSignatures = signatures[mimeType] || [];
  return validSignatures.some(sig =>
    sig.every((byte, i) => bytes[i] === byte)
  );
}
```

### OWASP Top 10 Coverage (Epic 6A.1)

#### A01:2021 – Broken Access Control

**Implementation:**

```typescript
// packages/auth/src/rbac.ts

export class RBACGuard {
  /**
   * Check if user has permission for action on resource
   */
  static async authorize(
    userId: string,
    organisationId: string,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): Promise<boolean> {
    // Get user's role in organization
    const membership = await db.query.user_organisations.findFirst({
      where: and(
        eq(user_organisations.user_id, userId),
        eq(user_organisations.organisation_id, organisationId)
      ),
    });

    if (!membership) {
      return false;
    }

    // Check permission matrix
    const permissions = PERMISSION_MATRIX[membership.role][resource];
    return permissions?.includes(action) || false;
  }

  /**
   * Middleware to enforce authorization
   */
  static requirePermission(resource: string, action: string) {
    return async (req: NextRequest, handler: Function) => {
      const userId = req.headers.get('X-User-Id');
      const orgId = req.headers.get('X-Organisation-Id');

      if (!userId || !orgId) {
        return NextResponse.json(
          { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
          { status: 401 }
        );
      }

      const hasPermission = await this.authorize(userId, orgId, resource, action as any);

      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } },
          { status: 403 }
        );
      }

      return handler(req);
    };
  }
}

const PERMISSION_MATRIX = {
  internal: {
    users: ['create', 'read', 'update', 'delete'],
    content: ['create', 'read', 'update', 'delete'],
    organisations: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
  },
  'product-seller': {
    users: ['create', 'read', 'update', 'delete'], // Own org only
    content: ['create', 'read', 'update', 'delete'], // Own org only
    organisations: ['read', 'update'], // Own org only
    analytics: ['read'], // Own org only
  },
  'agency-seller': {
    users: ['read'], // Own org only
    content: ['create', 'read'], // Own org only
    organisations: ['read'], // Own org only
    analytics: ['read'], // Own org only
  },
  client: {
    users: ['read'], // Self only
    content: ['read'], // Own org only
    organisations: ['read'], // Own org only
    analytics: [],
  },
};
```

#### A02:2021 – Cryptographic Failures

**Implementation:**

```typescript
// packages/security/src/encryption.ts

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { env } from '@repo/config/env';

const scryptAsync = promisify(scrypt);

export class Encryption {
  private static ALGORITHM = 'aes-256-gcm';
  private static KEY_LENGTH = 32; // 256 bits
  private static IV_LENGTH = 16;
  private static SALT_LENGTH = 32;
  private static TAG_LENGTH = 16;

  /**
   * Encrypt sensitive data (e.g., PII, tokens)
   */
  static async encrypt(plaintext: string): Promise<string> {
    const salt = randomBytes(this.SALT_LENGTH);
    const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, this.KEY_LENGTH)) as Buffer;
    const iv = randomBytes(this.IV_LENGTH);

    const cipher = createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:ciphertext (all base64)
    const result = Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
    return result;
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(ciphertext: string): Promise<string> {
    const buffer = Buffer.from(ciphertext, 'base64');

    const salt = buffer.slice(0, this.SALT_LENGTH);
    const iv = buffer.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
    const tag = buffer.slice(
      this.SALT_LENGTH + this.IV_LENGTH,
      this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
    );
    const encrypted = buffer.slice(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);

    const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, this.KEY_LENGTH)) as Buffer;

    const decipher = createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

// Usage
const encrypted = await Encryption.encrypt('sensitive-data');
await db.insert(secrets).values({ data: encrypted });

const decrypted = await Encryption.decrypt(record.data);
```

**TLS Configuration:**

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
```

#### A03:2021 – Injection

**Protection Measures:**

1. **SQL Injection:** Always use Drizzle ORM with parameterized queries (covered above)
2. **NoSQL Injection:** Validate all MongoDB queries (not applicable - using PostgreSQL)
3. **Command Injection:** Never execute shell commands with user input
4. **LDAP Injection:** Not applicable
5. **XPath/XML Injection:** Not applicable

```typescript
// ❌ NEVER DO THIS
import { exec } from 'child_process';
exec(`convert ${userFilename}.jpg ${userFilename}.pdf`); // DANGEROUS!

// ✅ Use safe libraries instead
import sharp from 'sharp';
await sharp(buffer).toFormat('pdf').toFile(outputPath);
```

#### A04:2021 – Insecure Design

**Security Requirements in Design:**

- Multi-factor authentication (Clerk handles this)
- Rate limiting on all public endpoints (100/min per user)
- Account enumeration protection (generic error messages)
- Secure password recovery flow (via Clerk)

#### A05:2021 – Security Misconfiguration

**Hardening Checklist:**

```typescript
// next.config.js
module.exports = {
  // Disable X-Powered-By header
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://clerk.*.clerk.accounts.dev https://*.vercel.app",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

#### A06:2021 – Vulnerable and Outdated Components

**Dependency Management:**

```json
// package.json
{
  "scripts": {
    "audit": "pnpm audit --audit-level=moderate",
    "audit:fix": "pnpm audit --fix",
    "outdated": "pnpm outdated"
  }
}
```

**Automated Scanning:**

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  pull_request:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm audit --audit-level=high
      - run: pnpm outdated

  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### A07:2021 – Identification and Authentication Failures

**Mitigations (via Clerk):**

- Multi-factor authentication (MFA) supported
- Password complexity requirements enforced
- Secure session management (JWT with rotation)
- Account lockout after failed attempts
- Credential stuffing protection

**Custom Authentication Hardening:**

```typescript
// Additional session validation
export async function validateSession(sessionToken: string): Promise<boolean> {
  try {
    const session = await verifyJWT(sessionToken);

    // Check if session is not expired
    if (session.exp < Date.now() / 1000) {
      return false;
    }

    // Check if session is revoked (stored in Redis)
    const isRevoked = await redis.get(`revoked:${session.sid}`);
    if (isRevoked) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

#### A08:2021 – Software and Data Integrity Failures

**Integrity Checks:**

```typescript
// Verify webhook signatures (Clerk webhooks)
import { Webhook } from 'svix';

export async function verifyWebhook(payload: string, headers: Headers): Promise<boolean> {
  const webhookSecret = env.CLERK_WEBHOOK_SECRET;
  const wh = new Webhook(webhookSecret);

  try {
    wh.verify(payload, {
      'svix-id': headers.get('svix-id')!,
      'svix-timestamp': headers.get('svix-timestamp')!,
      'svix-signature': headers.get('svix-signature')!,
    });
    return true;
  } catch {
    return false;
  }
}
```

**Subresource Integrity:**

```html
<!-- Use SRI for CDN resources -->
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

#### A09:2021 – Security Logging and Monitoring Failures

**Comprehensive Audit Logging:**

- All authentication events logged (via Clerk + custom audit log)
- All authorization failures logged
- All data access logged (create, read, update, delete)
- All configuration changes logged
- Integration with Sentry for real-time alerting

(See Audit Logging section above for implementation details)

#### A10:2021 – Server-Side Request Forgery (SSRF)

**SSRF Prevention:**

```typescript
// packages/security/src/ssrf.ts

export class SSRFProtection {
  private static BLOCKED_NETWORKS = [
    '10.0.0.0/8',        // Private network
    '172.16.0.0/12',     // Private network
    '192.168.0.0/16',    // Private network
    '127.0.0.0/8',       // Loopback
    '169.254.0.0/16',    // Link-local
    '::1/128',           // IPv6 loopback
    'fc00::/7',          // IPv6 private
  ];

  private static ALLOWED_PROTOCOLS = ['https:', 'http:'];

  /**
   * Validate URL before making external request
   */
  static async validateURL(url: string): Promise<boolean> {
    try {
      const parsed = new URL(url);

      // Check protocol
      if (!this.ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
        return false;
      }

      // Resolve hostname to IP
      const { address } = await dns.promises.lookup(parsed.hostname);

      // Check if IP is in blocked range
      for (const network of this.BLOCKED_NETWORKS) {
        if (this.isIPInRange(address, network)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  private static isIPInRange(ip: string, cidr: string): boolean {
    // IP range checking logic
    // Use library like 'ip-range-check' for production
    return false; // Simplified
  }

  /**
   * Safe fetch wrapper
   */
  static async safeFetch(url: string, options?: RequestInit): Promise<Response> {
    const isValid = await this.validateURL(url);

    if (!isValid) {
      throw new Error('Invalid URL: SSRF protection triggered');
    }

    // Additional safeguards
    const timeout = 10000; // 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        // Prevent following redirects to blocked networks
        redirect: 'manual',
      });

      // Check redirect location
      if ([301, 302, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location && !(await this.validateURL(location))) {
          throw new Error('Redirect target failed SSRF check');
        }
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Usage in API routes
const webhookUrl = userProvidedURL; // From user input
const response = await SSRFProtection.safeFetch(webhookUrl);
```

### Security Testing Requirements

**Automated Security Testing:**

```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on: [pull_request]

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - name: ZAP Scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: https://staging.example.com
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Security Checklist:**

**Development:**
- [ ] All user inputs validated with Zod schemas
- [ ] CSRF protection enabled on all state-changing endpoints
- [ ] SQL injection prevention via parameterized queries
- [ ] XSS prevention via HTML sanitization
- [ ] SSRF protection on all external requests

**Pre-Production:**
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Dependency audit passing (no high/critical vulnerabilities)
- [ ] RBAC authorization tested for all resources
- [ ] Encryption working for sensitive data
- [ ] Rate limiting tested and working

**Production:**
- [ ] Weekly automated security scans (ZAP, Snyk)
- [ ] Security logging and monitoring active
- [ ] Incident response plan documented
- [ ] Regular security reviews scheduled
- [ ] Penetration testing completed (annually)

---

