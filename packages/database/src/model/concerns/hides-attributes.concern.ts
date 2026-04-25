/**
 * @file hides-attributes.concern.ts
 * @description Mixin/concern that controls attribute visibility during JSON serialization.
 *
 * Provides `@Hidden()` and `@Visible()` decorator support for controlling which
 * attributes appear in `toJSON()` output. Reads metadata from MetadataStorage and
 * falls back to static `hidden` and `visible` array properties on the Model class.
 *
 * Visibility rules:
 * - If `visible` is non-empty → only those keys appear in output (whitelist mode)
 * - If `hidden` is non-empty → those keys are excluded from output (blacklist mode)
 * - `makeVisible(keys)` temporarily adds keys to the visible set
 * - `makeHidden(keys)` temporarily adds keys to the hidden set
 *
 * @example
 * ```ts
 * class User extends HidesAttributes(BaseClass) {
 *   static hidden = ['password', 'secret'];
 * }
 *
 * const user = new User();
 * user.getHidden();  // ['password', 'secret']
 * user.makeVisible(['password']);
 * // Now password will appear in toJSON()
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Interface for the HidesAttributes concern.
 *
 * Defines the contract for attribute visibility control on Model instances.
 */
export interface HidesAttributesInterface {
  /** Get the list of hidden field names. */
  getHidden(): string[];
  /** Get the list of visible field names. */
  getVisible(): string[];
  /** Temporarily add keys to the visible set. */
  makeVisible(keys: string[]): this;
  /** Temporarily add keys to the hidden set. */
  makeHidden(keys: string[]): this;
}

// ---------------------------------------------------------------------------
// HidesAttributes Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds attribute visibility control to a base class.
 *
 * Provides `getHidden`, `getVisible`, `makeVisible`, `makeHidden`, and
 * `applyVisibility` methods. Reads `@Hidden()` and `@Visible()` metadata
 * from MetadataStorage, falling back to static arrays on the class.
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with HidesAttributes functionality.
 *
 * @example
 * ```ts
 * class User extends HidesAttributes(BaseClass) {
 *   static hidden = ['password'];
 *   static visible = [];
 * }
 *
 * const user = new User();
 * const json = user.applyVisibility({ name: 'Alice', password: 'secret' });
 * // { name: 'Alice' } — password is hidden
 * ```
 */
export function HidesAttributes<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class HidesAttributesMixin extends Base implements HidesAttributesInterface {
    /**
     * Temporary additions to the visible set for this instance.
     * @internal
     */
    _temporaryVisible: Set<string> = new Set();

    /**
     * Temporary additions to the hidden set for this instance.
     * @internal
     */
    _temporaryHidden: Set<string> = new Set();

    /**
     * Get the list of hidden field names.
     *
     * Combines MetadataStorage `@Hidden()` fields, static `hidden` array,
     * and temporary hidden additions.
     *
     * @returns An array of field names that should be excluded from serialization.
     *
     * @example
     * ```ts
     * model.getHidden(); // ['password', 'secret']
     * ```
     */
    getHidden(): string[] {
      const hidden = new Set<string>();

      // 1. MetadataStorage
      const storage = MetadataStorage.getInstance();
      const metaHidden = storage.getMergedHiddenFields(this.constructor);
      for (const key of metaHidden) {
        hidden.add(key);
      }

      // 2. Static hidden property
      const staticHidden = (this.constructor as any).hidden as string[] | undefined;
      if (staticHidden) {
        for (const key of staticHidden) {
          hidden.add(key);
        }
      }

      // 3. Temporary hidden additions
      for (const key of this._temporaryHidden) {
        hidden.add(key);
      }

      return Array.from(hidden);
    }

    /**
     * Get the list of visible field names.
     *
     * Combines MetadataStorage `@Visible()` fields, static `visible` array,
     * and temporary visible additions.
     *
     * @returns An array of field names that should be included in serialization (whitelist).
     *
     * @example
     * ```ts
     * model.getVisible(); // ['name', 'email']
     * ```
     */
    getVisible(): string[] {
      const visible = new Set<string>();

      // 1. MetadataStorage
      const storage = MetadataStorage.getInstance();
      const metaVisible = storage.getMergedVisibleFields(this.constructor);
      for (const key of metaVisible) {
        visible.add(key);
      }

      // 2. Static visible property
      const staticVisible = (this.constructor as any).visible as string[] | undefined;
      if (staticVisible) {
        for (const key of staticVisible) {
          visible.add(key);
        }
      }

      // 3. Temporary visible additions
      for (const key of this._temporaryVisible) {
        visible.add(key);
      }

      return Array.from(visible);
    }

    /**
     * Temporarily add keys to the visible set for this instance.
     *
     * This does not modify the class-level configuration — only this
     * specific instance is affected. Useful for one-off serialization
     * where you need to expose normally-hidden fields.
     *
     * @param keys - The attribute names to make visible.
     * @returns `this` for chaining.
     *
     * @example
     * ```ts
     * model.makeVisible(['password']).toJSON();
     * // password will appear in this serialization
     * ```
     */
    makeVisible(keys: string[]): this {
      for (const key of keys) {
        this._temporaryVisible.add(key);
        // Remove from temporary hidden if present
        this._temporaryHidden.delete(key);
      }
      return this;
    }

    /**
     * Temporarily add keys to the hidden set for this instance.
     *
     * This does not modify the class-level configuration — only this
     * specific instance is affected.
     *
     * @param keys - The attribute names to hide.
     * @returns `this` for chaining.
     *
     * @example
     * ```ts
     * model.makeHidden(['email']).toJSON();
     * // email will be excluded from this serialization
     * ```
     */
    makeHidden(keys: string[]): this {
      for (const key of keys) {
        this._temporaryHidden.add(key);
        // Remove from temporary visible if present
        this._temporaryVisible.delete(key);
      }
      return this;
    }

    /**
     * Apply visibility rules to an attributes object for serialization.
     *
     * Logic:
     * 1. If visible set is non-empty → intersect (only visible keys appear)
     * 2. If hidden set is non-empty → subtract (hidden keys are removed)
     * 3. If both are empty → return all attributes
     *
     * @param attributes - The raw attributes object to filter.
     * @returns A new object with visibility rules applied.
     *
     * @example
     * ```ts
     * // With hidden = ['password']:
     * model.applyVisibility({ name: 'Alice', password: 'secret' });
     * // { name: 'Alice' }
     *
     * // With visible = ['name']:
     * model.applyVisibility({ name: 'Alice', email: 'a@b.com' });
     * // { name: 'Alice' }
     * ```
     */
    applyVisibility(attributes: Record<string, any>): Record<string, any> {
      const visible = this.getVisible();
      const hidden = this.getHidden();

      let result = { ...attributes };

      // Whitelist mode: if visible is non-empty, only include those keys
      if (visible.length > 0) {
        const visibleSet = new Set(visible);
        const filtered: Record<string, any> = {};
        for (const key of Object.keys(result)) {
          if (visibleSet.has(key)) {
            filtered[key] = result[key];
          }
        }
        result = filtered;
      }

      // Blacklist mode: remove hidden keys
      if (hidden.length > 0) {
        const hiddenSet = new Set(hidden);
        for (const key of hiddenSet) {
          delete result[key];
        }
      }

      return result;
    }
  };
}
