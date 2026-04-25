/**
 * Cache Service (Repository)
 *
 * The high-level API that consumers interact with. Wraps a low-level {@link Store}
 * and provides convenience methods: get, put, remember, tags, etc.
 *
 * This class is NOT injectable — it's created internally by {@link CacheManager.store}.
 * Each named store gets its own CacheService instance, which is cached and reused
 * on subsequent calls.
 *
 * ## Design
 *
 * CacheService follows the Repository pattern: it sits between the consumer
 * and the raw Store, adding higher-level operations (remember, pull, add)
 * that the Store interface doesn't define.
 *
 * ```
 * Consumer  →  CacheService  →  Store (MemoryStore | RedisStore | NullStore)
 * ```
 *
 * @module services/cache
 */

import type { Store, TaggableStore, TaggedCache } from '@/interfaces';

/**
 * CacheService — the consumer-facing cache API.
 *
 * Created by `CacheManager.store(name)`. Wraps a low-level Store
 * with a rich API including remember(), tags(), pull(), etc.
 *
 * @example
 * ```typescript
 * const cache = manager.store('redis');
 *
 * // Basic get/put
 * await cache.put('key', 'value', 3600);
 * const value = await cache.get('key');
 *
 * // Remember pattern (cache-aside)
 * const user = await cache.remember('user:1', 3600, () => fetchUser(1));
 *
 * // Tag-based invalidation (Redis only)
 * const tagged = await cache.tags(['users']);
 * await tagged.flush();
 * ```
 */
export class CacheService {
  /**
   * Create a new CacheService wrapping a store.
   *
   * @param _store - The underlying low-level cache store implementation
   * @param _defaultTtl - Default time-to-live in seconds, used when no TTL
   *   is explicitly provided to put/putMany/add operations (default: 300s / 5 min)
   */
  constructor(
    private readonly _store: Store,
    private _defaultTtl: number = 300
  ) {}

  // ── Read ────────────────────────────────────────────────────────────────

  /**
   * Check if a key exists in the cache.
   *
   * Performs a get operation and checks for null/undefined.
   * Note: a cached value of `false`, `0`, or `""` will return `true`.
   *
   * @param key - The cache key to check
   * @returns `true` if the key exists and has a non-null/undefined value
   *
   * @example
   * ```typescript
   * if (await cache.has('user:1')) {
   *   console.log('User is cached');
   * }
   * ```
   */
  async has(key: string): Promise<boolean> {
    const value = await this._store.get(key);
    return value !== undefined && value !== null;
  }

  /**
   * Retrieve a value from the cache.
   *
   * Returns the cached value if found, otherwise returns the optional
   * default value (or `undefined` if no default is provided).
   *
   * @typeParam T - Expected type of the cached value
   * @param key - The cache key to retrieve
   * @param defaultValue - Optional fallback value if the key is not found
   * @returns The cached value, or `defaultValue`, or `undefined`
   *
   * @example
   * ```typescript
   * const user = await cache.get<User>('user:1');
   * const theme = await cache.get('theme', 'light'); // 'light' if not cached
   * ```
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this._store.get(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Retrieve multiple values from the cache in a single call.
   *
   * Returns an object mapping each key to its cached value.
   * Missing keys will have `undefined` as their value.
   *
   * @typeParam T - Expected type of the cached values
   * @param keys - Array of cache keys to retrieve
   * @returns Object mapping keys to their cached values
   *
   * @example
   * ```typescript
   * const results = await cache.many<User>(['user:1', 'user:2', 'user:3']);
   * // { 'user:1': User, 'user:2': undefined, 'user:3': User }
   * ```
   */
  async many<T = any>(keys: string[]): Promise<Record<string, T>> {
    return this._store.many(keys);
  }

  // ── Write ───────────────────────────────────────────────────────────────

