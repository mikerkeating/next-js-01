# @repo/middleware

Shared middleware utilities for Next.js applications in the monorepo.

## Installation

This package is internal to the monorepo. Add it as a dependency in your app's `package.json`:

```json
{
  "dependencies": {
    "@repo/middleware": "workspace:*"
  }
}
```

Then run `pnpm install`.

## Basic Auth Proxy

Provides HTTP Basic Authentication protection for pre-release deployments.

### Quick Start

```typescript
// proxy.ts or middleware.ts
import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

export const runtime = "nodejs"; // Required for crypto module

const { proxy, config } = createBasicAuthProxy({
  realm: "My App",
  bypassPaths: ["/_next/*", "/api/health", "/favicon.ico"],
});

export { proxy, config };
```

### Configuration Options

| Option              | Type       | Default                        | Description                              |
| ------------------- | ---------- | ------------------------------ | ---------------------------------------- |
| `realm`             | `string`   | `"Secure Area"`                | Realm shown in browser auth dialog       |
| `usernameEnvVar`    | `string`   | `"BASIC_AUTH_USERNAME"`        | Env var name for username                |
| `passwordEnvVar`    | `string`   | `"BASIC_AUTH_PASSWORD"`        | Env var name for password                |
| `bypassPaths`       | `string[]` | `["/_next/*", "/favicon.ico"]` | Paths to skip authentication             |
| `bypassStaticFiles` | `boolean`  | `true`                         | Skip auth for paths with file extensions |

### Bypass Path Patterns

- **Exact match**: `/api/health` - matches only `/api/health`
- **Prefix match**: `/_next/*` - matches `/_next/static`, `/_next/image`, etc.

### Environment Variables

Set these in your environment or `.env.local`:

```bash
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=secure-password
```

When both variables are unset, authentication is disabled (convenient for local development).

### Return Values

`createBasicAuthProxy()` returns:

```typescript
{
  proxy: (request: NextRequest) => NextResponse;  // The middleware handler
  config: { matcher: string[] };                   // Next.js middleware config
  shouldBypassAuth: (pathname: string) => boolean; // Bypass checker function
}
```

### Security Features

- **Timing-safe comparison**: Uses SHA-256 hashing to normalize inputs before comparison, preventing timing attacks regardless of input length
- **Secure base64 decoding**: Handles malformed credentials gracefully
- **Configurable bypass**: Explicitly define which paths skip authentication

## API Reference

### `createBasicAuthProxy(options?)`

Factory function that creates a configured Basic Auth proxy.

### `timingSafeEqual(a, b)`

Timing-safe string comparison using SHA-256 normalization.

```typescript
import { timingSafeEqual } from "@repo/middleware/basic-auth";

const isEqual = timingSafeEqual(userInput, expectedValue);
```

### `unauthorizedResponse(realm)`

Creates a 401 response with WWW-Authenticate header.

```typescript
import { unauthorizedResponse } from "@repo/middleware/basic-auth";

return unauthorizedResponse("My Realm");
```

## Usage Examples

### Routing App

```typescript
// apps/routing/src/proxy.ts
import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

const { proxy, shouldBypassAuth } = createBasicAuthProxy({
  realm: "Secure Area",
  bypassPaths: ["/api/health", "/_next/*", "/favicon.ico"],
});

export { proxy, shouldBypassAuth };
```

### Documentation Site

```typescript
// apps/docs/proxy.ts
import { createBasicAuthProxy } from "@repo/middleware/basic-auth";

export const runtime = "nodejs";

const { proxy, config } = createBasicAuthProxy({
  realm: "Documentation",
  bypassPaths: ["/_next/static/*", "/_next/image/*", "/favicon.ico"],
});

export { config, proxy };
```

## Requirements

- Node.js runtime (for `crypto` module)
- Next.js 15.0.0 or higher
