import type { UseMutationResult } from '@tanstack/react-query';
import type {
  BaseRecord,
  HttpError,
  CreateManyResponse,
  UseCreateManyProps as UseCreateManyPropsOriginal,
} from '@refinedev/core';

export type UseCreateManyProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
> = UseCreateManyPropsOriginal<TData, TError, _TVariables>;

export interface UseCreateManyReturnType<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
> {
  mutate: (variables?: any, options?: any) => void;
  mutateAsync: (variables?: any, options?: any) => Promise<CreateManyResponse<TData>>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  error: TError | null;
  data: CreateManyResponse<TData> | undefined;
  reset: () => void;
  mutation: UseMutationResult<CreateManyResponse<TData>, TError, any, any>;
  overtime: { elapsedTime?: number };
}
