/**
 * @fileoverview DI tokens for the router package.
 * @module @stackra-inc/react-router
 * @category Constants
 */

/** DI token for the global {@link RouteRegistry} singleton. */
export const ROUTE_REGISTRY = Symbol.for('ROUTE_REGISTRY');

/** Metadata key used by the `@Route` decorator. */
export const ROUTE_METADATA_KEY = Symbol.for('ROUTE_METADATA');
