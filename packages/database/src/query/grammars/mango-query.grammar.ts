/**
 * @file mango-query.grammar.ts
 * @description Compiles a {@link QueryBuilderState} into an RxDB-compatible
 * Mango query object with `selector`, `sort`, `limit`, and `skip` fields.
 *
 * Operator mapping from QueryBuilder operators to CouchDB/RxDB Mango operators:
 *
 * | QueryBuilder | Mango     |
 * |-------------|-----------|
 * | `=`         | `$eq`     |
 * | `!=`        | `$ne`     |
 * | `>`         | `$gt`     |
 * | `>=`        | `$gte`    |
 * | `<`         | `$lt`     |
 * | `<=`        | `$lte`    |
 * | `in`        | `$in`     |
 * | `not_in`    | `$nin`    |
 * | `regex`     | `$regex`  |
 *
 * AND clauses are merged into a single flat selector object.
 * OR clauses are wrapped in a `$or` array at the top level.
 */

import { QueryGrammar } from './query.grammar';
import type { QueryBuilderState, WhereClause } from '@/query/query.builder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The compiled Mango query object that can be passed directly to
 * `RxCollection.find()`.
 *
 * @example
 * ```ts
 * const query: MangoQuery = {
 *   selector: { age: { $gt: 18 } },
 *   sort: [{ name: 'asc' }],
 *   limit: 10,
 *   skip: 0,
 * };
 * ```
 */
export interface MangoQuery {
  /** The Mango selector (CouchDB-style query conditions). */
  selector: Record<string, any>;

  /** Sort directives — array of `{ field: direction }` objects. */
  sort?: Array<Record<string, 'asc' | 'desc'>>;

  /** Maximum number of documents to return. */
  limit?: number;

  /** Number of documents to skip before returning results. */
  skip?: number;
}

// ---------------------------------------------------------------------------
// Operator mapping
// ---------------------------------------------------------------------------

/**
 * Maps QueryBuilder comparison operators to their Mango equivalents.
 * @internal
 */
const OPERATOR_MAP: Record<string, string> = {
  '=': '$eq',
  '!=': '$ne',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
  in: '$in',
  not_in: '$nin',
  regex: '$regex',
};

// ---------------------------------------------------------------------------
// MangoQueryGrammar
// ---------------------------------------------------------------------------

/**
 * Compiles a {@link QueryBuilderState} into an RxDB Mango query object.
 *
 * Used by the QueryBuilder when executing queries against local RxDB
 * storage drivers (IndexedDB, Memory, LocalStorage, SessionStorage).
 *
 * @example
 * ```ts
 * const grammar = new MangoQueryGrammar();
 * const state: QueryBuilderState = {
 *   wheres: [
 *     { field: 'age', operator: '>', value: 18, boolean: 'and' },
 *     { field: 'role', operator: '=', value: 'admin', boolean: 'or' },
 *   ],
 *   orders: [{ field: 'name', direction: 'asc' }],
 *   limitValue: 10,
 *   skipValue: 0,
 *   withTrashedFlag: false,
 *   onlyTrashedFlag: false,
 *   withoutGlobalScopeNames: [],
 *   eagerLoads: [],
 * };
 *
 * const mango = grammar.compile(state);
 * // mango.selector → { $or: [{ age: { $gt: 18 } }, { role: { $eq: 'admin' } }] }
 * // mango.sort → [{ name: 'asc' }]
 * // mango.limit → 10
 * // mango.skip → 0
 * ```
 */
