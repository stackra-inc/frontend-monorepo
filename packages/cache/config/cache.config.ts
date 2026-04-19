/**
 * Cache Configuration
 *
 * Pure data configuration file — no instances, no connections.
 * Redis connections are resolved at runtime by the RedisFactory
 * registered in the DI container.
 *
 * This file follows the `defineConfig` pattern (like Vite, Vitest, etc.)
 * for type-safe configuration with IDE autocomplete.
 *
 * ## Environment Variables
 *
 * | Variable                        | Description                    | Default     |
 * |---------------------------------|--------------------------------|-------------|
 * | `VITE_CACHE_DRIVER`             | Default cache store name       | `'memory'`  |
 * | `VITE_CACHE_MEMORY_MAX_SIZE`    | Max entries in memory store    | `100`       |
 * | `VITE_CACHE_MEMORY_TTL`         | Memory store default TTL (s)   | `300`       |
 * | `VITE_REDIS_CACHE_CONNECTION`   | Redis connection name          | `'cache'`   |
 * | `VITE_CACHE_REDIS_PREFIX`       | Redis store key prefix         | `'cache_'`  |
 * | `VITE_CACHE_REDIS_TTL`          | Redis store default TTL (s)    | `3600`      |
 * | `VITE_REDIS_SESSION_CONNECTION` | Session Redis connection name  | `'session'` |
 * | `VITE_CACHE_SESSION_TTL`        | Session store default TTL (s)  | `86400`     |
 * | `VITE_CACHE_PREFIX`             | Global cache key prefix        | `'app_'`    |
 *
 * @module config/cache
 */

import { defineConfig } from '@stackra/ts-cache';

/**
 * Application cache configuration.
 *
 * Defines four stores:
 * - `memory` — Fast in-memory cache, lost on page refresh
 * - `redis` — Persistent Redis cache via Upstash
 * - `session` — Separate Redis connection for session data (longer TTL)
 * - `null` — No-op cache for testing
 */
const cacheConfig = defineConfig({
  /**
   * Default store name.
   *
   * Determines which store is used when no specific store is requested.
   * Can be overridden at runtime via the `VITE_CACHE_DRIVER` env var.
   */
  default: import.meta.env.VITE_CACHE_DRIVER || 'memory',

  stores: {
    /**
     * In-memory cache store.
     *
     * Uses JavaScript Map internally. Fast with zero dependencies,
     * but all data is lost on page refresh or process restart.
     * Best for development, client-side caching, or short-lived data.
     */
    memory: {
      driver: 'memory',
      maxSize: Number(import.meta.env.VITE_CACHE_MEMORY_MAX_SIZE) || 100,
      ttl: Number(import.meta.env.VITE_CACHE_MEMORY_TTL) || 300,
      prefix: 'mem_',
    },

    /**
     * Redis cache store (via Upstash).
     *
     * The `connection` name (e.g., "cache") is resolved at runtime
     * by the RedisFactory registered under `REDIS_FACTORY` in the
     * DI container. This keeps the config file free of connection details.
     */
    redis: {
      driver: 'redis',
      connection: import.meta.env.VITE_REDIS_CACHE_CONNECTION || 'cache',
      prefix: import.meta.env.VITE_CACHE_REDIS_PREFIX || 'cache_',
      ttl: Number(import.meta.env.VITE_CACHE_REDIS_TTL) || 3600,
    },

    /**
     * Session store — uses a separate Redis connection with a longer TTL.
     *
     * Keeping session data on a different Redis connection allows
     * independent scaling and isolation from the general cache.
     */
    session: {
      driver: 'redis',
      connection: import.meta.env.VITE_REDIS_SESSION_CONNECTION || 'session',
      prefix: 'sess_',
      ttl: Number(import.meta.env.VITE_CACHE_SESSION_TTL) || 86400,
    },

    /**
     * No-op cache store for testing.
     *
     * All writes succeed silently, all reads return undefined.
     * Useful for unit tests or temporarily disabling cache.
     */
    null: {
      driver: 'null',
    },
  },

  /**
   * Global key prefix applied to all stores.
   *
   * Combined with each store's own prefix to form the full key prefix.
   * For example: global "app_" + store "cache_" = "app_cache_user:123".
   */
  prefix: import.meta.env.VITE_CACHE_PREFIX || 'app_',
});

export default cacheConfig;
