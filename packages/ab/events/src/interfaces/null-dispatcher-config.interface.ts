/**
 * Null Dispatcher Configuration
 *
 * @module @stackra/ts-events
 * @category Interfaces
 */

export interface NullDispatcherConfig {
  driver: 'null';
  /**
   * Key prefix (ignored, kept for config consistency).
   */
  prefix?: string;
}
