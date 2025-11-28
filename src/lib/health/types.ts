/**
 * Health Check Types
 *
 * Type definitions for the health check API endpoint.
 * Based on TAD: Health Check Specification
 */

/**
 * Status of an individual health check component
 */
export type HealthCheckStatus = 'ok' | 'degraded' | 'error';

/**
 * Overall status of the application health
 */
export type OverallHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Environment type based on Vercel deployment context
 */
export type Environment = 'development' | 'preview' | 'staging' | 'production';

/**
 * Detail for an individual health check component
 */
export interface HealthCheckDetail {
  status: HealthCheckStatus;
  responseTime?: number; // Milliseconds
  message?: string;
  lastChecked: string; // ISO 8601 format
}

/**
 * Collection of all health check results
 */
export interface HealthChecks {
  database: HealthCheckDetail;
  auth: HealthCheckDetail;
  cache: HealthCheckDetail;
}

/**
 * Complete health check response structure
 */
export interface HealthCheckResponse {
  status: OverallHealthStatus;
  timestamp: string; // ISO 8601 format
  version: string; // Application version from package.json
  environment: Environment;
  checks: HealthChecks;
  uptime: number; // Seconds since deployment
}
