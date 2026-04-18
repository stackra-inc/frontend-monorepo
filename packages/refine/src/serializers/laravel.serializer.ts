/**
 * @fileoverview Laravel-style query string serializer.
 *
 * Produces query strings like:
 * `?page=1&per_page=10&sort=-createdAt&filter[status]=published`
 *
 * @module @stackra/react-refine
 * @category Serializers
 *
 * @example
 * ```typescript
 * import { LaravelQueryStringSerializer } from '@stackra/react-refine';
 *
 * const serializer = new LaravelQueryStringSerializer();
 * const qs = serializer.serialize({
 *   pagination: { current: 1, pageSize: 10 },
 *   sorters: [{ field: 'createdAt', order: 'desc' }],
 *   filters: [{ field: 'status', operator: 'eq', value: 'published' }],
 * });
 * // → "?page=1&per_page=10&sort=-createdAt&filter[status]=published"
 * ```
 */

import type { QueryStringSerializer } from '@/interfaces/query-string-serializer.interface';
import type { GetListParams } from '@/interfaces/get-list-params.interface';

/**
 * Serializer producing Laravel-style query strings.
 */
export class LaravelQueryStringSerializer implements QueryStringSerializer {
  /**
   * Serialize query parameters into a Laravel-style URL query string.
   *
   * @param params - The list parameters to serialize.
   * @returns URL query string (with leading `?`), or empty string.
   */
  serialize(params: GetListParams): string {
    const parts: string[] = [];

    // Pagination: page=1&per_page=10
    if (params.pagination) {
      parts.push(`page=${params.pagination.current}`);
      parts.push(`per_page=${params.pagination.pageSize}`);
    }

    // Sorting: sort=-createdAt,title (prefix with '-' for desc)
    if (params.sorters?.length) {
      const sortStr = params.sorters
        .map((s) => (s.order === 'desc' ? `-${s.field}` : s.field))
        .join(',');
      parts.push(`sort=${sortStr}`);
    }

    // Filters: filter[field]=value or filter[field][]=val1&filter[field][]=val2
    if (params.filters?.length) {
      for (const f of params.filters) {
        if (Array.isArray(f.value)) {
          for (const v of f.value) {
            parts.push(`filter[${f.field}][]=${encodeURIComponent(v)}`);
          }
        } else {
          parts.push(`filter[${f.field}]=${encodeURIComponent(f.value)}`);
        }
      }
    }

    return parts.length ? `?${parts.join('&')}` : '';
  }
}
