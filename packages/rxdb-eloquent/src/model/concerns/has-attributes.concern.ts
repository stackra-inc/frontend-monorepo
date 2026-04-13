/**
 * @file has-attributes.concern.ts
 * @description Mixin/concern that provides attribute management for Model instances,
 * including get/set with accessor/mutator support, attribute casting, dirty tracking,
 * and original attribute snapshots.
 *
 * This concern is mixed into the Model base class to provide Eloquent-style attribute
 * handling. It reads `@Accessor()`, `@Mutator()`, and `@Cast()` metadata from
 * MetadataStorage, falling back to convention-based `get<Key>Attribute()` /
 * `set<Key>Attribute()` methods and static `casts` properties.
 *
 * @example
 * ```ts
 * // After mixing into Model:
 * const user = new User();
 * user.setAttribute('name', 'Alice');
 * user.getAttribute('name'); // 'Alice'
 * user.isDirty('name');      // true
 * user.getOriginal();        // {}
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Supported cast types for attribute transformation.
 *
 * Each cast type defines how values are transformed when getting (read)
 * and setting (write) attributes on a Model instance.
 */
export type CastType = 'string' | 'integer' | 'number' | 'boolean' | 'date' | 'json' | 'array';

/**
 * Interface for the HasAttributes concern.
 *
 * Defines the contract for attribute management on Model instances,
 * including get/set, casting, accessors/mutators, and dirty tracking.
 */
export interface HasAttributesInterface {
  /** Get a single attribute value by key, applying accessor and cast. */
  getAttribute(key: string): any;
  /** Set a single attribute value by key, applying mutator and cast. */
  setAttribute(key: string, value: any): void;
  /** Get all current attributes as a plain object. */
  getAttributes(): Record<string, any>;
  /** Get the original attributes snapshot (at load time). */
  getOriginal(): Record<string, any>;
  /** Check if one or all attributes have changed since load. */
  isDirty(key?: string): boolean;
  /** Get the cast type for a given attribute key. */
  getCastType(key: string): CastType | undefined;
  /** Apply cast transformation to a value for a given key. */
  castAttribute(key: string, value: any): any;
}

// ---------------------------------------------------------------------------
// Cast Implementations
// ---------------------------------------------------------------------------

/**
 * Apply a "get" cast transformation — converts stored value to in-memory type.
 *
 * @param castType - The cast type to apply.
 * @param value    - The raw stored value.
 * @returns The transformed value for reading.
 *
 * @example
 * ```ts
 * applyCastGet('date', '2024-01-01T00:00:00.000Z'); // Date object
 * applyCastGet('integer', '42.7');                    // 43
 * applyCastGet('json', '{"a":1}');                    // { a: 1 }
 * ```
 */
function applyCastGet(castType: CastType, value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  switch (castType) {
    case 'string':
      return String(value);

    case 'integer':
      return Math.round(Number(value));

    case 'number':
      return Number(value);

    case 'boolean':
      return Boolean(value);

    case 'date':
      // Stored as ISO string → return Date object
      return new Date(value);

    case 'json':
      // Stored as JSON string → parse to object
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;

    case 'array':
      // Same as json — stored as JSON string → parse to array
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;

    default:
      return value;
  }
}

/**
 * Apply a "set" cast transformation — converts in-memory value to stored format.
 *
 * @param castType - The cast type to apply.
 * @param value    - The in-memory value to transform for storage.
 * @returns The transformed value for storage.
 *
 * @example
 * ```ts
 * applyCastSet('date', new Date('2024-01-01')); // '2024-01-01T00:00:00.000Z'
 * applyCastSet('json', { a: 1 });                // { a: 1 } (RxDB stores natively)
 * applyCastSet('json', '{"a":1}');                // { a: 1 } (parsed from string)
 * applyCastSet('integer', 42.7);                  // 43
 * ```
 */
function applyCastSet(castType: CastType, value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  switch (castType) {
    case 'string':
      return String(value);

    case 'integer':
      return Math.round(Number(value));

    case 'number':
      return Number(value);

    case 'boolean':
      return Boolean(value);

    case 'date':
      // In-memory Date → ISO string for storage
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;

    case 'json':
      // RxDB stores objects natively — no need to stringify.
      // Just ensure the value is a proper object (parse if string).
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
      }
      return value;

    case 'array':
      // Same as json — RxDB stores arrays natively.
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
      }
      return value;

    default:
      return value;
  }
}

// ---------------------------------------------------------------------------
// Helper: PascalCase conversion
// ---------------------------------------------------------------------------

/**
 * Convert a snake_case or camelCase key to PascalCase for convention-based
 * accessor/mutator method name resolution.
 *
 * @param key - The attribute key (e.g. 'first_name', 'email').
 * @returns The PascalCase version (e.g. 'FirstName', 'Email').
 */
