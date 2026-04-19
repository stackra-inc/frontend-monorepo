/**
 * @fileoverview useList hook — fetch a paginated, sorted, filtered list.
 *
 * @module @stackra-inc/react-refine
 * @category Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { GetListParams } from '@/interfaces/get-list-params.interface';
import type { UseListProps } from '@/interfaces/use-list-props.interface';
import type { UseListReturnType } from '@/types/use-list-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

/**
 * Fetch a paginated list of records.
 *
 * @param props - Hook parameters.
 * @returns Query result with data array, total count, and states.
 */
export function useList<TData = any>(props: UseListProps): UseListReturnType<TData> {
  const { resource, pagination, sorters, filters, enabled = true } = props;

  const params: GetListParams = { pagination, sorters, filters };

  const query = useQuery({
    queryKey: QueryKeyFactory.list(resource, params),
    queryFn: () => resolveService(resource).getList(params),
    enabled,
  });

  return {
    data: query.data?.data as TData[] | undefined,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error as unknown as HttpError | null,
    refetch: query.refetch,
    query,
  };
}
