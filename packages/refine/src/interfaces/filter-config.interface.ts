/**
 * @fileoverview Filter configuration for a resource field.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Filter configuration for a resource field.
 */
export interface FilterConfig {
  /** Field name. */
  field: string;

  /** Filter input type. */
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';

  /** Human-readable label. */
  label: string;

  /** Optional select options. */
  options?: { label: string; value: any }[];
}
