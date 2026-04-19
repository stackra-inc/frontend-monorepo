/** @fileoverview useMany hook — fetch multiple records by IDs. @module @stackra-inc/react-refine @category Hooks */
import { useQuery } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseManyProps } from '@/interfaces/use-many-props.interface';
import type { UseManyReturnType } from '@/types/use-many-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useMany<TData = any>(props: UseManyProps): UseManyReturnType<TData> {
  const { resource, ids, enabled = true } = props;
  const query = useQuery({
    queryKey: QueryKeyFactory.many(resource, ids),
    queryFn: () => resolveService(resource).getMany(ids),
    enabled,
  });
  return {
    data: query.data as TData[] | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error as unknown as HttpError | null,
    refetch: query.refetch,
    query,
  };
}
