/**
 * @file connection.decorator.ts
 * @description Class decorator that registers the named database connection for a Model class.
 *
 * The `@Connection` decorator stores the connection name in MetadataStorage so that
 * the Model base class can resolve which ConnectionManager connection to use.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers the named database connection for a Model class.
 *
 * @param name - The connection name as defined in the ConnectionManager config (e.g. `'default'`).
 * @returns A class decorator function.
 *
 * @example
 * ```ts
 * @Connection('default')
 * class User extends Model {
 *   // ...
 * }
 * ```
 */
export function Connection(name: string) {
  return function (target: Function) {
    MetadataStorage.getInstance().registerClassMetadata(target, 'connection', name);
  };
}
