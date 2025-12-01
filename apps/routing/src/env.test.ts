/**
 * Environment Configuration Tests
 *
 * Tests for the T3 Env configuration including:
 * - Module exports validation
 * - Client-side environment variable access
 *
 * Note: T3 Env protects server-side variables from client access.
 * Server variables can only be tested in a Node.js environment with
 * proper server context. This test file focuses on client-side access
 * and verifying the module structure.
 *
 * @see https://env.t3.gg/docs/nextjs
 */
import { describe, it, expect } from 'vitest';

import { env } from './env';

describe('Environment Configuration', () => {
  describe('Module Structure', () => {
    it('exports an env object', () => {
      expect(env).toBeDefined();
      expect(typeof env).toBe('object');
    });

    it('env object is a proxy (T3 Env implementation)', () => {
      // T3 Env returns a Proxy object for environment access control
      // We verify it exists and is an object
      expect(env).not.toBeNull();
    });
  });

  describe('Client Environment Variables', () => {
    it('allows access to NEXT_PUBLIC_APP_URL', () => {
      // Client variables are accessible - may be undefined if not set
      const value = env.NEXT_PUBLIC_APP_URL;
      expect(value === undefined || typeof value === 'string').toBe(true);
    });

    it('allows access to NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', () => {
      const value = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      expect(value === undefined || typeof value === 'string').toBe(true);
    });

    it('allows access to NEXT_PUBLIC_POSTHOG_KEY', () => {
      const value = env.NEXT_PUBLIC_POSTHOG_KEY;
      expect(value === undefined || typeof value === 'string').toBe(true);
    });

    it('allows access to NEXT_PUBLIC_POSTHOG_HOST', () => {
      const value = env.NEXT_PUBLIC_POSTHOG_HOST;
      expect(value === undefined || typeof value === 'string').toBe(true);
    });
  });

  describe('Server Variable Protection', () => {
    it('throws when accessing server variables from client context', () => {
      // T3 Env protects server variables from client access
      // This is expected behavior - server vars should not be exposed
      expect(() => env.NODE_ENV).toThrow(/server-side environment variable/i);
    });

    it('protects DATABASE_URL from client access', () => {
      expect(() => env.DATABASE_URL).toThrow(/server-side environment variable/i);
    });

    it('protects CLERK_SECRET_KEY from client access', () => {
      expect(() => env.CLERK_SECRET_KEY).toThrow(/server-side environment variable/i);
    });

    it('protects ENCRYPTION_KEY from client access', () => {
      expect(() => env.ENCRYPTION_KEY).toThrow(/server-side environment variable/i);
    });
  });
});
