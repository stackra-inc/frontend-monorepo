/**
 * @fileoverview Return shape for the useList hook.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

import type { UseQueryHookResult } from './use-query-hook-result.interface';

/**
 * Return shape for the `useList` hook.
 *
 * Extends {@link UseQueryHookResult} with a `total` field.
 *
 * @typeParam TData - The type of each record.
 * @typeParam TError - The error type (defaults to `Error`).
 */
export interface UseListResult<TData, TError = Error> extends UseQueryHookResult<TData[], TError> {
  /** Total number of records matching the query (before pagination). */
  total: number;
}
