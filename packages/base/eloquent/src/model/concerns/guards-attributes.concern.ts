/**
 * @file guards-attributes.concern.ts
 * @description Mixin/concern that provides mass assignment protection for Model instances.
 *
 * Implements the fillable/guarded pattern from Laravel Eloquent. Properties marked with
 * `@Fillable()` are allowed for mass assignment, while properties marked with `@Guarded()`
 * are protected. This concern reads decorator metadata from MetadataStorage and falls back
 * to static `fillable` and `guarded` array properties on the Model class.
 *
 * Mass assignment rules:
 * - `fillable = ['*']` → all attributes are mass-assignable
 * - `guarded = ['*']` → all attributes are guarded (none mass-assignable)
 * - Both empty → totally guarded (no mass assignment allowed)
 * - Fillable set non-empty → only those keys are allowed
 * - Guarded set non-empty → all keys except guarded ones are allowed
 *
 * @example
 * ```ts
 * class User extends GuardsAttributes(BaseClass) {
 *   static fillable = ['name', 'email'];
 *   static guarded = ['password'];
 * }
 *
 * const instance = new User();
 * instance.isFillable('name');     // true
 * instance.isGuarded('password');  // true
 * instance.fillableFromArray({ name: 'Alice', password: 'secret' });
 * // Returns { name: 'Alice' } — password is filtered out
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Interface for the GuardsAttributes concern.
 *
 * Defines the contract for mass assignment protection on Model instances.
 */
export interface GuardsAttributesInterface {
  /** Check if a key is mass-assignable. */
  isFillable(key: string): boolean;
  /** Check if a key is guarded from mass assignment. */
  isGuarded(key: string): boolean;
  /** Filter an attributes object to only fillable keys. */
  fillableFromArray(attributes: Record<string, any>): Record<string, any>;
  /** Check if the model is totally guarded (no mass assignment allowed). */
  totallyGuarded(): boolean;
}

// ---------------------------------------------------------------------------
// GuardsAttributes Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds mass assignment protection to a base class.
 *
 * Provides `isFillable`, `isGuarded`, `fillableFromArray`, and `totallyGuarded`
 * methods. Reads `@Fillable()` and `@Guarded()` metadata from MetadataStorage,
 * falling back to static `fillable` and `guarded` arrays on the class.
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with GuardsAttributes functionality.
 *
 * @example
 * ```ts
 * class User extends GuardsAttributes(BaseClass) {
 *   static fillable = ['name', 'email'];
 * }
 *
 * const user = new User();
 * user.fillableFromArray({ name: 'Alice', role: 'admin' });
 * // { name: 'Alice' } — 'role' is not in fillable
 * ```
 */
