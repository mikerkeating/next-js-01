# Coding Standards

**Mandatory standards for all code contributions**

These standards prevent 80% of linting and type-check errors found in Epic 3.1 analysis.

---

## 1. Type Safety Rules

### 1.1 Never Use `any` Type Assertions

**❌ PROHIBITED**:

```typescript
const user = mockData as any;
mockFn.mockReturnValue({ data: something as any });
```

**✅ REQUIRED**: Use type-safe helpers from `test/types.ts`

```typescript
import { createMockClerkUser, mockUseUserReturn } from "@repo/auth/test/types";

mockUseUser.mockReturnValue(
  mockUseUserReturn({
    user: createMockClerkUser(mockUsers.internal),
  })
);
```

**Action**: If helpers don't exist, CREATE them first in `packages/*/src/test/types.ts`

---

### 1.2 Discriminated Union Type Narrowing

**❌ WRONG**:

```typescript
const result = await createOrganization(data);
expect(result.error).toContain("text"); // TS error if success: true
```

**✅ CORRECT**: Always narrow before accessing union properties

```typescript
const result = await createOrganization(data);
if (!result.success) {
  // Type narrowing
  expect(result.error).toContain("text");
  expect(result.field).toBe("slug");
}
```

**Applies to**: `ActionResult`, `ApiResponse`, any discriminated union

---

### 1.3 Explicit Function Types

**❌ WRONG**:

```typescript
function processData(data) {
  // Implicit any
  return data.map((item) => item.id); // Implicit any
}
```

**✅ CORRECT**:

```typescript
function processData(data: User[]): string[] {
  return data.map((item: User) => item.id);
}
```

**Rule**: All parameters and return types must be explicit

---

### 1.4 Zod Schema Types

**❌ DEPRECATED**:

```typescript
function validate<T extends z.ZodTypeAny>(schema: T): z.infer<T>;
```

**✅ CURRENT**:

```typescript
function validate<T extends z.ZodType>(schema: T): z.infer<T>;
```

**Rule**: Always use `z.ZodType`, never `z.ZodTypeAny`

---

## 2. Test Standards

### 2.1 Test Type Helpers Location

**Check these locations BEFORE writing tests**:

```
packages/auth/src/test/types.ts       # Clerk mocks
packages/*/src/test/types.ts          # Package-specific helpers
```

### 2.2 Creating New Test Helpers

**When to create**: If you need to mock complex external types (Clerk, Stripe, etc.)

**Pattern**:

```typescript
// packages/[package]/src/test/types.ts

/**
 * Type-safe mock for useX hook return value
 */
export type MockUseXReturn = {
  data: MockData | null;
  isLoaded: boolean;
  error?: Error;
};

export function mockUseXReturn(params: MockUseXReturn): MockUseXReturn {
  return params;
}
```

**Rule**: Create helpers BEFORE writing tests that need them

---

## 3. Import Standards

### 3.1 Import Groups

**❌ WRONG**:

```typescript
import { describe } from "vitest";
import { Component } from "./component";
```

**✅ CORRECT**: Blank line between external and internal imports

```typescript
import { describe } from "vitest";

import { Component } from "./component";
```

**Note**: Auto-fixable with `eslint --fix`

---

### 3.2 Import Order

1. External packages (npm modules)
2. Blank line
3. Internal `@repo/*` packages
4. Blank line
5. Relative imports

---

### 3.3 React Component Exports

**❌ WRONG**:

```typescript
export default function MyComponent() {
  return <div>...</div>;
}
```

**✅ CORRECT**: Use named exports

```typescript
export function MyComponent() {
  return <div>...</div>;
}
```

**Rule**: Always use named exports for React components (better for refactoring, tree-shaking, and IDE support)

---

## 4. ESLint Configuration

### 4.1 Config File Ignores

**When creating package-level ESLint configs**:

```javascript
// packages/[package]/eslint.config.js
export default [
  ...base,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "src/eslint/**/*.js", // Exclude ESLint configs
      "src/prettier/**/*.cjs", // Exclude CommonJS files
    ],
  },
];
```

**Rule**: Config files must ignore themselves

---

## 5. Incremental Quality Checks

### 5.1 During Development

**After completing each major component/module**:

```bash
# Auto-fix linting issues
npx pnpm@10.22.0 --filter [package] lint --fix

# Check type safety
npx pnpm@10.22.0 --filter [package] type-check

# Run tests
npx pnpm@10.22.0 --filter [package] test
```

