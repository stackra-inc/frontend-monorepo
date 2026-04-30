/**
 * Deep Merge Utility
 *
 * Recursively merges plain objects, concatenates arrays, and overwrites
 * primitives. Override values win on conflict; base values are preserved
 * where no override exists.
 *
 * @module utils/deep-merge
 */

/**
 * Check if a value is a plain object (not an array, null, or class instance).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep-merge two objects. Arrays are concatenated, plain objects are
 * recursively merged, primitives are overwritten by the override.
 *
 * @param base - Base configuration
 * @param overrides - Override configuration (wins on conflict)
 * @returns Merged configuration
 *
 * @example
 * ```typescript
 * const result = deepMerge(
 *   { build: { target: 'es2020', minify: true } },
 *   { build: { target: 'es2022' } }
 * );
 * // → { build: { target: 'es2022', minify: true } }
 * ```
 */
export function deepMerge<T>(base: T, overrides: Partial<T>): T {
  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(overrides as object)) {
    const baseValue = result[key];
    const overrideValue = (overrides as Record<string, unknown>)[key];

    if (Array.isArray(baseValue) && Array.isArray(overrideValue)) {
      result[key] = [...baseValue, ...overrideValue];
    } else if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      );
    } else {
      result[key] = overrideValue;
    }
  }

  return result as T;
}
