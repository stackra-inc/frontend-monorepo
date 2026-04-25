/**
 * @fileoverview Immutable, fluent QueryBuilder for constructing GetListParams.
 *
 * Every chainable method returns a new `QueryBuilder` instance,
 * leaving the original unchanged. This enables base query reuse.
 *
 * @module @stackra/react-refine
 * @category Utils
 *
 * @example
 * ```typescript
 * import { QueryBuilder } from '@stackra/react-refine';
 *
 * const base = new QueryBuilder()
 *   .where('status', 'published')
 *   .latest();
 *
 * const page1 = base.page(1, 10).build();
 * const page2 = base.page(2, 10).build();
 * ```
 */

import { FilterOperator } from '@/enums/filter-operator.enum';
import type { FilterDescriptor } from '@/interfaces/filter-descriptor.interface';
import type { SortDescriptor } from '@/interfaces/sort-descriptor.interface';
import type { Pagination } from '@/interfaces/pagination.interface';
import type { GetListParams } from '@/interfaces/get-list-params.interface';

/**
 * Internal state shape for the QueryBuilder.
 */
interface QueryBuilderState {
  filters: FilterDescriptor[];
  sorters: SortDescriptor[];
  pagination: Pagination | undefined;
}

/**
 * Immutable, fluent query builder for constructing {@link GetListParams}.
 *
 * Each method clones internal state and returns a new instance.
 */
export class QueryBuilder {
  private readonly state: QueryBuilderState;

  constructor(state?: Partial<QueryBuilderState>) {
    this.state = {
      filters: state?.filters ? [...state.filters] : [],
      sorters: state?.sorters ? [...state.sorters] : [],
      pagination: state?.pagination ? { ...state.pagination } : undefined,
    };
  }

  /** Clone with additional state. */
  private clone(patch: Partial<QueryBuilderState>): QueryBuilder {
    return new QueryBuilder({
      filters: patch.filters ?? [...this.state.filters],
      sorters: patch.sorters ?? [...this.state.sorters],
      pagination: patch.pagination !== undefined ? patch.pagination : this.state.pagination,
    });
  }

  // ─── Filter Methods ────────────────────────────────────────────

  /**
   * Add an equality filter, or a filter with a specific operator.
   *
   * @example
   * ```typescript
   * builder.where('status', 'published')        // equals shorthand
   * builder.where('age', FilterOperator.Gte, 18) // operator overload
   * ```
   */
  where(field: string, value: any): QueryBuilder;
  where(field: string, operator: FilterOperator, value: any): QueryBuilder;
  where(field: string, operatorOrValue: any, value?: any): QueryBuilder {
    const filter: FilterDescriptor =
      value !== undefined
        ? { field, operator: operatorOrValue, value }
        : { field, operator: FilterOperator.Eq, value: operatorOrValue };
    return this.clone({ filters: [...this.state.filters, filter] });
  }

  /** Filter where field value is in the given array. */
  whereIn(field: string, values: any[]): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.In, value: values }],
    });
  }

  /** Filter where field value is NOT in the given array. */
  whereNotIn(field: string, values: any[]): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Nin, value: values }],
    });
  }

  /** Filter where field value is null. */
  whereNull(field: string): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Null, value: true }],
    });
  }

  /** Filter where field value is NOT null. */
  whereNotNull(field: string): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Nnull, value: true }],
    });
  }

  /** Filter where field value is between min and max (inclusive). */
  whereBetween(field: string, range: [any, any]): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Between, value: range }],
    });
  }

  /** Filter where field value is NOT between min and max. */
  whereNotBetween(field: string, range: [any, any]): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Nbetween, value: range }],
    });
  }

  /** Filter where field contains the value (case-insensitive). */
  whereContains(field: string, value: any): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Contains, value }],
    });
  }

  /** Filter where field starts with the value (case-insensitive). */
  whereStartsWith(field: string, value: any): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Startswith, value }],
    });
  }

  /** Filter where field ends with the value (case-insensitive). */
  whereEndsWith(field: string, value: any): QueryBuilder {
    return this.clone({
      filters: [...this.state.filters, { field, operator: FilterOperator.Endswith, value }],
    });
  }

  // ─── Sort Methods ──────────────────────────────────────────────

  /**
   * Add a sort descriptor.
   * @param field - Field to sort by.
   * @param direction - Sort direction.
   */
  orderBy(field: string, direction: 'asc' | 'desc'): QueryBuilder {
    return this.clone({
      sorters: [...this.state.sorters, { field, order: direction }],
    });
  }

  /**
   * Sort by field descending (defaults to `createdAt`).
   * @param field - Field to sort by (default: `'createdAt'`).
   */
  latest(field = 'createdAt'): QueryBuilder {
    return this.orderBy(field, 'desc');
  }

  /**
   * Sort by field ascending (defaults to `createdAt`).
   * @param field - Field to sort by (default: `'createdAt'`).
   */
  oldest(field = 'createdAt'): QueryBuilder {
    return this.orderBy(field, 'asc');
  }

  // ─── Pagination Methods ────────────────────────────────────────

  /**
   * Set page number and page size.
   * @param current - Page number (1-indexed).
   * @param pageSize - Records per page.
   */
  page(current: number, pageSize: number): QueryBuilder {
    return this.clone({ pagination: { current, pageSize } });
  }

  /**
   * Set page size only (page defaults to 1).
   * @param pageSize - Records per page.
   */
  limit(pageSize: number): QueryBuilder {
    const current = this.state.pagination?.current ?? 1;
    return this.clone({ pagination: { current, pageSize } });
  }

  /**
   * Set offset (converts to page-based pagination).
   * @param skip - Number of records to skip.
   */
  offset(skip: number): QueryBuilder {
    const pageSize = this.state.pagination?.pageSize ?? 10;
    const current = Math.floor(skip / pageSize) + 1;
    return this.clone({ pagination: { current, pageSize } });
  }

  // ─── Build ─────────────────────────────────────────────────────

  /**
   * Build the accumulated state into a {@link GetListParams} object.
   * @returns The constructed query parameters.
   */
  build(): GetListParams {
    const params: GetListParams = {};
    if (this.state.filters.length > 0) {
      params.filters = [...this.state.filters];
    }
    if (this.state.sorters.length > 0) {
      params.sorters = [...this.state.sorters];
    }
    if (this.state.pagination) {
      params.pagination = { ...this.state.pagination };
    }
    return params;
  }
}
