/**
 * Result of the useCachedQuery hook.
 *
 * Contains the query data, loading/error states, and control functions
 * for manual refetching and cache invalidation.
 *
 * @typeParam T - The type of data returned by the query function
 *
 * @module interfaces/use-cached-query-result
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch, invalidate } = useCachedQuery<User>({
 *   key: 'user:123',
 *   queryFn: fetchUser,
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <UserCard user={data!} onRefresh={refetch} />;
 * ```
 */

export interface UseCachedQueryResult<T> {
  /**
   * The query result data.
   *
   * `undefined` while loading or if the query hasn't executed yet.
   * Contains the cached or freshly fetched data once available.
   */
  data: T | undefined;

  /**
   * Whether the query is currently loading.
   *
   * `true` during the initial fetch and during refetches.
   * `false` once data is available or an error occurred.
   */
  isLoading: boolean;

  /**
   * Error from the most recent query execution.
   *
   * `null` if no error occurred. Contains the Error instance
   * if the query function threw or rejected.
   */
  error: Error | null;

  /**
   * Manually trigger a refetch.
   *
   * Uses the cache if available (cache-first strategy).
   * To bypass the cache, use {@link invalidate} instead.
   *
   * @returns Promise that resolves when the refetch completes
   */
  refetch: () => Promise<void>;

  /**
   * Invalidate the cache entry and refetch fresh data.
   *
   * Removes the cached value first, then executes the query function
   * and stores the new result. Use this when you know the cached
   * data is stale (e.g., after a mutation).
   *
   * @returns Promise that resolves when invalidation and refetch complete
   */
  invalidate: () => Promise<void>;
}
