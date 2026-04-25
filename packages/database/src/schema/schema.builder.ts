/**
 * @file schema.builder.ts
 * @description Entry point for defining collection schemas using a fluent
 * callback-based API. The SchemaBuilder creates a {@link Blueprint}, passes
 * it to the developer's callback for column/index definitions, then compiles
 * the Blueprint via the configured {@link SchemaGrammar}.
 *
 * Inspired by Laravel's `Schema::create('users', function (Blueprint $table) { ... })`.
 *
 * @example
 * ```ts
 * const builder = new SchemaBuilder(new RxDBSchemaGrammar());
 *
 * const schema = builder.create('users', (table) => {
 *   table.string('id', 100).primary();
 *   table.string('name', 255);
 *   table.integer('age');
 *   table.timestamps();
 * });
 * // schema is now a valid RxJsonSchema (or SQL DDL, depending on grammar)
 * ```
 */

import { Blueprint } from './blueprint';
import type { SchemaGrammar } from './grammars/schema.grammar';

// ---------------------------------------------------------------------------
// SchemaBuilder
// ---------------------------------------------------------------------------

/**
 * Orchestrates Blueprint creation and Grammar compilation.
 *
 * Holds a reference to the active {@link SchemaGrammar} so that the same
 * `create()` call produces the correct output format for the target backend.
 */
export class SchemaBuilder {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /** The grammar used to compile Blueprints. */
  private readonly grammar: SchemaGrammar;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new SchemaBuilder with the given grammar.
   *
   * @param grammar - The schema grammar to use for compilation.
   *
   * @example
   * ```ts
   * const builder = new SchemaBuilder(new RxDBSchemaGrammar());
   * ```
   */
  constructor(grammar: SchemaGrammar) {
    this.grammar = grammar;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Create a new collection schema by defining columns and indexes in a callback.
   *
   * The callback receives a fresh {@link Blueprint} instance. After the callback
   * returns, the Blueprint is compiled via the configured grammar.
   *
   * @param collectionName - The collection / table name.
   * @param callback       - A function that receives the Blueprint and defines columns/indexes.
   * @returns The compiled schema (format depends on the grammar).
   *
   * @example
   * ```ts
   * const schema = builder.create('posts', (table) => {
   *   table.string('id', 100).primary();
   *   table.string('title', 255);
   *   table.string('body');
   *   table.timestamps();
   * });
   * ```
   */
  create(collectionName: string, callback: (blueprint: Blueprint) => void): any {
    const blueprint = new Blueprint(collectionName);
    callback(blueprint);
    return this.grammar.compile(blueprint);
  }
}
