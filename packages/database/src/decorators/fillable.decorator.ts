/**
 * @file fillable.decorator.ts
 * @description Property decorator that marks a Model property as mass-assignable.
 *
 * The `@Fillable` decorator sets the `isFillable` flag on the column metadata
 * in MetadataStorage. The Model's mass assignment guard reads this to determine
 * which properties can be set via `create()` or `fill()`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Marks a Model property as mass-assignable.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Fillable()
 * @Column({ type: 'string', maxLength: 255 })
 * declare name: string;
 * ```
 */
export function Fillable() {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isFillable', true);
  };
}
