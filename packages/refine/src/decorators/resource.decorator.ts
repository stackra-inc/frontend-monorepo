/**
 * @Resource Decorator
 *
 * Stores resource metadata on a Model class. The metadata is later read by
 * `RefineModule.forFeature()` to auto-create Repository + Service pairs and
 * register them in the ServiceRegistry.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra-inc/react-refine
 * @category Decorators
 *
 * @example
 * ```typescript
 * import { Resource } from '@stackra-inc/react-refine';
 * import { POST_RESOURCE } from '@/tokens/post.token';
 *
 * @Resource({ name: POST_RESOURCE, endpoint: '/api/posts' })
 * export class Post {
 *   id!: string;
 *   title!: string;
 * }
 * ```
 */

import { defineMetadata, getMetadata } from '@vivtel/metadata';
import { RESOURCE_METADATA_KEY } from '@/constants';
import type { ResourceMetadata } from '@/interfaces/resource-metadata.interface';

/**
 * Class decorator that stores resource metadata on a Model class.
 *
 * @param metadata - Resource configuration (name, endpoint, optional service/repository).
 * @returns A class decorator function.
 */
export function Resource(metadata: ResourceMetadata): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    defineMetadata(RESOURCE_METADATA_KEY, metadata, target as object);
  };
}

/**
 * Read `@Resource` metadata from a decorated class.
 *
 * @param target - The class to read metadata from.
 * @returns The stored {@link ResourceMetadata}, or `undefined` if not decorated.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getResourceMetadata(target: Function): ResourceMetadata | undefined {
  return getMetadata<ResourceMetadata>(RESOURCE_METADATA_KEY, target as object);
}
