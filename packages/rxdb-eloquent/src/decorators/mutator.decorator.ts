/**
 * @file mutator.decorator.ts
 * @description Method decorator that registers a setter mutator for a Model attribute.
 *
 * The `@Mutator` decorator stores mutator metadata in MetadataStorage. When the
 * Model's attribute system writes the specified field, it invokes this method to
 * transform the value before storing it.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a method as a setter mutator for a Model attribute.
 *
 * When the attribute identified by `fieldName` is set, this method is called
 * to transform the value before it is stored.
 *
 * @param fieldName - The attribute field name this mutator transforms.
 * @returns A method decorator function.
 *
 * @example
 * ```ts
 * @Mutator('password')
 * setPassword(value: string): string {
 *   return hashSync(value, 10);
 * }
 * ```
 */
export function Mutator(fieldName: string) {
  return function (target: Object, propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerAccessorMutator(target.constructor, {
      methodName: key,
      fieldName,
      type: 'mutator',
    });
  };
}
