/**
 * @file after-update.decorator.ts
 * @description Method decorator that registers a post-save lifecycle hook.
 *
 * The `@AfterUpdate` decorator stores hook metadata in MetadataStorage. The hook
 * method is invoked after an existing document has been updated.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a post-save lifecycle hook.
 *
 * The decorated method is called after an existing document is successfully updated.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @AfterUpdate()
 * logUpdate(): void {
 *   console.log(`Document ${this.getAttribute('id')} was updated`);
 * }
 * ```
 */
export function AfterUpdate() {
  return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerHook(target.constructor, {
      methodName: key,
      event: 'afterUpdate',
    });
  };
}
