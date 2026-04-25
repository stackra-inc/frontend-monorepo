/**
 * @file after-create.decorator.ts
 * @description Method decorator that registers a post-insert lifecycle hook.
 *
 * The `@AfterCreate` decorator stores hook metadata in MetadataStorage. The hook
 * method is invoked after a new document has been inserted into the collection.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a post-insert lifecycle hook.
 *
 * The decorated method is called after a new document is successfully created.
 *
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @AfterCreate()
 * sendWelcomeEmail(): void {
 *   emailService.send(this.getAttribute('email'), 'Welcome!');
 * }
 * ```
 */
export function AfterCreate() {
  return function (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerHook(target.constructor, {
      methodName: key,
      event: 'afterCreate',
    });
  };
}