function toPascalCase(key: string): string {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// ---------------------------------------------------------------------------
// HasAttributes Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds attribute management capabilities to a base class.
 *
 * Provides `getAttribute`, `setAttribute`, `getAttributes`, `getOriginal`,
 * `isDirty`, `getCastType`, and `castAttribute` methods. Integrates with
 * MetadataStorage for `@Accessor()`, `@Mutator()`, and `@Cast()` decorator
 * metadata, and falls back to convention-based methods and static properties.
 *
 * @param Base - The base class to extend.
 * @returns A new class extending Base with HasAttributes functionality.
 *
 * @example
 * ```ts
 * class MyModel extends HasAttributes(BaseClass) {
 *   static casts: Record<string, CastType> = { age: 'integer' };
 * }
 *
 * const instance = new MyModel();
 * instance.setAttribute('age', '25');
 * instance.getAttribute('age'); // 25 (cast to integer)
 * ```
 */
export function HasAttributes<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class HasAttributesMixin extends Base implements HasAttributesInterface {
    /**
     * Internal map storing current attribute values.
     * @internal
     */
    _attributes: Record<string, any> = {};

    /**
     * Snapshot of attributes at load time, used for dirty tracking.
     * @internal
     */
    _original: Record<string, any> = {};

    /**
     * Get a single attribute value by key.
     *
     * Resolution order:
     * 1. Check for `@Accessor()` metadata in MetadataStorage
     * 2. Fall back to `get<PascalKey>Attribute()` convention method
     * 3. Apply cast if registered via `@Cast()` or static `casts`
     * 4. Return raw value from attributes map
     *
     * @param key - The attribute name to read.
     * @returns The attribute value after accessor/cast transformations.
     *
     * @example
     * ```ts
     * model.getAttribute('name');      // 'Alice'
     * model.getAttribute('created_at'); // Date object (if cast to 'date')
     * ```
     */
    getAttribute(key: string): any {
      const rawValue = this._attributes[key];

      // 1. Check for @Accessor() metadata
      const accessor = this._findAccessor(key);
      if (accessor) {
        return accessor.call(this, rawValue);
      }

      // 2. Fall back to get<Key>Attribute() convention
      const conventionMethod = `get${toPascalCase(key)}Attribute`;
      if (typeof (this as any)[conventionMethod] === 'function') {
        return (this as any)[conventionMethod](rawValue);
      }

      // 3. Apply cast if registered
      const castType = this.getCastType(key);
      if (castType) {
        return applyCastGet(castType, rawValue);
      }

      // 4. Return raw value
      return rawValue;
    }

    /**
     * Set a single attribute value by key.
     *
     * Resolution order:
     * 1. Check for `@Mutator()` metadata in MetadataStorage
     * 2. Fall back to `set<PascalKey>Attribute()` convention method
     * 3. Apply cast if registered via `@Cast()` or static `casts`
     * 4. Store value in attributes map
     *
     * @param key   - The attribute name to write.
     * @param value - The value to set.
     *
     * @example
     * ```ts
     * model.setAttribute('name', 'Bob');
     * model.setAttribute('created_at', new Date()); // stored as ISO string if cast to 'date'
     * ```
     */
    setAttribute(key: string, value: any): void {
      // 1. Check for @Mutator() metadata
      const mutator = this._findMutator(key);
      if (mutator) {
        this._attributes[key] = mutator.call(this, value);
        return;
      }

      // 2. Fall back to set<Key>Attribute() convention
      const conventionMethod = `set${toPascalCase(key)}Attribute`;
      if (typeof (this as any)[conventionMethod] === 'function') {
        this._attributes[key] = (this as any)[conventionMethod](value);
        return;
      }

      // 3. Apply cast if registered
      const castType = this.getCastType(key);
      if (castType) {
        this._attributes[key] = applyCastSet(castType, value);
        return;
      }

      // 4. Store raw value
      this._attributes[key] = value;
    }

    /**
     * Get all current attributes as a plain object.
     *
     * Returns a shallow copy of the internal attributes map.
     *
     * @returns A record of all attribute key-value pairs.
     *
     * @example
     * ```ts
     * const attrs = model.getAttributes();
     * // { name: 'Alice', age: 30, email: 'alice@example.com' }
     * ```
     */
    getAttributes(): Record<string, any> {
      return { ...this._attributes };
    }

    /**
     * Get the original attributes snapshot taken at load time.
     *
     * Used for dirty tracking — comparing current attributes against
     * the original to determine what has changed.
     *
     * @returns A record of the original attribute key-value pairs.
     *
     * @example
     * ```ts
     * const original = model.getOriginal();
     * // Returns attributes as they were when the model was loaded
     * ```
     */
    getOriginal(): Record<string, any> {
      return { ...this._original };
    }

    /**
     * Check if one or all attributes have changed since load time.
     *
     * When called with a key, checks if that specific attribute differs
     * from its original value. When called without arguments, checks if
     * any attribute has changed.
     *
     * @param key - Optional attribute name to check. If omitted, checks all.
     * @returns `true` if the attribute(s) have changed.
     *
     * @example
     * ```ts
     * model.isDirty('name');  // true if name changed
     * model.isDirty();        // true if any attribute changed
     * ```
     */
    isDirty(key?: string): boolean {
      if (key !== undefined) {
        return this._attributes[key] !== this._original[key];
      }

      // Check all keys from both current and original
      const allKeys = new Set([...Object.keys(this._attributes), ...Object.keys(this._original)]);

      for (const k of allKeys) {
        if (this._attributes[k] !== this._original[k]) {
          return true;
        }
      }

      return false;
    }

    /**
     * Get the cast type for a given attribute key.
     *
     * Resolution order:
     * 1. Check `@Cast()` metadata in MetadataStorage
     * 2. Fall back to static `casts` property on the class
     *
     * @param key - The attribute name to look up.
     * @returns The cast type string, or `undefined` if no cast is registered.
     *
     * @example
     * ```ts
     * model.getCastType('age');        // 'integer'
     * model.getCastType('created_at'); // 'date'
     * model.getCastType('name');       // undefined
     * ```
     */
    getCastType(key: string): CastType | undefined {
      // 1. Check MetadataStorage
      const storage = MetadataStorage.getInstance();
      const casts = storage.getMergedCasts(this.constructor);
      if (casts.has(key)) {
        return casts.get(key) as CastType;
      }

      // 2. Fall back to static casts property
      const staticCasts = (this.constructor as any).casts as Record<string, CastType> | undefined;
      if (staticCasts && key in staticCasts) {
        return staticCasts[key];
      }

      return undefined;
    }

    /**
     * Apply cast transformation to a value for a given key.
     *
     * Uses the "get" cast direction — converts stored value to in-memory type.
     * If no cast is registered for the key, returns the value unchanged.
     *
     * @param key   - The attribute name (used to look up the cast type).
     * @param value - The value to cast.
     * @returns The cast value, or the original value if no cast is registered.
     *
     * @example
     * ```ts
     * model.castAttribute('age', '42');        // 42 (if cast to 'integer')
     * model.castAttribute('settings', '{}');   // {} (if cast to 'json')
     * ```
     */
    castAttribute(key: string, value: any): any {
      const castType = this.getCastType(key);
      if (castType) {
        return applyCastGet(castType, value);
      }
      return value;
    }

    /**
     * Sync the original attributes snapshot with the current attributes.
     *
     * Called after a model is loaded from the database or after a successful save,
     * to reset the dirty tracking baseline.
     *
     * @internal
     */
    syncOriginal(): void {
      this._original = { ...this._attributes };
    }

    /**
     * Fill attributes from a plain object, replacing all current attributes.
     *
     * @param attributes - The attributes to set.
     * @internal
     */
    fillRaw(attributes: Record<string, any>): void {
      this._attributes = { ...attributes };
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Find an accessor function for the given attribute key.
     *
     * Looks up `@Accessor('key')` metadata in MetadataStorage and returns
     * the bound method if found.
     *
     * @param key - The attribute name.
     * @returns The accessor method, or `undefined` if none registered.
     * @internal
     */
    _findAccessor(key: string): ((value: any) => any) | undefined {
      const storage = MetadataStorage.getInstance();
      const accessorsMutators = storage.getMergedAccessorsMutators(this.constructor);

      for (const am of accessorsMutators) {
        if (am.type === 'accessor' && am.fieldName === key) {
          const method = (this as any)[am.methodName];
          if (typeof method === 'function') {
            return method;
          }
        }
      }

      return undefined;
    }

    /**
     * Find a mutator function for the given attribute key.
     *
     * Looks up `@Mutator('key')` metadata in MetadataStorage and returns
     * the bound method if found.
     *
     * @param key - The attribute name.
     * @returns The mutator method, or `undefined` if none registered.
     * @internal
     */
    _findMutator(key: string): ((value: any) => any) | undefined {
      const storage = MetadataStorage.getInstance();
      const accessorsMutators = storage.getMergedAccessorsMutators(this.constructor);

      for (const am of accessorsMutators) {
        if (am.type === 'mutator' && am.fieldName === key) {
          const method = (this as any)[am.methodName];
          if (typeof method === 'function') {
            return method;
          }
        }
      }

      return undefined;
    }
  };
}