**Rule**: Fix issues immediately while context is fresh

---

### 5.2 Before Committing

**Zero-tolerance policy**:

```bash
# Must pass with 0 errors, 0 warnings
turbo lint
turbo type-check
SKIP_DB_TESTS=true npx pnpm@10.22.0 test
turbo run build
```

**Rule**: No commits with linting or type errors

---

## 6. Package-Specific Standards

### 6.1 @repo/auth - Clerk Mocks

**Available helpers** (`packages/auth/src/test/types.ts`):

- `createMockClerkUser()`
- `createMockClerkOrganization()`
- `createMockClerkMembership()`
- `mockUseUserReturn()`
- `mockUseOrganizationReturn()`
- `mockAuthReturn()`

**Example**:

```typescript
import { mockUseUserReturn, createMockClerkUser } from "@repo/auth/test/types";

mockUseUser.mockReturnValue(
  mockUseUserReturn({
    user: createMockClerkUser(mockUsers.internal),
    isLoaded: true,
    isSignedIn: true,
  })
);
```

---

### 6.2 @repo/content-validator - Zod Schemas

**Standards**:

- Use `z.ZodType` for generics
- Export inferred types: `export type User = z.infer<typeof userSchema>`
- Prefer `.extend()` over `.merge()`
- Use `.pick()` and `.omit()` for derived schemas

**Type-Safe Error Handling**:

```typescript
try {
  return schema.parse(content);
} catch (error) {
  if (error instanceof z.ZodError) {
    // ✅ Type-safe property access
    const formattedErrors = error.issues.map((issue) => {
      const issueWithExpected = issue as typeof issue & {
        expected?: string;
        received?: string;
      };

      return {
        path: issue.path.join("."),
        message: issue.message,
        expected: issueWithExpected.expected,
        received: issueWithExpected.received,
      };
    });
  }
}
```

**Schema Composition**:

```typescript
// ✅ CORRECT
const userSchema = z.object({ name: z.string() });
const extendedSchema = userSchema.extend({ age: z.number() });
const pickedSchema = userSchema.pick({ name: true });
const omittedSchema = userSchema.omit({ name: true });

// Export inferred types
export type User = z.infer<typeof userSchema>;
```

---

### 6.3 @repo/Organizations - Action Results

**All actions return discriminated unions**:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string };
```

**Always narrow before accessing properties**:

```typescript
if (result.success) {
  console.log(result.data); // Safe
} else {
  console.error(result.error); // Safe
}
```

---

## 7. Pre-Commit Checklist

**Before creating a commit, verify**:

- [ ] Zero `as any` assertions (except where absolutely necessary with justification)
- [ ] All discriminated unions use type narrowing
- [ ] All Zod schemas use `z.ZodType` (not `z.ZodTypeAny`)
- [ ] Test mocks use type-safe helpers from `test/types.ts`
- [ ] Imports have proper spacing between groups
- [ ] All functions have explicit parameter and return types
- [ ] `turbo lint` → 0 errors, 0 warnings
- [ ] `turbo type-check` → 0 errors
- [ ] `SKIP_DB_TESTS=true npx pnpm@10.22.0 test` → passing
- [ ] `turbo run build` → succeeds

---

## 8. Common Violations & Fixes

### Violation 1: Type Assertion in Tests

**Fix**: Use `packages/*/src/test/types.ts` helpers

### Violation 2: Accessing Union Properties

**Fix**: Add `if (!result.success)` type guard

### Violation 3: Deprecated Zod Type

**Fix**: Change `z.ZodTypeAny` to `z.ZodType`

### Violation 4: Missing Import Spacing

**Fix**: Run `npx pnpm@10.22.0 lint --fix` (auto-fixable)

### Violation 5: Implicit Types

**Fix**: Add explicit types to all function parameters and return values

---

## 9. Enforcement

### During Code Review

- All PRs must pass `turbo lint` and `turbo type-check` with zero errors
- Reviewers should reject PRs with `as any` unless justified
- CI/CD blocks merge if linting/type errors exist

### Metrics

- Track violations per epic
- Target: < 5 violations per epic (down from 556+ in Epic 3.1)

---

## 10. References

- **Process**: [Process Guide](/docs/0-process/0-process.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-23
**Status**: MANDATORY for all new code
