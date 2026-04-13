/**
 * @fileoverview LocalStorage store configuration interface.
 *
 * Configuration for the built-in localStorage persistence driver.
 *
 * @module interfaces/local-storage-store-config
 */

import type { BaseStoreConfig } from './base-store-config.interface';

/**
 * Config for the localStorage driver
 */
export interface LocalStorageStoreConfig extends BaseStoreConfig {
  driver: 'localStorage';
}
