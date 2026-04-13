/**
 * @fileoverview Union type of all built-in store configurations.
 *
 * Combines LocalStorage, API, Memory, and custom store configs
 * into a single discriminated union.
 *
 * @module interfaces/settings-store-config
 */

import type { BaseStoreConfig } from './base-store-config.interface';
import type { LocalStorageStoreConfig } from './local-storage-store-config.interface';
import type { ApiStoreConfig } from './api-store-config.interface';
import type { MemoryStoreConfig } from './memory-store-config.interface';

/** Union of all built-in store configs */
export type SettingsStoreConfig =
  | LocalStorageStoreConfig
  | ApiStoreConfig
  | MemoryStoreConfig
  | (BaseStoreConfig & Record<string, unknown>);
