/**
 * Test provider wrapper component.
 *
 * Wraps components with all required providers for testing.
 * This component is used by renderWithProviders and can be
 * extended to include additional providers as needed.
 *
 * @module providers
 */

import type { ProviderOptions, TestProvidersProps } from "./types";
import type { ReactElement, ReactNode } from "react";

/**
 * Test providers wrapper component.
 *
 * Wraps children with all necessary providers for testing.
 * Currently provides a simple wrapper that can be extended
 * to include React Query, Router, Theme, and other providers.
 *
 * @example
 * ```tsx
 * import { TestProviders } from '@repo/testing';
 *
 * function MyTest() {
 *   return (
 *     <TestProviders>
 *       <MyComponent />
 *     </TestProviders>
 *   );
 * }
 * ```
 */
export function TestProviders({ children, options }: TestProvidersProps): ReactElement {
  // If a custom wrapper is provided, use it
  if (options?.wrapper) {
    const CustomWrapper = options.wrapper;
    return <CustomWrapper>{children}</CustomWrapper>;
  }

  // Base wrapper - extend with providers as needed:
  // - QueryClientProvider (React Query)
  // - RouterContext (Next.js Router)
  // - ThemeProvider (UI themes)
  return <>{children}</>;
}

/**
 * Creates a wrapper component with the specified options.
 *
 * This is used by renderWithProviders to create a wrapper
 * that includes all test providers.
 *
 * @param options - Provider configuration options
 * @returns A wrapper component function
 *
 * @example
 * ```tsx
 * const Wrapper = createTestWrapper({});
 * render(<MyComponent />, { wrapper: Wrapper });
 * ```
 */
export function createTestWrapper(
  options?: ProviderOptions
): ({ children }: { children: ReactNode }) => ReactElement {
  return function TestWrapper({ children }: { children: ReactNode }): ReactElement {
    // Only pass options if defined to satisfy exactOptionalPropertyTypes
    if (options !== undefined) {
      return <TestProviders options={options}>{children}</TestProviders>;
    }
    return <TestProviders>{children}</TestProviders>;
  };
}
