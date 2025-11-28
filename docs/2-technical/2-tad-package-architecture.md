## Package Architecture

### Overview

This section defines the internal structure, public API surface, and inter-package dependencies for all shared packages in our monorepo. These packages form the foundation for Phases 2A and 2B, providing reusable functionality across all applications.

**Key Principles**:

- **Single Responsibility**: Each package has one clear purpose
- **Explicit Dependencies**: Dependencies are declared and versioned
- **Public API Contract**: Clear boundary between public and internal code
- **Type Safety**: Full TypeScript coverage with exported types
- **Minimal Coupling**: Packages depend on interfaces, not implementations

### Package Overview

| Package                 | Purpose                                             | Dependencies                          | Applications Using                      |
| ----------------------- | --------------------------------------------------- | ------------------------------------- | --------------------------------------- |
| **@repo/config**        | Shared configuration (TypeScript, ESLint, Tailwind) | None                                  | All apps & packages                     |
| **@repo/database**      | Database schema, queries, migrations                | `drizzle-orm`, `postgres`             | `routing`, `api`, `tools`               |
| **@repo/auth**          | Authentication utilities and middleware             | `@clerk/nextjs`, `@repo/database`     | `routing`, `api`, `tools`               |
| **@repo/ui**            | Shared UI component library                         | `react`, `tailwindcss`, `@radix-ui/*` | `routing`, `marketing`, `docs`, `tools` |
| **@repo/analytics**     | Analytics tracking and configuration                | `posthog-js`, `react`, `@repo/auth`   | `routing`, `marketing`, `tools`         |
| **@repo/observability** | Logging, error tracking, health checks              | `@sentry/nextjs`, `@repo/logger`      | All apps                                |
| **@repo/logger**        | Structured logging implementation                   | None                                  | All apps & packages                     |
| **@repo/middleware**    | Shared Next.js middleware                           | `@repo/auth`, `@repo/logger`          | `routing`, `api`, `tools`               |
| **@repo/api-client**    | Type-safe API client                                | `@repo/auth`, `zod`                   | `routing`, `marketing`, `tools`         |
| **@repo/org**           | Organization context and utilities                  | `@repo/database`, `@repo/auth`        | `routing`, `api`, `tools`               |
| **@repo/validation**    | Input validation schemas                            | `zod`                                 | All apps & packages                     |
| **@repo/testing**       | Testing utilities and helpers                       | `vitest`, `@testing-library/react`    | All apps & packages                     |

### Dependency Graph

```
┌──────────────────────────────────────────────────────────────────┐
│                      PACKAGE DEPENDENCY GRAPH                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Applications Layer                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │routing │  │  api   │  │ tools  │  │marketing│                │
│  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘                │
│      │           │           │           │                       │
│      └───────────┴───────────┴───────────┘                       │
│                      │                                           │
│  ┌───────────────────┴────────────────────────────┐              │
│  │                                                │              │
│  ▼                                                ▼              │
│  Shared Packages Layer                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ @repo/ui     │  │@repo/middleware│ │@repo/analytics│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         ▼                 ▼                 ▼                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │@repo/auth    │  │@repo/api-client│ │  @repo/org   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                    │
│                      │                                           │
│                      ▼                                           │
│  ┌──────────────────────────────────────────────────┐           │
│  │              @repo/database                      │           │
│  └──────────────────┬───────────────────────────────┘           │
│                     │                                            │
│  ┌─────────────────┴──────────────────────────┐                 │
│  │                                            │                 │
│  ▼                                            ▼                 │
│  Foundation Layer                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │@repo/logger  │  │@repo/validation│ │@repo/config  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Package Details

#### @repo/config

**Purpose**: Centralized configuration for TypeScript, ESLint, Prettier, and Tailwind CSS.

**Internal Structure**:

```
packages/config/
├── src/
│   ├── typescript/
│   │   ├── base.json          # Base TypeScript config
│   │   ├── nextjs.json        # Next.js specific config
│   │   └── react.json         # React specific config
│   ├── eslint/
│   │   ├── base.js            # Base ESLint rules
│   │   ├── nextjs.js          # Next.js rules
│   │   └── react.js           # React rules
│   ├── prettier/
│   │   └── index.js           # Prettier configuration
│   ├── tailwind/
│   │   ├── base.js            # Base Tailwind config
│   │   └── presets.js         # Theme presets
│   └── env.ts                 # Environment validation utilities
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// Environment validation (packages/config/src/env.ts)
export { createEnv } from "@t3-oss/env-nextjs";
export { env } from "./env-config";

