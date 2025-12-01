# React 19 Compatibility Analysis: @testing-library/react

> **Date**: 2025-12-01
> **Package**: `@repo/testing`
> **Status**: Verified Compatible (with caveats)

## Overview

This document analyzes the compatibility between `@testing-library/react` 16.3.0 and React 19.2.0 as configured in the `@repo/testing` package.

## Current Configuration

| Package                       | Version | Notes                        |
| ----------------------------- | ------- | ---------------------------- |
| `@testing-library/react`      | ^16.3.0 | Officially supports React 18 |
| `@testing-library/dom`        | ^10.4.1 | Core DOM utilities           |
| `@testing-library/user-event` | ^14.6.1 | User interaction simulation  |
| `react`                       | ^19.2.0 | Latest React version         |
| `react-dom`                   | ^19.2.0 | Latest React DOM version     |

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": ">=18.0.0 <20.0.0",
    "react-dom": ">=18.0.0 <20.0.0",
    "vitest": ">=4.0.0"
  }
}
```

React 19.2.0 falls within the declared peer dependency range.

## Known Compatibility Issues

`@testing-library/react` 16.3.0 officially supports React 18, not React 19. The following issues are documented in the community:

### 1. `findDOMNode` Removal

**Issue**: React 19 removed the deprecated `findDOMNode` API, which some Testing Library internals may use.

**Impact**: Can cause runtime errors in certain test scenarios.

**Status in our codebase**: No issues observed.

### 2. Suspense/Async Rendering Changes

**Issue**: React 19 changed Suspense and async rendering behavior, which can cause test flakiness or unexpected behavior with `waitFor`, `findBy*` queries, and async utilities.

**Impact**: Tests involving async operations may behave differently.

**Status in our codebase**: No issues observed.

### 3. `act()` Warning Changes

**Issue**: React 19 has more aggressive `act()` warnings that may surface in tests that were previously passing.

**Impact**: Console warnings or test failures related to state updates not wrapped in `act()`.

**Status in our codebase**: No issues observed.

## Verification Results

### Test Suite Execution

```bash
pnpm test
```

**Result**: All tests pass with no compatibility-related failures.

### Specific Checks Performed

- [x] Component rendering works correctly
- [x] `screen` queries function as expected
- [x] `userEvent` interactions work properly
- [x] jest-dom matchers available and functional
- [x] No `findDOMNode` errors
- [x] No unexpected `act()` warnings
- [x] Async utilities (`waitFor`, `findBy*`) work correctly

## Recommendations

### Short-term

1. **Monitor test suite** for any regressions as new tests are added
2. **Document workarounds** if specific patterns cause issues
3. **Use `--legacy-peer-deps`** if npm installation warns about peer dependencies

### Long-term

1. **Track upstream releases** - Monitor [@testing-library/react releases](https://github.com/testing-library/react-testing-library/releases) for official React 19 support
2. **Update when available** - Upgrade to a version with official React 19 support when released
3. **Re-verify after updates** - Run full test suite after any Testing Library version changes

## Conclusion

Despite `@testing-library/react` 16.3.0 not officially supporting React 19, our current test suite runs without issues. The combination is functional for our use cases but should be monitored.

### Risk Assessment

| Factor                | Rating      | Notes                            |
| --------------------- | ----------- | -------------------------------- |
| Current stability     | Low risk    | Tests passing                    |
| Future test additions | Medium risk | New patterns may hit edge cases  |
| Upstream support      | Medium risk | No official React 19 support yet |

## References

- [packages/testing/package.json](../../../packages/testing/package.json)
- [S2: Configure React Testing Library](./S2-react-testing-library.md)
- [React Testing Library GitHub](https://github.com/testing-library/react-testing-library)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
