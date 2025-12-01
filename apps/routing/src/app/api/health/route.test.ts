/**
 * Health Check API Route Tests
 *
 * Tests for GET /api/health endpoint including:
 * - Response structure validation
 * - Overall status determination logic
 * - Environment detection
 * - HTTP status code mapping
 * - Error handling for failed checks
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { HealthCheckDetail, HealthCheckResponse } from '@/lib/health/types';

// Mock the health check functions
vi.mock('@/lib/health/checks', () => ({
  checkDatabase: vi.fn(),
  checkAuth: vi.fn(),
  checkCache: vi.fn(),
}));

// Import after mocking
import { checkDatabase, checkAuth, checkCache } from '@/lib/health/checks';
import { GET } from './route';

// Type the mocked functions
const mockCheckDatabase = vi.mocked(checkDatabase);
const mockCheckAuth = vi.mocked(checkAuth);
const mockCheckCache = vi.mocked(checkCache);

// Helper to create a healthy check result
function createHealthyCheck(message = 'OK'): HealthCheckDetail {
  return {
    status: 'ok',
    responseTime: 5,
    message,
    lastChecked: new Date().toISOString(),
  };
}

// Helper to create a degraded check result
function createDegradedCheck(message = 'Degraded'): HealthCheckDetail {
  return {
    status: 'degraded',
    responseTime: 1500,
    message,
    lastChecked: new Date().toISOString(),
  };
}

// Helper to create an error check result
function createErrorCheck(message = 'Connection failed'): HealthCheckDetail {
  return {
    status: 'error',
    message,
    lastChecked: new Date().toISOString(),
  };
}

describe('GET /api/health', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Response Structure', () => {
    it('returns a valid health check response structure', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('checks');
      expect(data).toHaveProperty('uptime');

      // Verify checks structure
      expect(data.checks).toHaveProperty('database');
      expect(data.checks).toHaveProperty('auth');
      expect(data.checks).toHaveProperty('cache');
    });

    it('returns a valid ISO 8601 timestamp', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(() => new Date(data.timestamp)).not.toThrow();
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('returns uptime as a non-negative number', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(typeof data.uptime).toBe('number');
      expect(data.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Overall Status Determination', () => {
    it('returns "healthy" when all checks are ok', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
    });

    it('returns "degraded" when any check is degraded but none are error', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createDegradedCheck('Auth service slow'));
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.status).toBe('degraded');
    });

    it('returns "unhealthy" when any check is error', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createErrorCheck('Database unreachable'));
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
    });

    it('returns "unhealthy" when error takes precedence over degraded', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createErrorCheck());
      mockCheckAuth.mockResolvedValue(createDegradedCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
    });

    it('returns "unhealthy" when all checks are error', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createErrorCheck());
      mockCheckAuth.mockResolvedValue(createErrorCheck());
      mockCheckCache.mockResolvedValue(createErrorCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
    });
  });

  describe('HTTP Status Codes', () => {
    it('returns 200 for healthy status', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(200);
    });

    it('returns 200 for degraded status', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createDegradedCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(200);
    });

    it('returns 503 for unhealthy status', async () => {
      // Arrange
      mockCheckDatabase.mockResolvedValue(createErrorCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(503);
    });
  });

  describe('Environment Detection', () => {
    it('returns "production" when VERCEL_ENV is production', async () => {
      // Arrange
      process.env.VERCEL_ENV = 'production';
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data.environment).toBe('production');
    });

    it('returns "preview" when VERCEL_ENV is preview', async () => {
      // Arrange
      process.env.VERCEL_ENV = 'preview';
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data.environment).toBe('preview');
    });

    it('returns "staging" when STAGING_ENV is true', async () => {
      // Arrange
      process.env.STAGING_ENV = 'true';
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data.environment).toBe('staging');
    });

    it('returns "development" by default', async () => {
      // Arrange
      delete process.env.VERCEL_ENV;
      delete process.env.STAGING_ENV;
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data.environment).toBe('development');
    });
  });

  describe('Version Detection', () => {
    it('returns version from npm_package_version when available', async () => {
      // Arrange
      process.env.npm_package_version = '1.2.3';
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data.version).toBe('1.2.3');
    });

    it('returns fallback version when npm_package_version is not set', async () => {
      // Arrange
      delete process.env.npm_package_version;
      mockCheckDatabase.mockResolvedValue(createHealthyCheck());
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(data.version).toBe('0.1.0');
    });
  });

  describe('Error Handling', () => {
    it('handles rejected promises from health checks', async () => {
      // Arrange
      mockCheckDatabase.mockRejectedValue(new Error('Database connection timeout'));
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.checks.database.status).toBe('error');
      expect(data.checks.database.message).toBe('Database connection timeout');
    });

    it('handles non-Error rejection with fallback message', async () => {
      // Arrange
      mockCheckDatabase.mockRejectedValue('Unknown failure');
      mockCheckAuth.mockResolvedValue(createHealthyCheck());
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.checks.database.status).toBe('error');
      expect(data.checks.database.message).toBe('Check failed with unknown error');
    });

    it('handles multiple rejected checks', async () => {
      // Arrange
      mockCheckDatabase.mockRejectedValue(new Error('DB error'));
      mockCheckAuth.mockRejectedValue(new Error('Auth error'));
      mockCheckCache.mockResolvedValue(createHealthyCheck());

      // Act
      const response = await GET();
      const data: HealthCheckResponse = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.checks.database.status).toBe('error');
      expect(data.checks.auth.status).toBe('error');
      expect(data.checks.cache.status).toBe('ok');
    });
  });

  describe('Parallel Execution', () => {
    it('runs all health checks in parallel', async () => {
      // Arrange
      const checkOrder: string[] = [];

      mockCheckDatabase.mockImplementation(async () => {
        checkOrder.push('db-start');
        await new Promise((resolve) => setTimeout(resolve, 10));
        checkOrder.push('db-end');
        return createHealthyCheck();
      });

      mockCheckAuth.mockImplementation(async () => {
        checkOrder.push('auth-start');
        await new Promise((resolve) => setTimeout(resolve, 10));
        checkOrder.push('auth-end');
        return createHealthyCheck();
      });

      mockCheckCache.mockImplementation(async () => {
        checkOrder.push('cache-start');
        await new Promise((resolve) => setTimeout(resolve, 10));
        checkOrder.push('cache-end');
        return createHealthyCheck();
      });

      // Act
      await GET();

      // Assert: All starts should happen before any ends (parallel execution)
      const startIndexes = ['db-start', 'auth-start', 'cache-start'].map((s) =>
        checkOrder.indexOf(s)
      );
      const endIndexes = ['db-end', 'auth-end', 'cache-end'].map((s) => checkOrder.indexOf(s));

      // All starts should be in first 3 positions
      expect(Math.max(...startIndexes)).toBeLessThan(3);
      // All ends should be in last 3 positions
      expect(Math.min(...endIndexes)).toBeGreaterThanOrEqual(3);
    });
  });
});
