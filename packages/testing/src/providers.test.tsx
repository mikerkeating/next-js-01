/**
 * Tests for TestProviders component.
 *
 * Verifies that the provider wrapper correctly wraps children
 * and supports custom wrapper components.
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { TestProviders, createTestWrapper } from "./providers";

/**
 * Simple test component for verifying provider behavior.
 */
function ChildComponent(): React.ReactElement {
  return <div data-testid="child">Child Content</div>;
}

describe("TestProviders", () => {
  it("renders children correctly", () => {
    render(
      <TestProviders>
        <ChildComponent />
      </TestProviders>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <TestProviders>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </TestProviders>
    );

    expect(screen.getByTestId("first")).toBeInTheDocument();
    expect(screen.getByTestId("second")).toBeInTheDocument();
  });

  it("supports custom wrapper via options", () => {
    function CustomWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
      return (
        <div data-testid="custom-wrapper">
          <header>Header</header>
          {children}
        </div>
      );
    }

    render(
      <TestProviders options={{ wrapper: CustomWrapper }}>
        <ChildComponent />
      </TestProviders>
    );

    expect(screen.getByTestId("custom-wrapper")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders without options", () => {
    render(
      <TestProviders>
        <span>No options</span>
      </TestProviders>
    );

    expect(screen.getByText("No options")).toBeInTheDocument();
  });
});

describe("createTestWrapper", () => {
  it("creates a wrapper component", () => {
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <ChildComponent />
      </Wrapper>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("creates wrapper with custom options", () => {
    function CustomProvider({ children }: { children: React.ReactNode }): React.ReactElement {
      return (
        <div data-testid="custom-provider">
          <span>Custom</span>
          {children}
        </div>
      );
    }

    const Wrapper = createTestWrapper({ wrapper: CustomProvider });

    render(
      <Wrapper>
        <ChildComponent />
      </Wrapper>
    );

    expect(screen.getByTestId("custom-provider")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("can be used as RTL wrapper option", () => {
    const Wrapper = createTestWrapper();

    render(<ChildComponent />, { wrapper: Wrapper });

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
