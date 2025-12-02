/**
 * Tests for renderWithProviders utility.
 *
 * Verifies that the custom render function correctly wraps components
 * with test providers and returns all screen utilities.
 */
import { screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";

import { renderWithProviders } from "./render";

/**
 * Simple test component for verifying render behavior.
 */
function TestComponent({ text = "Test Component" }: { text?: string }): React.ReactElement {
  return <div data-testid="test-component">{text}</div>;
}

describe("renderWithProviders", () => {
  it("renders component to the DOM", () => {
    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId("test-component")).toBeInTheDocument();
    expect(screen.getByText("Test Component")).toBeInTheDocument();
  });

  it("returns screen utilities", () => {
    const result = renderWithProviders(<TestComponent />);

    // Verify standard RTL utilities are returned
    expect(result.getByTestId).toBeDefined();
    expect(result.queryByText).toBeDefined();
    expect(result.findByRole).toBeDefined();
    expect(result.container).toBeInstanceOf(HTMLElement);
    expect(result.baseElement).toBeInstanceOf(HTMLElement);
  });

  it("supports custom render options", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    renderWithProviders(<TestComponent />, { container });

    expect(container.querySelector('[data-testid="test-component"]')).toBeInTheDocument();

    document.body.removeChild(container);
  });

  it("supports rerender with same providers", () => {
    const { rerender } = renderWithProviders(<TestComponent text="Initial" />);

    expect(screen.getByText("Initial")).toBeInTheDocument();

    rerender(<TestComponent text="Updated" />);

    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Initial")).not.toBeInTheDocument();
  });

  it("creates isolated providers per render call", () => {
    // Render first component
    const { unmount: unmount1 } = renderWithProviders(<TestComponent text="First" />);
    expect(screen.getByText("First")).toBeInTheDocument();
    unmount1();

    // Render second component - should not share state with first
    renderWithProviders(<TestComponent text="Second" />);
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });

  it("supports custom wrapper component via providerOptions", () => {
    function CustomWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
      return (
        <div data-testid="custom-wrapper">
          <span>Custom Provider</span>
          {children}
        </div>
      );
    }

    renderWithProviders(<TestComponent />, {
      providerOptions: {
        wrapper: CustomWrapper,
      },
    });

    expect(screen.getByTestId("custom-wrapper")).toBeInTheDocument();
    expect(screen.getByText("Custom Provider")).toBeInTheDocument();
    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });
});
