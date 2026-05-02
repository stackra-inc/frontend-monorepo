/**
 * @fileoverview Hook for managing query parameters with type safety.
 *
 * Provides a React hook for reading and updating query parameters with
 * Zod schema validation, type conversion, and URL synchronization.
 *
 * ## Features
 *
 * - Type-safe query parameter access
 * - Zod schema validation with defaults
 * - Automatic URL synchronization
 * - Support for replace vs push navigation
 * - Preserve or filter unknown parameters
 * - No component remount on query changes
 *
 * ## Usage
 *
 * ```typescript
 * const [queryParams, setQueryParams] = useQueryParams<PostFilters>({
 *   schema: postFiltersSchema,
 *   defaults: { page: 1, pageSize: 20 },
 *   preserveOthers: true,
 *   replace: false
 * });
 *
 * // Read params
 * console.log(queryParams.page, queryParams.search);
 *
 * // Update params
 * setQueryParams({ page: 2 });
 * setQueryParams({ search: 'react' });
 * ```
 *
 * @module @stackra/react-router/query
 * @category Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useInject } from '@stackra/ts-container/react';
import { QueryService } from '@/query/query.service';
import type { QueryConfig } from '@/query/interfaces/query-config.interface';

/**
 * Return type for the `useQueryParams` hook.
 *
 * Provides the current query parameters and a setter function.
 *
 * @template T - Type of the query parameters object
 */
export type UseQueryParamsReturn<T> = [
  /**
   * Current query parameters, parsed and validated.
   */
  queryParams: T,
  /**
   * Function to update query parameters.
   *
   * Merges new parameters with existing ones and updates the URL.
   * Does not remount the component.
   *
   * @param newParams - Partial object of new query parameters
   */
  setQueryParams: (newParams: Partial<T>) => void,
];

/**
 * Hook for managing query parameters with type safety.
 *
 * Reads query parameters from the URL, validates them with a Zod schema,
 * and provides a setter function to update them. Updates are synchronized
 * with the URL without remounting the component.
 *
 * ## Type Safety
 *
 * The hook is generic and accepts a type parameter for the query parameters
 * object. Use a Zod schema to enforce validation and defaults.
 *
 * ## URL Synchronization
 *
 * Query parameter updates are automatically synchronized with the URL.
 * By default, updates push a new history entry (back button works).
 * Set `replace: true` to replace the current entry instead.
 *
 * ## Preserving Other Parameters
 *
 * By default, parameters not in the schema are preserved in the URL.
 * Set `preserveOthers: false` to remove them.
 *
 * @template T - Type of the query parameters object
 * @param config - Optional configuration for query parameter management
 * @returns Tuple of [queryParams, setQueryParams]
 *
 * @example
 * ```typescript
 * // Define schema
 * const filtersSchema = z.object({
 *   page: z.number().min(1).default(1),
 *   pageSize: z.number().min(10).max(100).default(20),
 *   search: z.string().optional(),
 *   status: z.enum(['active', 'inactive']).optional()
 * });
 *
 * // Use hook
 * function PostsPage() {
 *   const [filters, setFilters] = useQueryParams<PostFilters>({
 *     schema: filtersSchema,
 *     defaults: { page: 1, pageSize: 20 },
 *     preserveOthers: true,
 *     replace: false
 *   });
 *
 *   return (
 *     <div>
 *       <p>Page: {filters.page}</p>
 *       <p>Search: {filters.search}</p>
 *
 *       <button onClick={() => setFilters({ page: filters.page + 1 })}>
 *         Next Page
 *       </button>
 *
 *       <input
 *         value={filters.search ?? ''}
 *         onChange={(e) => setFilters({ search: e.target.value })}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Without schema (untyped)
 * const [params, setParams] = useQueryParams();
 *
 * // params is Record<string, any>
 * console.log(params.page, params.search);
 *
 * setParams({ page: 2 });
 * ```
 *
 * @example
 * ```typescript
 * // With replace mode (no history entry)
 * const [filters, setFilters] = useQueryParams<PostFilters>({
 *   schema: filtersSchema,
 *   replace: true // Back button skips query changes
 * });
 * ```
 */
export function useQueryParams<T = Record<string, any>>(
  config?: QueryConfig<T>
): UseQueryParamsReturn<T> {
  // Get dependencies
  const location = useLocation();
  const navigate = useNavigate();
  const queryService = useInject(QueryService);
  const [_searchParams] = useSearchParams();

  // Stabilize config reference — config is typically created inline
  // in the component, so it's a new object every render. We use a ref
  // to avoid re-triggering effects on every render.
  const configRef = useRef(config);
  configRef.current = config;

  // Parse initial query params from URL
  const [queryParams, setQueryParamsState] = useState<T>(() => {
    return queryService.parseQuery<T>(location.search, config);
  });

  /**
   * Update query parameters and synchronize with URL.
   *
   * Merges new parameters with existing ones, validates with schema,
   * and updates the URL. Does not remount the component.
   *
   * ## Behavior
   *
   * 1. Merge new params with current params
   * 2. Validate with schema (if provided)
   * 3. Stringify to URL search string
   * 4. Navigate to new URL (push or replace)
   * 5. Update local state
   *
   * @param newParams - Partial object of new query parameters
   */
  const setQueryParams = useCallback(
    (newParams: Partial<T>) => {
      const currentConfig = configRef.current;

      // Merge new params with current params
      const mergedParams = {
        ...queryParams,
        ...newParams,
      };

      // Merge with existing URL params if preserveOthers is true
      const searchString = currentConfig?.preserveOthers
        ? queryService.mergeQuery(
            location.search,
            mergedParams as Record<string, any>,
            currentConfig as any
          )
        : queryService.stringifyQuery(mergedParams as Record<string, any>, currentConfig as any);

      // Build new URL
      const newPath = `${location.pathname}${searchString ? `?${searchString}` : ''}`;

      // Navigate to new URL (push or replace)
      navigate(newPath, { replace: currentConfig?.replace ?? false });

      // Update local state (will also be updated by useEffect)
      setQueryParamsState(mergedParams as T);
    },
    [queryParams, location.pathname, location.search, navigate, queryService]
  );

  /**
   * Sync query params with URL changes.
   *
   * Re-parses query params when the URL search string changes.
   * This handles browser back/forward navigation and external URL changes.
   */
  useEffect(() => {
    const parsed = queryService.parseQuery<T>(location.search, configRef.current);
    setQueryParamsState(parsed);
  }, [location.search, queryService]);

  return [queryParams, setQueryParams];
}
