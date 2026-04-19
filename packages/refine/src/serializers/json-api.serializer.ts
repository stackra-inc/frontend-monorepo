/**
 * @fileoverview JSON:API query string serializer.
 *
 * Produces spec-compliant query strings like:
 * `?page[number]=1&page[size]=10&sort=-createdAt&filter[status]=published`
 *
 * @module @stackra-inc/react-refine
 * @category Serializers
 *
 * @example
 * ```typescript
 * import { JsonApiQueryStringSerializer } from '@stackra-inc/react-refine';
 *
 * const serializer = new JsonApiQueryStringSerializer();
 * const qs = serializer.serialize({
 *   pagination: { current: 1, pageSize: 10 },
 *   sorters: [{ field: 'createdAt', order: 'desc' }],
 *   filters: [{ field: 'status', operator: 'eq', value: 'published' }],
 * });
 * // → "?page[number]=1&page[size]=10&sort=-createdAt&filter[status]=published"
 * ```
 */

import type { QueryStringSerializer } from '@/interfaces/query-string-serializer.interface';
import type { GetListParams } from '@/interfaces/get-list-params.interface';

/**
 * Serializer producing JSON:API-compliant query strings.
 */
export class JsonApiQueryStringSerializer implements QueryStringSerializer {
  /**
   * Serialize query parameters into a JSON:API-style URL query string.
   *
   * @param params - The list parameters to serialize.
   * @returns URL query string (with leading `?`), or empty string.
   */
  serialize(params: GetListParams): string {
    const parts: string[] = [];

    // Pagination: page[number]=1&page[size]=10
    if (params.pagination) {
      parts.push(`page[number]=${params.pagination.current}`);
      parts.push(`page[size]=${params.pagination.pageSize}`);
    }

    // Sorting: sort=-createdAt,title
    if (params.sorters?.length) {
      const sortStr = params.sorters
        .map((s) => (s.order === 'desc' ? `-${s.field}` : s.field))
        .join(',');
      parts.push(`sort=${sortStr}`);
    }

    // Filters: filter[field]=value or filter[field]=val1,val2
    if (params.filters?.length) {
      for (const f of params.filters) {
        if (Array.isArray(f.value)) {
          parts.push(`filter[${f.field}]=${f.value.map(encodeURIComponent).join(',')}`);
        } else {
          parts.push(`filter[${f.field}]=${encodeURIComponent(f.value)}`);
        }
      }
    }

    return parts.length ? `?${parts.join('&')}` : '';
  }
}
