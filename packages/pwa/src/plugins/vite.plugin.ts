/**
 * Vite Plugin for PWA Package
 *
 * Wraps `vite-plugin-pwa` with sensible defaults for production PWAs.
 * Handles manifest generation, service worker registration, workbox
 * caching strategies, and dev-mode support out of the box.
 *
 * Responsibilities:
 * 1. Merge user options with production-ready defaults
 * 2. Delegate to vite-plugin-pwa under the hood
 * 3. Provide a clean, typed API surface
 *
 * Usage:
 * ```ts
 * import { defineConfig } from 'vite'
 * import { vitePwaPlugin } from '@stackra-inc/ts-pwa/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     vitePwaPlugin({
 *       manifest: {
 *         name: 'My App',
 *         short_name: 'App',
 *         theme_color: '#ffffff',
 *       },
 *     }),
 *   ],
 * })
 * ```
 *
 * @module pwa/plugins/vite
 */

import type { Plugin } from 'vite';
import type { VitePwaPluginOptions } from '@/interfaces/vite-pwa-plugin-options.interface';

/**
 * Default workbox glob patterns for precaching.
 */
const DEFAULT_GLOB_PATTERNS = ['**/*.{js,css,html,ico,png,svg,woff,woff2}'];

/**
 * Default runtime caching strategies for common asset types.
 */
const DEFAULT_RUNTIME_CACHING = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'google-fonts-cache',
      expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'gstatic-fonts-cache',
      expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
    handler: 'CacheFirst' as const,
    options: {
      cacheName: 'images-cache',
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
];

/**
 * Vite plugin that wraps vite-plugin-pwa with production-ready defaults.
 *
 * This plugin is a thin wrapper — it merges your options with sensible
 * defaults and delegates to `vite-plugin-pwa`. All vite-plugin-pwa
 * options can be passed through via `overrides`.
 *
 * @param options - PWA plugin configuration.
 * @returns A Vite plugin (or empty array if disabled).
 */
export function vitePwaPlugin(options: VitePwaPluginOptions = {}): Plugin | Plugin[] {
  const {
    disabled = false,
    registerType = 'autoUpdate',
    strategies = 'generateSW',
    includeAssets,
    manifest,
    workbox = {},
    devOptions,
    srcDir,
    filename,
    overrides = {},
  } = options;

  /* Bail out if explicitly disabled. */
  if (disabled) {
    return {
      name: 'vite-plugin-pwa-wrapper-disabled',
    };
  }

  /* Build the merged manifest. */
  const mergedManifest =
    manifest === false
      ? false
      : {
          display: 'standalone' as const,
          start_url: '/',
          scope: '/',
          ...manifest,
        };

  /* Build the merged workbox config. */
  const mergedWorkbox = {
    globPatterns: workbox.globPatterns ?? DEFAULT_GLOB_PATTERNS,
    cleanupOutdatedCaches: workbox.cleanupOutdatedCaches ?? true,
    navigateFallback: workbox.navigateFallback ?? 'index.html',
    runtimeCaching: workbox.runtimeCaching ?? DEFAULT_RUNTIME_CACHING,
    ...workbox,
  };

  /* Build the final vite-plugin-pwa options. */
  const pwaOptions: Record<string, unknown> = {
    registerType,
    strategies,
    manifest: mergedManifest,
    workbox: mergedWorkbox,
    ...overrides,
  };

  if (includeAssets) {
    pwaOptions.includeAssets = includeAssets;
  }

  if (devOptions) {
    pwaOptions.devOptions = devOptions;
  }

  if (srcDir) {
    pwaOptions.srcDir = srcDir;
  }

  if (filename) {
    pwaOptions.filename = filename;
  }

  /*
   * Dynamically import vite-plugin-pwa so the dependency stays optional.
   * If the consumer hasn't installed it, we throw a clear error.
   */
  let VitePWA: (options: Record<string, unknown>) => Plugin[];

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('vite-plugin-pwa');
    VitePWA = mod.VitePWA ?? mod.default?.VitePWA ?? mod.default;
  } catch {
    throw new Error(
      '[vitePwaPlugin] "vite-plugin-pwa" is required but not installed.\n' +
        'Install it with: pnpm add -D vite-plugin-pwa'
    );
  }

  return VitePWA(pwaOptions);
}
