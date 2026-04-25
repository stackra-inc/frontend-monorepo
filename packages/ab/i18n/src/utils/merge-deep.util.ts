/**
 * Deep Merge Utilities
 *
 * Provides recursive object merging and deep cloning helpers used
 * throughout the plugin to combine default and user-provided
 * configuration objects without mutating originals unexpectedly.
 *
 * @module utils/merge-deep
 */

/**
 * Recursively merge a source object into a target object.
 *
 * Nested plain objects are merged key-by-key; arrays and primitives
 * in `source` overwrite the corresponding value in `target`.
 * The `target` object is mutated in place and also returned for chaining.
 *
 * @typeParam T - Shape of the target/result object
 * @param target - The object to merge into (mutated in place)
 * @param source - The object whose values are merged into `target`
 * @returns The mutated `target` object
 *
 * @example
 * ```typescript
 * const base = { en: { translation: { hello: 'Hello' } } };
 * const additional = { en: { common: { save: 'Save' } } };
 * const merged = mergeDeep(base, additional);
 * // => { en: { translation: { hello: 'Hello' }, common: { save: 'Save' } } }
 * ```
 */
export function mergeDeep<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        mergeDeep(targetValue, sourceValue);
      } else {
        (target as any)[key] = sourceValue;
      }
    }
  }

  return target;
}

/**
 * Create a deep clone of an object via JSON round-trip.
 *
 * Fast and simple alternative to `structuredClone` or lodash `_.cloneDeep`.
 * Safe for plain data structures (objects, arrays, strings, numbers, booleans, `null`).
 *
 * **Limitation:** Cannot handle `Date`, `RegExp`, `Map`, `Set`, functions,
 * `Symbol`, `undefined` values, or circular references.
 *
 * @typeParam T - Type of the value being cloned
 * @param obj - The value to clone
 * @returns A deep copy disconnected from the original reference graph
 *
 * @example
 * ```typescript
 * const original = { en: { translation: { hello: 'Hello' } } };
 * const cloned = deepClone(original);
 * cloned.en.translation.hello = 'Hi'; // does not affect `original`
 * ```
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
