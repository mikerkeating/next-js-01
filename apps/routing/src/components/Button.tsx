/**
 * Button component demonstrating React Testing Library patterns.
 *
 * This is a sample component used to verify RTL setup is working correctly.
 * It demonstrates:
 * - Proper TypeScript typing for props
 * - Forwarding native button attributes
 * - Handling disabled state
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, ...props }: ButtonProps): React.ReactElement {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}
