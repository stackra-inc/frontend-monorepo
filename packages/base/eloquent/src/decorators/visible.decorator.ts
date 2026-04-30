/**
 * @file visible.decorator.ts
 * @description Property decorator that includes a Model property in `toJSON()` whitelist mode.
 *
 * The `@Visible` decorator sets the `isVisible` flag on the column metadata
 * in MetadataStorage. When any property is marked visible, only visible properties
 * appear in serialized output.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Includes a Model property in the `toJSON()` whitelist.
 *
 * When at least one property is marked `@Visible()`, only visible properties
 * are included in serialization output.
 *
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @Visible()
 * @Column({ type: 'string', maxLength: 255 })
 * declare name: string;
 * ```
 */
export function Visible() {
  return function (target: object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerColumnFlag(target.constructor, key, 'isVisible', true);
  };
}
