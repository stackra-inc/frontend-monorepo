/**
 * @file soft-deletes.decorator.ts
 * @description Class decorator that enables soft deletion with a `deleted_at` timestamp.
 *
 * The `@SoftDeletes` decorator sets the `softDeletes` flag in MetadataStorage so that
 * the Model base class and SchemaResolver auto-add the `deleted_at` column and apply
 * a global scope to exclude soft-deleted documents by default.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Enables soft deletion for a Model class.
 *
 * When enabled, calling `delete()` sets `deleted_at` instead of removing the document.
 * A global scope automatically excludes soft-deleted documents from queries.
 *
 * @returns A class decorator function.
 *
 * @example
 * ```ts
 * @SoftDeletes()
 * class Post extends Model {
 *   // delete() sets deleted_at, use forceDelete() to permanently remove
 * }
 * ```
 */
export function SoftDeletes() {
  return function (target: Function) {
    MetadataStorage.getInstance().registerClassMetadata(target, 'softDeletes', true);
  };
}
