/**
 * @file default.decorator.ts
 * @description Property decorator that registers a default value for a Model property.
 *
 * The `@Default` decorator sets the `defaultValue` on the column metadata
 * in MetadataStorage. The SchemaResolver uses this to set the `default` field
 * on the generated `RxJsonSchema` property.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a default value for a Model property.
 *
 * @param value - The default value to use when the property is not explicitly set.
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Default('active')
 * @Column({ type: 'string', maxLength: 50 })
 * declare status: string;
 *
 * @Default(0)
 * @Column({ type: 'integer' })
 * declare loginCount: number;
 * ```
 */
export function Default(value: any) {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(
      target.constructor,
      key,
      'defaultValue',
      value
    );
  };
}
