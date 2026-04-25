/**
 * @fileoverview Parameters for subscribing to a real-time channel.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

import type { LiveEvent } from './live-event.interface';

/**
 * Parameters for subscribing to a real-time channel.
 */
export interface SubscribeParams {
  /** Channel name to subscribe to. */
  channel: string;

  /** Event types to listen for. */
  types: string[];

  /** Callback invoked when a matching event arrives. */
  callback: (event: LiveEvent) => void;

  /** Optional additional parameters. */
  params?: Record<string, any>;
}
