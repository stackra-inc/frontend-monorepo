/**
 * @fileoverview Tracking configuration interface.
 *
 * Defines the shape of the configuration object passed to
 * `TrackingModule.forRoot()`. Controls which pixel scripts are loaded,
 * the API base URL for identity sync, and engagement feature flags.
 *
 * @module @stackra/react-tracking
 * @category Interfaces
 */

/**
 * Configuration for the tracking package.
 *
 * Passed to `TrackingModule.forRoot(config)` to configure pixel scripts,
 * identity sync endpoint, and engagement tracking features.
 *
 * @example
 * ```typescript
 * const config: TrackingConfig = {
 *   meta: { pixelId: '123456789' },
 *   google: { measurementId: 'G-XXXXXXXXXX' },
 *   tiktok: { pixelCode: 'CXXXXXXXXX' },
 *   apiBaseUrl: '/api',
 *   scrollDepthThresholds: [25, 50, 75, 100],
 *   enableTimeOnPage: true,
 *   enableCtaTracking: true,
 * };
 * ```
 */
export interface TrackingConfig {
  /**
   * Meta Pixel configuration.
   *
   * When provided, the Meta Pixel (`fbq`) script is loaded into the DOM.
   *
   * @default undefined (Meta Pixel disabled)
   */
  meta?: {
    /** The Meta Pixel ID (e.g., `'123456789'`). */
    pixelId: string;
  };

  /**
   * Google Analytics 4 configuration.
   *
   * When provided, the gtag.js script is loaded into the DOM.
   *
   * @default undefined (Google Analytics disabled)
   */
  google?: {
    /** The GA4 Measurement ID (e.g., `'G-XXXXXXXXXX'`). */
    measurementId: string;
  };

  /**
   * TikTok Pixel configuration.
   *
   * When provided, the TikTok pixel (`ttq`) script is loaded into the DOM.
   *
   * @default undefined (TikTok Pixel disabled)
   */
  tiktok?: {
    /** The TikTok Pixel Code (e.g., `'CXXXXXXXXX'`). */
    pixelCode: string;
  };

  /**
   * Base URL for the tracking API endpoints.
   *
   * Used by the identity sync service to POST client identity tokens
   * to `{apiBaseUrl}/tracking/context`.
   *
   * @example '/api'
   */
  apiBaseUrl: string;

  /**
   * Scroll depth percentage thresholds at which to fire events.
   *
   * Each value represents a percentage of the page height.
   *
   * @default [25, 50, 75, 100]
   */
  scrollDepthThresholds?: number[];

  /**
   * Whether to track time-on-page engagement events.
   *
   * When enabled, reports duration on `visibilitychange` or navigation.
   *
   * @default false
   */
  enableTimeOnPage?: boolean;

  /**
   * Whether to track CTA click engagement events.
   *
   * When enabled, fires events on click of elements with
   * the `data-track-cta` attribute.
   *
   * @default false
   */
  enableCtaTracking?: boolean;

  /**
   * Active A/B test experiment-to-variant mapping.
   *
   * When provided, the {@link PixelManager} appends this mapping as
   * additional parameters in every pixel event dispatch for conversion
   * attribution segmented by experiment.
   *
   * @default undefined (no experiments)
   *
   * @example
   * ```typescript
   * { experiments: { 'checkout-flow': 'variant-b', 'pricing-page': 'control' } }
   * ```
   */
  experiments?: Record<string, string>;

  /**
   * Offline event queue configuration.
   *
   * Controls how events are persisted when the device is offline.
   * The {@link OfflineQueueService} uses these settings for storage
   * backend selection and queue size limits.
   *
   * @default undefined (defaults: maxSize=500, storage='indexeddb')
   */
  offlineQueue?: {
    /**
     * Maximum number of events to store in the offline queue.
     * Oldest events are discarded when the limit is exceeded.
     *
     * @default 500
     */
    maxSize?: number;

    /**
     * Storage backend for persisting queued events.
     *
     * @default 'indexeddb'
     */
    storage?: "indexeddb" | "localstorage";
  };
}
