/**
 * @file sql-query.grammar.ts
 * @description Compiles a {@link QueryBuilderState} into a SQL `SELECT`
 * statement string. Used for remote backends (Supabase) where
 * queries are executed as SQL rather than Mango selectors.
 *
 * Operator mapping from QueryBuilder operators to SQL operators:
 *
 * | QueryBuilder | SQL        |
 * |-------------|------------|
 * | `=`         | `=`        |
 * | `!=`        | `!=`       |
 * | `>`         | `>`        |
 * | `>=`        | `>=`       |
 * | `<`         | `<`        |
 * | `<=`        | `<=`       |
 * | `in`        | `IN`       |
 * | `not_in`    | `NOT IN`   |
 * | `regex`     | `~`        |
 *
 * String values are quoted and escaped to prevent SQL injection.
 * Numeric and boolean values are rendered inline.
 */

import { Str } from '@stackra-inc/ts-support';
import { QueryGrammar } from './query.grammar';
import type { QueryBuilderState, WhereClause, OrderByClause } from '@/query/query.builder';

// ---------------------------------------------------------------------------
// Operator mapping
// ---------------------------------------------------------------------------

/**
 * Maps QueryBuilder comparison operators to their SQL equivalents.
 * @internal
 */
const SQL_OPERATOR_MAP: Record<string, string> = {
  '=': '=',
  '!=': '!=',
  '>': '>',
  '>=': '>=',
  '<': '<',
  '<=': '<=',
  in: 'IN',
  not_in: 'NOT IN',
  regex: '~',
};

// ---------------------------------------------------------------------------
// SqlQueryGrammar
// ---------------------------------------------------------------------------

/**
 * Compiles a {@link QueryBuilderState} into a SQL `SELECT` statement string.
 *
 * Used by the QueryBuilder when executing queries against remote SQL
 * backends (Supabase). Produces parameterized-style SQL with
 * inline escaped values.
 *
 * @example
 * ```ts
 * const grammar = new SqlQueryGrammar();
 * const state: QueryBuilderState = {
 *   wheres: [
 *     { field: 'age', operator: '>', value: 18, boolean: 'and' },
 *   ],
 *   orders: [{ field: 'name', direction: 'asc' }],
 *   limitValue: 10,
 *   skipValue: 5,
 *   withTrashedFlag: false,
 *   onlyTrashedFlag: false,
 *   withoutGlobalScopeNames: [],
 *   eagerLoads: [],
 * };
 *
 * const sql = grammar.compile(state, 'users');
 * // → 'SELECT * FROM "users" WHERE "age" > 18 ORDER BY "age" ASC LIMIT 10 OFFSET 5'
 * ```
 */
