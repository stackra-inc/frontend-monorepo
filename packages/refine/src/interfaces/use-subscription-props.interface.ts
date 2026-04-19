/**
 * @fileoverview Props interface for the useSubscription realtime hook.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

import type { LiveEvent } from './live-event.interface';

/**
 * Props for the {@link useSubscription} hook.
 *
 * Configures a real-time channel subscription with event type filtering.
 */
export interface UseSubscriptionProps {
  /** Channel name to subscribe to. */
  channel: string;
  /** Event types to listen for. */
  types: string[];
  /** Callback invoked when a matching live event arrives. */
  onLiveEvent: (event: LiveEvent) => void;
  /** Whether the subscription is active. @default true */
  enabled?: boolean;
}
