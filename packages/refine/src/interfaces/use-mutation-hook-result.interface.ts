/**
 * @fileoverview Return shape for mutation hooks (useCreate, useUpdate, useDelete, etc.).
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Return shape for mutation hooks (useCreate, useUpdate, useDelete, etc.).
 *
 * @typeParam TData - The data type returned by the mutation.
 * @typeParam TError - The error type (defaults to `Error`).
 * @typeParam TVariables - The variables type passed to `mutate`.
 */
export interface UseMutationHookResult<TData, TError = Error, TVariables = any> {
  /** Fire-and-forget mutation trigger. */
  mutate: (variables: TVariables) => void;

  /** Async mutation trigger that returns a promise. */
  mutateAsync: (variables: TVariables) => Promise<TData>;

  /** True while the mutation is in-flight. */
  isLoading: boolean;

  /** True if the mutation errored. */
  isError: boolean;

  /** True if the mutation succeeded. */
  isSuccess: boolean;

  /** True if the mutation has not been triggered yet. */
  isIdle: boolean;

  /** Error object if the mutation failed, otherwise null. */
  error: TError | null;

  /** Data returned by the last successful mutation. */
  data: TData | undefined;

  /** Reset the mutation state back to idle. */
  reset: () => void;

  /** The underlying TanStack Mutation result object. */
  mutation: any;
}
