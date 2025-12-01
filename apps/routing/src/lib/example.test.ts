/**
 * Example test file to verify Vitest setup
 *
 * This file demonstrates basic Vitest functionality including:
 * - Test discovery (*.test.ts pattern)
 * - Global APIs (describe, it, expect)
 * - Async test support
 * - Path alias resolution (@/ imports)
 *
 * Run with: pnpm test (from root or apps/routing)
 */

import { describe, it, expect, vi } from 'vitest';

// Test path alias resolution
import { checkDatabase, checkAuth, checkCache } from '@/lib/health/checks';

describe('Vitest Setup Verification', () => {
  describe('Basic Functionality', () => {
    it('should pass a simple assertion', () => {
      expect(1 + 1).toBe(2);
    });

    it('should handle string assertions', () => {
      const message = 'Hello, Vitest!';
      expect(message).toContain('Vitest');
      expect(message).toHaveLength(14);
    });

    it('should handle array assertions', () => {
      const items = [1, 2, 3];
      expect(items).toHaveLength(3);
      expect(items).toContain(2);
    });

    it('should handle object assertions', () => {
      const user = { name: 'Test User', role: 'admin' };
      expect(user).toHaveProperty('name');
      expect(user).toMatchObject({ role: 'admin' });
    });
  });

  describe('Async Support', () => {
    it('should resolve async values', async () => {
      const asyncValue = await Promise.resolve('async result');
      expect(asyncValue).toBe('async result');
    });

    it('should handle async/await with delays', async () => {
      const delay = (ms: number): Promise<string> =>
        new Promise((resolve) => setTimeout(() => resolve('done'), ms));

      const result = await delay(10);
      expect(result).toBe('done');
    });

    it('should handle rejected promises', async () => {
      const failingPromise = Promise.reject(new Error('Test error'));
      await expect(failingPromise).rejects.toThrow('Test error');
    });
  });

  describe('Mock Support', () => {
    it('should create and use mock functions', () => {
      const mockFn = vi.fn();
      mockFn('arg1', 'arg2');

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should mock return values', () => {
      const mockFn = vi.fn().mockReturnValue('mocked value');
      expect(mockFn()).toBe('mocked value');
    });
  });
});

describe('Path Alias Resolution', () => {
  describe('Health Check Imports (@/lib/health/checks)', () => {
    it('should import checkDatabase function', () => {
      expect(typeof checkDatabase).toBe('function');
    });

    it('should import checkAuth function', () => {
      expect(typeof checkAuth).toBe('function');
    });

    it('should import checkCache function', () => {
      expect(typeof checkCache).toBe('function');
    });
  });

  describe('Health Check Execution', () => {
    it('should execute checkDatabase and return valid response', async () => {
      const result = await checkDatabase();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('lastChecked');
      expect(result.status).toBe('ok');
      expect(typeof result.responseTime).toBe('number');
    });

    it('should execute checkAuth and return valid response', async () => {
      const result = await checkAuth();

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('ok');
    });

    it('should execute checkCache and return valid response', async () => {
      const result = await checkCache();

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('ok');
    });
  });
});
