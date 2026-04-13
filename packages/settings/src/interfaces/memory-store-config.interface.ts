/**
 * @fileoverview Memory store configuration interface.
 *
 * Configuration for the in-memory persistence driver.
 * Data is lost on page refresh.
 *
 * @module interfaces/memory-store-config
 */

import type { BaseStoreConfig } from './base-store-config.interface';

/**
 * Config for the memory driver
 */
export interface MemoryStoreConfig extends BaseStoreConfig {
  driver: 'memory';
}