  /**
   * Store a value in the cache.
   *
   * If no TTL is provided, the service's default TTL is used.
   *
   * @typeParam T - Type of the value being cached
   * @param key - The cache key
   * @param value - The value to store
   * @param ttl - Time-to-live in seconds (optional, uses default TTL if omitted)
   * @returns `true` if the value was stored successfully
   *
   * @example
   * ```typescript
   * await cache.put('user:1', { name: 'John' }, 3600); // 1 hour
   * await cache.put('temp', 'data'); // uses default TTL
   * ```
   */
  async put<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this._store.put(key, value, ttl ?? this._defaultTtl);
  }

  /**
   * Store multiple key-value pairs in the cache.
   *
   * All entries share the same TTL. If no TTL is provided,
   * the service's default TTL is used.
   *
   * @typeParam T - Type of the values being cached
   * @param values - Object mapping keys to values
   * @param ttl - Time-to-live in seconds (optional, uses default TTL if omitted)
   * @returns `true` if all values were stored successfully
   *
   * @example
   * ```typescript
   * await cache.putMany({
   *   'user:1': { name: 'Alice' },
   *   'user:2': { name: 'Bob' },
   * }, 3600);
   * ```
   */
  async putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<boolean> {
    return this._store.putMany(values, ttl ?? this._defaultTtl);
  }

  /**
   * Store a value only if the key does not already exist.
   *
   * This is an atomic "set if not exists" operation. Useful for
   * preventing overwrites of existing cached data.
   *
   * @typeParam T - Type of the value being cached
   * @param key - The cache key
   * @param value - The value to store
   * @param ttl - Time-to-live in seconds (optional, uses default TTL if omitted)
   * @returns `true` if the value was stored (key didn't exist), `false` otherwise
   *
   * @example
   * ```typescript
   * const added = await cache.add('lock:resource', true, 30);
   * if (!added) {
   *   console.log('Resource is already locked');
   * }
   * ```
   */
  async add<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    // Check existence first — if key already exists, bail out
    if (await this.has(key)) return false;
    return this.put(key, value, ttl);
  }

  /**
   * Store a value in the cache indefinitely (no expiration).
   *
   * The value will persist until explicitly removed via `forget()` or `flush()`.
   * For Redis, this uses a very large TTL (10 years) rather than true persistence.
   *
   * @typeParam T - Type of the value being cached
   * @param key - The cache key
   * @param value - The value to store
   * @returns `true` if the value was stored successfully
   *
   * @example
   * ```typescript
   * await cache.forever('config:app', { theme: 'dark', lang: 'en' });
   * ```
   */
  async forever<T = any>(key: string, value: T): Promise<boolean> {
    return this._store.forever(key, value);
  }

  // ── Counters ────────────────────────────────────────────────────────────

  /**
   * Increment a numeric value in the cache.
   *
   * If the key doesn't exist, behavior depends on the store:
   * - MemoryStore: initializes to 0, then increments
   * - RedisStore: uses native INCR/INCRBY (initializes to 0)
   * - NullStore: returns 0 (no-op)
   *
   * @param key - The cache key holding a numeric value
   * @param value - Amount to increment by (default: 1)
   * @returns The new value after incrementing, or 0 on failure
   *
   * @example
   * ```typescript
   * await cache.increment('page:views');        // 1
   * await cache.increment('page:views', 5);     // 6
   * ```
   */
  async increment(key: string, value: number = 1): Promise<number> {
    const result = await this._store.increment(key, value);
    // Store.increment can return `false` on failure — normalize to 0
    return typeof result === 'number' ? result : 0;
  }

  /**
   * Decrement a numeric value in the cache.
   *
   * If the key doesn't exist, behavior depends on the store:
   * - MemoryStore: initializes to 0, then decrements (goes negative)
   * - RedisStore: uses native DECR/DECRBY (initializes to 0)
   * - NullStore: returns 0 (no-op)
   *
   * @param key - The cache key holding a numeric value
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value after decrementing, or 0 on failure
   *
   * @example
   * ```typescript
   * await cache.decrement('stock:item:42');      // -1
   * await cache.decrement('stock:item:42', 10);  // -11
   * ```
   */
  async decrement(key: string, value: number = 1): Promise<number> {
    const result = await this._store.decrement(key, value);
    // Store.decrement can return `false` on failure — normalize to 0
    return typeof result === 'number' ? result : 0;
  }

  // ── Remember ────────────────────────────────────────────────────────────

  /**
   * Get a value from cache, or execute a callback and store the result.
   *
   * This is the "cache-aside" pattern (also known as "lazy loading"):
   * 1. Check if the key exists in cache
   * 2. If found, return the cached value
   * 3. If not found, execute the callback, store the result, and return it
   *
   * This is the most commonly used method for caching expensive operations.
   *
   * @typeParam T - Type of the cached/computed value
   * @param key - The cache key
   * @param ttl - Time-to-live in seconds for the cached result
   * @param cb - Callback to execute on cache miss (can be sync or async)
   * @returns The cached or freshly computed value
   *
   * @example
   * ```typescript
   * // Cache database query for 1 hour
   * const user = await cache.remember('user:1', 3600, async () => {
   *   return await db.users.findById(1);
   * });
   *
   * // Cache API response for 5 minutes
   * const weather = await cache.remember('weather:nyc', 300, () =>
   *   fetch('https://api.weather.com/nyc').then(r => r.json())
   * );
   * ```
   */
  async remember<T = any>(key: string, ttl: number, cb: () => Promise<T> | T): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    // Cache miss — execute callback, store result, and return
    const value = await cb();
    await this.put(key, value, ttl);
    return value;
  }

  /**
   * Get a value from cache, or execute a callback and store the result forever.
   *
   * Same as {@link remember}, but the cached value never expires.
   * Useful for data that rarely changes (e.g., configuration, static lookups).
   *
   * @typeParam T - Type of the cached/computed value
   * @param key - The cache key
   * @param cb - Callback to execute on cache miss (can be sync or async)
   * @returns The cached or freshly computed value
   *
   * @example
   * ```typescript
   * const countries = await cache.rememberForever('countries:all', async () => {
   *   return await db.countries.findAll();
   * });
   * ```
   */
  async rememberForever<T = any>(key: string, cb: () => Promise<T> | T): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    // Cache miss — execute callback, store forever, and return
    const value = await cb();
    await this.forever(key, value);
    return value;
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  /**
   * Get a value from cache and then remove it.
   *
   * Atomically retrieves and deletes the cached value.
   * Useful for one-time tokens, nonces, or queue-like patterns.
   *
   * @typeParam T - Expected type of the cached value
   * @param key - The cache key
   * @param defaultValue - Optional fallback if the key doesn't exist
   * @returns The cached value (or default), then removes the key
   *
   * @example
   * ```typescript
   * // One-time verification token
   * const token = await cache.pull<string>('verify:abc123');
   * if (token) {
   *   // Token is now removed from cache — can't be used again
   *   await verifyEmail(token);
   * }
   * ```
   */
  async pull<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.get<T>(key, defaultValue);
    // Always attempt to forget, even if value was the default
    await this.forget(key);
    return value;
  }

  /**
   * Remove a single item from the cache.
   *
   * @param key - The cache key to remove
   * @returns `true` if the item was removed (or didn't exist)
   *
   * @example
   * ```typescript
   * await cache.forget('user:1');
   * ```
   */
  async forget(key: string): Promise<boolean> {
    return this._store.forget(key);
  }

  /**
   * Remove all items from the cache store.
   *
   * **Warning:** This clears the entire store, not just keys created
   * by this application. Use with caution in shared environments.
   *
   * @returns `true` if the store was flushed successfully
   *
   * @example
   * ```typescript
   * await cache.flush(); // Clears everything in this store
   * ```
   */
  async flush(): Promise<boolean> {
    return this._store.flush();
  }

  // ── Tags ────────────────────────────────────────────────────────────────

  /**
   * Begin a tagged cache operation.
   *
   * Returns a {@link TaggedCache} instance that scopes all operations
   * to the given tags. Only supported by stores that implement
   * {@link TaggableStore} (currently only RedisStore).
   *
   * Tagged cache keys are automatically prefixed with tag namespaces.
   * When tags are flushed, their namespaces change, making all
   * previously tagged keys inaccessible.
   *
   * @param names - Array of tag names to scope operations to
   * @returns A TaggedCache instance for tag-scoped operations
   * @throws Error if the underlying store does not support tagging
   *
   * @example
   * ```typescript
   * // Store data with tags
   * const tagged = await cache.tags(['users', 'premium']);
   * await tagged.put('user:1', userData, 3600);
   *
   * // Flush all entries tagged with 'users'
   * const userTagged = await cache.tags(['users']);
   * await userTagged.flush();
   * ```
   */
  async tags(names: string[]): Promise<TaggedCache> {
    const s = this._store;

    // Runtime check: only TaggableStore implementations support tags
    if (!('tags' in s && typeof (s as any).tags === 'function')) {
      throw new Error(`Store [${s.constructor.name}] does not support tagging.`);
    }

    return (s as TaggableStore).tags(names);
  }

  // ── Accessors ───────────────────────────────────────────────────────────

  /**
   * Get the cache key prefix for the underlying store.
   *
   * The prefix is a combination of the global prefix and the store-specific prefix.
   *
   * @returns The full prefix string (e.g., "app_cache_")
   */
  getPrefix(): string {
    return this._store.getPrefix();
  }

  /**
   * Get the underlying low-level store instance.
   *
   * Useful for advanced operations or store-specific features
   * not exposed by CacheService.
   *
   * @returns The raw Store instance (MemoryStore, RedisStore, or NullStore)
   */
  getStore(): Store {
    return this._store;
  }

  /**
   * Get the current default TTL in seconds.
   *
   * @returns The default TTL used when no explicit TTL is provided
   */
  getDefaultTtl(): number {
    return this._defaultTtl;
  }

  /**
   * Set the default TTL for this service instance.
   *
   * Affects all subsequent put/putMany/add calls that don't specify a TTL.
   * Returns `this` for method chaining.
   *
   * @param seconds - New default TTL in seconds
   * @returns This CacheService instance (for chaining)
   *
   * @example
   * ```typescript
   * cache.setTtl(7200).put('key', 'value'); // Uses 2-hour TTL
   * ```
   */
  setTtl(seconds: number): this {
    this._defaultTtl = seconds;
    return this;
  }
}
