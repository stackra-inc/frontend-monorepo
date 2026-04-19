/** @fileoverview useInfiniteList hook — infinite scrolling list. @module @stackra/react-refine @category Hooks */
import { useInfiniteQuery } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { GetListParams } from '@/interfaces/get-list-params.interface';
import type { UseInfiniteListProps } from '@/interfaces/use-infinite-list-props.interface';
import type { UseInfiniteListReturnType } from '@/types/use-infinite-list-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

export function useInfiniteList<TData = any>(
  props: UseInfiniteListProps
): UseInfiniteListReturnType<TData> {
  const { resource, pagination, sorters, filters, enabled = true } = props;
  const baseParams: GetListParams = { sorters, filters };
  const pageSize = pagination?.pageSize ?? 10;

  const query = useInfiniteQuery({
    queryKey: QueryKeyFactory.infinite(resource, baseParams),
    queryFn: ({ pageParam = 1 }) => {
      const params: GetListParams = {
        ...baseParams,
        pagination: { current: pageParam as number, pageSize },
      };
      return resolveService(resource).getList(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const totalFetched = allPages.reduce((sum: number, p: any) => sum + (p.data?.length ?? 0), 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled,
  });

  return {
    data: query.data?.pages.map((p: any) => p.data) as TData[][] | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error as unknown as HttpError | null,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    query,
  };
}
