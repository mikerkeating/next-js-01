/**
 * Basic Auth Proxy Configuration Tests
 *
 * Tests for the basic auth proxy setup including:
 * - Proxy function export
 * - Bypass path checking
 * - Configuration validation
 */
import { describe, it, expect } from 'vitest';

import { proxy, shouldBypassAuth } from './proxy';

describe('Basic Auth Proxy', () => {
  describe('Exports', () => {
    it('exports proxy function', () => {
      expect(proxy).toBeDefined();
      expect(typeof proxy).toBe('function');
    });

    it('exports shouldBypassAuth function', () => {
      expect(shouldBypassAuth).toBeDefined();
      expect(typeof shouldBypassAuth).toBe('function');
    });
  });

  describe('shouldBypassAuth', () => {
    describe('Health Check Endpoint', () => {
      it('bypasses /api/health', () => {
        expect(shouldBypassAuth('/api/health')).toBe(true);
      });

      it('does not bypass /api/health with query params (exact match)', () => {
        // The bypass is configured for exact path match, not with query params
        expect(shouldBypassAuth('/api/health?verbose=true')).toBe(false);
      });
    });

    describe('Next.js Internal Paths', () => {
      it('bypasses /_next/static paths', () => {
        expect(shouldBypassAuth('/_next/static/chunks/main.js')).toBe(true);
      });

      it('bypasses /_next/image paths', () => {
        expect(shouldBypassAuth('/_next/image?url=/logo.png')).toBe(true);
      });

      it('bypasses /_next/data paths', () => {
        expect(shouldBypassAuth('/_next/data/build-id/page.json')).toBe(true);
      });
    });

    describe('Favicon', () => {
      it('bypasses /favicon.ico', () => {
        expect(shouldBypassAuth('/favicon.ico')).toBe(true);
      });
    });

    describe('Static Files', () => {
      it('bypasses SVG files', () => {
        expect(shouldBypassAuth('/logo.svg')).toBe(true);
      });

      it('bypasses PNG files', () => {
        expect(shouldBypassAuth('/images/hero.png')).toBe(true);
      });

      it('bypasses JPG files', () => {
        expect(shouldBypassAuth('/photos/profile.jpg')).toBe(true);
      });

      it('bypasses JPEG files', () => {
        expect(shouldBypassAuth('/photos/banner.jpeg')).toBe(true);
      });

      it('bypasses GIF files', () => {
        expect(shouldBypassAuth('/animations/loading.gif')).toBe(true);
      });

      it('bypasses ICO files', () => {
        expect(shouldBypassAuth('/icons/app.ico')).toBe(true);
      });

      it('bypasses WEBP files', () => {
        expect(shouldBypassAuth('/images/optimized.webp')).toBe(true);
      });

      it('bypasses CSS files', () => {
        expect(shouldBypassAuth('/styles/main.css')).toBe(true);
      });

      it('bypasses JS files', () => {
        expect(shouldBypassAuth('/scripts/analytics.js')).toBe(true);
      });
    });

    describe('Protected Paths', () => {
      it('does not bypass root path', () => {
        expect(shouldBypassAuth('/')).toBe(false);
      });

      it('does not bypass dashboard paths', () => {
        expect(shouldBypassAuth('/dashboard')).toBe(false);
      });

      it('does not bypass API endpoints (except health)', () => {
        expect(shouldBypassAuth('/api/users')).toBe(false);
        expect(shouldBypassAuth('/api/data')).toBe(false);
      });

      it('does not bypass app routes', () => {
        expect(shouldBypassAuth('/settings')).toBe(false);
        expect(shouldBypassAuth('/profile')).toBe(false);
      });
    });
  });
});
