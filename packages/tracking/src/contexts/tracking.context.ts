/**
 * @fileoverview TrackingContext — React context for tracking services.
 *
 * Provides access to the {@link ITrackingService} and {@link ConsentService}
 * throughout the React component tree. Consumed by the `useTracking` and
 * `useConsent` hooks, populated by the `TrackingProvider`.
 *
 * @module @stackra/react-tracking
 * @category Contexts
 */

import { createContext } from "react";

import type { ITrackingService } from "@/interfaces/tracking-service.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Shape of the tracking context value.
 *
 * Contains the tracking service instance, consent service instance,
 * and the last known event ID from the `X-Tracking-Context` response
 * header for deduplication.
 */
export interface TrackingContextValue {
  /**
   * The tracking service instance for dispatching engagement events.
   * `null` when the provider has not yet initialized.
   */
  trackingService: ITrackingService | null;

  /**
   * The consent service instance for managing user consent state.
   * `null` when the provider has not yet initialized.
   */
  consentService: ConsentService | null;

  /**
   * The last event ID received from the `X-Tracking-Context` header.
   * Used for deduplicating page view events with server-side dispatches.
   */
  lastEventId: string | null;
}

/**
 * TrackingContext — React context for engagement tracking.
 *
 * Defaults to `null` for all services and `null` event ID.
 * Must be wrapped in a `TrackingProvider` to function.
 *
 * @example
 * ```typescript
 * const { trackingService, consentService, lastEventId } = useContext(TrackingContext);
 * ```
 */
export const TrackingContext = createContext<TrackingContextValue>({
  trackingService: null,
  consentService: null,
  lastEventId: null,
});