export function GuardsAttributes<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class GuardsAttributesMixin extends Base implements GuardsAttributesInterface {
    /**
     * Check if a given attribute key is mass-assignable.
     *
     * Resolution logic:
     * 1. Get fillable set from MetadataStorage or static `fillable` property
     * 2. If fillable contains `'*'`, all keys are fillable
     * 3. If fillable set is non-empty, key must be in the set
     * 4. If fillable is empty, check guarded — key is fillable if not guarded
     *
     * @param key - The attribute name to check.
     * @returns `true` if the key is allowed for mass assignment.
     *
     * @example
     * ```ts
     * model.isFillable('name');     // true (if name is in fillable)
     * model.isFillable('password'); // false (if password is guarded)
     * ```
     */
    isFillable(key: string): boolean {
      const fillable = this._getFillableSet();
      const guarded = this._getGuardedSet();

      // The primary key is always fillable — it must pass through
      // mass assignment so that Model.create({ id: '...' }) works.
      const pk = (this.constructor as any).primaryKey ?? 'id';
      if (key === pk) {
        return true;
      }

      // fillable=['*'] allows all
      if (fillable.has('*')) {
        return true;
      }

      // If fillable set is non-empty, key must be in it
      if (fillable.size > 0) {
        return fillable.has(key);
      }

      // If fillable is empty, check guarded
      // guarded=['*'] guards all
      if (guarded.has('*')) {
        return false;
      }

      // Key is fillable if not in guarded set
      if (guarded.size > 0) {
        return !guarded.has(key);
      }

      // Both empty = totally guarded
      return false;
    }

    /**
     * Check if a given attribute key is guarded from mass assignment.
     *
     * @param key - The attribute name to check.
     * @returns `true` if the key is protected from mass assignment.
     *
     * @example
     * ```ts
     * model.isGuarded('password'); // true
     * model.isGuarded('name');     // false
     * ```
     */
    isGuarded(key: string): boolean {
      const guarded = this._getGuardedSet();

      // guarded=['*'] guards all
      if (guarded.has('*')) {
        return true;
      }

      // Explicitly guarded
      if (guarded.has(key)) {
        return true;
      }

      // If no fillable and no guarded, totally guarded
      const fillable = this._getFillableSet();
      if (fillable.size === 0 && guarded.size === 0) {
        return true;
      }

      // If fillable is set and key is not in it, it's effectively guarded
      if (fillable.size > 0 && !fillable.has('*') && !fillable.has(key)) {
        return true;
      }

      return false;
    }

    /**
     * Filter an attributes object to only include mass-assignable keys.
     *
     * Iterates over the provided attributes and returns a new object
     * containing only the keys that pass the `isFillable()` check.
     *
     * @param attributes - The raw attributes object to filter.
     * @returns A new object with only fillable key-value pairs.
     *
     * @example
     * ```ts
     * const filtered = model.fillableFromArray({
     *   name: 'Alice',
     *   email: 'alice@example.com',
     *   role: 'admin',
     * });
     * // If fillable = ['name', 'email']:
     * // { name: 'Alice', email: 'alice@example.com' }
     * ```
     */
    fillableFromArray(attributes: Record<string, any>): Record<string, any> {
      const result: Record<string, any> = {};

      for (const key of Object.keys(attributes)) {
        if (this.isFillable(key)) {
          result[key] = attributes[key];
        }
      }

      return result;
    }

    /**
     * Check if the model is totally guarded (no mass assignment allowed).
     *
     * Returns `true` when both the fillable and guarded sets are empty,
     * meaning no explicit mass assignment rules have been defined.
     *
     * @returns `true` if the model rejects all mass assignment.
     *
     * @example
     * ```ts
     * model.totallyGuarded(); // true if no @Fillable or @Guarded decorators
     * ```
     */
    totallyGuarded(): boolean {
      const fillable = this._getFillableSet();
      const guarded = this._getGuardedSet();
      return fillable.size === 0 && guarded.size === 0;
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Get the set of fillable field names.
     *
     * Reads from MetadataStorage first, then falls back to the static
     * `fillable` array property on the class.
     *
     * @returns A Set of fillable field names.
     * @internal
     */
    _getFillableSet(): Set<string> {
      // 1. Check MetadataStorage
      const storage = MetadataStorage.getInstance();
      const metaFillable = storage.getMergedFillableFields(this.constructor);
      if (metaFillable.size > 0) {
        return metaFillable;
      }

      // 2. Fall back to static fillable property
      const staticFillable = (this.constructor as any).fillable as string[] | undefined;
      if (staticFillable && staticFillable.length > 0) {
        return new Set(staticFillable);
      }

      return new Set();
    }

    /**
     * Get the set of guarded field names.
     *
     * Reads from MetadataStorage first, then falls back to the static
     * `guarded` array property on the class.
     *
     * @returns A Set of guarded field names.
     * @internal
     */
    _getGuardedSet(): Set<string> {
      // 1. Check MetadataStorage
      const storage = MetadataStorage.getInstance();
      const metaGuarded = storage.getMergedGuardedFields(this.constructor);
      if (metaGuarded.size > 0) {
        return metaGuarded;
      }

      // 2. Fall back to static guarded property
      const staticGuarded = (this.constructor as any).guarded as string[] | undefined;
      if (staticGuarded && staticGuarded.length > 0) {
        return new Set(staticGuarded);
      }

      return new Set();
    }
  };
}
