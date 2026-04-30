/**
 * @file has-timestamps.concern.ts
 * @description Mixin/concern that provides automatic timestamp management for Model instances.
 *
 * When enabled (via `@Timestamps()` decorator or static `timestamps` property), this concern
 * automatically sets `created_at` on insert and `updated_at` on both insert and update.
 * Custom field names can be configured via static `CREATED_AT` and `UPDATED_AT` properties.
 *
 * Reads `@Timestamps()` metadata from MetadataStorage, falling back to the static
 * `timestamps` boolean property on the Model class.
 *
 * @example
 * ```ts
 * @Timestamps()
 * class User extends HasTimestamps(BaseClass) {
 *   // created_at and updated_at are auto-managed
 * }
 *
 * // Custom field names:
 * class Post extends HasTimestamps(BaseClass) {
 *   static timestamps = true;
 *   static CREATED_AT = 'publishedAt';
 *   static UPDATED_AT = 'lastModifiedAt';
 * }
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Interface for the HasTimestamps concern.
 *
 * Defines the contract for automatic timestamp management on Model instances.
 */
export interface HasTimestampsInterface {
  /**
   * Touch (set) timestamp fields on the model.
   *
   * @param isNew - Whether this is a new record (insert) or existing (update).
   */
  touchTimestamps(isNew: boolean): void;
}

// ---------------------------------------------------------------------------
// HasTimestamps Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds automatic timestamp management to a base class.
 *
 * Provides the `touchTimestamps` method that sets `created_at` on insert and
 * `updated_at` on both insert and update. Reads `@Timestamps()` metadata from
 * MetadataStorage, falling back to the static `timestamps` property.
 *
 * The mixin expects the base class to have `setAttribute(key, value)` available
 * (provided by the HasAttributes concern).
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with HasTimestamps functionality.
 *
 * @example
 * ```ts
 * class User extends HasTimestamps(HasAttributes(BaseClass)) {
 *   static timestamps = true;
 * }
 *
 * const user = new User();
 * user.touchTimestamps(true);  // Sets both created_at and updated_at
 * user.touchTimestamps(false); // Sets only updated_at
 * ```
 */
export function HasTimestamps<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class HasTimestampsMixin extends Base implements HasTimestampsInterface {
    /**
     * Touch (set) timestamp fields on the model.
     *
     * When timestamps are enabled:
     * - On insert (`isNew = true`): sets both `created_at` and `updated_at`
     * - On update (`isNew = false`): sets only `updated_at`
     *
     * Respects custom field names via static `CREATED_AT` and `UPDATED_AT` properties.
     * Does nothing if timestamps are not enabled for this model.
     *
     * @param isNew - `true` for insert operations, `false` for updates.
     *
     * @example
     * ```ts
     * // On insert:
     * model.touchTimestamps(true);
     * // created_at = '2024-01-01T00:00:00.000Z'
     * // updated_at = '2024-01-01T00:00:00.000Z'
     *
     * // On update:
     * model.touchTimestamps(false);
     * // updated_at = '2024-01-01T00:00:01.000Z'
     * ```
     */
    touchTimestamps(isNew: boolean): void {
      if (!this._hasTimestamps()) {
        return;
      }

      const now = new Date().toISOString();
      const createdAtField = this._getCreatedAtField();
      const updatedAtField = this._getUpdatedAtField();

      // On insert, set both created_at and updated_at
      if (isNew) {
        if (typeof (this as any).setAttribute === 'function') {
          (this as any).setAttribute(createdAtField, now);
          (this as any).setAttribute(updatedAtField, now);
        } else {
          // Direct attribute access fallback
          if ((this as any)._attributes) {
            (this as any)._attributes[createdAtField] = now;
            (this as any)._attributes[updatedAtField] = now;
          }
        }
        return;
      }

      // On update, set only updated_at
      if (typeof (this as any).setAttribute === 'function') {
        (this as any).setAttribute(updatedAtField, now);
      } else {
        if ((this as any)._attributes) {
          (this as any)._attributes[updatedAtField] = now;
        }
      }
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Check if timestamps are enabled for this model.
     *
     * Resolution order:
     * 1. `@Timestamps()` metadata in MetadataStorage
     * 2. Static `timestamps` property on the class
     *
     * @returns `true` if timestamps should be auto-managed.
     * @internal
     */
    _hasTimestamps(): boolean {
      // 1. Check MetadataStorage
      const storage = MetadataStorage.getInstance();
      const classMeta = storage.getMergedClassMetadata(this.constructor);
      if (classMeta.timestamps) {
        return true;
      }

      // 2. Fall back to static timestamps property
      const staticTimestamps = (this.constructor as any).timestamps;
      if (staticTimestamps === true) {
        return true;
      }

      return false;
    }

    /**
     * Get the field name for the "created at" timestamp.
     *
     * Reads from the static `CREATED_AT` property, defaulting to `'created_at'`.
     *
     * @returns The created-at field name.
     * @internal
     */
    _getCreatedAtField(): string {
      return (this.constructor as any).CREATED_AT ?? 'created_at';
    }

    /**
     * Get the field name for the "updated at" timestamp.
     *
     * Reads from the static `UPDATED_AT` property, defaulting to `'updated_at'`.
     *
     * @returns The updated-at field name.
     * @internal
     */
    _getUpdatedAtField(): string {
      return (this.constructor as any).UPDATED_AT ?? 'updated_at';
    }
  };
}
