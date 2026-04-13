/**
 * @file has-one.decorator.ts
 * @description Property decorator that registers a hasOne relation on a Model property.
 *
 * The `@HasOne` decorator stores relation metadata in MetadataStorage using a factory
 * function for the related Model to avoid circular dependency issues.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a hasOne relation on a Model property.
 *
 * The related Model is specified via a factory function `(() => Model)` to defer
 * class resolution and avoid circular dependency errors.
 *
 * @param relatedFactory - Factory function returning the related Model class.
 * @param foreignKey     - The foreign key column on the related collection.
 * @param localKey       - The local key on this Model (defaults to primary key).
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @HasOne(() => Profile, 'user_id')
 * declare profile: Profile;
 *
 * @HasOne(() => Phone, 'user_id', 'id')
 * declare phone: Phone;
 * ```
 */
export function HasOne(relatedFactory: () => any, foreignKey: string, localKey?: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerRelation(target.constructor, {
      propertyKey: key,
      type: 'hasOne',
      relatedFactory,
      foreignKey,
      localKey,
    });
  };
}
