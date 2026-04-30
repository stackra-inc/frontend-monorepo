/**
 * Cache Configuration
 *
 * Configuration for the @stackra/ts-cache package.
 * Defines cache stores, drivers, and TTL settings.
 * Pure data config — no instances, no connections.
 * Redis connections are resolved at runtime by the RedisFactory
 * registered in the DI container.
 *
 * ## Environment Variables
 *
 * | Variable                        | Description                    | Default     |
 * |---------------------------------|--------------------------------|-------------|
 * | `VITE_CACHE_DRIVER`             | Default cache store name       | `'memory'`  |
 * | `VITE_CACHE_MEMORY_MAX_SIZE`    | Max items in memory store      | `100`       |
 * | `VITE_CACHE_MEMORY_TTL`         | Memory store TTL (seconds)     | `300`       |
 * | `VITE_REDIS_CACHE_CONNECTION`   | Redis connection name for cache| `'cache'`   |
 * | `VITE_CACHE_REDIS_PREFIX`       | Redis cache key prefix         | `'cache_'`  |
 * | `VITE_CACHE_REDIS_TTL`          | Redis cache TTL (seconds)      | `3600`      |
 * | `VITE_REDIS_SESSION_CONNECTION` | Redis connection for sessions  | `'session'` |
 * | `VITE_CACHE_SESSION_TTL`        | Session store TTL (seconds)    | `86400`     |
 * | `VITE_CACHE_PREFIX`             | Global key prefix for all stores | `'app_'`  |
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import cacheConfig from '@/config/cache.config';
 *
 * @Module({
 *   imports: [CacheModule.forRoot(cacheConfig)],
 * })
 * export class AppModule {}
 * ```
 *
 * @module config/cache
 */

import { defineConfig } from "@stackra/ts-cache";

/**
 * Cache configuration.
 *
 * @example
 * ```typescript
 * import { CacheFacade } from '@stackra/ts-cache';
 *
 * const cache = CacheFacade.store();        // default (memory)
 * const redis = CacheFacade.store('redis'); // redis store
 *
 * await cache.put('key', 'value', 300);
 * const value = await cache.get('key');
 * ```
 */
const cacheConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Store
  |--------------------------------------------------------------------------
  |
  | The name of the default cache store. Must match a key in `stores`.
  | Switch at runtime via the VITE_CACHE_DRIVER environment variable.
  |
  */
  default: env("VITE_CACHE_DRIVER", "memory"),

  /*
  |--------------------------------------------------------------------------
  | Cache Stores
  |--------------------------------------------------------------------------
  |
  | Named store configurations. Each store has a `driver` field that
  | determines the backing implementation.
  |
  | Drivers:
  |   - 'memory' : In-memory Map. Fast, no dependencies. Lost on refresh.
  |   - 'redis'  : Upstash Redis via @stackra/ts-redis.
  |   - 'null'   : No-op store for testing.
  |
  */
  stores: {
    /**
     * In-memory cache. Fast, no dependencies. Lost on refresh.
     * @default driver: 'memory'
     */
    memory: {
      driver: "memory",

      /**
       * Maximum number of items to store.
       * @default 100
       */
      maxSize: env("VITE_CACHE_MEMORY_MAX_SIZE", 100),

      /**
       * Default TTL in seconds.
       * @default 300
       */
      ttl: env("VITE_CACHE_MEMORY_TTL", 300),

      /**
       * Key prefix for memory store entries.
       * @default 'mem_'
       */
      prefix: "mem_",
    },

    /**
     * Redis cache via Upstash.
     * The connection name "cache" is resolved by the RedisFactory
     * registered under REDIS_FACTORY in the DI container.
     */
    redis: {
      driver: "redis",

      /**
       * Redis connection name from redis.config.ts.
       * @default 'cache'
       */
      connection: env("VITE_REDIS_CACHE_CONNECTION", "cache"),

      /**
       * Key prefix for Redis cache entries.
       * @default 'cache_'
       */
      prefix: env("VITE_CACHE_REDIS_PREFIX", "cache_"),

      /**
       * Default TTL in seconds.
       * @default 3600
       */
      ttl: env("VITE_CACHE_REDIS_TTL", 3600),
    },

    /**
     * Session store — longer TTL, separate Redis connection.
     */
    session: {
      driver: "redis",

      /**
       * Redis connection name for sessions.
       * @default 'session'
       */
      connection: env("VITE_REDIS_SESSION_CONNECTION", "session"),

      /**
       * Key prefix for session entries.
       * @default 'sess_'
       */
      prefix: "sess_",

      /**
       * Session TTL in seconds (24 hours).
       * @default 86400
       */
      ttl: env("VITE_CACHE_SESSION_TTL", 86400),
    },

    /**
     * No-op cache for testing. All operations succeed but store nothing.
     */
    null: {
      driver: "null",
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Global Prefix
  |--------------------------------------------------------------------------
  |
  | A key prefix applied to all stores. Useful for namespacing cache
  | entries across multiple applications sharing the same Redis instance.
  |
  */
  prefix: env("VITE_CACHE_PREFIX", "app_"),
});

export default cacheConfig;
