import { useCustomMutation as useCustomMutationOriginal } from '@refinedev/core';
import type { BaseRecord, HttpError } from '@refinedev/core';
import type {
  UseCustomMutationProps,
  UseCustomMutationReturnType,
} from './use-custom-mutation.types';

export const useCustomMutation = <
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
>(
  props?: UseCustomMutationProps<TData, TError, _TVariables>
): UseCustomMutationReturnType<TData, TError, _TVariables> => {
  const result = useCustomMutationOriginal<TData, TError, _TVariables>(props ?? {});

  return {
    mutate: result.mutate,
    mutateAsync: result.mutateAsync,
    isLoading: result.mutation.isPending,
    isError: result.mutation.isError,
    isSuccess: result.mutation.isSuccess,
    isIdle: result.mutation.isIdle,
    error: result.mutation.error,
    data: result.mutation.data,
    reset: result.mutation.reset,
    mutation: result.mutation as any,
    overtime: { elapsedTime: result.overtime?.elapsedTime },
  };
};
