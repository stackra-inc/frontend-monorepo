/**
 * @Route Decorator
 *
 * Stores route metadata on a component class for auto-registration.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra-inc/react-router
 * @category Decorators
 *
 * @example
 * ```typescript
 * import { Route } from '@stackra-inc/react-router';
 *
 * @Route({ path: '/posts', resource: 'posts', action: 'list' })
 * export class PostListPage { ... }
 * ```
 */

import { defineMetadata, getMetadata } from '@vivtel/metadata';
import { ROUTE_METADATA_KEY } from '@/constants';
import type { RouteMetadata } from '@/interfaces/route-metadata.interface';

/**
 * Class decorator that stores route metadata on a component class.
 *
 * @param metadata - Route configuration.
 * @returns A class decorator function.
 */
export function Route(metadata: RouteMetadata): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    defineMetadata(ROUTE_METADATA_KEY, metadata, target as object);
  };
}

/**
 * Read `@Route` metadata from a decorated class.
 *
 * @param target - The class to read metadata from.
 * @returns The stored {@link RouteMetadata}, or `undefined` if not decorated.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getRouteMetadata(target: Function): RouteMetadata | undefined {
  return getMetadata<RouteMetadata>(ROUTE_METADATA_KEY, target as object);
}
