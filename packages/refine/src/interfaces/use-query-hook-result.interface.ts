/**
 * @fileoverview Return shape for query hooks (useOne, useMany, useShow, useCustom).
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Return shape for query hooks (useOne, useMany, useShow, useCustom).
 *
 * @typeParam TData - The data type returned by the query.
 * @typeParam TError - The error type (defaults to `Error`).
 */
export interface UseQueryHookResult<TData, TError = Error> {
  /** Resolved data (undefined while loading). */
  data: TData | undefined;

  /** True during the initial load (no cached data). */
  isLoading: boolean;

  /** True whenever a fetch is in-flight (including background refetches). */
  isFetching: boolean;

  /** True if the query errored. */
  isError: boolean;

  /** True if the query succeeded at least once. */
  isSuccess: boolean;

  /** Error object if the query failed, otherwise null. */
  error: TError | null;

  /** Manually trigger a refetch. */
  refetch: () => void;

  /** The underlying TanStack Query result object. */
  query: any;
}
