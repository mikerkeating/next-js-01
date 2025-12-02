# Neon Cloud Database Setup

This guide explains how to set up and connect to a Neon PostgreSQL database for staging and production environments.

## Prerequisites

- A Neon account ([sign up at neon.tech](https://neon.tech))
- pnpm installed (v10.22.0+)
- Node.js 24.x

## Quick Start

### 1. Create a Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click "New Project"
3. Configure your project:
   - **Name**: Your project name (e.g., `my-app-production`)
   - **PostgreSQL Version**: 16 (recommended)
   - **Region**: Choose closest to your users

### 2. Get Connection String

1. In your project dashboard, click "Connection Details"
2. Select "Connection string" tab
3. Copy the connection string (looks like):

   ```text
   postgres://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb
   ```

### 3. Configure Environment

Add the connection string to your environment:

```bash
# For local development testing with Neon
export DATABASE_URL="postgres://username:password@ep-example.us-east-1.aws.neon.tech/neondb"
```

Or add to `.env.local`:

```bash
DATABASE_URL="postgres://username:password@ep-example.us-east-1.aws.neon.tech/neondb"
```

### 4. Verify Connection

```bash
# Verify the connection works
pnpm --filter @repo/database run verify-connection
```

Expected output:

```text
╔════════════════════════════════════════════════════════════╗
║          Database Connection Verification                 ║
╚════════════════════════════════════════════════════════════╝

  URL:       postgres://username:****@ep-example.us-east-1.aws.neon.tech/neondb
  Type:      Neon Serverless
  Status:    ✓ Connected
  Latency:   45.23ms
  Quality:   Excellent (< 100ms target met)
  Timestamp: 2025-12-02T10:30:00.000Z

  Database connection verified successfully!
```

### 5. Run Integration Tests

```bash
# Run integration tests against Neon
pnpm --filter @repo/database run test:integration
```

## Connection String Format

### Standard Format

```
postgres://[username]:[password]@[endpoint].[region].aws.neon.tech/[database]
```

### Components

| Component | Description                          | Example             |
| --------- | ------------------------------------ | ------------------- |
| username  | Database user (usually project name) | `my-app-user`       |
| password  | Auto-generated password              | `AbCdEf123456`      |
| endpoint  | Unique endpoint ID                   | `ep-example-123456` |
| region    | AWS region                           | `us-east-1`         |
| database  | Database name                        | `neondb`            |

### Connection String with SSL (Default)

Neon requires SSL connections. The connection string works with SSL by default:

```
postgres://user:pass@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

> **Note**: The `?sslmode=require` parameter is optional as Neon connections use SSL by default.

## Environment-Specific Setup

### Development

For local development against a Neon database:

```bash
# .env.local
DATABASE_URL="postgres://dev-user:pass@ep-dev.us-east-1.aws.neon.tech/devdb"
```

### Staging

For staging/preview environments (Vercel):

```bash
# Vercel Environment Variables (Preview)
DATABASE_URL="postgres://staging-user:pass@ep-staging.us-east-1.aws.neon.tech/stagingdb"
```

### Production

For production environments (Vercel):

```bash
# Vercel Environment Variables (Production)
DATABASE_URL="postgres://prod-user:pass@ep-prod.us-east-1.aws.neon.tech/proddb"
```

## Branching (Recommended for Teams)

Neon supports database branching for isolated development:

### Create a Branch

1. In Neon Console, go to "Branches"
2. Click "New Branch"
3. Name it (e.g., `feature/new-feature`)
4. Use the branch's connection string for development

### Branch Connection Strings

Each branch has its own endpoint:

```
# Main branch
postgres://user:pass@ep-main-123.us-east-1.aws.neon.tech/neondb

# Feature branch
postgres://user:pass@ep-feature-456.us-east-1.aws.neon.tech/neondb
```

## Pooled Connections

For serverless environments, use pooled connections:

1. In Connection Details, enable "Connection Pooling"

2. Copy the pooled connection string:

   ```text
   postgres://user:pass@ep-example-pooler.us-east-1.aws.neon.tech/neondb
   ```

> **Note**: The pooler endpoint includes `-pooler` in the hostname.

## Configuration Details

### Driver Selection

The database client automatically detects Neon URLs and uses the HTTP driver:

```typescript
// Automatic detection based on URL pattern
// URLs containing .neon.tech use the Neon HTTP driver
const dbType = getDatabaseType(databaseUrl); // Returns 'neon'
```

### Performance Optimization

For production, the client enables connection caching:

```typescript
// Enabled automatically when NODE_ENV === 'production'
// or when VERCEL_ENV === 'production'
neonConfig.fetchConnectionCache = true;
```

This reduces cold-start latency by caching the connection configuration.

## Security Best Practices

### 1. Never Commit Credentials

```bash
# .gitignore should include:
.env.local
.env.*.local
```

### 2. Use Environment Variables

Store connection strings in environment variables, not in code:

```typescript
// ✓ Good
const url = process.env.DATABASE_URL;

// ✗ Bad
const url = "postgres://user:pass@ep-example.neon.tech/db";
```

### 3. Rotate Passwords Regularly

1. In Neon Console, go to Settings > Reset Password
2. Update all environment variables with new password
3. Verify connections work

### 4. Use Separate Databases for Environments

| Environment | Database/Branch  |
| ----------- | ---------------- |
| Development | `dev` branch     |
| Staging     | `staging` branch |
| Production  | `main` branch    |

## Troubleshooting

### Connection Timeout

**Symptom:** `Connection timeout` or `ETIMEDOUT`

**Solutions:**

1. Verify network connectivity
2. Check if the endpoint is correct (typos in URL)
3. Ensure your IP is not blocked (check Neon project settings)
4. Try increasing timeout in health check:

   ```typescript
   await checkDatabaseHealth({ timeoutMs: 15000 });
   ```

### Authentication Failed

**Symptom:** `password authentication failed`

**Solutions:**

1. Verify username and password are correct
2. Check for special characters in password (URL-encode them)
3. Reset password in Neon Console if needed

### SSL Certificate Error

**Symptom:** `SSL certificate problem`

**Solutions:**

1. Ensure you're using a recent Node.js version (24.x)
2. Try adding `?sslmode=require` to the connection string

### Endpoint Not Found

**Symptom:** `endpoint not found` or DNS resolution failure

**Solutions:**

1. Verify the endpoint ID is correct
2. Check if the branch/project was deleted
3. Ensure the project is active (not suspended)

### Rate Limiting

**Symptom:** `too many connections` or `rate limited`

**Solutions:**

1. Use connection pooling (pooler endpoint)
2. Reduce connection frequency
3. Upgrade Neon plan if needed

## Monitoring

### Neon Console Metrics

In Neon Console, monitor:

- **Compute hours**: CPU usage
- **Storage**: Database size
- **Data transfer**: Network usage
- **Connections**: Active connection count

### Application Health Checks

Use the health check function for monitoring:

```typescript
import { checkDatabaseHealth } from "@repo/database";

// Periodic health check
setInterval(async () => {
  const health = await checkDatabaseHealth();
  if (health.status === "unhealthy") {
    console.error("Database unhealthy:", health.error);
  }
}, 60000); // Every minute
```

## Next Steps

- [Local Docker Setup](./setup-local.md) - For offline development
- [Integration Tests](../src/__tests__/integration/) - Test suite documentation
- [Neon Documentation](https://neon.tech/docs) - Official Neon docs
