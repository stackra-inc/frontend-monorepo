/**
 * @file column.decorator.ts
 * @description Property decorator that registers a schema column definition for a Model property.
 *
 * The `@Column` decorator stores the column type and constraints in MetadataStorage.
 * The SchemaResolver reads this metadata to produce the `properties` section of an `RxJsonSchema`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';
import type { ColumnOptions } from '@/metadata/metadata.storage';

/**
 * Registers a schema column definition for a Model property.
 *
 * @param options - Column type and constraint options (type, maxLength, minimum, etc.).
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Column({ type: 'string', maxLength: 255 })
 * declare name: string;
 *
 * @Column({ type: 'integer', minimum: 0 })
 * declare age: number;
 *
 * @Column({ type: 'enum', enumValues: ['active', 'inactive'] })
 * declare status: string;
 * ```
 */
export function Column(options: ColumnOptions) {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumn(target.constructor, key, options);
  };
}
