/** @fileoverview Query hook result interface. @module @stackra-inc/react-auth @category Interfaces */

/**
 * Standard return shape for query hooks.
 */
export interface UseQueryHookResult<TData = any, TError = Error> {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: TError | null;
  refetch: () => void;
  query: any;
}
