/**
 * @file query-compilation.error.ts
 * @description Error thrown when a QueryGrammar cannot compile
 * a QueryBuilder's state into a valid query format.
 * This can happen when the builder state contains invalid
 * operator/value combinations or unsupported query patterns
 * for the target grammar (e.g. regex on SQL grammar).
 */

/**
 * Thrown when a QueryGrammar fails to compile a QueryBuilder
 * state into a valid executable query.
 *
 * @example
 * ```ts
 * throw new QueryCompilationError(
 *   { wheres: [...] },
 *   'Unsupported operator "like" for MangoQueryGrammar'
 * );
 * ```
 */
export class QueryCompilationError extends Error {
  /**
   * The QueryBuilder internal state that failed compilation.
   * Useful for debugging which query chain caused the issue.
   */
  public readonly state: object;

  /**
   * A human-readable explanation of why compilation failed.
   */
  public readonly reason: string;

  /**
   * @param state - The QueryBuilderState that could not be compiled
   * @param reason - Description of the compilation failure
   */
  constructor(state: object, reason: string) {
    super(`Query compilation failed: ${reason}`);
    this.state = state;
    this.reason = reason;
    Object.setPrototypeOf(this, QueryCompilationError.prototype);
  }
}
