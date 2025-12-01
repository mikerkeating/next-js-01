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
];
