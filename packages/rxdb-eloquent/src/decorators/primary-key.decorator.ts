/**
 * @file primary-key.decorator.ts
 * @description Property decorator that marks a Model property as the primary key.
 *
 * The `@PrimaryKey` decorator sets the `isPrimary` flag on the column metadata
 * in MetadataStorage. The SchemaResolver uses this to set the `primaryKey` field
 * on the generated `RxJsonSchema`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Marks a Model property as the primary key.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @PrimaryKey()
 * @Column({ type: 'string', maxLength: 100 })
 * declare id: string;
 * ```
 */
export function PrimaryKey() {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isPrimary', true);
  };
}
