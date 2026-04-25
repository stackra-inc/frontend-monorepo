/**
 * @file belongs-to.decorator.ts
 * @description Property decorator that registers a belongsTo relation on a Model property.
 *
 * The `@BelongsTo` decorator stores relation metadata in MetadataStorage using a factory
 * function for the related Model to avoid circular dependency issues.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Registers a belongsTo relation on a Model property.
 *
 * The related Model is specified via a factory function `(() => Model)` to defer
 * class resolution and avoid circular dependency errors.
 *
 * @param relatedFactory - Factory function returning the related (parent) Model class.
 * @param foreignKey     - The foreign key column on this Model.
 * @param ownerKey       - The owner key on the parent Model (defaults to primary key).
 * @returns A property decorator function.
 *
 * @example
 * ```ts
 * @BelongsTo(() => User, 'user_id')
 * declare user: User;
 *
 * @BelongsTo(() => Category, 'category_id', 'id')
 * declare category: Category;
 * ```
 */
export function BelongsTo(relatedFactory: () => any, foreignKey: string, ownerKey?: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const key = typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;
    MetadataStorage.getInstance().registerRelation(target.constructor, {
      propertyKey: key,
      type: 'belongsTo',
      relatedFactory,
      foreignKey,
      ownerKey,
    });
  };
}
