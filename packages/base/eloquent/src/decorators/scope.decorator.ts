/**
 * @file scope.decorator.ts
 * @description Method decorator that registers a local query scope on a Model method.
 *
 * The `@Scope` decorator stores scope metadata in MetadataStorage. Local scopes
 * are invoked explicitly via the QueryBuilder's dynamic method resolution.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a local query scope.
 *
 * Local scopes are called explicitly on the QueryBuilder and receive the
 * builder instance as their first argument.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @Scope()
 * scopeActive(query: QueryBuilder<User>): QueryBuilder<User> {
 *   return query.where('active', '=', true);
 * }
 * ```
 */
export function Scope() {
  return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerScope(target.constructor, {
      methodName: key,
      type: 'local',
    });
  };
}