// Usage in consuming packages
import { env } from "@repo/config/env";
const apiUrl = env.NEXT_PUBLIC_API_URL; // Type-safe, validated
```

**Configuration Exports**:

```json
// package.json
{
  "name": "@repo/config",
  "exports": {
    "./typescript/base": "./src/typescript/base.json",
    "./typescript/nextjs": "./src/typescript/nextjs.json",
    "./eslint/base": "./src/eslint/base.js",
    "./eslint/nextjs": "./src/eslint/nextjs.js",
    "./prettier": "./src/prettier/index.js",
    "./tailwind": "./src/tailwind/base.js",
    "./env": "./src/env.ts"
  }
}
```

**Dependencies**: None (peer dependencies only: `typescript`, `eslint`, `prettier`, `tailwindcss`)

**Consumed By**: All applications and packages

---

#### @repo/database

**Purpose**: Database schema definitions, type-safe queries, and migration management.

**Internal Structure**:

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── index.ts           # Re-exports all schemas
│   │   ├── users.ts           # User table schema
│   │   ├── organisations.ts   # Organisation table schema
│   │   ├── content.ts         # Content table schema
│   │   ├── analytics.ts       # Analytics events schema
│   │   ├── audit-logs.ts      # Audit log schema
│   │   └── privacy.ts         # Privacy-related tables
│   ├── queries/
│   │   ├── users.ts           # User queries
│   │   ├── organisations.ts   # Organisation queries
│   │   ├── content.ts         # Content queries
│   │   └── analytics.ts       # Analytics queries
│   ├── migrations/
│   │   └── meta/              # Migration metadata
│   ├── types.ts               # Exported TypeScript types
│   ├── client.ts              # Database client configuration
│   └── index.ts               # Public API exports
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/database/src/index.ts

// 1. Database Client
export { db } from "./client";

// 2. Schema Definitions
export * from "./schema";
export type {
  User,
  Organisation,
  UserOrganisation,
  Content,
  AnalyticsEvent,
  AuditLog,
  DeletionRequest,
  ExportRequest,
  UserConsent,
  UserPrivacyPreferences,
  VendorAgreement,
} from "./types";

// 3. Query Functions
export {
  // User queries
  getUserById,
  getUserByClerkId,
  createUser,
  updateUser,
  deleteUser,

  // Organisation queries
  getOrganisationById,
  getOrganisationBySlug,
  createOrganisation,
  updateOrganisation,
  getUserOrganisations,
  addUserToOrganisation,
  removeUserFromOrganisation,

  // Content queries
  getContentById,
  getContentByOrganisation,
  createContent,
  updateContent,
  deleteContent,

  // Analytics queries
  trackEvent,
  getEventsByOrganisation,
  getEventsByUser,
} from "./queries";

// 4. Utilities
export { sql } from "drizzle-orm";
export { eq, and, or, not, isNull, isNotNull } from "drizzle-orm";
```

**Usage Example**:

```typescript
// In apps/routing/src/app/api/users/route.ts
import { db, getUserById, type User } from "@repo/database";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const user: User | null = await getUserById(userId);

  return Response.json({ user });
}
```

**Dependencies**:

- `drizzle-orm`: ORM library
- `postgres`: PostgreSQL driver
- `@repo/logger`: Structured logging

**Consumed By**: `routing`, `api`, `tools`, `@repo/auth`, `@repo/org`

