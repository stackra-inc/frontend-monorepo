/**
 * @file timestamps.decorator.ts
 * @description Class decorator that enables automatic `created_at` / `updated_at` management.
 *
 * The `@Timestamps` decorator sets the `timestamps` flag in MetadataStorage so that
 * the Model base class and SchemaResolver auto-add timestamp columns.
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

/**
 * Enables automatic timestamp management (`created_at` / `updated_at`) for a Model class.
 *
 * @returns A class decorator function.
 *
 * @example
 * ```ts
 * @Timestamps()
 * class Post extends Model {
 *   // created_at and updated_at are auto-managed
 * }
 * ```
 */
export function Timestamps() {
  return function (target: Function) {
    MetadataStorage.getInstance().registerClassMetadata(target, 'timestamps', true);
  };
}
