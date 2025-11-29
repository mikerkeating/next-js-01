/**
 * Button component demonstrating React Testing Library patterns.
 *
 * This is a sample component used to verify RTL setup is working correctly.
 * It demonstrates:
 * - Proper TypeScript typing for props
 * - Forwarding native button attributes
 * - Handling disabled state
 */
import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, type = "button", ...props }: ButtonProps): React.ReactElement {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}
