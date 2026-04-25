/**
 * Cache Service Interface
 *
 * Defines the full contract for cache service implementations.
 * This interface describes both the manager-level operations (store selection,
 * introspection) and the store-level operations (get, put, remember, etc.).
 *
 * All cache operations return Promises for consistency, even when the
 * underlying store is synchronous (e.g., MemoryStore).
 *
 * @module interfaces/cache-service
 */

import type { TaggedCache } from './tagged-cache.interface';

/**
 * Complete cache service interface.
 *
 * Combines manager-level capabilities (store switching, introspection)
 * with store-level cache operations (CRUD, counters, remember pattern).
 */
export interface CacheServiceInterface {
  // ── Manager-level operations ──────────────────────────────────────────

  /**
   * Get a cache store by name.
   *
   * Returns a CacheService instance configured for the specified store.
   * If no name is provided, returns the default store.
   *
   * @param name - Store name (uses default if not specified)
   * @returns CacheService instance for the specified store
   */
  store(name?: string): any; // Returns CacheService

  /**
   * Get the name of the default cache store.
   *
   * @returns Default store name as configured in CacheModuleOptions
   */
  getDefaultStoreName(): string;

  /**
   * Get all configured store names.
   *
   * Returns names from the configuration, not just stores that
   * have been instantiated.
   *
   * @returns Array of store names (e.g., ["memory", "redis", "null"])
   */
  getStoreNames(): string[];

  /**
   * Check if a store is configured (exists in the configuration).
   *
   * @param name - Store name to check
   * @returns `true` if the store exists in the configuration
   */
  hasStore(name: string): boolean;

  /**
   * Get the global cache key prefix.
   *
   * @returns The prefix string applied to all cache keys
   */
  getPrefix(): string;

  // ── Store-level read operations ───────────────────────────────────────

  /**
   * Check if a key exists in the cache.
   *
   * @param key - Cache key to check
   * @returns `true` if the key exists with a non-null/undefined value
   */
  has(key: string): Promise<boolean>;

  /**
   * Retrieve a value from the cache.
   *
   * @typeParam T - Expected type of the cached value
   * @param key - Cache key to retrieve
   * @param defaultValue - Optional fallback if the key is not found
   * @returns The cached value, or `defaultValue`, or `undefined`
   */
  get<T = any>(key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Retrieve multiple values from the cache in a single call.
   *
   * @typeParam T - Expected type of the cached values
   * @param keys - Array of cache keys to retrieve
   * @returns Object mapping keys to their cached values
   */
  many<T = any>(keys: string[]): Promise<Record<string, T>>;

  // ── Store-level write operations ──────────────────────────────────────

  /**
   * Store a value in the cache.
   *
   * @typeParam T - Type of the value being cached
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - Time-to-live in seconds (optional)
   * @returns `true` if stored successfully
   */
  put<T = any>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * Store multiple key-value pairs in the cache.
   *
   * @typeParam T - Type of the values being cached
   * @param values - Object mapping keys to values
   * @param ttl - Time-to-live in seconds (optional)
   * @returns `true` if all values were stored successfully
   */
  putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<boolean>;

  /**
   * Store a value only if the key does not already exist.
   *
   * @typeParam T - Type of the value being cached
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - Time-to-live in seconds (optional)
   * @returns `true` if stored (key didn't exist), `false` otherwise
   */
  add<T = any>(key: string, value: T, ttl?: number): Promise<boolean>;

  // ── Remember pattern ──────────────────────────────────────────────────

  /**
   * Get a value from cache, or execute a callback and store the result.
   *
   * @typeParam T - Type of the cached/computed value
   * @param key - Cache key
   * @param ttl - Time-to-live in seconds
   * @param callback - Function to execute on cache miss
   * @returns The cached or freshly computed value
   */
  remember<T = any>(key: string, ttl: number, callback: () => T | Promise<T>): Promise<T>;

  /**
   * Get a value from cache, or execute a callback and store the result forever.
   *
   * @typeParam T - Type of the cached/computed value
   * @param key - Cache key
   * @param callback - Function to execute on cache miss
   * @returns The cached or freshly computed value
   */
  rememberForever<T = any>(key: string, callback: () => T | Promise<T>): Promise<T>;

  // ── Counter operations ────────────────────────────────────────────────

  /**
   * Increment a numeric value in the cache.
   *
   * @param key - Cache key holding a numeric value
   * @param value - Amount to increment by (default: 1)
   * @returns The new value after incrementing
   */
  increment(key: string, value?: number): Promise<number>;

  /**
   * Decrement a numeric value in the cache.
   *
   * @param key - Cache key holding a numeric value
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value after decrementing
   */
  decrement(key: string, value?: number): Promise<number>;

  // ── Persistence operations ────────────────────────────────────────────

  /**
   * Store a value indefinitely (no expiration).
   *
   * @typeParam T - Type of the value being cached
   * @param key - Cache key
   * @param value - Value to store
   * @returns `true` if stored successfully
   */
  forever<T = any>(key: string, value: T): Promise<boolean>;

  // ── Delete operations ─────────────────────────────────────────────────

  /**
   * Get a value from cache and then remove it (atomic get-and-delete).
   *
   * @typeParam T - Expected type of the cached value
   * @param key - Cache key
   * @param defaultValue - Optional fallback if the key doesn't exist
   * @returns The cached value, then removes the key
   */
  pull<T = any>(key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Remove a single item from the cache.
   *
   * @param key - Cache key to remove
   * @returns `true` if the item was removed
   */
  forget(key: string): Promise<boolean>;

  /**
   * Remove all items from the cache store.
   *
   * @returns `true` if the store was flushed successfully
   */
  flush(): Promise<boolean>;

  // ── Tagging ───────────────────────────────────────────────────────────

  /**
   * Begin a tagged cache operation (Redis only).
   *
   * @param names - Array of tag names
   * @returns A TaggedCache instance for tag-scoped operations
   * @throws Error if the store does not support tagging
   */
  tags(names: string[]): Promise<TaggedCache>;
}
