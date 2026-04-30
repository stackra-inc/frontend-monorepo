/**
 * Redis Cache Store
 *
 * Redis-backed cache implementation using `@stackra/ts-redis` for connection
 * management. Supports all standard cache operations plus tagging via
 * {@link RedisTagSet} and {@link TaggedCache}.
 *
 * ## Connection Resolution
 *
 * The Redis connection is resolved lazily on first use from the injected
 * {@link IRedisService}. The connection name (e.g., "cache", "session")
 * maps to a connection configured in `RedisModule.forRoot()`.
 *
 * ## Serialization
 *
 * All values are JSON-serialized before storage and deserialized on retrieval.
 * This means:
 * - Primitives, plain objects, and arrays work out of the box
 * - Class instances lose their prototype chain (stored as plain objects)
 * - `undefined` values are stored as the string `"undefined"` — avoid this
 *
 * ## Tagging
 *
 * RedisStore implements {@link TaggableStore}, enabling tag-based cache
 * invalidation. Tags are managed by {@link RedisTagSet} using Redis
 * sorted sets for TTL tracking.
 *
 * @module stores/redis
 *
 * @example
 * ```typescript
 * const store = new RedisStore(redisService, 'cache_', 'cache');
 *
 * await store.put('user:1', { name: 'John' }, 3600);
 * const user = await store.get('user:1');
 *
 * // Tagging (Redis-only feature)
 * const tagged = await store.tags(['users']);
 * await tagged.put('user:1', user, 3600);
 * await tagged.flush(); // Invalidate all 'users' tagged entries
 * ```
 */

import type { RedisConnection, IRedisService } from '@stackra/ts-redis';

import { RedisTagSet } from '@/tags/redis-tag-set';
import type { TaggableStore, TaggedCache } from '@/interfaces';
import { TaggedCache as TaggedCacheImpl } from '@/tags/tagged-cache';

/**
 * Redis-backed cache store with tagging support.
 *
 * Implements both {@link Store} (via {@link TaggableStore}) for standard
 * cache operations and tagging for organized cache invalidation.
 */
export class RedisStore implements TaggableStore {
  /**
   * The Redis service used to resolve named connections.
   * Injected from the DI container via CacheManager.
   */
  private readonly redisService: IRedisService;

  /**
   * Cache key prefix applied to all keys stored by this instance.
   * Combines the global prefix and store-specific prefix
   * (e.g., "app_cache_").
   */
  private readonly prefix: string;

  /**
   * Named Redis connection identifier (e.g., "cache", "session", "default").
   * Resolved at runtime by the RedisService.
   */
  private readonly connectionName: string;

  /**
   * Lazily resolved Redis connection instance.
   * Cached after first resolution to avoid repeated lookups.
   */
  private _connection?: RedisConnection;

  /**
   * Create a new Redis cache store.
   *
   * @param redisService - The Redis service for resolving named connections
   * @param prefix - Cache key prefix (default: empty string)
   * @param connection - Named Redis connection to use (default: "default")
   */
  constructor(redisService: IRedisService, prefix: string = '', connection: string = 'default') {
    this.redisService = redisService;
    this.prefix = prefix;
    this.connectionName = connection;
  }

  /**
   * Resolve the Redis connection lazily and cache it.
   *
   * On first call, resolves the named connection from RedisService.
   * Subsequent calls return the cached connection instance.
   *
   * @returns The resolved Redis connection
   * @private
   */
  private async conn(): Promise<RedisConnection> {
    if (!this._connection) {
      this._connection = await this.redisService.connection(this.connectionName);
    }
    return this._connection!;
  }

  /**
   * Retrieve an item from the cache by key.
   *
   * Performs a Redis GET, then deserializes the JSON string.
   * Returns `undefined` if the key doesn't exist (Redis returns null).
   *
   * @param key - Cache key (prefix is applied automatically)
   * @returns The deserialized cached value, or `undefined` if not found
   */
  async get(key: string): Promise<any> {
    const c = await this.conn();
    const value = await c.get(this.prefix + key);

    // Redis returns null for missing keys — normalize to undefined
    return value === null ? undefined : this.deserialize(value);
  }

