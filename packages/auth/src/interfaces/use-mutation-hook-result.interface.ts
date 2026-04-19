/** @fileoverview Mutation hook result interface. @module @stackra-inc/react-auth @category Interfaces */

/**
 * Standard return shape for mutation hooks.
 */
export interface UseMutationHookResult<TData = any, TError = Error, TVariables = any> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  error: TError | null;
  data: TData | undefined;
  reset: () => void;
  mutation: any;
}
