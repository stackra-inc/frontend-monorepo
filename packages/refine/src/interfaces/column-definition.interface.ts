/**
 * @fileoverview Column definition for list views.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

/**
 * Column definition for list views.
 */
export interface ColumnDefinition {
  /** Field name. */
  field: string;

  /** Column header label. */
  label: string;

  /** Whether this column is sortable. */
  sortable?: boolean;

  /** Optional column width. */
  width?: string | number;

  /** Optional render type override. */
  renderType?: string;
}
