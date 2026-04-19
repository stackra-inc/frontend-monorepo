/** @fileoverview useShow hook — fetch a single record for display. @module @stackra-inc/react-refine @category Hooks */
import { useQuery } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseShowProps } from '@/interfaces/use-show-props.interface';
import type { UseShowReturnType } from '@/types/use-show-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useShow<TData = any>(props: UseShowProps): UseShowReturnType<TData> {
  const { resource, id, enabled = true } = props;
  const query = useQuery({
    queryKey: QueryKeyFactory.one(resource, id),
    queryFn: () => resolveService(resource).getOne(id),
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
