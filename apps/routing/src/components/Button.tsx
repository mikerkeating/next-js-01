/**
 * Button component demonstrating React Testing Library patterns.
 *
 * This is a sample component used to verify RTL setup is working correctly.
 * It demonstrates:
 * - Proper TypeScript typing for props
 * - Forwarding native button attributes
 * - Handling disabled state
 */
import type { ButtonHTMLAttributes, JSX } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, type = "button", ...props }: ButtonProps): JSX.Element {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}
