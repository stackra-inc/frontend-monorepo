/**
 * @fileoverview Settings module root configuration interface.
 *
 * Defines the top-level options passed to `SettingsModule.forRoot()`,
 * including default store, named store configs, prefix, per-group
 * overrides, and debounce settings.
 *
 * @module interfaces/settings-module-options
 *
 * @example
 * ```ts
 * SettingsModule.forRoot({
 *   default: 'local',
 *   prefix: 'mngo:settings',
 *   stores: {
 *     local: { driver: 'localStorage' },
 *     api: { driver: 'api', baseUrl: '/api/settings', fallbackStore: 'local' },
 *     memory: { driver: 'memory' },
 *   },
 *   groups: {
 *     display:  { store: 'local' },
 *     terminal: { store: 'api' },
 *   },
 *   debounce: true,
 *   debounceMs: 300,
 * })
 * ```
 */

import type { SettingsStoreConfig } from './settings-store-config.type';
import type { SettingsGroupOverride } from './settings-group-override.interface';

// Re-export all types that were previously in this file for backwards compatibility
export type { BuiltInSettingsDriver, SettingsDriverName } from './settings-driver.type';
export type { BaseStoreConfig } from './base-store-config.interface';
export type { LocalStorageStoreConfig } from './local-storage-store-config.interface';
export type { ApiStoreConfig } from './api-store-config.interface';
export type { MemoryStoreConfig } from './memory-store-config.interface';
export type { SettingsStoreConfig } from './settings-store-config.type';
export type { SettingsGroupOverride } from './settings-group-override.interface';

/**
 * Root module configuration.
 *
 * Mirrors the cache package's `CacheModuleOptions` pattern:
 * `default` + `stores` + optional per-entity overrides.
 */
export interface SettingsModuleOptions {
  /**
   * Default store name.
   * Must match a key in `stores`.
   * @default 'local'
   */
  default?: string;

  /**
   * Named store configurations.
   * Each key is a store name, each value configures a driver.
   *
   * @default { local: { driver: 'localStorage' } }
   */
  stores?: Record<string, SettingsStoreConfig>;

  /**
   * Global key prefix for localStorage stores.
   * Each group is stored under `{prefix}:{groupKey}`.
   * @default 'app:settings'
   */
  prefix?: string;

  /**
   * Per-group store overrides.
   * Keys are group keys (e.g. 'display', 'terminal').
   */
  groups?: Record<string, SettingsGroupOverride>;

  /**
   * Debounce persistence writes.
   * @default true
   */
  debounce?: boolean;

  /**
   * Debounce delay in ms.
   * @default 300
   */
  debounceMs?: number;
}