export class SqlQueryGrammar extends QueryGrammar {
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Compile a QueryBuilderState into a SQL SELECT string.
   *
   * @param state     - The accumulated query builder state.
   * @param tableName - The target table name. Defaults to `'unknown'` if
   *                    not provided (the QueryBuilder will supply this).
   * @returns A SQL SELECT statement string.
   */
  compile(state: QueryBuilderState, tableName: string = 'unknown'): string {
    const parts: string[] = [];

    // SELECT clause
    parts.push(this.compileSelect(tableName));

    // WHERE clause
    const where = this.compileWheres(state.wheres);
    if (where) {
      parts.push(`WHERE ${where}`);
    }

    // ORDER BY clause
    const orderBy = this.compileOrders(state.orders);
    if (orderBy) {
      parts.push(orderBy);
    }

    // LIMIT / OFFSET clause
    const limitOffset = this.compileLimit(state.limitValue, state.skipValue);
    if (limitOffset) {
      parts.push(limitOffset);
    }

    return parts.join(' ');
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Compile the SELECT clause.
   *
   * @param tableName - The table name to select from.
   * @returns The `SELECT * FROM "tableName"` string.
   */
  private compileSelect(tableName: string): string {
    return `SELECT * FROM "${tableName}"`;
  }

  /**
   * Compile an array of WhereClause objects into a SQL WHERE expression.
   *
   * AND clauses are joined with `AND`. OR clauses are joined with `OR`.
   * The first clause's boolean connector is ignored (it's always the
   * start of the WHERE expression).
   *
   * @param wheres - The array of where clauses from the builder state.
   * @returns A SQL WHERE expression string, or empty string if no clauses.
   */
  private compileWheres(wheres: WhereClause[]): string {
    if (wheres.length === 0) {
      return '';
    }

    const parts: string[] = [];

    for (let i = 0; i < wheres.length; i++) {
      const clause = wheres[i]!;
      const condition = this.compileWhereClause(clause);

      if (i === 0) {
        // First clause — no connector prefix
        parts.push(condition);
      } else {
        // Subsequent clauses — prepend AND or OR
        const connector = clause.boolean === 'or' ? 'OR' : 'AND';
        parts.push(`${connector} ${condition}`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Compile a single WhereClause into a SQL condition string.
   *
   * Handles special cases for `IN` and `NOT IN` operators which
   * require parenthesized value lists.
   *
   * @param clause - The where clause to compile.
   * @returns A SQL condition string, e.g. `"age" > 18`.
   */
  private compileWhereClause(clause: WhereClause): string {
    const sqlOp = SQL_OPERATOR_MAP[clause.operator] ?? '=';
    const field = this.quoteIdentifier(clause.field);

    // IN / NOT IN require parenthesized value lists
    if (clause.operator === 'in' || clause.operator === 'not_in') {
      const values = Array.isArray(clause.value) ? clause.value : [clause.value];
      const list = values.map((v: any) => this.quoteValue(v)).join(', ');
      return `${field} ${sqlOp} (${list})`;
    }

    // Regex uses the ~ operator with a quoted pattern
    if (clause.operator === 'regex') {
      return `${field} ${sqlOp} ${this.quoteValue(String(clause.value))}`;
    }

    return `${field} ${sqlOp} ${this.quoteValue(clause.value)}`;
  }

  /**
   * Compile OrderByClause array into a SQL ORDER BY expression.
   *
   * @param orders - The array of order-by clauses from the builder state.
   * @returns A SQL `ORDER BY` string, or empty string if no orders.
   *
   * @example
   * ```ts
   * compileOrders([{ field: 'name', direction: 'asc' }])
   * // → 'ORDER BY "name" ASC'
   * ```
   */
  private compileOrders(orders: OrderByClause[]): string {
    if (orders.length === 0) {
      return '';
    }

    const parts = orders.map((o) => `${this.quoteIdentifier(o.field)} ${Str.upper(o.direction)}`);

    return `ORDER BY ${parts.join(', ')}`;
  }

  /**
   * Compile limit and skip values into a SQL LIMIT/OFFSET clause.
   *
   * @param limit - The maximum number of rows, or `null` for no limit.
   * @param skip  - The number of rows to skip, or `null` for no offset.
   * @returns A SQL `LIMIT n OFFSET m` string, or empty string if neither is set.
   */
  private compileLimit(limit: number | null, skip: number | null): string {
    const parts: string[] = [];

    if (limit !== null) {
      parts.push(`LIMIT ${limit}`);
    }

    if (skip !== null) {
      parts.push(`OFFSET ${skip}`);
    }

    return parts.join(' ');
  }

  /**
   * Quote a SQL identifier (table or column name) with double quotes.
   *
   * Double quotes inside the identifier are escaped by doubling them.
   *
   * @param identifier - The raw identifier string.
   * @returns The quoted identifier, e.g. `"my_column"`.
   */
  private quoteIdentifier(identifier: string): string {
    // Escape any embedded double quotes by doubling them
    const escaped = identifier.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  /**
   * Quote and escape a value for safe inclusion in a SQL string.
   *
   * - Strings are wrapped in single quotes with internal single quotes escaped.
   * - Numbers and booleans are rendered as-is.
   * - `null` is rendered as the SQL keyword `NULL`.
   * - Arrays and objects are JSON-serialized and quoted as strings.
   *
   * @param value - The raw value to quote.
   * @returns The SQL-safe value string.
   *
   * @example
   * ```ts
   * quoteValue("O'Brien") // → "'O''Brien'"
   * quoteValue(42)        // → '42'
   * quoteValue(true)      // → 'TRUE'
   * quoteValue(null)      // → 'NULL'
   * ```
   */
  private quoteValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }

    if (typeof value === 'string') {
      // Escape single quotes by doubling them (SQL standard)
      const escaped = value.replace(/'/g, "''");
      return `'${escaped}'`;
    }

    // Arrays and objects — serialize as JSON string
    const json = JSON.stringify(value);
    const escaped = json.replace(/'/g, "''");
    return `'${escaped}'`;
  }
}
