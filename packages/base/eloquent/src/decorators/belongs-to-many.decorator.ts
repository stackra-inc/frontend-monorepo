/**
 * @file belongs-to-many.decorator.ts
 * @description Property decorator that registers a belongsToMany relation on a Model property.
 *
 * The `@BelongsToMany` decorator stores relation metadata in MetadataStorage using a factory
 * function for the related Model to avoid circular dependency issues. This relation type
 * uses a pivot collection to connect two Models in a many-to-many relationship.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a belongsToMany (many-to-many) relation on a Model property.
 *
 * The related Model is specified via a factory function `(() => Model)` to defer
 * class resolution and avoid circular dependency errors.
 *
 * @param relatedFactory   - Factory function returning the related Model class.
 * @param pivotCollection  - The name of the pivot collection.
 * @param foreignPivotKey  - The foreign key for this Model in the pivot collection.
 * @param relatedPivotKey  - The foreign key for the related Model in the pivot collection.
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @BelongsToMany(() => Role, 'user_roles', 'user_id', 'role_id')
 * declare roles: Role[];
 *
 * @BelongsToMany(() => Tag, 'post_tags', 'post_id', 'tag_id')
 * declare tags: Tag[];
 * ```
 */
export function BelongsToMany(
  relatedFactory: () => any,
  pivotCollection: string,
  foreignPivotKey: string,
  relatedPivotKey: string
) {
  return function (target: object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerRelation(target.constructor, {
      propertyKey: key,
      type: 'belongsToMany',
      relatedFactory,
      foreignKey: foreignPivotKey,
      pivotCollection,
      foreignPivotKey,
      relatedPivotKey,
    });
  };
}
