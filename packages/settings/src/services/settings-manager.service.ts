/**
 * Settings Store Manager
 *
 * Extends `MultipleInstanceManager<SettingsStore>` from `@abdokouta/react-support`.
 * Same pattern as CacheManager — manages named store instances with lazy
 * initialization, caching, and extensibility via `extend()`.
 *
 * @module stores/settings-store-manager
 */

import { Injectable, Inject } from '@abdokouta/ts-container';
import { MultipleInstanceManager } from '@abdokouta/react-support';

import type { SettingsStore } from '@/interfaces/settings-store.interface';
import type { SettingsModuleOptions } from '@/interfaces/settings-module-options.interface';
import type { ApiStoreConfig } from '@/interfaces/api-store-config.interface';
import { LocalStorageStore } from '@/stores/local-storage.store';
import { MemoryStore } from '@/stores/memory.store';
import { ApiStore } from '@/stores/api.store';
import { SETTINGS_CONFIG } from '@/constants/tokens.constant';

/**
 * SettingsStoreManager — creates and manages named settings stores.
 *
 * Follows the exact same pattern as CacheManager:
 * - `store()` / `store('api')` — get a store by name
 * - `storeForGroup('terminal')` — get the store for a specific group
egister custom drivers
 *
 * @example
 * ```ts
 * const local = manager.store('local');
 * await local.save('display', { compact: true });
 *
 * const api = manager.store('api');
 * await api.load('terminal');
 *
 * manager.extend('indexeddb', (config) => new IndexedDBStore(config));
 * ```
 */
@Injectable()
export class SettingsStoreManager extends MultipleInstanceManager<SettingsStore> {
  constructor(@Inject(SETTINGS_CONFIG) private readonly config: SettingsModuleOptions) {
    super();
  }

  // ── MultipleInstanceManager contract ────────────────────────────────

  /** Get the default store name from config */
  getDefaultInstance(): string {
    return this.config.default ?? 'local';
  }

  /** Change the default store at runtime */
  setDefaultInstance(name: string): void {
    (this.config as any).default = name;
  }

  /** Get the configuration for a named store */
  getInstanceConfig(name: string): Record<string, any> | undefined {
    const stores = this.config.stores ?? { local: { driver: 'localStorage' } };
    return stores[name];
  }

  /**
   * Create a store driver instance.
   *
   * Called by the base class when a store is requested for the first time.
   * Dispatches to LocalStorageStore, ApiStore, or MemoryStore based on
   * the `driver` field in the config.
   *
   * @param driver - Driver name ('localStorage', 'api', 'memory')
   * @param config - Raw store configuration
   * @returns A new SettingsStore instance
   * @throws Error if the driver is not supported
   */
  protected createDriver(driver: string, config: Record<string, any>): SettingsStore {
    const prefix = this.config.prefix ?? 'app:settings';

    switch (driver) {
      case 'localStorage':
        return new LocalStorageStore(prefix);

      case 'memory':
        return new MemoryStore();

      case 'api': {
        const apiConfig = config as ApiStoreConfig;

        // Resolve fallback store if configured
        let fallback: SettingsStore | undefined;
        if (apiConfig.fallbackStore) {
          fallback = this.instance(apiConfig.fallbackStore);
        }

        return new ApiStore(apiConfig, fallback);
      }

      default:
        throw new Error(
          `[SettingsStoreManager] Unknown driver "${driver}". ` +
            `Use manager.extend('${driver}', factory) to register it.`
        );
    }
  }

  // ── Settings-specific API ───────────────────────────────────────────

  /**
   * Get a store by name. Alias for `instance()`.
   *
   * @param name - Store name. Uses default if omitted.
   */
  store(name?: string): SettingsStore {
    return this.instance(name);
  }

  /**
   * Get the store for a specific settings group.
   *
   * Checks per-group overrides first, then falls back to the default store.
   *
   * @param groupKey - The settings group key
   */
  storeForGroup(groupKey: string): SettingsStore {
    const storeName = this.config.groups?.[groupKey]?.store ?? this.config.default ?? 'local';
    return this.instance(storeName);
  }

  /** Get all configured store names */
  getStoreNames(): string[] {
    const stores = this.config.stores ?? { local: { driver: 'localStorage' } };
    return Object.keys(stores);
  }

  /** Check if a store is configured */
  hasStore(name: string): boolean {
    const stores = this.config.stores ?? {};
    return name in stores;
  }
}
