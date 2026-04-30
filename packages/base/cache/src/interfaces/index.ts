/**
 * Cache Interfaces Barrel Export
 *
 * All interface and type definitions for the cache package.
 * These define the contracts that stores, services, and hooks must follow.
 *
 * ## Interface Hierarchy
 *
 * ```
 * Store (base contract for all cache stores)
 *   └── TaggableStore (extends Store with tagging support)
 *
 * TagSet (manages tag namespaces for invalidation)
 * TaggedCache (cache operations scoped to tags)
 *
 * CacheModuleOptions (top-level DI configuration)
 *   └── StoreConfig = MemoryStoreConfig | RedisStoreConfig | NullStoreConfig
 *
 * CacheServiceInterface (full cache service contract)
 *
 * UseCachedQueryOptions (React hook input)
 * UseCachedQueryResult (React hook output)
 * ```
 *
 * @module interfaces
 */

/** Top-level cache module configuration (stores, default, prefix) */
export type { CacheModuleOptions } from './cache-module-options.interface';

/** In-memory store configuration (maxSize, ttl, prefix) */
export type { MemoryStoreConfig } from './memory-store-config.interface';

/** Redis-backed store configuration (connection, ttl, prefix) */
export type { RedisStoreConfig } from './redis-store-config.interface';

/** No-op store configuration (prefix, ttl) */
export type { NullStoreConfig } from './null-store-config.interface';

/** Base contract for all cache store implementations */
export type { Store } from './store.interface';

/** Extended store contract with tagging support (Redis only) */
export type { TaggableStore } from './taggable-store.interface';

/** Tag namespace management contract */
export type { TagSet } from './tag-set.interface';

/** Tag-scoped cache operations contract */
export type { TaggedCache } from './tagged-cache.interface';

/** Configuration options for the useCachedQuery React hook */
export type { UseCachedQueryOptions } from './use-cached-query-options.interface';

/** Return type of the useCachedQuery React hook */
export type { UseCachedQueryResult } from './use-cached-query-result.interface';

/** Full cache service contract (manager + store operations) */
export type { CacheServiceInterface } from './cache-service.interface';

/** Cache entry structure for memory store TTL tracking */
export type { CacheEntry } from './cache-entry.interface';
