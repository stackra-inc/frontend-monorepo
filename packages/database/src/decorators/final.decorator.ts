/**
 * @file final.decorator.ts
 * @description Property decorator that marks a Model property as immutable after creation.
 *
 * The `@Final` decorator sets the `isFinal` flag on the column metadata
 * in MetadataStorage. Final properties cannot be changed after the document
 * is first inserted.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Marks a Model property as immutable after creation.
 *
 * Once a document is created, final properties cannot be updated.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Final()
 * @Column({ type: 'string', maxLength: 100 })
 * declare slug: string;
 * ```
 */
export function Final() {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isFinal', true);
  };
}
