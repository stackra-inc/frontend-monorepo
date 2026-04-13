/**
 * @fileoverview Base store configuration interface.
 *
 * Shared base config that all store driver configurations extend.
 *
 * @module interfaces/base-store-config
 */

import type { SettingsDriverName } from './settings-driver.type';

/**
 * Base config shared by all store drivers
 */
export interface BaseStoreConfig {
  /**
   * The driver to use for this store
   */
  driver: SettingsDriverName;
}
