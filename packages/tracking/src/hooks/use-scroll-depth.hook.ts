/**
 * @fileoverview useScrollDepth hook — fires at configurable scroll thresholds.
 *
 * Monitors the user's scroll position and fires engagement events when
 * configured depth thresholds (e.g., 25%, 50%, 75%, 100%) are reached.
 * Each threshold fires at most once per page URL.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect, useRef } from "react";

import { useTracking } from "./use-tracking.hook";

/** Default scroll depth thresholds as percentages. */
const DEFAULT_THRESHOLDS = [25, 50, 75, 100];

/**
 * Track scroll depth milestones at configurable thresholds.
 *
 * Attaches a scroll event listener that calculates the current scroll
 * depth as a percentage of the total scrollable height. When a configured
 * threshold is crossed, fires a scroll depth event via the tracking service.
 * Each threshold fires at most once per URL — resets when the URL changes.
 *
 * @param url - The current page URL. Thresholds reset when this changes.
 * @param thresholds - Percentage thresholds to track (default: [25, 50, 75, 100]).
 *
 * @example
 * ```tsx
 * function App() {
 *   const location = useLocation();
 *   useScrollDepth(location.pathname, [25, 50, 75, 100]);
 *
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export function useScrollDepth(url: string, thresholds: number[] = DEFAULT_THRESHOLDS): void {
  const { trackingService } = useTracking();
  const firedThresholds = useRef<Set<number>>(new Set());
  const currentUrl = useRef<string>(url);

  // Reset fired thresholds when URL changes
  useEffect(() => {
    if (url !== currentUrl.current) {
      firedThresholds.current.clear();
      currentUrl.current = url;
    }
  }, [url]);

  useEffect(() => {
    if (!trackingService) return;
    if (typeof window === "undefined") return;

    /**
     * Calculate scroll depth percentage and fire events for
     * any newly crossed thresholds.
     */
    const handleScroll = (): void => {
      const scrollTop = window.scrollY ?? document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Avoid division by zero on pages with no scrollable content
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      const scrollPercent = Math.round((scrollTop / maxScroll) * 100);

      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          trackingService.trackScrollDepth(threshold, url);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [trackingService, url, thresholds]);
}
