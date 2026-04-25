/**
 * @file before-update.decorator.ts
 * @description Method decorator that registers a pre-save lifecycle hook.
 *
 * The `@BeforeUpdate` decorator stores hook metadata in MetadataStorage. The hook
 * method is invoked before an existing document is updated.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a pre-save lifecycle hook.
 *
 * The decorated method is called before an existing document is updated.
 * Returning `false` from the hook cancels the update operation.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @BeforeUpdate()
 * validateAge(): void {
 *   if (this.getAttribute('age') < 0) {
 *     throw new Error('Age cannot be negative');
 *   }
 * }
 * ```
 */
export function BeforeUpdate() {
  return function (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerHook(target.constructor, {
      methodName: key,
      event: 'beforeUpdate',
    });
  };
}
