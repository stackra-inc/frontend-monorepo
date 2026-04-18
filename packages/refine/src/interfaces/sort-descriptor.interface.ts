/**
 * @fileoverview Sort descriptor interface for list query ordering.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Describes a single sort criterion for list queries.
 */
export interface SortDescriptor {
  /** Field name to sort by. */
  field: string;

  /** Sort direction. */
  order: 'asc' | 'desc';
}
