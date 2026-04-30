/**
 * @fileoverview Default realtime configuration values.
 * @module @stackra/ts-realtime
 * @category Config
 */

import type { RealtimeConfig } from '../interfaces/realtime-config.interface';

/**
 * Default configuration values for the realtime module.
 *
 * Provides a sensible starting point with an empty connections map.
 * Consumers must provide at least one connection in `RealtimeModule.forRoot()`.
 *
 * @description
 * Contains sensible defaults for the multi-connection config shape.
 * Individual connection configs should specify their own reconnection
 * parameters; the defaults here are for the top-level structure only.
 *
 * @example
 * ```typescript
 * import { defaultRealtimeConfig } from '@stackra/ts-realtime';
 *
 * const merged = { ...defaultRealtimeConfig, ...consumerConfig };
 * ```
 */
export const defaultRealtimeConfig: Partial<RealtimeConfig> = {
  /** Default connection name. */
  default: 'default',

  /** Named connections map. */
  connections: {},

  /** Register providers globally. */
  isGlobal: true,
};
