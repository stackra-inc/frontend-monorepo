/**
 * @file query.grammar.ts
 * @description Abstract base class for all query grammar implementations.
 *
 * A QueryGrammar compiles a {@link QueryBuilderState} into an executable
 * query format for a specific backend. Concrete subclasses implement the
 * compilation for specific targets:
 * - {@link MangoQueryGrammar} → RxDB Mango query object (selector, sort, limit, skip)
 * - {@link SqlQueryGrammar} → SQL SELECT string
 *
 * This follows the Grammar pattern from Laravel's Illuminate\Database package,
 * mirroring the schema grammar hierarchy but for query compilation.
 */

import type { QueryBuilderState } from '@/query/query.builder';

// ---------------------------------------------------------------------------
// QueryGrammar abstract base
// ---------------------------------------------------------------------------

/**
 * Abstract base class that all query grammar implementations extend.
 *
 * Subclasses must implement {@link compile} to transform a
 * {@link QueryBuilderState} into the appropriate query format for
 * their target backend.
 *
 * @example
 * ```ts
 * class MyQueryGrammar extends QueryGrammar {
 *   compile(state: QueryBuilderState): any {
 *     // Transform state into target query format
 *   }
 * }
 * ```
 */
export abstract class QueryGrammar {
  /**
   * Compile a QueryBuilder's internal state into an executable query
   * for the target backend.
   *
   * @param state - The accumulated query builder state containing
   *                where clauses, ordering, limit, skip, etc.
   * @returns The compiled query in the target format. The return type
   *          varies by subclass (Mango object, SQL string, etc.).
   */
  abstract compile(state: QueryBuilderState): any;
}
