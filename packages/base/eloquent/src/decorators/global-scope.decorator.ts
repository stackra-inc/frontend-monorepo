/**
 * @file global-scope.decorator.ts
 * @description Method decorator that registers a global query scope on a Model method.
 *
 * The `@GlobalScope` decorator stores scope metadata in MetadataStorage. Global scopes
 * are automatically applied to every query on the Model unless explicitly removed
 * via `withoutGlobalScope()` or `withoutGlobalScopes()`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a global query scope.
 *
 * Global scopes are automatically applied to every query. They can be removed
 * individually via `withoutGlobalScope(name)` or all at once via `withoutGlobalScopes()`.
 *
 * @param name - A unique name for this global scope (used for removal).
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @GlobalScope('verified')
 * scopeVerified(query: QueryBuilder<User>): QueryBuilder<User> {
 *   return query.where('verified', '=', true);
 * }
 * ```
 */
export function GlobalScope(name: string) {
  return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerScope(target.constructor, {
      methodName: key,
      type: 'global',
      name,
    });
  };
}
