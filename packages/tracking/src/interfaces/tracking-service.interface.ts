/**
 * @fileoverview Tracking service interface.
 *
 * Defines the contract for browser engagement tracking operations.
 * Implementations orchestrate pixel calls for page views, scroll depth,
 * time on page, and CTA click events. Commerce events (Purchase,
 * AddToCart, etc.) are NOT handled here — those are dispatched
 * exclusively by the backend.
 *
 * @module @stackra/react-tracking
 * @category Interfaces
 */

/**
 * Tracking service interface for browser engagement events.
 *
 * Implementations coordinate client-side pixel calls (Meta Pixel, gtag.js,
 * TikTok pixel) for engagement-only events. Each method accepts an optional
 * `eventId` for deduplication with server-side dispatches.
 */
export interface ITrackingService {
  /**
   * Track a page view event across all configured pixels.
   *
   * Fires `fbq('track', 'PageView')`, `gtag('event', 'page_view')`,
   * and `ttq.track('ViewContent')` as applicable.
   *
   * @param url - The page URL being viewed.
   * @param eventId - Optional event ID from `X-Tracking-Context` header
   *   for deduplication with server-side page view events.
   * @returns void
   */
  trackPageView(url: string, eventId?: string): void;

  /**
   * Track a scroll depth milestone event.
   *
   * Fires when the user scrolls past a configured threshold percentage.
   *
   * @param depth - The scroll depth percentage reached (e.g., 25, 50, 75, 100).
   * @param url - The page URL where the scroll occurred.
   * @returns void
   */
  trackScrollDepth(depth: number, url: string): void;

  /**
   * Track time spent on a page.
   *
   * Typically fired on `visibilitychange` or navigation away from the page.
   *
   * @param duration - Time spent on the page in seconds.
   * @param url - The page URL where time was spent.
   * @returns void
   */
  trackTimeOnPage(duration: number, url: string): void;

  /**
   * Track a CTA (call-to-action) click event.
   *
   * Fired when a user clicks an element with the `data-track-cta` attribute.
   *
   * @param ctaId - The identifier of the CTA element (from `data-track-cta` value).
   * @param url - The page URL where the click occurred.
   * @returns void
   */
  trackCtaClick(ctaId: string, url: string): void;
}
