/**
 * Tests for Button component.
 *
 * Demonstrates React Testing Library patterns:
 * - Rendering components with render()
 * - Querying with screen.getByRole() (accessibility-first)
 * - User interactions with userEvent
 * - DOM matchers from jest-dom (toBeInTheDocument, etc.)
 *
 * @see https://testing-library.com/docs/react-testing-library/intro/
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders with the correct text", () => {
      render(<Button>Click me</Button>);

      // Use getByRole for accessibility-first queries
      const button = screen.getByRole("button", { name: "Click me" });

      // jest-dom matcher - should work without explicit import
      expect(button).toBeInTheDocument();
    });

    it("renders children correctly", () => {
      render(
        <Button>
          <span data-testid="icon">★</span>
          Submit
        </Button>
      );

      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });
  });

  describe("user interactions", () => {
    it("calls onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button", { name: "Click me" });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("supports multiple clicks", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button", { name: "Click me" });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("disabled state", () => {
    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick} disabled>
          Cannot click
        </Button>
      );

      const button = screen.getByRole("button", { name: "Cannot click" });

      // Verify button is disabled using jest-dom matcher
      expect(button).toBeDisabled();

      // Try to click disabled button
      await user.click(button);

      // Handler should not be called
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("has correct disabled styling attributes", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button", { name: "Disabled" });

      expect(button).toHaveAttribute("disabled");
    });
  });

  describe("accessibility", () => {
    it("is focusable via keyboard navigation", async () => {
      const user = userEvent.setup();

      render(<Button>Focusable</Button>);

      const button = screen.getByRole("button", { name: "Focusable" });

      // Tab to focus the button
      await user.tab();

      expect(button).toHaveFocus();
    });

    it("can be activated with keyboard (Enter/Space)", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole("button", { name: "Press Enter" });
      button.focus();

      // Press Enter key
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Press Space key
      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });
});
