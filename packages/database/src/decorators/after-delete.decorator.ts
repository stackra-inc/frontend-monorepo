/**
 * @file after-delete.decorator.ts
 * @description Method decorator that registers a post-remove lifecycle hook.
 *
 * The `@AfterDelete` decorator stores hook metadata in MetadataStorage. The hook
 * method is invoked after a document has been removed from the collection.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a post-remove lifecycle hook.
 *
 * The decorated method is called after a document is successfully deleted.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @AfterDelete()
 * cleanupFiles(): void {
 *   fileService.deleteUserFiles(this.getAttribute('id'));
 * }
 * ```
 */
export function AfterDelete() {
  return function (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerHook(target.constructor, {
      methodName: key,
      event: 'afterDelete',
    });
  };
}
