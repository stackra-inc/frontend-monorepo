/**
 * @file before-create.decorator.ts
 * @description Method decorator that registers a pre-insert lifecycle hook.
 *
 * The `@BeforeCreate` decorator stores hook metadata in MetadataStorage. The hook
 * method is invoked before a new document is inserted into the collection.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a pre-insert lifecycle hook.
 *
 * The decorated method is called before a new document is created.
 * Returning `false` from the hook cancels the insert operation.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @BeforeCreate()
 * generateId(): void {
 *   if (!this.getAttribute('id')) {
 *     this.setAttribute('id', generateUUID());
 *   }
 * }
 * ```
 */
export function BeforeCreate() {
  return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerHook(target.constructor, {
      methodName: key,
      event: 'beforeCreate',
    });
  };
}
