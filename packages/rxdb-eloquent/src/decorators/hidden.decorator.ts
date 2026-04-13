/**
 * @file hidden.decorator.ts
 * @description Property decorator that excludes a Model property from `toJSON()` output.
 *
 * The `@Hidden` decorator sets the `isHidden` flag on the column metadata
 * in MetadataStorage. Hidden properties are stripped from serialized output.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Excludes a Model property from `toJSON()` serialization output.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Hidden()
 * @Column({ type: 'string', maxLength: 255 })
 * declare password: string;
 * ```
 */
export function Hidden() {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isHidden', true);
  };
}
