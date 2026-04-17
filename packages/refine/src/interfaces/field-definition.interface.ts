/**
 * @fileoverview A single field definition within a resource.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

import type { FieldType } from '@/enums/field-type.enum';

/**
 * A single field definition within a resource.
 */
export interface FieldDefinition {
  /** Field name (matches the data key). */
  name: string;

  /** Field data type. */
  type: FieldType;

  /** Human-readable label. */
  label: string;

  /** Optional placeholder text. */
  placeholder?: string;

  /** Optional validation rule string. */
  validation?: string;

  /** Which CRUD views this field is visible in. */
  visibility: ('list' | 'create' | 'edit' | 'show')[];

  /** Whether this field is sortable. */
  sortable?: boolean;

  /** Whether this field is filterable. */
  filterable?: boolean;

  /** Whether this field is searchable. */
  searchable?: boolean;

  /** Optional default value. */
  defaultValue?: any;

  /** Optional select/enum options. */
  options?: { label: string; value: any }[];
}
