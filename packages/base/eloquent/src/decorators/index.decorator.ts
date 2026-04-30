/**
 * @file index.decorator.ts
 * @description Property decorator that registers a database index on a Model property.
 *
 * The `@Index` decorator sets the `isIndex` flag on the column metadata
 * in MetadataStorage. The SchemaResolver uses this to populate the `indexes`
 * array on the generated `RxJsonSchema`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a database index on a Model property.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Index()
 * @Column({ type: 'string', maxLength: 255 })
 * declare email: string;
 * ```
 */
export function Index() {
  return function (target: object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isIndex', true);
  };
}
