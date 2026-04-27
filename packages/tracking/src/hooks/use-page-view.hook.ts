/**
 * @fileoverview usePageView hook — fires PageView on route change with dedup.
 *
 * Automatically tracks page view events when the provided URL changes.
 * Uses the `event_id` from the `X-Tracking-Context` header to deduplicate
 * with server-side page view dispatches.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect, useRef } from "react";

import { useTracking } from "./use-tracking.hook";

/**
 * Track page views on route changes with event ID deduplication.
 *
 * Fires a page view event via the tracking service whenever the `url`
 * parameter changes. Passes the last known `event_id` from the
 * `X-Tracking-Context` header to prevent double-counting with
 * server-side page view events.
 *
 * @param url - The current page URL. When this changes, a page view is fired.
 *
 * @example
 * ```tsx
 * function App() {
 *   const location = useLocation();
 *   usePageView(location.pathname + location.search);
 *
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export function usePageView(url: string): void {
  const { trackingService, lastEventId } = useTracking();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!trackingService) return;

    // Only fire when the URL actually changes
    if (url === previousUrl.current) return;
    previousUrl.current = url;

    trackingService.trackPageView(url, lastEventId ?? undefined);
  }, [url, trackingService, lastEventId]);
}
