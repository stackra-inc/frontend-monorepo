import type { UseMutationResult } from '@tanstack/react-query';
import type {
  BaseRecord,
  HttpError,
  DeleteManyResponse,
  UseDeleteManyProps as UseDeleteManyPropsOriginal,
} from '@refinedev/core';

export type UseDeleteManyProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
> = UseDeleteManyPropsOriginal<TData, TError, _TVariables>;

export interface UseDeleteManyReturnType<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  _TVariables = {},
> {
  mutate: (variables?: any, options?: any) => void;
  mutateAsync: (variables?: any, options?: any) => Promise<DeleteManyResponse<TData>>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  error: TError | null;
  data: DeleteManyResponse<TData> | undefined;
  reset: () => void;
  mutation: UseMutationResult<DeleteManyResponse<TData>, TError, any, any>;
  overtime: { elapsedTime?: number };
}
