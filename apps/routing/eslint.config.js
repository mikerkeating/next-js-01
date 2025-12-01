/**
 * ESLint flat configuration for @repo/routing.
 *
 * Extends the shared Next.js configuration from @repo/config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
import nextjs from '@repo/config/eslint/nextjs';

export default [
  ...nextjs,
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'coverage/**'],
  },
  // Relax type-checking rules for test files where API responses are typed
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
];
