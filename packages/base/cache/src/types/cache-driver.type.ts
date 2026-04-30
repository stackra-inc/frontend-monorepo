/**
 * Cache Driver Type
 *
 * Union type representing the built-in cache driver identifiers.
 * Used in store configurations to specify which backend to use.
 *
 * - `'memory'` — In-memory cache using JavaScript Map. Fast, no dependencies,
 *   but data is lost on process restart. Best for development, testing,
 *   or client-side caching.
 *
 * - `'redis'` — Redis-backed cache via `@stackra/ts-redis`. Persistent,
 *   shared across processes, supports tagging. Requires a Redis connection.
 *
 * - `'null'` — No-op cache that doesn't store anything. All writes succeed
 *   silently, all reads return undefined. Useful for testing, benchmarking,
 *   or temporarily disabling cache via feature flags.
 *
 * Custom drivers can be registered at runtime via `CacheManager.extend()`,
 * but this type only covers the built-in drivers.
 *
 * @module types/cache-driver
 *
 * @example
 * ```typescript
 * const driver: CacheDriver = 'redis';
 *
 * // Used in store configuration
 * const config = {
 *   driver: 'memory' satisfies CacheDriver,
 *   maxSize: 1000,
 * };
 * ```
 */
export type CacheDriver = 'memory' | 'redis' | 'null';
