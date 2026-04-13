/**
 * @file schema-compilation.error.ts
 * @description Error thrown when a SchemaGrammar cannot compile
 * a Blueprint into a valid schema format. This catches issues
 * like missing primary keys, invalid column types, or
 * incompatible modifier combinations before the schema
 * reaches RxDB's own validation.
 */

/**
 * Thrown when a SchemaGrammar fails to compile a Blueprint
 * into a valid target format (RxJsonSchema or SQL DDL).
 *
 * @example
 * ```ts
 * throw new SchemaCompilationError(
 *   'users',
 *   'Blueprint has no primary key defined'
 * );
 * ```
 */
export class SchemaCompilationError extends Error {
  /**
   * The collection/table name from the Blueprint that
   * failed compilation.
   */
  public readonly blueprint: string;

  /**
   * A human-readable explanation of why compilation failed.
   */
  public readonly reason: string;

  /**
   * @param blueprint - The collection name from the Blueprint
   * @param reason - Description of the compilation failure
   */
  constructor(blueprint: string, reason: string) {
    super(`Schema compilation failed for "${blueprint}": ${reason}`);
    this.blueprint = blueprint;
    this.reason = reason;
    Object.setPrototypeOf(this, SchemaCompilationError.prototype);
  }
}