---

#### @repo/auth

**Purpose**: Authentication utilities, session management, and authorization helpers.

**Internal Structure**:

```
packages/auth/
├── src/
│   ├── clerk/
│   │   ├── client.ts          # Clerk client configuration
│   │   ├── middleware.ts      # Auth middleware
│   │   ├── webhooks.ts        # Webhook handlers
│   │   └── types.ts           # Clerk-specific types
│   ├── session/
│   │   ├── manager.ts         # Session management
│   │   ├── validation.ts      # Session validation
│   │   └── types.ts           # Session types
│   ├── rbac/
│   │   ├── permissions.ts     # Permission definitions
│   │   ├── roles.ts           # Role definitions
│   │   └── checks.ts          # Authorization checks
│   ├── utils/
│   │   ├── hash.ts            # Password hashing utilities
│   │   └── tokens.ts          # Token generation/validation
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/auth/src/index.ts

// 1. Clerk Integration
export { clerkClient, clerkMiddleware, auth, currentUser, getAuth } from "./clerk/client";

export { handleClerkWebhook, type ClerkWebhookEvent } from "./clerk/webhooks";

// 2. Session Management
export {
  createSession,
  validateSession,
  destroySession,
  refreshSession,
  type Session,
} from "./session/manager";

// 3. RBAC (Role-Based Access Control)
export { Roles, Permissions, type Role, type Permission } from "./rbac/roles";

export { checkPermission, requirePermission, hasRole, requireRole } from "./rbac/checks";

// 4. Utilities
export { hashPassword, verifyPassword } from "./utils/hash";

export { generateToken, verifyToken } from "./utils/tokens";

// 5. Types
export type { AuthUser, AuthSession, AuthContext } from "./types";
```

**Usage Example**:

```typescript
// In apps/routing/src/middleware.ts
import { clerkMiddleware, requirePermission, Permissions } from '@repo/auth';

export default clerkMiddleware((auth, req) => {
  // Public routes
  if (req.nextUrl.pathname.startsWith('/public')) {
    return;
  }

  // Protected routes - require authentication
  if (!auth().userId) {
    return auth().redirectToSignIn();
  }

  // Admin routes - require admin permission
  if (req.nextUrl.pathname.startsWith('/admin')) {
    requirePermission(Permissions.ADMIN_ACCESS);
  }
});

// In a server component
import { auth, hasRole, Roles } from '@repo/auth';

export default async function AdminPage() {
  const { userId } = auth();
  const isAdmin = await hasRole(userId, Roles.ADMIN);

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  return <div>Admin Dashboard</div>;
}
```

**Dependencies**:

- `@clerk/nextjs`: Clerk authentication SDK
- `@repo/database`: User and session storage
- `@repo/logger`: Structured logging
- `bcrypt`: Password hashing

**Consumed By**: `routing`, `api`, `tools`, `@repo/middleware`, `@repo/api-client`

---

#### @repo/ui

**Purpose**: Shared React component library with shadcn/ui components and custom components.

**Internal Structure**:

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── forms/             # Form components
│   │   │   ├── form.tsx
│   │   │   ├── form-field.tsx
│   │   │   └── form-error.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── container.tsx
│   │   └── feedback/          # Feedback components
│   │       ├── toast.tsx
│   │       ├── loading.tsx
│   │       └── error-boundary.tsx
│   ├── hooks/                 # Shared React hooks
│   │   ├── use-toast.ts
│   │   ├── use-media-query.ts
│   │   └── use-debounce.ts
│   ├── utils/                 # Component utilities
│   │   ├── cn.ts              # className utility
│   │   └── format.ts          # Formatting utilities
│   ├── styles/                # Global styles
│   │   └── globals.css
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/ui/src/index.ts

// 1. UI Components (shadcn/ui)
export { Button, type ButtonProps } from "./components/ui/button";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./components/ui/dialog";

// ... all shadcn/ui components

