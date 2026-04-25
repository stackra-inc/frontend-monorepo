/**
 * @file schema.grammar.ts
 * @description Abstract base class for all schema grammar implementations.
 *
 * A SchemaGrammar compiles a {@link Blueprint} into a target schema format.
 * Concrete subclasses implement the compilation for specific backends:
 * - {@link RxDBSchemaGrammar} → RxJsonSchema (JSON Schema for RxDB)
 * - {@link SupabaseSchemaGrammar} → SQL DDL (PostgreSQL for Supabase)
 *
 * This follows the Grammar pattern from Laravel's Illuminate\Database package.
 */

import type { Blueprint } from '@/schema/blueprint';

// ---------------------------------------------------------------------------
// SchemaGrammar abstract base
// ---------------------------------------------------------------------------

/**
 * Abstract base class that all schema grammar implementations extend.
 *
 * Subclasses must implement {@link compile}, {@link compileCreate}, and
 * {@link compileDrop} to produce the appropriate output for their target
 * backend.
 *
 * @example
 * ```ts
 * class MyGrammar extends SchemaGrammar {
 *   compile(blueprint: Blueprint): any { ... }
 *   compileCreate(blueprint: Blueprint): any { ... }
 *   compileDrop(collectionName: string): any { ... }
 * }
 * ```
 */
export abstract class SchemaGrammar {
  /**
   * Compile a Blueprint into the target schema format.
   *
   * @param blueprint - The Blueprint containing column and index definitions.
   * @returns The compiled schema in the target format.
   */
  abstract compile(blueprint: Blueprint): any;

  /**
   * Compile a Blueprint into a "create" statement for the target backend.
   *
   * For RxDB this is equivalent to {@link compile}. For SQL backends this
   * produces a `CREATE TABLE` DDL statement.
   *
   * @param blueprint - The Blueprint containing column and index definitions.
   * @returns The compiled create statement.
   */
  abstract compileCreate(blueprint: Blueprint): any;

  /**
   * Compile a drop / delete statement for the given collection or table.
   *
   * @param collectionName - The name of the collection or table to drop.
   * @returns The compiled drop statement.
   */
  abstract compileDrop(collectionName: string): any;
}
