/**
 * @fileoverview Route metadata interface stored by the @Route decorator.
 * @module @stackra-inc/react-router
 * @category Interfaces
 */

import type { ComponentType } from 'react';

/**
 * Metadata stored on a component class by the `@Route` decorator.
 */
export interface RouteMetadata {
  /** Route path (e.g. `'/posts'`, `'/posts/:id/edit'`). */
  path: string;
  /** Optional resource name this route is associated with. */
  resource?: string;
  /** Optional CRUD action. */
  action?: 'list' | 'create' | 'edit' | 'show';
  /** Optional layout component. */
  layout?: ComponentType;
  /** Optional middleware identifiers. */
  middleware?: string[];
}
