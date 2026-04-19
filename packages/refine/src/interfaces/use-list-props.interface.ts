/**
 * @fileoverview Props for the useList hook.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

import type { Pagination } from './pagination.interface';
import type { SortDescriptor } from './sort-descriptor.interface';
import type { FilterDescriptor } from './filter-descriptor.interface';

/**
 * Props for the `useList` hook (object-based overload).
 */
export interface UseListProps {
  /** Resource name string. */
  resource: string;
  /** Pagination configuration. */
  pagination?: Pagination;
  /** Sort descriptors. */
  sorters?: SortDescriptor[];
  /** Filter descriptors. */
  filters?: FilterDescriptor[];
  /** Whether the query is enabled. */
  enabled?: boolean;
  /** Arbitrary metadata. */
  meta?: Record<string, any>;
}
