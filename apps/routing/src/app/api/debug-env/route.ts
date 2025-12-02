/**
 * Debug Environment Variables API Route
 *
 * GET /api/debug-env
 *
 * Returns information about environment variable availability.
 * IMPORTANT: Remove this endpoint before production release.
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      BASIC_AUTH_USERNAME: {
        exists: !!username,
        length: username?.length ?? 0,
        // Show first 2 chars only for verification
        preview: username ? `${username.substring(0, 2)}***` : null,
      },
      BASIC_AUTH_PASSWORD: {
        exists: !!password,
        length: password?.length ?? 0,
        // Don't show password preview
        preview: password ? '***' : null,
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV ?? 'not set',
    },
    processEnvKeys: Object.keys(process.env)
      .filter((key) => key.startsWith('BASIC_AUTH') || key.startsWith('VERCEL'))
      .sort(),
  });
}
