/**
 * @fileoverview useOne hook — fetch a single record by ID.
 *
 * Resolves the service from the ServiceRegistry and delegates
 * to `service.getOne(id)` via TanStack Query's `useQuery`.
 *
 * @module @stackra-inc/react-refine
 * @category Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { resolveService } from '@/use-service.util';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';
import type { UseOneProps } from '@/interfaces/use-one-props.interface';
import type { UseOneReturnType } from '@/types/use-one-return-type.type';
import type { HttpError } from '@/interfaces/http-error.interface';

/**
 * Fetch a single record by resource name and ID.
 *
 * @param props - Hook parameters.
 * @returns Query result with data, loading, and error states.
 */
export function useOne<TData = any>(props: UseOneProps): UseOneReturnType<TData> {
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
