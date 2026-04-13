/**
 * Memory Dispatcher Configuration
 *
 * @module @abdokouta/ts-events
 * @category Interfaces
 */

export interface MemoryDispatcherConfig {
  driver: 'memory';
  /**
   * Enable wildcard matching. @default true
   */
  wildcards?: boolean;
  /**
   * Key prefix for namespacing.
   */
  prefix?: string;
}
