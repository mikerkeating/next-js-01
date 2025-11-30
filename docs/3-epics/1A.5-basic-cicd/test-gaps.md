# Test Coverage Gaps Analysis

> Generated from GitHub Action run analysis on 2025-11-30

## Warnings

### 1. Deprecated Turbo Environment Variable

Appears twice in the output:

```
TURBO_REMOTE_ONLY is deprecated and will be removed in a future major version.
Use TURBO_CACHE=remote:rw
```

**Action:** Update CI workflow to use `TURBO_CACHE=remote:rw` instead of `TURBO_REMOTE_ONLY`.

### 2. Missing Turbo Output Configuration

```
no output files found for task docs#test:coverage. Please check your `outputs` key in `turbo.json`
```

**Action:** Review `turbo.json` and ensure `outputs` is configured for `test:coverage` task.

## Errors

### Test Coverage Failure (`@repo/routing`)

The `@repo/routing` package failed because coverage thresholds are not met:

| Metric     | Actual | Required |
| ---------- | ------ | -------- |
| Lines      | 17.94% | 80%      |
| Functions  | 28.57% | 80%      |
| Statements | 16.66% | 80%      |
| Branches   | 5.26%  | 80%      |

**Note:** All 42 tests passed - the failure is purely due to low coverage.

## Uncovered Files in `@repo/routing`

| File                          | Coverage | Uncovered Lines |
| ----------------------------- | -------- | --------------- |
| `src/env.ts`                  | 0%       | line 4          |
| `src/proxy.ts`                | 0%       | line 15         |
| `src/app/layout.tsx`          | 0%       | lines 7-22      |
| `src/app/page.tsx`            | 0%       | line 2          |
| `src/app/api/health/route.ts` | 0%       | lines 26-132    |
| `src/lib/health/types.ts`     | 0%       | all             |

## Recommendations

### Option 1: Add More Tests

Write tests to cover the uncovered files, prioritizing:

1. `src/app/api/health/route.ts` - largest gap (lines 26-132)
2. `src/app/layout.tsx` - React component (lines 7-22)
3. `src/env.ts` and `src/proxy.ts` - utility files

### Option 2: Adjust Coverage Thresholds

Lower the coverage thresholds in the vitest config for `@repo/routing` to a more realistic target (e.g., 50%) while tests are being added.

### Option 3: Exclude Boilerplate Files

Exclude Next.js boilerplate files from coverage reporting:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- Type-only files like `src/lib/health/types.ts`

## Follow-up Tasks

- [ ] Fix `TURBO_REMOTE_ONLY` deprecation warning in CI
- [ ] Configure `outputs` for `docs#test:coverage` in `turbo.json`
- [ ] Decide on coverage strategy (add tests vs. adjust thresholds vs. exclude files)
- [ ] Implement chosen coverage strategy
