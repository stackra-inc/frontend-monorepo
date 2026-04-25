/**
 * Store Configuration Union Type
 *
 * Discriminated union of all built-in store configuration interfaces.
 * The `driver` field acts as the discriminant, enabling TypeScript to
 * narrow the type based on which driver is specified.
 *
 * This type is used in {@link CacheModuleOptions.stores} to provide
 * type-safe configuration for each named store.
 *
 * @module types/store-config
 *
 * @example
 * ```typescript
 * // TypeScript narrows based on the 'driver' discriminant
 * function configureStore(config: StoreConfig) {
 *   switch (config.driver) {
 *     case 'memory':
 *       // config is narrowed to MemoryStoreConfig
 *       console.log(config.maxSize);
 *       break;
 *     case 'redis':
 *       // config is narrowed to RedisStoreConfig
 *       console.log(config.connection);
 *       break;
 *     case 'null':
 *       // config is narrowed to NullStoreConfig
 *       break;
 *   }
 * }
 * ```
 */

import type { MemoryStoreConfig } from '@/interfaces/memory-store-config.interface';
import type { RedisStoreConfig } from '@/interfaces/redis-store-config.interface';
import type { NullStoreConfig } from '@/interfaces/null-store-config.interface';

/**
 * Union of all built-in store configuration types.
 *
 * Discriminated by the `driver` field:
 * - `'memory'` → {@link MemoryStoreConfig}
 * - `'redis'` → {@link RedisStoreConfig}
 * - `'null'` → {@link NullStoreConfig}
 */
export type StoreConfig = MemoryStoreConfig | RedisStoreConfig | NullStoreConfig;
