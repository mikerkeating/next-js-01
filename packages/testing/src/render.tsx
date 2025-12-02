/**
 * Custom render function with test providers.
 *
 * Provides renderWithProviders utility that wraps React Testing Library's
 * render with all necessary providers for testing.
 *
 * @module render
 */

import { render } from "@testing-library/react";

import { createTestWrapper } from "./providers";

import type { RenderWithProvidersOptions, RenderWithProvidersResult } from "./types";
import type { ReactElement } from "react";

/**
 * Renders a React element with test providers.
 *
 * This function wraps React Testing Library's render with all
 * necessary providers for testing, such as:
 * - React Query's QueryClientProvider (when added)
 * - Router context (when added)
 * - Theme providers (when added)
 *
 * A new instance of any stateful providers (like QueryClient)
 * is created for each render call to ensure test isolation.
 *
 * @param ui - The React element to render
 * @param options - Render options including provider configuration
 * @returns RenderResult with all screen queries and utilities
 *
 * @example
 * ```tsx
 * import { renderWithProviders, screen } from '@repo/testing';
 *
 * test('renders component with providers', () => {
 *   renderWithProviders(<MyComponent />);
 *   expect(screen.getByRole('button')).toBeInTheDocument();
 * });
 * ```
 *
 * @example
 * ```tsx
 * // With custom options
 * test('renders with custom container', () => {
 *   const container = document.createElement('div');
 *   renderWithProviders(<MyComponent />, { container });
 * });
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
  const { providerOptions, ...renderOptions } = options;

  // Create wrapper with providers
  const Wrapper = createTestWrapper(providerOptions);

  // Render with the wrapper (spread renderOptions first to ensure our wrapper takes precedence)
  const result = render(ui, {
    ...renderOptions,
    wrapper: Wrapper,
  });

  // Return result - RTL's rerender automatically uses the wrapper option
  return result;
}
