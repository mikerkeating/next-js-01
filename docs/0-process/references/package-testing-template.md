# Package TESTING.md Template

> **Usage**: Copy this template to `packages/{name}/docs/TESTING.md` when creating a new package. Replace placeholders (in `{braces}`) with actual content.
>
> **Audience**: Package maintainers and contributors
>
> **TAD Reference**: [Two Audiences Strategy](/docs/2-technical/2-tad-documentation.md#two-audiences-strategy) | [Documentation Layers](/docs/2-technical/2-tad-documentation.md#documentation-layers)

---

# Testing @repo/{package-name}

Testing strategy and guide for the {package-name} package.

## Testing Philosophy

{Brief description of the testing approach for this package.}

**Key principles**:

- {Principle 1, e.g., "Test behavior, not implementation"}
- {Principle 2, e.g., "Prioritize integration tests over unit tests for complex flows"}
- {Principle 3, e.g., "Use realistic mocks based on actual API responses"}

---

## Test Structure

```
packages/{package-name}/
├── tests/
│   ├── unit/                 # Unit tests - isolated function testing
│   │   ├── {module1}.test.ts
│   │   └── {module2}.test.ts
│   ├── integration/          # Integration tests - cross-module testing
│   │   └── {flow}.test.ts
│   ├── fixtures/             # Test fixtures and mock data
│   │   ├── {fixture1}.ts
│   │   └── {fixture2}.json
│   └── helpers/              # Test utilities and helpers
│       └── index.ts
└── src/
    └── test/                 # Exported test utilities for consumers
        └── types.ts          # Type-safe mock helpers
```

---

## Running Tests

### All Tests

```bash
# Run all tests once
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode (during development)
pnpm test:watch
```

### Specific Tests

```bash
# Run a specific test file
pnpm test {path/to/test.test.ts}

# Run tests matching a pattern
pnpm test --grep "{pattern}"

# Run tests in a specific directory
pnpm test tests/unit/
```

### CI/CD

```bash
# Command used in CI (includes coverage, no watch mode)
pnpm test:ci
```

---

## Test Categories

### Unit Tests

**Location**: `tests/unit/`

**Purpose**: Test individual functions and modules in isolation.

**Characteristics**:

- Fast execution (<100ms per test)
- No external dependencies (network, filesystem, database)
- Mocked dependencies using vi.mock or test doubles
- One logical assertion per test

**Example**:

```typescript
// tests/unit/{module}.test.ts
import { describe, it, expect, vi } from "vitest";

import { {functionName} } from "../../src/{module}";

describe("{functionName}", () => {
  it("should {expected behavior}", () => {
    // Arrange
    const input = {testInput};

    // Act
    const result = {functionName}(input);

    // Assert
    expect(result).toBe({expectedOutput});
  });

  it("should handle {edge case}", () => {
    // Test edge case
  });
});
```

### Integration Tests

**Location**: `tests/integration/`

**Purpose**: Test interactions between multiple modules or with external dependencies.

**Characteristics**:

- Test complete flows, not just functions
- May use real implementations (not mocks) where appropriate
- Slower than unit tests, but more realistic
- Focus on contract verification

**Example**:

```typescript
// tests/integration/{flow}.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { {Module1} } from "../../src/{module1}";
import { {Module2} } from "../../src/{module2}";

describe("{Flow Name}", () => {
  beforeEach(() => {
    // Setup - initialize real or mock dependencies
  });

  afterEach(() => {
    // Cleanup
  });

  it("should complete {flow description}", async () => {
    // Arrange
    const module1 = new {Module1}();
    const module2 = new {Module2}(module1);

    // Act
    const result = await module2.{action}();

    // Assert
    expect(result).toMatchObject({expectedShape});
  });
});
```

### {Additional Test Type If Needed}

**Location**: `tests/{type}/`

**Purpose**: {Description}

{Document any package-specific test types, e.g., contract tests, snapshot tests, etc.}

---

## Mocking Strategy

### Internal Mocks

{Document how internal dependencies are mocked within this package.}

```typescript
// Example: Mocking an internal module
vi.mock("../../src/{module}", () => ({
  {functionName}: vi.fn().mockReturnValue({mockValue}),
}));
```

### External Dependencies

{Document how external dependencies are mocked.}

| Dependency       | Mock Approach                            | Location                    |
| ---------------- | ---------------------------------------- | --------------------------- |
| `{external-lib}` | {approach, e.g., "vi.mock with factory"} | `tests/helpers/mocks.ts`    |
| `{api-service}`  | {approach, e.g., "MSW handlers"}         | `tests/helpers/handlers.ts` |

### Type-Safe Mock Helpers

**Location**: `src/test/types.ts`

This package exports type-safe mock helpers for consumers to use in their tests.

```typescript
// src/test/types.ts
export interface Mock{TypeName} {
  {property1}: {type};
  {property2}: {type};
}

export function createMock{TypeName}(overrides?: Partial<Mock{TypeName}>): Mock{TypeName} {
  return {
    {property1}: {defaultValue},
    {property2}: {defaultValue},
    ...overrides,
  };
}
```

**Usage in consumer tests**:

```typescript
import { createMock{TypeName} } from "@repo/{package-name}/test/types";

const mockData = createMock{TypeName}({ {property1}: {customValue} });
```

---

## Test Fixtures

**Location**: `tests/fixtures/`

### Available Fixtures

| Fixture      | Purpose            | File                    |
| ------------ | ------------------ | ----------------------- |
| `{fixture1}` | {What it provides} | `fixtures/{file1}.ts`   |
| `{fixture2}` | {What it provides} | `fixtures/{file2}.json` |

### Creating Fixtures

{Guidelines for creating new fixtures.}

```typescript
// tests/fixtures/{name}.ts
export const {fixtureName} = {
  {property}: {value},
  // ...
} as const;
```

---

## Coverage Requirements

### Minimum Coverage

| Metric     | Minimum | Target |
| ---------- | ------- | ------ |
| Statements | {X}%    | {Y}%   |
| Branches   | {X}%    | {Y}%   |
| Functions  | {X}%    | {Y}%   |
| Lines      | {X}%    | {Y}%   |

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML coverage report
open coverage/index.html
```

### Coverage Exclusions

{Document any intentional coverage exclusions and why.}

```typescript
// vitest.config.ts coverage.exclude patterns:
// - src/test/**          # Test utilities (tested by consumers)
// - src/**/*.d.ts        # Type declaration files
// - {other exclusions}   # {reason}
```

---

## Test Environment

### Setup

{Document any global test setup.}

```typescript
// tests/setup.ts (or vitest.setup.ts)
import { beforeAll, afterAll, afterEach } from "vitest";

beforeAll(() => {
  // Global setup
});

afterEach(() => {
  // Cleanup between tests
  vi.clearAllMocks();
});

afterAll(() => {
  // Global teardown
});
```

### Environment Variables

{Document test-specific environment variables.}

| Variable       | Purpose   | Default Value |
| -------------- | --------- | ------------- |
| `{TEST_VAR_1}` | {Purpose} | `{default}`   |
| `{TEST_VAR_2}` | {Purpose} | `{default}`   |

---

## Common Testing Patterns

### Pattern: {Pattern Name 1}

{Description of when to use this pattern.}

```typescript
// Example
{
  codeExample;
}
```

### Pattern: {Pattern Name 2}

{Description.}

```typescript
// Example
{
  codeExample;
}
```

---

## Debugging Tests

### Running Single Test

```bash
# Focus on a specific test
pnpm test --grep "should {test description}"

# Run in debug mode
pnpm test --inspect-brk
```

### Common Issues

| Issue                    | Solution                                       |
| ------------------------ | ---------------------------------------------- |
| "Module not found"       | Run `pnpm build` first                         |
| Mock not being applied   | Ensure `vi.mock()` is hoisted (before imports) |
| Async test timeout       | Increase timeout or check for hanging promises |
| {Package-specific issue} | {Solution}                                     |

---

## CI/CD Integration

### Pipeline Configuration

Tests run in CI with:

```yaml
# Relevant CI config snippet
- name: Test {package-name}
  run: pnpm --filter @repo/{package-name} test:ci
```

### Required Checks

- [ ] All tests pass
- [ ] Coverage meets minimum thresholds
- [ ] No flaky tests (tests should be deterministic)

---

## Adding New Tests

### Checklist for New Tests

- [ ] Test file follows naming convention: `{module}.test.ts`
- [ ] Tests are in appropriate category (`unit/` or `integration/`)
- [ ] Uses existing fixtures and helpers where applicable
- [ ] Follows AAA pattern (Arrange, Act, Assert)
- [ ] Tests edge cases and error conditions
- [ ] No hardcoded delays (`setTimeout`) - use proper async patterns

### Test Naming Convention

```typescript
describe("{ModuleName}", () => {
  describe("{methodName}", () => {
    it("should {expected behavior} when {condition}", () => {
      // ...
    });
  });
});
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Package internal structure
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution workflow
- [Coding Standards](/docs/2-technical/references/coding-standards.md) - Test type helpers
- [TAD: Quality Gates](/docs/2-technical/2-tad-documentation.md#quality-gates) - CI/CD requirements

---

> **Template Version**: 1.0
> **Template Source**: [package-testing-template.md](/docs/0-process/references/package-testing-template.md)