// 2. Form Components
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./components/forms/form";

export { FormError, type FormErrorProps } from "./components/forms/form-error";

// 3. Layout Components
export { Header } from "./components/layout/header";
export { Footer } from "./components/layout/footer";
export { Sidebar } from "./components/layout/sidebar";
export { Container } from "./components/layout/container";

// 4. Feedback Components
export { ErrorBoundary, type ErrorBoundaryProps } from "./components/feedback/error-boundary";

export { Loading, Spinner } from "./components/feedback/loading";

export { toast, useToast, Toaster } from "./components/feedback/toast";

// 5. Hooks
export { useMediaQuery } from "./hooks/use-media-query";
export { useDebounce } from "./hooks/use-debounce";
export { useToast } from "./hooks/use-toast";

// 6. Utilities
export { cn } from "./utils/cn";
export { formatDate, formatCurrency } from "./utils/format";
```

**Usage Example**:

```typescript
// In apps/routing/src/app/dashboard/page.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  useToast,
} from '@repo/ui';

export default function Dashboard() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: 'Success',
      description: 'Action completed successfully',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick}>Click Me</Button>
      </CardContent>
    </Card>
  );
}
```

**Dependencies**:

- `react`: React library
- `react-dom`: React DOM
- `@radix-ui/*`: Radix UI primitives
- `tailwindcss`: Styling
- `class-variance-authority`: Component variants
- `clsx`: className utility
- `tailwind-merge`: Tailwind class merging

**Consumed By**: `routing`, `marketing`, `docs`, `tools`, `landing`

---

#### @repo/analytics

**Purpose**: Product analytics tracking with PostHog and Google Analytics 4.

**Internal Structure**:

```
packages/analytics/
├── src/
│   ├── posthog/
│   │   ├── client.ts          # PostHog client setup
│   │   ├── provider.tsx       # PostHog React provider
│   │   ├── hooks.ts           # React hooks for tracking
│   │   └── types.ts           # Event types
│   ├── ga4/
│   │   ├── client.ts          # GA4 client setup
│   │   ├── events.ts          # GA4 event tracking
│   │   └── types.ts           # GA4 event types
│   ├── events/
│   │   ├── definitions.ts     # Event schema definitions
│   │   └── tracker.ts         # Unified event tracker
│   ├── consent/
│   │   ├── manager.ts         # Consent management
│   │   └── banner.tsx         # Consent banner component
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/analytics/src/index.ts

// 1. PostHog Integration
export { PostHogProvider, type PostHogConfig } from "./posthog/provider";

export { usePostHog, useFeatureFlag } from "./posthog/hooks";

// 2. Event Tracking
export { track, identify, page, group, alias } from "./events/tracker";

export { Events, type EventName, type EventProperties } from "./events/definitions";

// 3. Consent Management
export {
  ConsentBanner,
  updateConsent,
  getConsentPreferences,
  type ConsentPreferences,
} from "./consent/manager";

// 4. Types
export type { AnalyticsUser, TrackingEvent } from "./types";
```

**Event Schema**:

```typescript
// packages/analytics/src/events/definitions.ts

export const Events = {
  // User Events
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_LOGGED_OUT: "user_logged_out",

  // Content Events
  CONTENT_CREATED: "content_created",
  CONTENT_UPDATED: "content_updated",
  CONTENT_DELETED: "content_deleted",
  CONTENT_PUBLISHED: "content_published",

  // Landing Page Events
  LANDING_PAGE_VIEWED: "landing_page_viewed",
  LANDING_PAGE_CREATED: "landing_page_created",
  LANDING_PAGE_PUBLISHED: "landing_page_published",
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

// Type-safe event properties
export interface EventProperties {
  [Events.USER_SIGNED_UP]: {
    method: "email" | "oauth";
    provider?: string;
  };

  [Events.CONTENT_CREATED]: {
    contentType: string;
    organisationId: string;
  };

  // ... all event properties
}
```

**Usage Example**:

```typescript
// In apps/routing/src/app/layout.tsx
import { PostHogProvider } from '@repo/analytics';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}

// In a component
import { track, Events } from '@repo/analytics';

export function CreateContentButton() {
  const handleCreate = async () => {
    const content = await createContent();

    // Track event
    track(Events.CONTENT_CREATED, {
      contentType: content.type,
      organisationId: content.organisationId,
    });
  };

  return <Button onClick={handleCreate}>Create Content</Button>;
}
```

**Dependencies**:

- `posthog-js`: PostHog SDK
- `react`: React library
- `@repo/auth`: User identification
- `@repo/database`: Consent storage

**Consumed By**: `routing`, `marketing`, `tools`

---

#### @repo/observability

**Purpose**: Centralized observability including logging, error tracking, and health monitoring.

**Internal Structure**:

```
packages/observability/
├── src/
│   ├── sentry/
│   │   ├── client.ts          # Sentry SDK setup
│   │   ├── middleware.ts      # Sentry middleware
│   │   └── utils.ts           # Error capture utilities
│   ├── health-checks/
│   │   ├── database.ts        # Database health check
│   │   ├── auth.ts            # Auth service health check
│   │   ├── cache.ts           # Cache health check
│   │   └── aggregator.ts      # Health check aggregator
│   ├── web-vitals/
│   │   └── reporter.ts        # Web vitals tracking
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/observability/src/index.ts

// 1. Sentry Integration
export {
  initSentry,
  captureError,
  captureMessage,
  setSentryUser,
  clearSentryUser,
} from "./sentry/client";

// 2. Health Checks
export {
  checkDatabase,
  checkAuth,
  checkCache,
  checkAllServices,
  type HealthCheckResult,
} from "./health-checks/aggregator";

// 3. Web Vitals
export { reportWebVitals } from "./web-vitals/reporter";

// 4. Types
export type { HealthStatus, ServiceHealth } from "./types";
```

**Usage Example**:

```typescript
// In apps/routing/src/app/api/health/route.ts
import { checkAllServices } from '@repo/observability';

export async function GET() {
  const { overall, checks } = await checkAllServices();

  return Response.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: overall === 'unhealthy' ? 503 : 200 }
  );
}

// In apps/routing/src/app/layout.tsx
import { initSentry, reportWebVitals } from '@repo/observability';

initSentry();

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return <html lang="en"><body>{children}</body></html>;
}
```

**Dependencies**:

- `@sentry/nextjs`: Sentry SDK
- `web-vitals`: Web Vitals library
- `@repo/logger`: Structured logging
- `@repo/database`: Database access for health checks

**Consumed By**: All applications

---

#### @repo/logger

**Purpose**: Structured JSON logging with privacy-first design.

**Internal Structure**:

```
packages/logger/
├── src/
│   ├── logger.ts              # Logger class implementation
│   ├── types.ts               # Log entry types
│   ├── formatters/
│   │   ├── json.ts            # JSON formatter
│   │   └── pretty.ts          # Development pretty printer
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/logger/src/index.ts

export { Logger } from "./logger";

export type { LogEntry, LogLevel, LogMetadata } from "./types";

// Singleton for convenience
export const logger = new Logger("default");
```

**Usage Example**:

```typescript
// In any package or application
import { Logger } from "@repo/logger";

const logger = new Logger("user-service");

// Info log
logger.info("User created", {
  userId: user.id,
  data: { method: "registration" },
});

// Error log
try {
  await riskyOperation();
} catch (error) {
  logger.error("Operation failed", error as Error, {
    data: { operation: "riskyOperation" },
  });
}

// Performance log
const start = Date.now();
await performTask();
logger.info("Task completed", {
  performance: { duration: Date.now() - start },
});
```

**Dependencies**: None (pure TypeScript)

**Consumed By**: All applications and packages

---

#### @repo/middleware

**Purpose**: Shared Next.js middleware for authentication, rate limiting, and request logging.

**Internal Structure**:

```
packages/middleware/
├── src/
│   ├── auth.ts                # Authentication middleware
│   ├── rate-limit.ts          # Rate limiting middleware
│   ├── logging.ts             # Request logging middleware
│   ├── org-context.ts         # Organisation context middleware
│   ├── security-headers.ts    # Security headers middleware
│   ├── composer.ts            # Middleware composition utility
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/middleware/src/index.ts

export { authMiddleware } from "./auth";

export { rateLimitMiddleware, createRateLimiter } from "./rate-limit";

export { loggingMiddleware } from "./logging";

export { orgContextMiddleware } from "./org-context";

export { securityHeadersMiddleware } from "./security-headers";

export { composeMiddleware } from "./composer";
```

**Usage Example**:

```typescript
// In apps/routing/src/middleware.ts
import {
  authMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  securityHeadersMiddleware,
  composeMiddleware,
} from "@repo/middleware";

export default composeMiddleware([
  loggingMiddleware,
  securityHeadersMiddleware,
  authMiddleware,
  rateLimitMiddleware,
]);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

**Dependencies**:

- `@repo/auth`: Authentication utilities
- `@repo/logger`: Request logging
- `@repo/database`: Rate limit storage

**Consumed By**: `routing`, `api`, `tools`

---

#### @repo/api-client

**Purpose**: Type-safe API client with automatic authentication and error handling.

**Internal Structure**:

```
packages/api-client/
├── src/
│   ├── client.ts              # Base API client
│   ├── endpoints/
│   │   ├── users.ts           # User endpoints
│   │   ├── organisations.ts   # Organisation endpoints
│   │   ├── content.ts         # Content endpoints
│   │   └── analytics.ts       # Analytics endpoints
│   ├── types.ts               # Request/response types
│   ├── errors.ts              # Error classes
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/api-client/src/index.ts

export { APIClient, createAPIClient } from "./client";

export { UserAPI, OrganisationAPI, ContentAPI, AnalyticsAPI } from "./endpoints";

export { APIError, ValidationError, AuthenticationError, NotFoundError } from "./errors";

export type { APIResponse, APIErrorResponse, PaginatedResponse } from "./types";
```

**Usage Example**:

```typescript
// In apps/routing/src/lib/api.ts
import { createAPIClient } from '@repo/api-client';

export const api = createAPIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In a component
import { api } from '@/lib/api';

export async function UserProfile({ userId }: { userId: string }) {
  const user = await api.users.getById(userId);  // Type-safe

  return <div>{user.name}</div>;
}
```

**Dependencies**:

- `@repo/auth`: Authentication token management
- `@repo/validation`: Request/response validation
- `zod`: Schema validation

**Consumed By**: `routing`, `marketing`, `tools`

---

#### @repo/org

**Purpose**: Organisation context management and multi-tenant utilities.

**Internal Structure**:

```
packages/org/
├── src/
│   ├── context/
│   │   ├── provider.tsx       # React context provider
│   │   ├── hooks.ts           # React hooks
│   │   └── types.ts           # Context types
│   ├── utils/
│   │   ├── switcher.ts        # Organisation switching logic
│   │   └── permissions.ts     # Org-level permissions
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/org/src/index.ts

export { OrganisationProvider, useOrganisation, useOrganisationList } from "./context/provider";

export { switchOrganisation, getCurrentOrganisation } from "./utils/switcher";

export type { OrganisationContext, OrganisationMembership } from "./context/types";
```

**Usage Example**:

```typescript
// In apps/routing/src/app/layout.tsx
import { OrganisationProvider } from '@repo/org';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrganisationProvider>
          {children}
        </OrganisationProvider>
      </body>
    </html>
  );
}

// In a component
import { useOrganisation } from '@repo/org';

export function OrganisationSwitcher() {
  const { organisation, organisations, switchTo } = useOrganisation();

  return (
    <select
      value={organisation.id}
      onChange={(e) => switchTo(e.target.value)}
    >
      {organisations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
```

**Dependencies**:

- `@repo/database`: Organisation data access
- `@repo/auth`: User authentication
- `react`: React library

**Consumed By**: `routing`, `api`, `tools`

---

#### @repo/validation

**Purpose**: Shared validation schemas using Zod for type-safe input validation.

**Internal Structure**:

```
packages/validation/
├── src/
│   ├── schemas/
│   │   ├── user.ts            # User validation schemas
│   │   ├── organisation.ts    # Organisation schemas
│   │   ├── content.ts         # Content schemas
│   │   ├── auth.ts            # Auth schemas
│   │   └── common.ts          # Common schemas (email, uuid, etc.)
│   ├── middleware/
│   │   └── validator.ts       # Validation middleware
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/validation/src/index.ts

export {
  // User schemas
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,

  // Organisation schemas
  organisationCreateSchema,
  organisationUpdateSchema,

  // Content schemas
  contentCreateSchema,
  contentUpdateSchema,

  // Auth schemas
  loginSchema,
  signupSchema,
  passwordResetSchema,

  // Common schemas
  emailSchema,
  uuidSchema,
  paginationSchema,
} from "./schemas";

export { validateRequest, validateQuery, validateBody } from "./middleware/validator";
```

**Usage Example**:

```typescript
// In apps/routing/src/app/api/users/route.ts
import { validateBody, userCreateSchema } from "@repo/validation";

export async function POST(request: Request) {
  const body = await request.json();

  // Validate and parse
  const validatedData = userCreateSchema.parse(body);
  // Type: { name: string; email: string; ... }

  const user = await createUser(validatedData);
  return Response.json({ user });
}

// With middleware
import { validateRequest } from "@repo/validation";

export const POST = validateRequest(userCreateSchema, async (request, validatedData) => {
  const user = await createUser(validatedData);
  return Response.json({ user });
});
```

**Dependencies**:

- `zod`: Schema validation library

**Consumed By**: All applications and packages

---

#### @repo/testing

**Purpose**: Shared testing utilities, fixtures, and helpers for unit and integration tests.

**Internal Structure**:

```
packages/testing/
├── src/
│   ├── fixtures/
│   │   ├── users.ts           # User test fixtures
│   │   ├── organisations.ts   # Organisation fixtures
│   │   └── content.ts         # Content fixtures
│   ├── helpers/
│   │   ├── database.ts        # Test database helpers
│   │   ├── auth.ts            # Auth test helpers
│   │   └── api.ts             # API test helpers
│   ├── mocks/
│   │   ├── clerk.ts           # Clerk mock
│   │   ├── posthog.ts         # PostHog mock
│   │   └── sentry.ts          # Sentry mock
│   ├── setup/
│   │   ├── vitest.ts          # Vitest setup
│   │   └── playwright.ts      # Playwright setup
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Public API Surface**:

```typescript
// packages/testing/src/index.ts

export {
  // Fixtures
  createUserFixture,
  createOrganisationFixture,
  createContentFixture,
} from "./fixtures";

export {
  // Database helpers
  setupTestDatabase,
  teardownTestDatabase,
  resetTestDatabase,
} from "./helpers/database";

export {
  // Auth helpers
  mockAuthUser,
  mockAuthSession,
  createTestUser,
} from "./helpers/auth";

export {
  // API helpers
  mockAPIRequest,
  mockAPIResponse,
} from "./helpers/api";

export {
  // Mocks
  mockClerk,
  mockPostHog,
  mockSentry,
} from "./mocks";
```

**Usage Example**:

```typescript
// In apps/routing/src/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { createUserFixture } from '@repo/testing';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user information', () => {
    const user = createUserFixture({
      name: 'John Doe',
      email: 'john@example.com',
    });

    render(<UserCard user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});

// In integration test
import {
  setupTestDatabase,
  teardownTestDatabase,
  createUserFixture,
} from '@repo/testing';
import { getUserById } from '@repo/database';

describe('User API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('retrieves user by ID', async () => {
    const fixture = createUserFixture();
    const user = await getUserById(fixture.id);

    expect(user).toEqual(fixture);
  });
});
```

**Dependencies**:

- `vitest`: Test framework
- `@testing-library/react`: React testing utilities
- `@playwright/test`: E2E testing
- `@repo/database`: Database access for fixtures

**Consumed By**: All applications and packages (devDependencies)

---

### Inter-Package Dependency Rules

**Dependency Layers** (packages can only depend on packages in lower layers):

1. **Foundation Layer** (no internal dependencies):
   - `@repo/config`
   - `@repo/logger`
   - `@repo/validation`

2. **Data Layer** (depends on Foundation):
   - `@repo/database` → `@repo/logger`

3. **Service Layer** (depends on Foundation + Data):
   - `@repo/auth` → `@repo/database`, `@repo/logger`
   - `@repo/observability` → `@repo/logger`, `@repo/database`

4. **Application Layer** (depends on any lower layer):
   - `@repo/ui` → Foundation layer only
   - `@repo/middleware` → `@repo/auth`, `@repo/logger`, `@repo/database`
   - `@repo/api-client` → `@repo/auth`, `@repo/validation`
   - `@repo/org` → `@repo/database`, `@repo/auth`
   - `@repo/analytics` → `@repo/auth`, `@repo/database`

5. **Testing Layer** (can depend on any package):
   - `@repo/testing` → All packages (as devDependency)

**Circular Dependency Prevention**:

```typescript
// ❌ WRONG: Circular dependency
// @repo/auth imports from @repo/middleware
// @repo/middleware imports from @repo/auth

// ✅ CORRECT: Extract shared types to avoid circular dependency
// Create @repo/types for shared types
// Both @repo/auth and @repo/middleware import from @repo/types
```

**Dependency Enforcement**:

```json
// .eslintrc.js (root)
{
  "rules": {
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./packages/config",
            "from": "./packages",
            "except": ["./config"]
          },
          {
            "target": "./packages/logger",
            "from": "./packages",
            "except": ["./logger"]
          }
        ]
      }
    ]
  }
}
```

---

### Package Versioning Strategy

**Internal Packages** (all `@repo/*` packages):

- Use workspace protocol: `"@repo/database": "workspace:*"`
- All packages share the same version from root `package.json`
- Version bumps are synchronized across all packages

**External Dependencies**:

- Locked to exact versions in `pnpm-lock.yaml`
- Major version updates require ADR and testing across all packages
- Security updates applied immediately via Dependabot

**Publishing** (if needed for external consumption):

- Packages are private by default: `"private": true`
- If published to npm: Use semantic versioning independently per package

---

### Package Testing Requirements

Each package must include:

1. **Unit Tests**: 90% coverage minimum for packages, 80% for applications
2. **Integration Tests**: Test interactions between packages
3. **Type Tests**: Verify exported types are correct
4. **Build Tests**: Verify package builds successfully

**Test Structure**:

```
packages/database/
├── src/
│   └── queries/
│       └── users.ts
└── tests/
    ├── unit/
    │   └── queries/
    │       └── users.test.ts
    └── integration/
        └── database.test.ts
```

**Test Commands**:

```json
// packages/database/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

---

### Package Documentation

Each package must include:

1. **README.md**: Package overview, installation, usage examples
2. **API.md**: Complete API reference
3. **CHANGELOG.md**: Version history
4. **Examples**: Code examples in `/examples` directory

**README Template**:

```markdown
# @repo/package-name

Brief description of the package.

## Installation

\`\`\`bash
pnpm add @repo/package-name
\`\`\`

## Usage

\`\`\`typescript
import { SomeExport } from '@repo/package-name';

// Example usage
\`\`\`

## API Reference

See [API.md](./API.md) for complete API documentation.

## Testing

\`\`\`bash
pnpm test
\`\`\`

## License

MIT
```

---
