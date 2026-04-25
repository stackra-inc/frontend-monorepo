/**
 * @file soft-deletes.concern.ts
 * @description Mixin/concern that provides soft deletion functionality for Model instances.
 *
 * When enabled (via `@SoftDeletes()` decorator), this concern overrides the default
 * `delete()` behavior to set a `deleted_at` timestamp instead of permanently removing
 * the document. Provides `trashed()`, `restore()`, and `forceDelete()` methods.
 *
 * Reads `@SoftDeletes()` metadata from MetadataStorage. The SchemaResolver automatically
 * adds a `deleted_at` column when `@SoftDeletes()` is present.
 *
 * @example
 * ```ts
 * @SoftDeletes()
 * class User extends SoftDeletes(BaseClass) {
 *   // delete() now sets deleted_at instead of removing
 * }
 *
 * const user = await User.find('123');
 * await user.delete();       // Sets deleted_at = now
 * user.trashed();            // true
 * await user.restore();      // Sets deleted_at = null, saves
 * await user.forceDelete();  // Permanently removes via RxDocument.remove()
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Interface for the SoftDeletes concern.
 *
 * Defines the contract for soft deletion on Model instances.
 */
export interface SoftDeletesInterface {
  /** Check if the model has been soft-deleted. */
  trashed(): boolean;
  /** Restore a soft-deleted model by clearing deleted_at and saving. */
  restore(): Promise<void>;
  /** Permanently delete the model by calling RxDocument.remove(). */
  forceDelete(): Promise<void>;
}

// ---------------------------------------------------------------------------
// SoftDeletes Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds soft deletion capabilities to a base class.
 *
 * Provides `trashed`, `restore`, `forceDelete`, and an overridden `delete`
 * method. Reads `@SoftDeletes()` metadata from MetadataStorage.
 *
 * The mixin expects the base class to have `getAttribute`, `setAttribute`,
 * and `save` methods available (provided by HasAttributes and the Model class).
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with SoftDeletes functionality.
 *
 * @example
 * ```ts
 * @SoftDeletes()
 * class Post extends SoftDeletes(HasAttributes(BaseClass)) {}
 *
 * const post = new Post();
 * post.setAttribute('deleted_at', new Date().toISOString());
 * post.trashed(); // true
 * ```
 */
export function SoftDeletes<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class SoftDeletesMixin extends Base implements SoftDeletesInterface {
    /**
     * Check if the model instance has been soft-deleted.
     *
     * Returns `true` if the `deleted_at` attribute is set (not null/undefined).
     *
     * @returns `true` if the model is soft-deleted.
     *
     * @example
     * ```ts
     * model.trashed(); // true if deleted_at is set
     * ```
     */
    trashed(): boolean {
      if (!this._hasSoftDeletes()) {
        return false;
      }

      const deletedAtField = this._getDeletedAtField();
      const value = this._getAttributeValue(deletedAtField);
      return value !== null && value !== undefined;
    }

    /**
     * Restore a soft-deleted model by clearing the `deleted_at` field and saving.
     *
     * Sets `deleted_at` to `null` and calls `save()` to persist the change.
     * Does nothing if soft deletes are not enabled.
     *
     * @returns A promise that resolves when the restore is complete.
     *
     * @example
     * ```ts
     * await model.restore();
     * model.trashed(); // false
     * ```
     */
    async restore(): Promise<void> {
      if (!this._hasSoftDeletes()) {
        return;
      }

      // Fire restoring event
      if (typeof (this as any).fireEvent === 'function') {
        if (!(this as any).fireEvent('restoring')) {
          return;
        }
      }

      const deletedAtField = this._getDeletedAtField();

      if (typeof (this as any).setAttribute === 'function') {
        (this as any).setAttribute(deletedAtField, null);
      }

      // Persist via RxDocument
      const rxDocument = (this as any)._rxDocument;
      if (rxDocument && typeof rxDocument.incrementalPatch === 'function') {
        await rxDocument.incrementalPatch({ [deletedAtField]: null });
      }

      // Fire restored event
      if (typeof (this as any).fireEvent === 'function') {
        (this as any).fireEvent('restored');
      }
    }

    /**
     * Permanently delete the model by calling `RxDocument.remove()` directly.
     *
     * Bypasses the soft delete mechanism and permanently removes the document
     * from the RxDB collection.
     *
     * @returns A promise that resolves when the document is removed.
     *
     * @example
     * ```ts
     * await model.forceDelete(); // Permanently removed from database
     * ```
     */
    async forceDelete(): Promise<void> {
      // Access the underlying RxDocument and call remove()
      const rxDocument = (this as any).rxDocument ?? (this as any)._rxDocument;
      if (!rxDocument || typeof rxDocument.remove !== 'function') {
        throw new Error('Cannot forceDelete: RxDocument reference is missing.');
      }
      await rxDocument.remove();
      (this as any)._exists = false;
    }

    /**
     * Perform a soft delete by setting `deleted_at` to the current timestamp.
     *
     * This method is intended to override the Model's `delete()` method when
     * soft deletes are enabled. Instead of removing the document, it sets
     * `deleted_at` and saves.
     *
     * If soft deletes are not enabled, this method does nothing — the Model's
     * original `delete()` should handle permanent deletion.
     *
     * @returns A promise that resolves when the soft delete is complete.
     *
     * @example
     * ```ts
     * await model.performSoftDelete();
     * model.trashed(); // true
     * ```
     */
    async performSoftDelete(): Promise<void> {
      if (!this._hasSoftDeletes()) {
        return;
      }

      const deletedAtField = this._getDeletedAtField();
      const now = new Date().toISOString();

      // Set deleted_at to current timestamp
      if (typeof (this as any).setAttribute === 'function') {
        (this as any).setAttribute(deletedAtField, now);
      }

      // Persist via RxDocument
      const rxDocument = (this as any)._rxDocument;
      if (rxDocument && typeof rxDocument.incrementalPatch === 'function') {
        await rxDocument.incrementalPatch({ [deletedAtField]: now });
      }
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Check if soft deletes are enabled for this model.
     *
     * Reads `@SoftDeletes()` metadata from MetadataStorage.
     *
     * @returns `true` if soft deletes are enabled.
     * @internal
     */
    _hasSoftDeletes(): boolean {
      const storage = MetadataStorage.getInstance();
      const classMeta = storage.getMergedClassMetadata(this.constructor);
      return classMeta.softDeletes;
    }

    /**
     * Get the field name for the soft delete timestamp.
     *
     * Reads from the static `DELETED_AT` property, defaulting to `'deleted_at'`.
     *
     * @returns The deleted-at field name.
     * @internal
     */
    _getDeletedAtField(): string {
      return (this.constructor as any).DELETED_AT ?? 'deleted_at';
    }

    /**
     * Get an attribute value, using getAttribute if available or direct access.
     *
     * @param key - The attribute name.
     * @returns The attribute value.
     * @internal
     */
    _getAttributeValue(key: string): any {
      if (typeof (this as any).getAttribute === 'function') {
        return (this as any).getAttribute(key);
      }
      return (this as any)._attributes?.[key];
    }
  };
}
