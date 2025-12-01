# @repo/database

Database schema, client, and utilities for the monorepo using Drizzle ORM with PostgreSQL (Neon serverless).

## Installation

This package is part of the monorepo and is automatically linked via pnpm workspaces.

```bash
# From monorepo root
pnpm install
```

## Usage

```typescript
import { db } from "@repo/database";
import { users } from "@repo/database/schema";

// Query example (available after S2 setup)
const allUsers = await db.query.users.findMany();
```

## Package Structure

```
packages/database/
├── src/
│   ├── index.ts          # Package entry point
│   └── schema/
│       └── index.ts      # Schema barrel export
├── drizzle.config.ts     # Drizzle Kit configuration (S2)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script             | Description                      |
| ------------------ | -------------------------------- |
| `pnpm build`       | Compile TypeScript to JavaScript |
| `pnpm type-check`  | Run TypeScript type checking     |
| `pnpm test`        | Run unit tests                   |
| `pnpm db:generate` | Generate migrations from schema  |
| `pnpm db:migrate`  | Apply pending migrations         |
| `pnpm db:push`     | Push schema changes (dev only)   |
| `pnpm db:studio`   | Open Drizzle Studio              |

## Dependencies

- **drizzle-orm** - Type-safe ORM for PostgreSQL
- **@neondatabase/serverless** - Neon serverless driver
- **drizzle-kit** - Migration and schema tooling (dev)

## Related Documentation

- [ADR-005: Drizzle as ORM](/docs/2-technical/adr/005-drizzle-orm.md)
- [ADR-001: Monorepo Structure](/docs/2-technical/adr/001-monorepo-turborepo.md)

## Implementation Status

This package is being built incrementally across multiple stories:

- **S1**: Package structure (current) - Basic setup and configuration
- **S2**: Configure Drizzle ORM and Client - Database client setup
- **S3**: Implement Connection Utilities - Connection pooling and helpers
- **S4**: Set Up Migration Infrastructure - Migration workflow
- **S5-S6**: Schema definitions and utilities
- **S7**: Comprehensive testing

## License

Private - Internal use only
