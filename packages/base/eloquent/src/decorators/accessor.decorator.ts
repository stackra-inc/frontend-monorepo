/**
 * @file accessor.decorator.ts
 * @description Method decorator that registers a getter accessor for a Model attribute.
 *
 * The `@Accessor` decorator stores accessor metadata in MetadataStorage. When the
 * Model's attribute system reads the specified field, it invokes this method to
 * transform the value.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a getter accessor for a Model attribute.
 *
 * When the attribute identified by `fieldName` is read, this method is called
 * to transform the raw stored value before returning it.
 *
 * @param fieldName - The attribute field name this accessor transforms.
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @Accessor('fullName')
 * getFullName(): string {
 *   return `${this.getAttribute('first_name')} ${this.getAttribute('last_name')}`;
 * }
 * ```
 */
export function Accessor(fieldName: string) {
  return function (target: object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerAccessorMutator(target.constructor, {
      methodName: key,
      fieldName,
      type: 'accessor',
    });
  };
}
