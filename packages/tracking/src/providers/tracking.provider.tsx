/**
 * @fileoverview TrackingProvider — React context provider for engagement tracking.
 *
 * Initializes pixel scripts via {@link PixelManager}, starts identity
 * sync via {@link IdentitySyncService}, and listens for `X-Tracking-Context`
 * headers on API responses. Exposes tracking methods and consent service
 * to the component tree via {@link TrackingContext}.
 *
 * @module @stackra/react-tracking
 * @category Providers
 */

import React, { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { HEADER_TRACKING_CONTEXT } from "@/constants/tracking.constant";
import { TrackingContext } from "@/contexts/tracking.context";
import type { TrackingContextValue } from "@/contexts/tracking.context";
import type { ITrackingService } from "@/interfaces/tracking-service.interface";
import type { PixelManager } from "@/services/pixel-manager.service";
import type { ConsentService } from "@/services/consent.service";
import type { IdentitySyncService } from "@/services/identity-sync.service";

/**
 * Props for the {@link TrackingProvider} component.
 */
export interface TrackingProviderProps {
  /** The child components to render within the tracking context. */
  children: ReactNode;

  /** The tracking service instance resolved from the DI container. */
  trackingService: ITrackingService;

  /** The pixel manager instance resolved from the DI container. */
  pixelManager: PixelManager;

  /** The consent service instance resolved from the DI container. */
  consentService: ConsentService;

  /** The identity sync service instance resolved from the DI container. */
  identitySync: IdentitySyncService;
}

/**
 * TrackingProvider — initializes tracking infrastructure and provides context.
 *
 * On mount:
 * 1. Loads configured pixel scripts via PixelManager (consent-gated)
 * 2. Starts identity cookie sync with the backend (consent-gated)
 * 3. Sets up an interceptor to capture `X-Tracking-Context` response headers
 * 4. Subscribes to consent changes to load pixels when consent is granted
 *
 * On unmount:
 * 1. Stops the identity sync interval
 * 2. Unsubscribes from consent changes
 *
 * @example
 * ```tsx
 * <TrackingProvider
 *   trackingService={trackingSvc}
 *   pixelManager={pixelMgr}
 *   consentService={consentSvc}
 *   identitySync={identitySyncSvc}
 * >
 *   <App />
 * </TrackingProvider>
 * ```
 */
export function TrackingProvider({
  children,
  trackingService,
  pixelManager,
  consentService,
  identitySync,
}: TrackingProviderProps): React.JSX.Element {
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  // ── Initialize pixels and identity sync on mount ──────────────────

  useEffect(() => {
    // PixelManager.loadAll() checks marketing consent internally
    pixelManager.loadAll();

    // IdentitySyncService.start() checks analytics consent internally
    identitySync.start();

    // Re-attempt loading when consent changes (e.g., user grants marketing)
    const unsubscribe = consentService.subscribe(() => {
      pixelManager.loadAll();
      identitySync.start();
    });

    return () => {
      identitySync.stop();
      unsubscribe();
    };
  }, [pixelManager, consentService, identitySync]);

  // ── Listen for X-Tracking-Context on fetch responses ──────────────

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const response = await originalFetch(...args);

      const trackingContext = response.headers.get(HEADER_TRACKING_CONTEXT);
      if (trackingContext) {
        setLastEventId(trackingContext);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // ── Build context value ───────────────────────────────────────────

  const contextValue: TrackingContextValue = useMemo(
    () => ({
      trackingService,
      consentService,
      lastEventId,
    }),
    [trackingService, consentService, lastEventId],
  );

  return <TrackingContext.Provider value={contextValue}>{children}</TrackingContext.Provider>;
}
