/**
 * @fileoverview Default realtime configuration values.
 * @module @stackra/ts-realtime
 * @category Config
 */

import type { RealtimeConfig } from '@stackra/ts-realtime';

/**
 * Default configuration values for the realtime WebSocket connection.
 *
 * These defaults are merged with the consumer-provided config in
 * `RealtimeModule.forRoot()` so that only required fields and explicit
 * overrides need to be specified.
 *
 * @description
 * Contains sensible defaults for optional and reconnection fields:
 * - TLS is disabled by default (suitable for local Soketi development).
 * - Pusher stats are disabled by default.
 * - Reconnection uses exponential backoff starting at 1 second, doubling
 *   each attempt, capped at 30 seconds.
 *
 * @example
 * ```typescript
 * import { defaultRealtimeConfig } from '@stackra/ts-realtime';
 *
 * const merged = { ...defaultRealtimeConfig, ...consumerConfig };
 * ```
 */
export const defaultRealtimeConfig: Partial<RealtimeConfig> = {
  /** Force TLS for the WebSocket connection. */
  forceTLS: false,

  /** Pusher cluster. */
  cluster: 'mt1',

  /** Enable encrypted connection. */
  encrypted: false,

  /** Disable Pusher stats reporting. */
  disableStats: true,

  /** Initial delay before the first reconnection attempt (ms). */
  reconnectInitialDelay: 1000,

  /** Maximum delay between reconnection attempts (ms). */
  reconnectMaxDelay: 30000,

  /** Multiplier applied to the delay after each failed reconnection attempt. */
  reconnectMultiplier: 2,
};
