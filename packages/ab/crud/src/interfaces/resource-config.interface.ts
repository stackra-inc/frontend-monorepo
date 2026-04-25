/**
 * @fileoverview Resource configuration returned by the Pages API.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

import type { FieldDefinition } from './field-definition.interface';
import type { RelationDefinition } from './relation-definition.interface';
import type { FilterConfig } from './filter-config.interface';
import type { ColumnDefinition } from './column-definition.interface';
import type { Pagination } from './pagination.interface';
import type { SortDescriptor } from './sort-descriptor.interface';

/**
 * Resource configuration returned by the Pages API.
 */
export interface ResourceConfig {
  /** Resource name. */
  name: string;

  /** API endpoint for this resource. */
  apiEndpoint: string;

  /** Primary key field name. */
  primaryKey: string;

  /** Field definitions for this resource. */
  fields: FieldDefinition[];

  /** Optional relation definitions. */
  relations?: RelationDefinition[];

  /** Optional filter configurations. */
  filters?: FilterConfig[];

  /** Optional list of sortable field names. */
  sortableFields?: string[];

  /** Optional metadata. */
  meta?: {
    /** Default pagination settings. */
    paginationDefaults?: Pagination;
    /** Default sort descriptor. */
    defaultSort?: SortDescriptor;
    /** Available bulk actions. */
    bulkActions?: string[];
    /** Column definitions for list views. */
    columns?: ColumnDefinition[];
  };
}
