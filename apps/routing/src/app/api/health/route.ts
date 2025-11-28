/**
 * Health Check API Route
 *
 * GET /api/health
 *
 * Returns application health status including checks for database,
 * authentication, and cache services.
 *
 * HTTP Status Codes:
 * - 200 OK: All systems healthy or degraded
 * - 503 Service Unavailable: One or more critical systems unhealthy
 */

import { NextResponse } from 'next/server';

import { checkAuth, checkCache, checkDatabase } from '@/lib/health/checks';
import type {
  Environment,
  HealthCheckDetail,
  HealthCheckResponse,
  HealthChecks,
  OverallHealthStatus,
} from '@/lib/health/types';

// Track when the server started for uptime calculation. The uptime will only reflect the time since the last cold start, not the actual deployment uptime
const serverStartTime = Date.now();

/**
 * Determine overall health status based on individual checks
 */
function determineOverallStatus(checks: HealthChecks): OverallHealthStatus {
  const statuses = Object.values(checks).map((check) => check.status);

  if (statuses.some((status) => status === 'error')) {
    return 'unhealthy';
  }

  if (statuses.some((status) => status === 'degraded')) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Get the current environment from Vercel environment variables
 */
function getEnvironment(): Environment {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === 'production') {
    return 'production';
  }

  if (vercelEnv === 'preview') {
    return 'preview';
  }

  // Check for staging environment via custom env var
  // Note: VERCEL_ENV can only be 'production', 'preview', or 'development'
  if (process.env.STAGING_ENV === 'true') {
    return 'staging';
  }

  return 'development';
}

/**
 * Get application version from package.json
 */
function getVersion(): string {
  // In Vercel, npm_package_version is available during build
  // Fall back to a default if not available
  return process.env.npm_package_version || '0.1.0';
}

/**
 * Process a Promise.allSettled result into a HealthCheckDetail
 */
function processCheckResult(
  result: PromiseSettledResult<HealthCheckDetail>
): HealthCheckDetail {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  // Handle rejected promise
  return {
    status: 'error',
    message:
      result.reason instanceof Error
        ? result.reason.message
        : 'Check failed with unknown error',
    lastChecked: new Date().toISOString(),
  };
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  // Run all checks in parallel
  const checkResults = await Promise.allSettled([
    checkDatabase(),
    checkAuth(),
    checkCache(),
  ]);

  // Process results
  const checks: HealthChecks = {
    database: processCheckResult(checkResults[0]),
    auth: processCheckResult(checkResults[1]),
    cache: processCheckResult(checkResults[2]),
  };

  // Determine overall status
  const overallStatus = determineOverallStatus(checks);

  // Calculate uptime in seconds
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);

  // Build response
  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: getVersion(),
    environment: getEnvironment(),
    checks,
    uptime,
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(response, { status: httpStatus });
}
