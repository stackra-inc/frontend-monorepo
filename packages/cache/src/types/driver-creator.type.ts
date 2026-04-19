/**
 * Driver Creator Type
 *
 * Factory function signature for creating custom driver instances from
 * configuration objects. Used by {@link CacheManager} (via
 * `MultipleInstanceManager.extend()`) to register custom cache drivers
 * at runtime.
 *
 * When you call `manager.extend('custom', creator)`, the creator function
 * is stored and invoked lazily when `manager.store('custom')` is first called.
 *
 * @typeParam T - The type of instance the creator produces (defaults to `any`).
 *   For cache drivers, this should be a {@link Store} implementation.
 *
 * @param config - The raw configuration object for the store, as defined
 *   in `CacheModuleOptions.stores[name]`
 * @param prefix - Optional computed cache key prefix (global + store-specific)
 * @returns A new driver instance
 *
 * @module types/driver-creator
 *
 * @example
 * ```typescript
 * import type { DriverCreator } from '@stackra/ts-cache';
 * import type { Store } from '@stackra/ts-cache';
 *
 * // Define a custom driver creator
 * const createDynamoStore: DriverCreator<Store> = (config, prefix) => {
 *   return new DynamoDBStore({
 *     tableName: config.tableName,
 *     region: config.region,
 *     prefix: prefix ?? '',
 *   });
 * };
 *
 * // Register with the cache manager
 * manager.extend('dynamodb', createDynamoStore);
 *
 * // Now you can use it
 * const cache = manager.store('dynamodb');
 * ```
 */
export type DriverCreator<T = any> = (config: Record<string, any>, prefix?: string) => T;
