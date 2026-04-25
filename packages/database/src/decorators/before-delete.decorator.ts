/**
 * @file before-delete.decorator.ts
 * @description Method decorator that registers a pre-remove lifecycle hook.
 *
 * The `@BeforeDelete` decorator stores hook metadata in MetadataStorage. The hook
 * method is invoked before a document is removed from the collection.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a pre-remove lifecycle hook.
 *
 * The decorated method is called before a document is deleted.
 * Returning `false` from the hook cancels the delete operation.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @BeforeDelete()
 * checkDependencies(): void {
 *   if (this.getAttribute('posts_count') > 0) {
 *     throw new Error('Cannot delete user with posts');
 *   }
 * }
 * ```
 */
export function BeforeDelete() {
  return function (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerHook(target.constructor, {
      methodName: key,
      event: 'beforeDelete',
    });
  };
}
