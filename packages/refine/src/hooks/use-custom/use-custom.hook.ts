/** @fileoverview useCustom hook — execute a custom query. @module @stackra-inc/react-refine @category Hooks */
import { useQuery } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseCustomProps } from '@/interfaces/use-custom-props.interface';
import type { UseCustomReturnType } from '@/types/use-custom-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useCustom<TData = any>(props: UseCustomProps): UseCustomReturnType<TData> {
  const { resource, params, enabled = true } = props;
  const query = useQuery({
    queryKey: QueryKeyFactory.custom(resource, params),
    queryFn: () => resolveService(resource).custom(params),
    enabled,
  });
  return {
    data: query.data as TData | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error as unknown as HttpError | null,
    refetch: query.refetch,
    query,
  };
}
