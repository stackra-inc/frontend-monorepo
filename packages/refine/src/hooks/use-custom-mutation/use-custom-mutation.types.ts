import type { UseMutationResult } from '@tanstack/react-query';
import type {
  BaseRecord,
  HttpError,
  CreateResponse,
  UseCustomMutationProps as UseCustomMutationPropsOriginal,
} from '@refinedev/core';

export type UseCustomMutationProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
> = UseCustomMutationPropsOriginal<TData, TError, _TVariables>;

export interface UseCustomMutationReturnType<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
> {
  mutate: (variables?: any, options?: any) => void;
  mutateAsync: (variables?: any, options?: any) => Promise<CreateResponse<TData>>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  error: TError | null;
  data: CreateResponse<TData> | undefined;
  reset: () => void;
  mutation: UseMutationResult<CreateResponse<TData>, TError, any, any>;
  overtime: { elapsedTime?: number };
}
