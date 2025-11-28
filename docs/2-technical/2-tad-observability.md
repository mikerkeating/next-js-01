## Observability Architecture

### Overview

Our observability strategy ensures the application is monitored, debuggable, and maintainable through structured logging, error tracking, and health monitoring. This section covers Epic 2A.3 requirements.

**Key Principles**:

- **Structured Logging**: All logs use JSON format for queryability
- **Error Boundaries**: Graceful error handling with automatic tracking
- **Real-time Monitoring**: Health checks and vitals tracking
- **Privacy-First**: No PII in logs or error reports
- **Performance Tracking**: Core Web Vitals and custom metrics

### Structured Logging Schema

#### Log Format

All application logs use a standardized JSON structure:

```typescript
// packages/logger/src/types.ts
interface LogEntry {
  timestamp: string; // ISO 8601 format
  level: LogLevel; // debug | info | warn | error | fatal
  message: string; // Human-readable message
  environment: string; // development | preview | staging | production
  service: string; // Service name (e.g., 'routing-app', 'api')
  traceId?: string; // Request trace ID for correlation
  userId?: string; // User ID (if authenticated, hashed for privacy)
  metadata?: Record<string, unknown>; // Additional context
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration?: number; // Operation duration in ms
    memory?: number; // Memory usage in bytes
  };
}

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
```

#### Log Levels

| Level     | When to Use                                  | Examples                                          | Retention |
| --------- | -------------------------------------------- | ------------------------------------------------- | --------- |
| **debug** | Development troubleshooting, verbose details | Function entry/exit, variable values              | 7 days    |
| **info**  | Normal operation events                      | User login, API calls, data updates               | 30 days   |
| **warn**  | Recoverable issues, deprecations             | Fallback used, retry attempted, slow query        | 90 days   |
| **error** | Errors requiring attention                   | API failure, validation error, uncaught exception | 180 days  |
| **fatal** | Critical system failures                     | Database unavailable, auth service down           | 365 days  |

#### Logger Implementation

```typescript
// packages/logger/src/logger.ts
import { env } from "@repo/config/env";

export class Logger {
  private service: string;
  private environment: string;

  constructor(service: string) {
    this.service = service;
    this.environment = env.VERCEL_ENV || "development";
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.environment,
      traceId: metadata?.traceId,
      userId: metadata?.userId ? this.hashUserId(metadata.userId) : undefined,
      metadata: metadata?.data,
      error: metadata?.error,
      performance: metadata?.performance,
    };

    // In production, send to Vercel logs (JSON format)
    // In development, pretty-print for readability
    if (this.environment === "development") {
      this.prettyPrint(entry);
    } else {
      console.log(JSON.stringify(entry));
    }

    // Send errors to Sentry
    if (level === "error" || level === "fatal") {
      this.sendToSentry(entry);
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log("error", message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: (error as any).code,
          }
        : undefined,
    });
  }

  fatal(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log("fatal", message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: (error as any).code,
          }
        : undefined,
    });
  }

  private hashUserId(userId: string): string {
    // Hash user ID for privacy (SHA-256)
    // Implementation uses Web Crypto API or Node crypto
    return `usr_${userId.slice(0, 8)}...`; // Simplified
  }

  private prettyPrint(entry: LogEntry): void {
    const colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      fatal: "\x1b[35m", // Magenta
      reset: "\x1b[0m",
    };

    const color = colors[entry.level];
    console.log(
      `${color}[${entry.level.toUpperCase()}]${colors.reset} ${entry.timestamp} - ${entry.message}`,
      entry.metadata || ""
    );
  }

  private sendToSentry(entry: LogEntry): void {
    // Implemented in error tracking section
  }
}

// Usage examples
const logger = new Logger("routing-app");

// Info log
logger.info("User logged in", {
  userId: "user_123",
  data: { method: "oauth" },
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

### Error Tracking Integration

#### Sentry SDK Configuration

```typescript
// packages/observability/src/sentry.ts
import * as Sentry from "@sentry/nextjs";
import { env } from "@repo/config/env";

