/**
 * @fileoverview useInvalidate hook.
 *
 * Provides a function to programmatically invalidate TanStack Query
 * cache entries for a given resource. Used internally by mutation
 * hooks after successful operations, and available for manual use.
 *
 * @module @stackra-inc/react-refine
 * @category Hooks
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeyFactory } from '@/utils/query-key-factory.util';

/**
 * Invalidation targets.
 */
export type InvalidateTarget = 'list' | 'many' | 'detail' | 'all';

/**
 * Parameters for the invalidate function.
 */
export interface InvalidateParams {
  /** Resource name to invalidate. */
  resource: string;
  /** Which query types to invalidate. Defaults to `['list', 'many']`. */
  invalidates?: InvalidateTarget[];
  /** Specific record ID for detail invalidation. */
  id?: string | number;
}

/**
 * Returns a function that invalidates query cache entries for a resource.
 *
 * @example
 * ```ts
 * const invalidate = useInvalidate();
 *
 * // Invalidate list and many queries for "posts":
 * invalidate({ resource: 'posts' });
 *
 * // Invalidate everything for "posts":
 * invalidate({ resource: 'posts', invalidates: ['all'] });
 *
 * // Invalidate a specific detail query:
 * invalidate({ resource: 'posts', invalidates: ['detail'], id: 42 });
 * ```
 */
export function useInvalidate() {
  const queryClient = useQueryClient();

  return useCallback(
    ({ resource, invalidates = ['list', 'many'], id }: InvalidateParams) => {
      for (const target of invalidates) {
        switch (target) {
          case 'all':
            queryClient.invalidateQueries({
              queryKey: QueryKeyFactory.invalidate(resource),
            });
            break;

          case 'list':
            queryClient.invalidateQueries({
              queryKey: QueryKeyFactory.list(resource, {}),
            });
            break;

          case 'many':
            queryClient.invalidateQueries({
              queryKey: [resource, 'getMany'],
            });
            break;

          case 'detail':
            if (id !== undefined) {
              queryClient.invalidateQueries({
                queryKey: QueryKeyFactory.one(resource, id),
              });
            } else {
              queryClient.invalidateQueries({
                queryKey: [resource, 'getOne'],
              });
            }
            break;
        }
      }
    },
    [queryClient]
  );
}
