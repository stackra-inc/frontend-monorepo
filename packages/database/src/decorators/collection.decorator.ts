/**
 * @file collection.decorator.ts
 * @description Class decorator that registers the RxDB collection name for a Model class.
 *
 * The `@Collection` decorator stores the collection name in MetadataStorage so that
 * the Model base class and SchemaResolver can look it up at runtime without relying
 * on static properties.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers the RxDB collection name for a Model class.
 *
 * @param name - The RxDB collection name (e.g. `'users'`, `'posts'`).
 * @returns A class decorator function.
 *
 * @example
 * ```ts
 * @Collection('users')
 * class User extends Model {
 *   // ...
 * }
 * ```
 */
export function Collection(name: string) {
  return function (target: Function) {
    MetadataStorage.getInstance().registerClassMetadata(target, 'collection', name);
  };
}
