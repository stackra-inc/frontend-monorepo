/**
 * @file hooks/types.ts
 * @description Shared type definitions for all rxdb-eloquent React hooks.
 *
 * These types define the return shapes and configuration options used
 * across `useFind`, `useQuery`, `usePaginate`, `useCreate`, etc.
 */

import type { Model, ModelStatic } from '../model/model';
import type { QueryBuilder } from '../query/query.builder';

// ---------------------------------------------------------------------------
// Hook Result Types
// ---------------------------------------------------------------------------

/**
 * Base result shape returned by all query hooks.
 *
 * @typeParam T - The data type returned by the hook.
 */
export interface HookResult<T> {
  /** The resolved data. `null` while loading or on error. */
  data: T | null;

  /** Whether the hook is currently fetching data. */
  loading: boolean;

  /** The error object if the query failed, `null` otherwise. */
  error: Error | null;
}

/**
 * Result shape for hooks that support manual refetching.
 *
 * @typeParam T - The data type returned by the hook.
 */
export interface RefetchableHookResult<T> extends HookResult<T> {
  /** Manually re-execute the query. */
  refetch: () => void;
}

/**
 * Result shape for mutation hooks (create, update, delete).
 *
 * @typeParam TArgs - The argument type for the mutate function.
 * @typeParam TResult - The return type of the mutation.
 */
export interface MutationHookResult<TArgs, TResult> {
  /** Execute the mutation. */
  mutate: (args: TArgs) => Promise<TResult>;

  /** Whether the mutation is currently in progress. */
  loading: boolean;

  /** The error object if the mutation failed, `null` otherwise. */
  error: Error | null;
}

/**
 * Result shape for the `usePaginate` hook.
 *
 * @typeParam T - The Model type.
 */
export interface PaginateHookResult<T> {
  /** The current page of items. */
  data: T[];

  /** Whether the hook is currently fetching data. */
  loading: boolean;

  /** The error object if the query failed, `null` otherwise. */
  error: Error | null;

  /** Current page number (1-indexed). */
  page: number;

  /** Number of items per page. */
  pageSize: number;

  /** Total number of matching documents. */
  total: number;

  /** Total number of pages. */
  totalPages: number;

  /** Whether there is a next page. */
  hasNextPage: boolean;

  /** Whether there is a previous page. */
  hasPrevPage: boolean;

  /** Navigate to the next page. */
  nextPage: () => void;

  /** Navigate to the previous page. */
  prevPage: () => void;

  /** Navigate to a specific page. */
  goToPage: (page: number) => void;

  /** Change the page size. */
  setPageSize: (size: number) => void;

  /** Manually re-execute the query. */
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Hook Configuration Types
// ---------------------------------------------------------------------------

/**
 * Configuration options for query hooks.
 */
export interface QueryHookOptions {
  /**
   * When `true`, subscribes to RxDB's reactive queries and re-renders
   * on every data change. When `false` (default), does a one-shot query.
   * @default false
   */
  live?: boolean;

  /**
   * Whether the hook should execute immediately.
   * Set to `false` to defer execution until `refetch()` is called.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Configuration options for the `usePaginate` hook.
 */
export interface PaginateHookOptions {
  /** Initial page number (1-indexed). @default 1 */
  page?: number;

  /** Number of items per page. @default 20 */
  pageSize?: number;

  /** Optional query builder callback to filter/sort results. */
  query?: (qb: QueryBuilder<any>) => QueryBuilder<any>;

  /**
   * When `true`, subscribes to RxDB's reactive queries.
   * @default false
   */
  live?: boolean;
}

/**
 * A Model class constructor type accepted by hooks.
 * Hooks accept the Model class directly (e.g., `User`).
 */
export type ModelClass<T extends Model = Model> = ModelStatic<T> & {
  find(id: string): Promise<T | null>;
  create(attributes: Record<string, any>): Promise<T>;
  all(): Promise<T[]>;
  query(): QueryBuilder<T>;
};