export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    console.warn("Sentry DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.VERCEL_ENV || "development",

    // Performance monitoring
    tracesSampleRate: env.VERCEL_ENV === "production" ? 0.1 : 1.0,

    // Session replay (production only)
    replaysSessionSampleRate: env.VERCEL_ENV === "production" ? 0.01 : 0,
    replaysOnErrorSampleRate: env.VERCEL_ENV === "production" ? 1.0 : 0,

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: [
          "localhost",
          /^https:\/\/[^/]*\.vercel\.app/,
          env.NEXT_PUBLIC_API_URL,
        ],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Error filtering
    beforeSend(event, hint) {
      // Filter out known benign errors
      if (event.exception) {
        const errorMessage = event.exception.values?.[0]?.value || "";

        // Ignore cancelled requests
        if (errorMessage.includes("AbortError")) {
          return null;
        }

        // Ignore network errors (handled by retry logic)
        if (errorMessage.includes("NetworkError")) {
          return null;
        }
      }

      // Remove PII
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      return event;
    },

    // Add custom context
    beforeBreadcrumb(breadcrumb) {
      // Sanitize breadcrumb data
      if (breadcrumb.category === "console") {
        return null; // Don't send console logs to Sentry
      }
      return breadcrumb;
    },
  });

  // Set user context (only after authentication)
  Sentry.setUser({
    id: "anonymous", // Will be updated after auth
  });
}

// Set authenticated user context
export function setSentryUser(userId: string, email?: string): void {
  Sentry.setUser({
    id: userId,
    email: email, // Sentry automatically hashes email
  });
}

// Clear user context on logout
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

// Capture custom errors
export function captureError(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Capture custom messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  Sentry.captureMessage(message, level);
}
```

#### React Error Boundary

```typescript
// packages/ui/src/error-boundary.tsx
'use client';

import React, { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Logger } from '@repo/logger';

