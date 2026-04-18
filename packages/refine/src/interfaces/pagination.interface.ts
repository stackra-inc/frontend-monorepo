/**
 * @fileoverview Pagination interface for list queries.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import type { Pagination } from '@stackra/react-refine';
 *
 * const pagination: Pagination = {
 *   current: 1,
 *   pageSize: 25,
 *   mode: 'server',
 * };
 * ```
 */

/**
 * Pagination parameters for list queries.
 */
export interface Pagination {
  /** Current page number (1-indexed). */
  current: number;

  /** Number of records per page. */
  pageSize: number;

  /**
   * Pagination mode.
   * - `'server'` — server-side pagination (default)
   * - `'client'` — client-side pagination
   * - `'off'` — no pagination
   */
  mode?: 'server' | 'client' | 'off';
}
