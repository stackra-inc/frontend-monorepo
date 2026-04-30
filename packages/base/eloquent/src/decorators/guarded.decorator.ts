/**
 * @file guarded.decorator.ts
 * @description Property decorator that marks a Model property as guarded from mass assignment.
 *
 * The `@Guarded` decorator sets the `isGuarded` flag on the column metadata
 * in MetadataStorage. Guarded properties cannot be set via `create()` or `fill()`.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Marks a Model property as guarded from mass assignment.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Guarded()
 * @Column({ type: 'string', maxLength: 255 })
 * declare password: string;
 * ```
 */
export function Guarded() {
  return function (target: object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isGuarded', true);
  };
}