const logger = new Logger('error-boundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    logger.error('React Error Boundary caught error', error, {
      data: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Something went wrong
            </h2>
            <p className="mb-6 text-gray-600">
              We've been notified and are looking into it. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in app layout
// apps/routing/src/app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

#### API Route Error Handling

```typescript
// packages/api/src/middleware/error-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@repo/logger";
import { captureError } from "@repo/observability/sentry";

const logger = new Logger("api-error-handler");

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function errorHandler(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler(request);
  } catch (error) {
    // Determine if it's a known ApiError
    if (error instanceof ApiError) {
      logger.warn(`API Error: ${error.message}`, {
        data: {
          statusCode: error.statusCode,
          code: error.code,
          path: request.nextUrl.pathname,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        },
        { status: error.statusCode }
      );
    }

    // Unknown error - log and report
    logger.error("Unhandled API error", error as Error, {
      data: {
        path: request.nextUrl.pathname,
        method: request.method,
      },
    });

    captureError(error as Error, {
      path: request.nextUrl.pathname,
      method: request.method,
    });

    // Don't expose internal errors to client
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}

// Usage in API routes
// apps/routing/src/app/api/example/route.ts
import { errorHandler, ApiError } from "@repo/api/middleware/error-handler";

export async function GET(request: NextRequest) {
  return errorHandler(request, async (req) => {
    // Your API logic here
    if (someCondition) {
      throw new ApiError("Resource not found", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: {} });
  });
}
```

### Web Vitals Tracking

```typescript
// packages/observability/src/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';
import { Logger } from '@repo/logger';

const logger = new Logger('web-vitals');

export function reportWebVitals(): void {
  function sendToAnalytics(metric: Metric): void {
    // Log metric
    logger.info('Web Vital recorded', {
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      },
    });

    // Send to Sentry as measurement
    Sentry.setMeasurement(metric.name, metric.value, 'millisecond');

    // Send to PostHog (if configured)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('web_vital', {
        metric_name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
    }
  }

  // Core Web Vitals
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onFID(sendToAnalytics);  // First Input Delay
  onLCP(sendToAnalytics);  // Largest Contentful Paint

  // Other metrics
  onFCP(sendToAnalytics);  // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

// Usage in root layout
// apps/routing/src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@repo/observability/web-vitals';

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Health Check Utilities

Building on the health check endpoint defined in the Steel Thread section, we provide reusable utilities for service health monitoring.

```typescript
// packages/observability/src/health-checks.ts
import { Logger } from "@repo/logger";
import { db } from "@repo/database";
import { env } from "@repo/config/env";

const logger = new Logger("health-checks");

export interface HealthCheckResult {
  status: "ok" | "degraded" | "error";
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

/**
 * Check database connectivity and performance
 */
export async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    // Simple query to test connection
    await db.execute("SELECT 1");

    const responseTime = Date.now() - start;
    const status = responseTime > 1000 ? "degraded" : "ok";

    return {
      status,
      responseTime,
      message: status === "degraded" ? "Slow response time" : undefined,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Database health check failed", error as Error);

    return {
      status: "error",
      message: "Database connection failed",
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check authentication service (Clerk)
 */
export async function checkAuth(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    // Verify Clerk API key is valid
    const response = await fetch("https://api.clerk.com/v1/sessions", {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      },
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        status: "error",
        message: `Clerk API returned ${response.status}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: responseTime > 500 ? "degraded" : "ok",
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Auth health check failed", error as Error);

    return {
      status: "error",
      message: "Auth service unreachable",
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check cache availability (if using Redis/Upstash)
 */
export async function checkCache(): Promise<HealthCheckResult> {
  // If no cache configured, return ok
  if (!env.REDIS_URL) {
    return {
      status: "ok",
      message: "Cache not configured",
      lastChecked: new Date().toISOString(),
    };
  }

  const start = Date.now();

  try {
    // Test cache with ping
    // Implementation depends on cache provider
    const responseTime = Date.now() - start;

    return {
      status: "ok",
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    logger.warn("Cache health check failed", error as Error);

    // Cache is non-critical, return degraded instead of error
    return {
      status: "degraded",
      message: "Cache unavailable",
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Aggregate health check for all services
 */
export async function checkAllServices(): Promise<{
  overall: "healthy" | "degraded" | "unhealthy";
  checks: {
    database: HealthCheckResult;
    auth: HealthCheckResult;
    cache: HealthCheckResult;
  };
}> {
  const [database, auth, cache] = await Promise.all([checkDatabase(), checkAuth(), checkCache()]);

  const checks = { database, auth, cache };

  // Determine overall status
  const hasError = Object.values(checks).some((check) => check.status === "error");
  const hasDegraded = Object.values(checks).some((check) => check.status === "degraded");

  const overall = hasError ? "unhealthy" : hasDegraded ? "degraded" : "healthy";

  return { overall, checks };
}
```

### Monitoring Dashboard Integration

#### Vercel Analytics

```typescript
// apps/routing/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### PostHog Integration (Optional)

```typescript
// packages/observability/src/posthog.ts
import posthog from "posthog-js";
import { env } from "@repo/config/env";

export function initPostHog(): void {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    loaded: (posthog) => {
      if (env.VERCEL_ENV === "development") {
        posthog.debug();
      }
    },
    capture_pageview: false, // We'll capture manually
    capture_pageleave: true,
    autocapture: false, // Explicit tracking only
  });
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  posthog.identify(userId, traits);
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  posthog.capture(eventName, properties);
}

export function resetUser(): void {
  posthog.reset();
}
```

### Test Coverage Requirements

All observability utilities must maintain **80% test coverage**:

```typescript
// packages/observability/__tests__/logger.test.ts
import { describe, it, expect, vi } from "vitest";
import { Logger } from "../src/logger";

describe("Logger", () => {
  it("should log info messages in JSON format", () => {
    const consoleSpy = vi.spyOn(console, "log");
    const logger = new Logger("test-service");

    logger.info("Test message", { data: { key: "value" } });

    expect(consoleSpy).toHaveBeenCalled();
    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logEntry.level).toBe("info");
    expect(logEntry.message).toBe("Test message");
    expect(logEntry.service).toBe("test-service");
  });

  it("should include error details in error logs", () => {
    const consoleSpy = vi.spyOn(console, "log");
    const logger = new Logger("test-service");
    const error = new Error("Test error");

    logger.error("Operation failed", error);

    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logEntry.level).toBe("error");
    expect(logEntry.error.name).toBe("Error");
    expect(logEntry.error.message).toBe("Test error");
  });
});
```

### Observability Checklist

**Development Phase**:

- [ ] Structured logger configured in all services
- [ ] Error boundaries wrap all major UI sections
- [ ] API routes use error handler middleware
- [ ] Web Vitals tracking initialized in root layout
- [ ] Sentry DSN configured (or disabled in development)
- [ ] Health check utilities tested

**Pre-Production**:

- [ ] Sentry project created and DSN added to environment variables
- [ ] Log retention policies configured (per level)
- [ ] Error filtering rules configured in Sentry
- [ ] Web Vitals thresholds defined
- [ ] Health check monitoring alerts configured
- [ ] PII scrubbing verified in logs and error reports

**Production**:

- [ ] Verify logs appear in Vercel dashboard
- [ ] Verify errors are captured in Sentry
- [ ] Monitor Web Vitals in Vercel Analytics
- [ ] Set up alerting for critical errors
- [ ] Document incident response procedures
- [ ] Regular review of error trends and performance metrics

---
