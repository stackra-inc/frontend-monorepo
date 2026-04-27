/**
 * @fileoverview useTracking hook — access tracking methods from context.
 *
 * Provides a convenient way to access the {@link ITrackingService} and
 * the last event ID from the nearest {@link TrackingProvider}.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useContext } from "react";

import { TrackingContext } from "@/contexts/tracking.context";
import type { TrackingContextValue } from "@/contexts/tracking.context";

/**
 * Access tracking methods and state from the nearest TrackingProvider.
 *
 * Returns the tracking service instance for dispatching engagement events
 * and the last event ID from the `X-Tracking-Context` response header.
 *
 * @returns The tracking context value containing the service and last event ID.
 * @throws When used outside of a TrackingProvider (returns default null values).
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackingService, lastEventId } = useTracking();
 *
 *   const handleClick = () => {
 *     trackingService?.trackCtaClick('signup-button', window.location.href);
 *   };
 *
 *   return <button onClick={handleClick}>Sign Up</button>;
 * }
 * ```
 */
export function useTracking(): TrackingContextValue {
  return useContext(TrackingContext);
}
