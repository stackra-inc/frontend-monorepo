/**
 * @fileoverview usePushOpen hook — fires PushNotificationOpen on service worker notification click.
 *
 * Listens for messages from the service worker indicating a push notification
 * was clicked, and fires a `PushNotificationOpen` event via {@link PixelManager}.
 * No-ops silently when the Service Worker API is not supported.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useEffect } from "react";

import type { PixelManager } from "@/services/pixel-manager.service";

/**
 * Fire a `PushNotificationOpen` event when a service worker push notification is clicked.
 *
 * Listens for `message` events from the service worker with a
 * `type: 'PUSH_NOTIFICATION_CLICK'` payload. No-ops silently when
 * the Service Worker API is not supported.
 *
 * @param pixelManager - The pixel manager instance for dispatching events.
 * @returns void
 *
 * @example
 * ```tsx
 * function App() {
 *   const pixelManager = useResolve<PixelManager>(PIXEL_MANAGER);
 *   usePushOpen(pixelManager);
 *   return <div>My PWA</div>;
 * }
 * ```
 */
export function usePushOpen(pixelManager: PixelManager): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent): void => {
      if (event.data?.type === "PUSH_NOTIFICATION_CLICK") {
        pixelManager.fireEvent("PushNotificationOpen", {
          notification_id: event.data.notificationId,
          campaign: event.data.campaign,
          timestamp: Date.now(),
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [pixelManager]);
}
