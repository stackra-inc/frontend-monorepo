/**
 * @file cast.decorator.ts
 * @description Property decorator that registers an attribute cast type for a Model property.
 *
 * The `@Cast` decorator sets the `castType` value on the column metadata
 * in MetadataStorage. The Model's attribute system uses this to transform
 * values between their stored format and in-memory representation.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers an attribute cast type for a Model property.
 *
 * @param type - The cast type (e.g. `'string'`, `'integer'`, `'date'`, `'json'`, `'array'`).
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Cast('date')
 * @Column({ type: 'string', format: 'date-time' })
 * declare createdAt: Date;
 *
 * @Cast('json')
 * @Column({ type: 'object' })
 * declare settings: Record<string, any>;
 * ```
 */
export function Cast(type: string) {
  return function (target: object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'castType', type);
  };
}
