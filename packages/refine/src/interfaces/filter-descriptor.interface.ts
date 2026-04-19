/**
 * @fileoverview Filter descriptor interface for list query filtering.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

import type { FilterOperator } from '@/enums/filter-operator.enum';

/**
 * Describes a single filter criterion for list queries.
 */
export interface FilterDescriptor {
  /** Field name to filter on. */
  field: string;

  /** Comparison operator. */
  operator: FilterOperator;

  /** Value to compare against. Type depends on the operator. */
  value: any;
}
