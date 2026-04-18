/**
 * Options for the useCachedQuery hook.
 *
 * Configures how the hook fetches, caches, and refreshes async query results.
 * Inspired by React Query's API but backed by the cache system.
 *
 * @typeParam T - The type of data returned by the query function
 *
 * @module interfaces/use-cached-query-options
 *
 * @example
 * ```typescript
 * const options: UseCachedQueryOptions<User> = {
 *   key: 'user:123',
 *   queryFn: () => fetch('/api/users/123').then(r => r.json()),
 *   ttl: 3600,
 *   storeName: 'redis',
 *   enabled: true,
 *   refetchOnMount: false,
 * };
 * ```
 */

export interface UseCachedQueryOptions<T> {
  /**
   * Unique cache key for this query.
   *
   * Used to store and retrieve the query result from the cache.
   * Should be unique across the application to avoid collisions.
   *
   * @example 'user:123', 'posts:list:page:1'
   */
  key: string;

  /**
   * Async function that fetches the data on cache miss.
   *
   * Called when the cache doesn't have a value for the key,
   * or when a forced refetch is triggered.
   *
   * @returns Promise resolving to the query data
   */
  queryFn: () => Promise<T>;

  /**
   * Time-to-live in seconds for the cached result.
   *
   * After this duration, the cached value expires and the
   * query function will be called again on next access.
   *
   * @default 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Named cache store to use for this query.
   *
   * If not specified, the default store from CacheModule configuration
   * is used. Useful for routing different queries to different backends.
   *
   * @default undefined (uses default store)
   * @example 'redis', 'memory'
   */
  storeName?: string;

  /**
   * Whether the query should execute.
   *
   * When `false`, the query function is not called and the hook
   * returns `isLoading: false` with `data: undefined`.
   * Useful for conditional fetching based on component state.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Automatic refetch interval in milliseconds.
   *
   * When set, the query will automatically refetch at this interval.
   * Set to `undefined` or `0` to disable polling.
   *
   * @default undefined (no polling)
   * @example 30000 (refetch every 30 seconds)
   */
  refetchInterval?: number;

  /**
   * Whether to bypass the cache and refetch on component mount.
   *
   * When `true`, the query function is always called when the
   * component mounts, even if cached data exists. The cache is
   * updated with the fresh result.
   *
   * @default false
   */
  refetchOnMount?: boolean;
}
