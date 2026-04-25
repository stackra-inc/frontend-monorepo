/**
 * @fileoverview QueryKeyFactory — deterministic TanStack Query cache key generation.
 *
 * Generates cache keys in the format `[resource, operation, ...sortedParams]`
 * so that identical queries share cache entries regardless of parameter
 * insertion order.
 *
 * @module @stackra/react-refine
 * @category Utils
 *
 * @example
 * ```typescript
 * import { QueryKeyFactory } from '@stackra/react-refine';
 *
 * QueryKeyFactory.list('posts', { pagination: { current: 1, pageSize: 10 } });
 * // → ['posts', 'list', { pagination: { current: 1, pageSize: 10 } }]
 *
 * QueryKeyFactory.one('posts', '123');
 * // → ['posts', 'one', '123']
 *
 * QueryKeyFactory.invalidate('posts');
 * // → ['posts']
 * ```
 */

import type { GetListParams } from '@/interfaces/get-list-params.interface';
import type { CustomParams } from '@/interfaces/custom-params.interface';

/**
 * Utility class for generating deterministic TanStack Query cache keys.
 *
 * All methods are static — no instantiation needed.
 */
export class QueryKeyFactory {
  /**
   * Cache key for a single record query.
   * @param resource - Resource name.
   * @param id - Record identifier.
   * @returns Deterministic cache key tuple.
   */
  static one(resource: string, id: any): readonly unknown[] {
    return [resource, 'one', id] as const;
  }

  /**
   * Cache key for a list query.
   * @param resource - Resource name.
   * @param params - Optional list parameters.
   * @returns Deterministic cache key tuple.
   */
  static list(resource: string, params?: GetListParams): readonly unknown[] {
    if (!params) return [resource, 'list'] as const;
    return [resource, 'list', QueryKeyFactory.sortObject(params)] as const;
  }

  /**
   * Cache key for a many-by-ids query.
   * @param resource - Resource name.
   * @param ids - Array of record identifiers.
   * @returns Deterministic cache key tuple.
   */
  static many(resource: string, ids: any[]): readonly unknown[] {
    // Sort ids for deterministic keys
    const sorted = [...ids].sort();
    return [resource, 'many', sorted] as const;
  }

  /**
   * Cache key for an infinite list query.
   * @param resource - Resource name.
   * @param params - Optional list parameters.
   * @returns Deterministic cache key tuple.
   */
  static infinite(resource: string, params?: GetListParams): readonly unknown[] {
    if (!params) return [resource, 'infinite'] as const;
    return [resource, 'infinite', QueryKeyFactory.sortObject(params)] as const;
  }

  /**
   * Cache key for a custom query.
   * @param resource - Resource name.
   * @param params - Optional custom parameters.
   * @returns Deterministic cache key tuple.
   */
  static custom(resource: string, params?: CustomParams): readonly unknown[] {
    if (!params) return [resource, 'custom'] as const;
    return [resource, 'custom', QueryKeyFactory.sortObject(params)] as const;
  }

  /**
   * Cache key prefix for invalidating all queries for a resource.
   *
   * Use with `queryClient.invalidateQueries({ queryKey: prefix })`.
   *
   * @param resource - Resource name.
   * @param operation - Optional operation to narrow invalidation.
   * @returns Cache key prefix.
   */
  static invalidate(resource: string, operation?: string): readonly unknown[] {
    if (operation) return [resource, operation] as const;
    return [resource] as const;
  }

  /**
   * Recursively sort object keys for deterministic serialization.
   *
   * Ensures that `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produce
   * identical cache key components.
   *
   * @param obj - The object to sort.
   * @returns A new object with sorted keys.
   */
  private static sortObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map((item) => QueryKeyFactory.sortObject(item));
    if (typeof obj !== 'object') return obj;

    const sorted: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = QueryKeyFactory.sortObject(obj[key]);
    }
    return sorted;
  }
}
