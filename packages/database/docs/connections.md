# Connection Setup Guide

This guide covers database connection configuration, environment setup, pooling behavior, and edge runtime compatibility.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Connection String Format](#connection-string-format)
- [Auto-Detection](#auto-detection)
- [Local Development](#local-development)
- [Production (Neon)](#production-neon)
- [Edge Runtime Support](#edge-runtime-support)
- [Health Checks](#health-checks)
- [Retry Logic](#retry-logic)
- [Connection Pooling](#connection-pooling)

## Environment Variables

| Variable       | Required | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string                |
| `NODE_ENV`     | No       | Environment (development, test, production) |
| `VERCEL_ENV`   | No       | Vercel environment for connection caching   |

### Example `.env.local`

```bash
# Local development with Docker PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres

# Neon serverless
DATABASE_URL=postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Connection String Format

### Neon (Production)

```
postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require
```

Components:

- **user**: Your Neon username (often `neondb_owner`)
- **password**: Connection password (from Neon dashboard)
- **host**: Endpoint hostname (e.g., `ep-example-123456.us-east-2.aws.neon.tech`)
- **database**: Database name (default: `neondb`)
- **sslmode**: Always `require` for Neon

### Local PostgreSQL

```
postgres://[user]:[password]@localhost:[port]/[database]
```

Components:

- **user**: PostgreSQL username (default: `postgres`)
- **password**: PostgreSQL password
- **port**: Default is `5432`
- **database**: Database name

## Auto-Detection

The database client automatically selects the appropriate driver based on your `DATABASE_URL`:

```typescript
import { db, getDatabaseType, isNeonUrl, isLocalPostgresUrl } from "@repo/database";

// Check the detected type
const dbType = getDatabaseType(process.env.DATABASE_URL);
// Returns: 'neon' | 'local' | 'unknown'

// Individual checks
isNeonUrl("postgresql://...neon.tech/..."); // true
isLocalPostgresUrl("postgres://localhost:5432/db"); // true
```

### Detection Rules

| URL Pattern                | Driver              | Use Case                |
| -------------------------- | ------------------- | ----------------------- |
| Contains `.neon.tech`      | Neon HTTP           | Production, cloud, edge |
| `localhost` or `127.0.0.1` | postgres.js         | Local development       |
| Other                      | Neon HTTP (default) | Unknown cloud providers |

## Local Development

### Docker PostgreSQL Setup

1. **Start the database:**

   ```bash
   cd packages/database
   pnpm run db:start
   ```

1. **Configure environment:**

   ```bash
   # .env.local
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
   ```

1. **Run migrations:**

   ```bash
   pnpm run db:migrate
   ```

1. **Stop when done:**

   ```bash
   pnpm run db:stop
   ```

### Data Persistence

Local data is stored in a Docker volume (`next-js-01-postgres-data`). To reset:

```bash
pnpm run db:stop
docker volume rm next-js-01-postgres-data
pnpm run db:start
pnpm run db:migrate
```

## Production (Neon)

### Connection Caching

The client automatically enables connection caching in production for better performance:

```typescript
// Automatically enabled when:
// - VERCEL_ENV === 'production', or
// - NODE_ENV === 'production'

// This reduces latency for subsequent queries
neonConfig.fetchConnectionCache = true;
```

### SSL Configuration

Neon requires SSL. The `?sslmode=require` parameter is mandatory:

```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

## Edge Runtime Support

The Neon HTTP driver is fully compatible with edge runtimes:

- **Vercel Edge Functions**
- **Cloudflare Workers**
- **Deno Deploy**

### Key Features

- No TCP connections required (HTTP-based)
- Sub-50ms cold starts
- Automatic connection pooling at the database layer
- Works with `export const runtime = 'edge'`

### Example Edge Route

```typescript
// app/api/users/route.ts
import { db } from "@repo/database";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const users = await db.query.users.findMany({
    limit: 10,
  });

  return NextResponse.json(users);
}
```

## Health Checks

Verify database connectivity using the health check utility:

```typescript
import { checkDatabaseHealth } from "@repo/database";

const health = await checkDatabaseHealth();

if (health.status === "healthy") {
  console.log(`Connected! Latency: ${health.latencyMs}ms`);
  console.log(`Checked at: ${health.timestamp}`);
} else {
  console.error(`Database unhealthy: ${health.error}`);
}
```

### Health Check Options

```typescript
const health = await checkDatabaseHealth({
  timeoutMs: 5000, // Maximum wait time (default: 5000ms)
});
```

### Response Interface

```typescript
interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  latencyMs: number;
  timestamp: string; // ISO 8601
  error?: string; // Present when unhealthy
}
```

### Integration with Health Endpoints

```typescript
// app/api/health/route.ts
import { checkDatabaseHealth } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  const dbHealth = await checkDatabaseHealth({ timeoutMs: 3000 });

  const status = dbHealth.status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status: dbHealth.status,
      database: {
        latencyMs: dbHealth.latencyMs,
        error: dbHealth.error,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
```

## Retry Logic

Wrap database operations with retry logic for resilience against transient failures:

```typescript
import { withRetry, db } from "@repo/database";
import { eq } from "drizzle-orm";

const user = await withRetry(() => db.query.users.findFirst({ where: eq(users.id, userId) }), {
  maxAttempts: 3, // Total attempts (default: 3)
  baseDelayMs: 100, // Initial delay (default: 100ms)
  onRetry: (error, attempt) => {
    console.warn(`Retry ${attempt}: ${error.message}`);
  },
  shouldRetry: (error) => {
    // Don't retry on authentication errors
    return !error.message.includes("authentication");
  },
});
```

### Exponential Backoff

The retry delay increases exponentially:

| Attempt | Delay (with 100ms base) |
| ------- | ----------------------- |
| 1       | 100ms                   |
| 2       | 200ms                   |
| 3       | 400ms                   |
| 4       | 800ms                   |

### Retry Options

```typescript
interface RetryOptions {
  maxAttempts?: number; // Default: 3
  baseDelayMs?: number; // Default: 100
  onRetry?: (error: Error, attempt: number) => void;
  shouldRetry?: (error: Error) => boolean; // Default: always true
}
```

## Connection Pooling

### Neon (Production)

Neon handles connection pooling at the infrastructure level:

- **HTTP Driver**: Stateless, no client-side pooling needed
- **Serverless-Optimized**: Automatic scaling based on demand
- **Connection Cache**: Enabled in production via `fetchConnectionCache`

### Local PostgreSQL

The postgres.js driver manages its own connection pool:

- Default pool size is optimized for development
- Connections are reused across queries
- Automatic cleanup on process exit

### Best Practices

1. **Don't create multiple clients**: Use the singleton `db` export
2. **Use health checks**: Verify connectivity at startup
3. **Implement retry logic**: Handle transient network issues
4. **Monitor latency**: Track query performance in production

## Troubleshooting

| Issue                   | Cause                        | Solution                           |
| ----------------------- | ---------------------------- | ---------------------------------- |
| `DATABASE_URL required` | Missing env variable         | Set DATABASE_URL in `.env.local`   |
| Connection timeout      | Network or server issue      | Check connectivity, verify URL     |
| SSL certificate error   | Missing `sslmode=require`    | Add `?sslmode=require` to Neon URL |
| Cold start latency      | Edge function initialization | Enable `fetchConnectionCache`      |
| Connection refused      | Local DB not running         | Run `pnpm run db:start`            |

See [Troubleshooting Guide](./troubleshooting.md) for more solutions.

## Related Documentation

- [README](../README.md) - Package overview
- [Migrations Guide](./migrations.md) - Database schema changes
- [Drizzle ORM Docs](https://orm.drizzle.team/) - Official documentation
- [Neon Docs](https://neon.tech/docs) - Serverless PostgreSQL
