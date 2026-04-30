/**
 * Cache Manager
 *
 * The central orchestrator for the cache system. Manages multiple named
 * cache stores using the `MultipleInstanceManager` pattern.
 *
 * Each store is lazily created on first access, cached internally, and
 * reused on subsequent calls. The manager creates low-level `Store`
 * instances (memory, redis, null) and wraps them in `CacheService`
 * instances that provide the high-level API (remember, tags, etc.).
 *
 * ## Architecture
 *
 * ```
 * CacheManager (this class)
 *   ├── extends MultipleInstanceManager<Store>
 *   ├── creates Store instances (MemoryStore, RedisStore, NullStore)
 *   └── wraps them in CacheService (the consumer-facing API)
 * ```
 *
 * ## Lifecycle
 *
 * - `OnModuleInit` — eagerly creates the default store
 * - `OnModuleDestroy` — flushes all stores and releases resources
 *
 * @module services/cache-manager
 */

import {
  Injectable,
  Inject,
  Optional,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@stackra/ts-container';
import { MultipleInstanceManager } from '@stackra/ts-support';
import { REDIS_MANAGER, type IRedisService } from '@stackra/ts-redis';

import type { StoreConfig } from '@/types';
import { CacheService } from './cache.service';
import { NullStore } from '@/stores/null.store';
import { RedisStore } from '@/stores/redis.store';
import { MemoryStore } from '@/stores/memory.store';
import { CACHE_CONFIG } from '@/constants/tokens.constant';
import type { Store, CacheModuleOptions } from '@/interfaces';

/**
 * CacheManager — creates and manages multiple named cache stores.
 *
 * @example
 * ```typescript
 * const cache = manager.store();
 * await cache.remember('key', 3600, () => fetchData());
 *
 * const redis = manager.store('redis');
 * await redis.tags(['users']).flush();
 *
 * manager.extend('custom', (config) => new MyStore(config));
 * ```
 */
@Injectable()
export class CacheManager
  extends MultipleInstanceManager<Store>
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Cached CacheService wrappers, keyed by store name.
   * Separate from the base class's Store cache — this caches
   * the high-level CacheService wrappers.
   */
  private readonly services: Map<string, CacheService> = new Map();

  /**
   * @param config - Cache module configuration (default store, stores, prefix)
   * @param redisService - Optional RedisManager for Redis-backed stores.
   *   Injected automatically if RedisModule.forRoot() is imported.
   */
  constructor(
    @Inject(CACHE_CONFIG) private readonly config: CacheModuleOptions,
    @Optional() @Inject(REDIS_MANAGER) private readonly redisService?: IRedisService
  ) {
    super();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Called after all providers are instantiated.
   * Eagerly creates the default store to catch config errors early.
   * If the default store requires Redis and it's not available,
   * logs a warning instead of crashing.
   */
  onModuleInit(): void {
    try {
      this.store();
    } catch (err) {
      console.warn(
        `[CacheManager] Failed to create default store '${this.config.default}':`,
        (err as Error).message
      );
    }
  }

  /**
   * Called on `app.close()`.
   * Flushes all stores and clears internal caches.
   * Errors during flush are silently ignored.
   */
  async onModuleDestroy(): Promise<void> {
    for (const [, service] of this.services) {
      try {
        await service.flush();
      } catch {
        /* ignore */
      }
    }
    this.services.clear();
    this.purge();
  }

  // ── MultipleInstanceManager contract ────────────────────────────────────

  /**
   * Get the default store name from configuration.
   *
   * Required by the `MultipleInstanceManager` base class to know
   * which instance to return when no name is specified.
   *
   * @returns The default store name (e.g., "memory", "redis")
   */
  getDefaultInstance(): string {
    return this.config.default;
  }

  /**
   * Change the default store at runtime.
   *
   * Subsequent calls to `store()` without a name argument will
   * resolve to the new default. Does not affect already-resolved
   * CacheService instances.
   *
   * @param name - The new default store name (must exist in config)
   */
  setDefaultInstance(name: string): void {
    (this.config as any).default = name;
  }

  /**
   * Get the raw configuration object for a named store.
   *
   * Required by the `MultipleInstanceManager` base class to pass
   * configuration into `createDriver()`. The returned object must
   * include a `driver` field (`'memory'`, `'redis'`, or `'null'`).
   *
   * @param name - Store name to look up
   * @returns The store configuration, or `undefined` if not found
   */
  getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.config.stores[name];
  }

  /**
   * Create a store driver instance.
   *
   * Called by the base class when a store is requested for the first time.
   * Dispatches to MemoryStore, RedisStore, or NullStore based on the
   * `driver` field in the config.
   *
   * @param driver - Driver name ('memory', 'redis', 'null')
   * @param config - Raw store configuration
   * @returns A new Store instance
   * @throws Error if the driver is not supported
   */
  protected createDriver(driver: string, config: Record<string, any>): Store {
    const storeConfig = config as StoreConfig;
    const prefix = this.buildPrefix(storeConfig);

    switch (driver) {
      case 'memory':
        return new MemoryStore({
          ttl: storeConfig.ttl,
          maxSize: (storeConfig as any).maxSize,
          prefix,
        });
      case 'redis':
        return this.createRedisStore(storeConfig, prefix);
      case 'null':
        return new NullStore({ prefix });
      default:
        throw new Error(`Cache driver [${driver}] is not supported.`);
    }
  }

  // ── Store access ────────────────────────────────────────────────────────

  /**
   * Get a CacheService for a named store.
   *
   * The primary consumer API. Returns a CacheService wrapping the
   * underlying Store with get, put, remember, tags, etc.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Store name. Uses default if omitted.
   */
  store(name?: string): CacheService {
    const storeName = name ?? this.config.default;

    const existing = this.services.get(storeName);
    if (existing) return existing;

    const storeInstance = this.instance(storeName);
    const storeConfig = this.config.stores[storeName];
    const service = new CacheService(storeInstance, storeConfig?.ttl ?? 300);

    this.services.set(storeName, service);
    return service;
  }

  // ── Introspection ───────────────────────────────────────────────────────

  /**
   * Get the default driver/store name.
   *
   * Convenience alias — equivalent to reading `config.default` directly.
   *
   * @returns The default store name (e.g., "memory", "redis")
   */
  getDefaultDriver(): string {
    return this.config.default;
  }

  /**
   * Get all configured store names.
   *
   * Returns names from the configuration object, not just stores
   * that have been instantiated. Useful for introspection and
   * building admin UIs.
   *
   * @returns Array of store names (e.g., ["memory", "redis", "null"])
   */
  getStoreNames(): string[] {
    return Object.keys(this.config.stores);
  }

  /**
   * Check if a store is configured.
   *
   * Tests whether the given name exists as a key in the
   * `stores` configuration object.
   *
   * @param name - Store name to check
   * @returns `true` if the store exists in the configuration
   */
  hasStore(name: string): boolean {
    return name in this.config.stores;
  }

  /**
   * Get the global cache key prefix.
   *
   * This prefix is combined with each store's own prefix to form
   * the full key prefix (e.g., global `"app_"` + store `"cache_"` = `"app_cache_"`).
   *
   * @returns The global prefix string, or empty string if not configured
   */
  getGlobalPrefix(): string {
    return this.config.prefix ?? '';
  }

  // ── Cache management ────────────────────────────────────────────────────

  /**
   * Forget a cached store and its CacheService wrapper.
   * Forces re-creation on next `store()` call.
   *
   * @param name - Store name(s). Uses default if omitted.
   */
  forgetStore(name?: string | string[]): this {
    const names = name ? (Array.isArray(name) ? name : [name]) : [this.config.default];
    for (const n of names) {
      this.services.delete(n);
    }
    return this.forgetInstance(name);
  }

  /**
   * Clear all cached stores and CacheService wrappers.
   *
   * Removes every resolved Store and CacheService from internal caches,
   * forcing full re-creation on next access. Extends the base class
   * `purge()` to also clear the services map.
   */
  override purge(): void {
    this.services.clear();
    super.purge();
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Create a Redis-backed cache store.
   * Requires RedisModule.forRoot() to be imported before CacheModule.forRoot().
   *
   * @param config - Store config (must have `connection` field)
   * @param prefix - Computed cache key prefix
   * @throws Error if RedisManager is not available
   */
  private createRedisStore(config: StoreConfig, prefix: string): RedisStore {
    if (!this.redisService) {
      throw new Error(
        'Redis cache driver requires @stackra/ts-redis.\n' +
          'Import RedisModule.forRoot() before CacheModule.forRoot().'
      );
    }
    return new RedisStore(this.redisService, prefix, (config as any).connection ?? 'default');
  }

  /**
   * Build the full cache key prefix for a store.
   * Combines global prefix + store-specific prefix.
   * Example: 'app_' + 'cache_' = 'app_cache_'
   */
  private buildPrefix(config: StoreConfig): string {
    return (this.config.prefix ?? '') + (config.prefix ?? '');
  }
}
