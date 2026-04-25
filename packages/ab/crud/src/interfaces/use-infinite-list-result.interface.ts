/**
 * @fileoverview Return shape for the useInfiniteList hook.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Return shape for the `useInfiniteList` hook.
 *
 * @typeParam TData - The type of each record.
 * @typeParam TError - The error type (defaults to `Error`).
 */
export interface UseInfiniteListResult<TData, TError = Error> {
  /** Data organized as pages. */
  data: TData[][] | undefined;

  /** True during the initial load. */
  isLoading: boolean;

  /** True whenever a fetch is in-flight. */
  isFetching: boolean;

  /** True if the query errored. */
  isError: boolean;

  /** True if the query succeeded at least once. */
  isSuccess: boolean;

  /** Error object if the query failed, otherwise null. */
  error: TError | null;

  /** Manually trigger a refetch. */
  refetch: () => void;

  /** Fetch the next page of results. */
  fetchNextPage: () => void;

  /** Whether there are more pages to fetch. */
  hasNextPage: boolean;

  /** True while fetching the next page. */
  isFetchingNextPage: boolean;

  /** The underlying TanStack Query result object. */
  query: any;
}