  /**
   * Retrieve multiple items from the cache in a single round-trip.
   *
   * Uses Redis MGET for efficient batch retrieval.
   * Missing keys will have `undefined` as their value in the result.
   *
   * @param keys - Array of cache keys
   * @returns Object mapping original keys to their deserialized values
   */
  async many(keys: string[]): Promise<Record<string, any>> {
    // Short-circuit for empty input
    if (keys.length === 0) return {};

    const c = await this.conn();

    // Apply prefix to all keys for the Redis MGET call
    const prefixed = keys.map((k) => this.prefix + k);
    const values = await c.mget(...prefixed);

    // Map Redis results back to original (unprefixed) keys
    const results: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k !== undefined) {
        results[k] = values[i] !== null ? this.deserialize(values[i]!) : undefined;
      }
    }
    return results;
  }

  /**
   * Store an item in the cache with a TTL.
   *
   * Uses Redis SET with EX (expiration in seconds).
   * The value is JSON-serialized before storage.
   *
   * @param key - Cache key (prefix is applied automatically)
   * @param value - Value to store (will be JSON-serialized)
   * @param seconds - Time-to-live in seconds
   * @returns `true` if Redis responded with "OK"
   */
  async put(key: string, value: any, seconds: number): Promise<boolean> {
    const c = await this.conn();
    const result = await c.set(this.prefix + key, this.serialize(value), { ex: seconds });
    return result === 'OK';
  }

  /**
   * Store multiple items in the cache with a shared TTL.
   *
   * Uses Redis MSET for the initial write, then applies TTL to each key
   * individually via SET with EX (Redis MSET doesn't support per-key TTL).
   *
   * @param values - Object mapping keys to values
   * @param seconds - Time-to-live in seconds for all entries
   * @returns `true` if all operations succeeded
   */
  async putMany(values: Record<string, any>, seconds: number): Promise<boolean> {
    // Short-circuit for empty input
    if (Object.keys(values).length === 0) return true;

    const c = await this.conn();

    // Serialize all values and apply key prefix
    const serialized: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      serialized[this.prefix + k] = this.serialize(v);
    }

    // Bulk write (no TTL support in MSET)
    await c.mset(serialized);

    // Apply TTL to each key individually
    // (Redis MSET doesn't support expiration, so we re-SET with EX)
    await Promise.all(
      Object.keys(values).map((k) => {
        const sv = serialized[this.prefix + k];
        return sv !== undefined ? c.set(this.prefix + k, sv, { ex: seconds }) : Promise.resolve();
      })
    );

    return true;
  }

  /**
   * Increment a numeric value stored in Redis.
   *
   * Uses native Redis INCR (for +1) or INCRBY (for other values).
   * If the key doesn't exist, Redis initializes it to 0 before incrementing.
   *
   * @param key - Cache key holding a numeric value
   * @param value - Amount to increment by (default: 1)
   * @returns The new value after incrementing
   */
  async increment(key: string, value: number = 1): Promise<number | boolean> {
    const c = await this.conn();
    // Use INCR for +1 (slightly more efficient), INCRBY for other values
    return value === 1 ? c.incr(this.prefix + key) : c.incrby(this.prefix + key, value);
  }

  /**
   * Decrement a numeric value stored in Redis.
   *
   * Uses native Redis DECR (for -1) or DECRBY (for other values).
   * If the key doesn't exist, Redis initializes it to 0 before decrementing.
   *
   * @param key - Cache key holding a numeric value
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value after decrementing
   */
  async decrement(key: string, value: number = 1): Promise<number | boolean> {
    const c = await this.conn();
    // Use DECR for -1 (slightly more efficient), DECRBY for other values
    return value === 1 ? c.decr(this.prefix + key) : c.decrby(this.prefix + key, value);
  }

  /**
   * Store an item indefinitely (effectively forever).
   *
   * Uses a 10-year TTL (315,360,000 seconds) rather than no expiration,
   * to avoid keys that can never be cleaned up by Redis's memory policies.
   *
   * @param key - Cache key
   * @param value - Value to store (will be JSON-serialized)
   * @returns `true` if Redis responded with "OK"
   */
  async forever(key: string, value: any): Promise<boolean> {
    const c = await this.conn();
    // 10 years in seconds — effectively forever, but still has an expiration
    const result = await c.set(this.prefix + key, this.serialize(value), { ex: 315360000 });
    return result === 'OK';
  }

  /**
   * Remove an item from the cache.
   *
   * Uses Redis DEL to remove the key.
   *
   * @param key - Cache key to remove
   * @returns `true` if the key existed and was removed
   */
  async forget(key: string): Promise<boolean> {
    const c = await this.conn();
    // DEL returns the number of keys removed (0 or 1 for a single key)
    return (await c.del(this.prefix + key)) > 0;
  }

  /**
   * Remove all items from the Redis database.
   *
   * **Warning:** This calls FLUSHDB, which removes ALL keys in the
   * current Redis database — not just keys with this store's prefix.
   * Use with extreme caution in shared environments.
   *
   * @returns `true` if Redis responded with "OK"
   */
  async flush(): Promise<boolean> {
    const c = await this.conn();
    return (await c.flushdb()) === 'OK';
  }

  /**
   * Get the cache key prefix for this store.
   *
   * @returns The prefix string (e.g., "app_cache_")
   */
  getPrefix(): string {
    return this.prefix;
  }

  /**
   * Begin a tagged cache operation.
   *
   * Creates a {@link RedisTagSet} for the given tag names and wraps
   * this store in a {@link TaggedCache} that scopes all operations
   * to those tags.
   *
   * @param names - Array of tag names (e.g., ["users", "premium"])
   * @returns A TaggedCache instance for tag-scoped operations
   *
   * @example
   * ```typescript
   * const tagged = await store.tags(['users', 'premium']);
   * await tagged.put('user:1', userData, 3600);
   * await tagged.flush(); // Invalidates all entries with these tags
   * ```
   */
  async tags(names: string[]): Promise<TaggedCache> {
    const c = await this.conn();
    const tagSet = new RedisTagSet(c, names);
    return new TaggedCacheImpl(this, tagSet);
  }

  /**
   * Serialize a value to a JSON string for Redis storage.
   *
   * @param value - Any JSON-serializable value
   * @returns JSON string representation
   * @private
   */
  private serialize(value: any): string {
    return JSON.stringify(value);
  }

  /**
   * Deserialize a JSON string from Redis back to its original value.
   *
   * Falls back to returning the raw string if JSON parsing fails
   * (e.g., for values stored by other applications).
   *
   * @param value - JSON string from Redis
   * @returns The deserialized value, or the raw string on parse failure
   * @private
   */
  private deserialize(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      // If JSON parsing fails, return the raw string
      return value;
    }
  }
}
