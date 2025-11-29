/**
 * Shared type definitions for @repo/testing package.
 *
 * Provides types for:
 * - renderWithProviders options and results
 * - Provider configuration
 * - Test utility types
 *
 * @module types
 */

import type { RenderOptions as RTLRenderOptions, RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Options for configuring test providers.
 *
 * @example
 * ```typescript
 * const providerOptions: ProviderOptions = {
 *   // Future: Add provider-specific options here
 * };
 * ```
 */
export interface ProviderOptions {
  /**
   * Custom wrapper component to use around children.
   * If provided, this will be used in addition to the default providers.
   */
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Extended render options for renderWithProviders.
 *
 * Combines React Testing Library's RenderOptions with provider-specific options.
 *
 * @example
 * ```typescript
 * const options: RenderWithProvidersOptions = {
 *   // RTL options
 *   container: document.body,
 *   baseElement: document.body,
 *
 *   // Provider options (future extensibility)
 * };
 * ```
 */
export interface RenderWithProvidersOptions extends Omit<RTLRenderOptions, "wrapper"> {
  /**
   * Options for configuring the test providers.
   */
  providerOptions?: ProviderOptions;
}

/**
 * Result type from renderWithProviders.
 *
 * Extends RenderResult with a stricter rerender signature that matches
 * the initial render's ReactElement requirement for API consistency.
 */
export interface RenderWithProvidersResult extends Omit<RenderResult, "rerender"> {
  /**
   * Re-render the component with a new element while maintaining providers.
   * @param ui - The React element to render (must be ReactElement, not ReactNode)
   */
  rerender: (ui: ReactElement) => void;
}

/**
 * Props for the TestProviders component.
 */
export interface TestProvidersProps {
  /**
   * Children to wrap with providers.
   */
  children: ReactNode;

  /**
   * Provider configuration options.
   */
  options?: ProviderOptions;
}