export class MangoQueryGrammar extends QueryGrammar {
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Compile a QueryBuilderState into a Mango query object.
   *
   * @param state - The accumulated query builder state.
   * @param softDeleteField - Optional soft-delete field name to inject into the selector.
   * @param onlyTrashed - When true and softDeleteField is set, filter for only trashed documents.
   * @returns A {@link MangoQuery} object ready for `RxCollection.find()`.
   */
  compile(
    state: QueryBuilderState,
    softDeleteField?: string | null,
    onlyTrashed?: boolean
  ): MangoQuery {
    const query: MangoQuery = {
      selector: this.compileWheres(state.wheres),
    };

    // Inject soft-delete scope into selector
    if (softDeleteField) {
      if (onlyTrashed) {
        query.selector[softDeleteField] = { $ne: null };
      } else {
        query.selector[softDeleteField] = { $eq: null };
      }
    }

    // Compile sort directives
    const sort = this.compileSort(state.orders);
    if (sort.length > 0) {
      query.sort = sort;
    }

    // Apply limit
    if (state.limitValue !== null) {
      query.limit = state.limitValue;
    }

    // Apply skip
    if (state.skipValue !== null) {
      query.skip = state.skipValue;
    }

    return query;
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Compile an array of WhereClause objects into a Mango selector.
   *
   * AND clauses are merged into a single flat selector object.
   * When OR clauses are present, the selector is wrapped in a `$or` array.
   *
   * Strategy:
   * 1. Group consecutive AND clauses together.
   * 2. When an OR clause is encountered, start a new group.
   * 3. If there's only one group, return it as a flat selector.
   * 4. If there are multiple groups, wrap them in `$or`.
   *
   * @param wheres - The array of where clauses from the builder state.
   * @returns A Mango selector object.
   */
  private compileWheres(wheres: WhereClause[]): Record<string, any> {
    if (wheres.length === 0) {
      return {};
    }

    // Check if any OR clauses exist
    const hasOr = wheres.some((w) => w.boolean === 'or');

    if (!hasOr) {
      // All AND — merge into a single flat selector
      return this.mergeAndClauses(wheres);
    }

    // Split into groups separated by OR boundaries.
    // The first clause always starts a new group regardless of its boolean.
    // Subsequent 'or' clauses start new groups.
    const groups: WhereClause[][] = [];
    let currentGroup: WhereClause[] = [];

    for (const clause of wheres) {
      if (clause.boolean === 'or' && currentGroup.length > 0) {
        // Push the current AND group and start a new one for the OR branch
        groups.push(currentGroup);
        currentGroup = [clause];
      } else {
        currentGroup.push(clause);
      }
    }

    // Push the final group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // If we ended up with a single group, just merge it
    if (groups.length === 1) {
      return this.mergeAndClauses(groups[0]!);
    }

    // Multiple groups → wrap in $or
    return {
      $or: groups.map((group) => this.mergeAndClauses(group)),
    };
  }

  /**
   * Merge an array of AND-combined where clauses into a single selector object.
   *
   * Each clause becomes `{ field: { $operator: value } }`. Multiple clauses
   * on the same field are merged into the same field entry.
   *
   * @param clauses - An array of WhereClause objects (all AND-combined).
   * @returns A flat Mango selector object.
   */
  private mergeAndClauses(clauses: WhereClause[]): Record<string, any> {
    const selector: Record<string, any> = {};

    for (const clause of clauses) {
      const compiled = this.compileOperator(clause.operator, clause.value);

      if (selector[clause.field] !== undefined) {
        // Merge multiple conditions on the same field
        Object.assign(selector[clause.field], compiled);
      } else {
        selector[clause.field] = compiled;
      }
    }

    return selector;
  }

  /**
   * Compile a single operator + value pair into a Mango operator object.
   *
   * @param operator - The QueryBuilder operator string (e.g. `'>'`, `'in'`).
   * @param value    - The comparison value.
   * @returns A Mango operator object, e.g. `{ $gt: 18 }`.
   *
   * @example
   * ```ts
   * compileOperator('>', 18)   // → { $gt: 18 }
   * compileOperator('in', [1]) // → { $in: [1] }
   * ```
   */
  private compileOperator(operator: string, value: any): Record<string, any> {
    const mangoOp = OPERATOR_MAP[operator];

    if (!mangoOp) {
      // Fallback: treat unknown operators as $eq
      return { $eq: value };
    }

    return { [mangoOp]: value };
  }

  /**
   * Compile OrderByClause array into Mango sort directives.
   *
   * Each sort directive is an object with a single key (the field name)
   * mapped to the direction string (`'asc'` or `'desc'`).
   *
   * @param orders - The array of order-by clauses from the builder state.
   * @returns An array of `{ field: direction }` objects.
   *
   * @example
   * ```ts
   * compileSort([{ field: 'name', direction: 'asc' }])
   * // → [{ name: 'asc' }]
   * ```
   */
  private compileSort(
    orders: Array<{ field: string; direction: 'asc' | 'desc' }>
  ): Array<Record<string, 'asc' | 'desc'>> {
    return orders.map((order) => ({
      [order.field]: order.direction,
    }));
  }
}
