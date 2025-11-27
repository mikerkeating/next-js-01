## Story Sizing

### References

| Size | Hours | Complexity | Example |
|------|-------|------------|---------|
| **S** | 2-4h | Single file, clear scope | "Add health check endpoint" |
| **M** | 4-6h | Multiple files, some integration | "Configure Vitest with coverage" |
| **L** | 6-8h | Cross-cutting, complex logic | "Implement auth middleware chain" |
| **XL** | 8h+ | **Too large — split further** | — |

### Example: Epic 2A.2 Broken into Stories

```
Epic 2A.2: Database Infrastructure
├── Story 2A.2.S1: Install and configure Drizzle ORM (M, 4h)
├── Story 2A.2.S2: Create database connection utilities (S, 3h)
├── Story 2A.2.S3: Set up migration infrastructure (M, 5h)
├── Story 2A.2.S4: Create seed script framework (S, 3h)
├── Story 2A.2.S5: Add connection pooling configuration (S, 2h)
├── Story 2A.2.S6: Create generic helper utilities (S, 3h)
├── Story 2A.2.S7: Write database package tests (M, 4h)
└── Story 2A.2.S8: Document database package (S, 2h)
                                            Total: ~26h (3-4 days)
```