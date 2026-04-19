/**
 * @fileoverview GetListParams interface for list query parameters.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

import type { Pagination } from './pagination.interface';
import type { SortDescriptor } from './sort-descriptor.interface';
import type { FilterDescriptor } from './filter-descriptor.interface';

/**
 * Parameters for list/getList operations.
 */
export interface GetListParams {
  /** Pagination configuration. */
  pagination?: Pagination;

  /** Array of sort descriptors. */
  sorters?: SortDescriptor[];

  /** Array of filter descriptors. */
  filters?: FilterDescriptor[];

  /** Arbitrary metadata passed through to the repository. */
  meta?: Record<string, any>;
}
