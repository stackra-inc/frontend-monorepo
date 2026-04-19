/**
 * @fileoverview Route definition interface extending RouteMetadata with component.
 * @module @stackra-inc/react-router
 * @category Interfaces
 */

import type { ComponentType } from 'react';
import type { RouteMetadata } from './route-metadata.interface';

/**
 * A fully resolved route definition with its component.
 */
export interface RouteDefinition extends RouteMetadata {
  /** The React component to render for this route. */
  component: ComponentType<any>;
}
