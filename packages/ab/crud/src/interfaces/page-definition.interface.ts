/**
 * @fileoverview A single page definition returned by the Pages API.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

import type { SchemaComponent } from './schema-component.interface';

/**
 * A single page definition returned by the Pages API.
 */
export interface PageDefinition {
  /** Route path for this page. */
  path: string;

  /** Resource name this page operates on. */
  resource: string;

  /** CRUD action this page represents. */
  action: 'list' | 'create' | 'edit' | 'show';

  /** Optional layout identifier. */
  layout?: string;

  /** Page title. */
  title: string;

  /** Optional icon identifier. */
  icon?: string;

  /** Component schema tree for rendering. */
  schema: SchemaComponent[];

  /** Optional required permissions. */
  permissions?: string[];
}
