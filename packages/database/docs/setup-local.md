# Local Docker Database Setup

This guide explains how to set up and use a local PostgreSQL database for development using Docker.

## Prerequisites

- Docker Desktop installed and running
- pnpm installed (v10.22.0+)
- Node.js 24.x

## Quick Start

### 1. Start the Database

From the repository root:

```bash
# Start the Docker database container
pnpm run db:start

# Wait for container to be ready (check status)
docker compose ps
```

Expected output:

```text
NAME                COMMAND                  SERVICE     STATUS              PORTS
next-js-01-db-1     "docker-entrypoint.s…"   db          running (healthy)   0.0.0.0:5432->5432/tcp
```

### 2. Verify Connection

```bash
# Verify the connection works
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
  pnpm --filter @repo/database run verify-connection
```

Expected output:

```text
╔════════════════════════════════════════════════════════════╗
║          Database Connection Verification                 ║
╚════════════════════════════════════════════════════════════╝

  URL:       postgres://postgres:****@localhost:5432/postgres
  Type:      Local PostgreSQL
  Status:    ✓ Connected
  Latency:   5.23ms
  Quality:   Excellent (< 100ms target met)
  Timestamp: 2025-12-02T10:30:00.000Z

  Database connection verified successfully!
```

### 3. Run Integration Tests

```bash
# Run integration tests against local database
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
  pnpm --filter @repo/database run test:integration
```

### 4. Stop the Database

```bash
# Stop the database container
pnpm run db:stop
```

## Configuration

### Default Connection Details

| Setting  | Value     |
| -------- | --------- |
| Host     | localhost |
| Port     | 5432      |
| Database | postgres  |
| Username | postgres  |
| Password | postgres  |

### Connection String Format

```
postgres://postgres:postgres@localhost:5432/postgres
```

### Environment Variables

For persistent configuration, create a `.env.local` file in the repository root:

```bash
# Local development database
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
```

For test-specific configuration, update `packages/database/.env.test`:

```bash
DATABASE_URL_TEST="postgres://postgres:postgres@localhost:5432/postgres"
SKIP_DB_TESTS=false
```

## Docker Compose Configuration

The database is defined in `docker-compose.yml` at the repository root:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

## Common Operations

### View Database Logs

```bash
docker compose logs -f db
```

### Connect with psql

```bash
docker compose exec db psql -U postgres
```

### Reset Database

```bash
# Stop and remove volumes (deletes all data)
docker compose down -v

# Start fresh
pnpm run db:start
```

### Apply Migrations

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
  pnpm --filter @repo/database run db:apply-migrations
```

### Open Drizzle Studio

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" \
  pnpm --filter @repo/database run db:studio
```

## Troubleshooting

### Container Won't Start

**Symptom:** `docker compose up` fails or container keeps restarting.

**Solutions:**

1. Check if port 5432 is already in use:

   ```bash
   lsof -i :5432
   ```

2. Stop any existing PostgreSQL instances
3. Check Docker Desktop is running

### Connection Refused

**Symptom:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**

1. Verify container is running:

   ```bash
   docker compose ps
   ```

2. Wait for healthcheck to pass (container status shows "healthy")

3. Check container logs for errors:

   ```bash
   docker compose logs db
   ```

### Permission Denied

**Symptom:** `permission denied for table...`

**Solutions:**

1. Ensure you're using the correct user (postgres)

2. Reset the database volumes if necessary:

   ```bash
   docker compose down -v && pnpm run db:start
   ```

### Slow Queries

**Symptom:** Queries taking longer than expected

**Solutions:**

1. Check if Docker has sufficient resources allocated
2. Verify no other heavy processes are running
3. For Apple Silicon Macs, ensure Docker is using Rosetta 2 emulation

### Data Persistence

**Note:** Data persists in a Docker volume (`db_data`) between restarts. To completely reset:

```bash
docker compose down -v
pnpm run db:start
```

## Integration with CI/CD

For CI/CD environments, use PostgreSQL service containers instead of Docker Compose. See the GitHub Actions workflow configuration:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Next Steps

- [Neon Cloud Setup](./setup-neon.md) - For production/staging databases
- [Integration Tests](../src/__tests__/integration/) - Test suite documentation
- [Database Package Documentation](../../../docs/3-epics/2A.2-database-infra/S8-documentation.md) - Full package documentation
