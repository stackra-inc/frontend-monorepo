/**
 * @fileoverview Engagement event type enum.
 *
 * Defines the canonical names for browser engagement events tracked
 * by `@stackra/react-tracking`. These are client-only events — commerce
 * events (Purchase, AddToCart, etc.) are handled by the backend.
 *
 * @module @stackra/react-tracking
 * @category Enums
 */

/**
 * Browser engagement event types.
 *
 * Used as discriminators when dispatching engagement events to
 * configured pixel scripts. Each value matches the canonical
 * event name expected by advertising platforms.
 */
export enum EngagementEvent {
  /** Fired on route change. Deduplicated via `event_id` from server. */
  PAGE_VIEW = "page_view",

  /** Fired when the user scrolls past a configured depth threshold. */
  SCROLL_DEPTH = "scroll_depth",

  /** Fired on `visibilitychange` or navigation, reporting page duration. */
  TIME_ON_PAGE = "time_on_page",

  /** Fired on click of elements with `data-track-cta` attribute. */
  CTA_CLICK = "cta_click",
}
