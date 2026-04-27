/**
 * @fileoverview TrackingService — orchestrates browser engagement pixel calls.
 *
 * Dispatches engagement events (page views, scroll depth, time on page,
 * CTA clicks) to all configured advertising pixels via the {@link PixelManager}.
 * Reads `event_id` from server response headers for deduplication with
 * server-side events.
 *
 * This service does NOT dispatch commerce events (Purchase, AddToCart, etc.)
 * — those are handled exclusively by the backend tracking module.
 *
 * @module @stackra/react-tracking
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";

import { PIXEL_MANAGER } from "@/constants/tokens.constant";
import { EngagementEvent } from "@/enums/engagement-event.enum";
import type { ITrackingService } from "@/interfaces/tracking-service.interface";
import type { PixelManager } from "@/services/pixel-manager.service";

/**
 * TrackingService — browser engagement event orchestrator.
 *
 * Delegates all pixel dispatch to the {@link PixelManager}, which iterates
 * over configured platforms (Meta, Google, TikTok). Each public method maps
 * engagement event names to platform-appropriate event names before calling
 * `PixelManager.fireEvent()`.
 *
 * @example
 * ```typescript
 * const tracking = container.get<ITrackingService>(TRACKING_SERVICE);
 * tracking.trackPageView('/products', 'abc-123');
 * tracking.trackScrollDepth(50, '/products');
 * ```
 */
@Injectable()
export class TrackingService implements ITrackingService {
  /**
   * Create a new TrackingService instance.
   *
   * @param pixelManager - The pixel manager for dispatching events across platforms.
   */
  public constructor(@Inject(PIXEL_MANAGER) private readonly pixelManager: PixelManager) {}

  // ── Engagement Events ─────────────────────────────────────────────

  /**
   * Track a page view event across all configured pixels.
   *
   * Dispatches a `PageView` event via the PixelManager. Passes `eventId`
   * for deduplication with server-side page view events.
   *
   * @param url - The page URL being viewed.
   * @param eventId - Optional event ID from `X-Tracking-Context` header.
   * @returns void
   */
  public trackPageView(url: string, eventId?: string): void {
    this.pixelManager.fireEvent(EngagementEvent.PAGE_VIEW, { url, page_location: url }, eventId);
  }

  /**
   * Track a scroll depth milestone event.
   *
   * Fires when the user scrolls past a configured threshold percentage.
   *
   * @param depth - The scroll depth percentage reached (e.g., 25, 50, 75, 100).
   * @param url - The page URL where the scroll occurred.
   * @returns void
   */
  public trackScrollDepth(depth: number, url: string): void {
    this.pixelManager.fireEvent(EngagementEvent.SCROLL_DEPTH, {
      depth,
      percent_scrolled: depth,
      url,
      page_location: url,
    });
  }

  /**
   * Track time spent on a page.
   *
   * Typically fired on `visibilitychange` or navigation away from the page.
   *
   * @param duration - Time spent on the page in seconds.
   * @param url - The page URL where time was spent.
   * @returns void
   */
  public trackTimeOnPage(duration: number, url: string): void {
    this.pixelManager.fireEvent(EngagementEvent.TIME_ON_PAGE, {
      duration,
      engagement_time_msec: duration * 1000,
      url,
      page_location: url,
    });
  }

  /**
   * Track a CTA (call-to-action) click event.
   *
   * Fired when a user clicks an element with the `data-track-cta` attribute.
   *
   * @param ctaId - The identifier of the CTA element.
   * @param url - The page URL where the click occurred.
   * @returns void
   */
  public trackCtaClick(ctaId: string, url: string): void {
    this.pixelManager.fireEvent(EngagementEvent.CTA_CLICK, {
      cta_id: ctaId,
      url,
      page_location: url,
    });
  }
}
