/**
 * @fileoverview GetListResult interface for list query responses.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Result shape returned by list/getList operations.
 *
 * @typeParam TData - The type of each record in the result set.
 */
export interface GetListResult<TData> {
  /** Array of records matching the query. */
  data: TData[];

  /** Total number of records matching the query (before pagination). */
  total: number;
}
