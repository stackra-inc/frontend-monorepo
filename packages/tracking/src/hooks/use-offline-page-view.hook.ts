/**
 * @fileoverview useOfflinePageView hook — fires OfflinePageView when page is served from cache while offline.
 *
 * Detects when a page is served from the service worker cache while
 * `navigator.onLine === false` and fires an `OfflinePageView` event
 * via {@link PixelManager}. No-ops silently when `navigator.onLine`
 * is not supported.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect } from "react";

import type { PixelManager } from "@/services/pixel-manager.service";

/**
 * Fire an `OfflinePageView` event when a page is served from cache while offline.
 *
 * Checks `navigator.onLine` on mount. If the device is offline, fires
 * an `OfflinePageView` event with the current URL. No-ops silently when
 * `navigator.onLine` is not supported.
 *
 * @param pixelManager - The pixel manager instance for dispatching events.
 * @returns void
 *
 * @example
 * ```tsx
 * function App() {
 *   const pixelManager = useResolve<PixelManager>(PIXEL_MANAGER);
 *   useOfflinePageView(pixelManager);
 *   return <div>My PWA</div>;
 * }
 * ```
 */
export function useOfflinePageView(pixelManager: PixelManager): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || typeof navigator.onLine === "undefined") return;

    if (!navigator.onLine) {
      pixelManager.fireEvent("OfflinePageView", {
        url: typeof window !== "undefined" ? window.location.href : "",
        timestamp: Date.now(),
      });
    }
  }, [pixelManager]);
}
