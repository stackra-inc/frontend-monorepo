/**
 * @file supabase-schema.grammar.ts
 * @description Compiles a {@link Blueprint} into PostgreSQL-compatible SQL DDL
 * statements for Supabase. Produces `CREATE TABLE` and `DROP TABLE` strings.
 *
 * Type mappings:
 * | Blueprint type | SQL type                          |
 * |---------------|-----------------------------------|
 * | string        | `VARCHAR(maxLength)` or `TEXT`     |
 * | integer       | `INTEGER`                         |
 * | number        | `DOUBLE PRECISION`                |
 * | boolean       | `BOOLEAN`                         |
 * | array         | `JSONB`                           |
 * | object        | `JSONB`                           |
 * | enum          | `VARCHAR` with `CHECK` constraint  |
 * | json (object) | `JSONB`                           |
 *
 * Modifiers: `PRIMARY KEY`, `NOT NULL`, `DEFAULT`.
 */

import { SchemaGrammar } from './schema.grammar';
import type { Blueprint } from '@/schema/blueprint';
import type { ColumnDefinition } from '@/schema/column.definition';

// ---------------------------------------------------------------------------
// SupabaseSchemaGrammar
// ---------------------------------------------------------------------------

/**
 * Compiles a Blueprint into PostgreSQL DDL for Supabase.
 *
 * @example
 * ```ts
 * const grammar = new SupabaseSchemaGrammar();
 * const bp = new Blueprint('users');
 * bp.string('id', 100).primary();
 * bp.string('name', 255);
 * bp.integer('age');
 *
 * const ddl = grammar.compile(bp);
 * // CREATE TABLE "users" (
 * //   "id" VARCHAR(100) PRIMARY KEY,
 * //   "name" VARCHAR(255) NOT NULL,
 * //   "age" INTEGER NOT NULL
 * // );
 * ```
 */
export class SupabaseSchemaGrammar extends SchemaGrammar {
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Compile a Blueprint into a `CREATE TABLE` SQL DDL string.
   *
   * @param blueprint - The Blueprint to compile.
   * @returns A PostgreSQL `CREATE TABLE` statement.
   */
  compile(blueprint: Blueprint): string {
    return this.compileCreate(blueprint);
  }

  /**
   * Compile a Blueprint into a `CREATE TABLE` SQL DDL string.
   *
   * @param blueprint - The Blueprint to compile.
   * @returns A PostgreSQL `CREATE TABLE` statement.
   */
  compileCreate(blueprint: Blueprint): string {
    const columns = blueprint.getColumns();
    const pk = blueprint.getPrimaryKey();
    const columnDefs: string[] = [];

    for (const col of columns) {
      columnDefs.push(this.compileColumnDef(col, pk));
    }

    const tableName = this.quoteIdentifier(blueprint.collectionName);
    const body = columnDefs.join(',\n  ');

    return `CREATE TABLE ${tableName} (\n  ${body}\n);`;
  }

  /**
   * Compile a `DROP TABLE IF EXISTS` statement.
   *
   * @param collectionName - The table name to drop.
   * @returns A PostgreSQL `DROP TABLE IF EXISTS` statement.
   */
  compileDrop(collectionName: string): string {
    return `DROP TABLE IF EXISTS ${this.quoteIdentifier(collectionName)};`;
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Compile a single column definition into a SQL column clause.
   *
   * @param col - The column definition.
   * @param pk  - The primary key field name (or null).
   * @returns A SQL column definition string.
   */
  protected compileColumnDef(col: ColumnDefinition, pk: string | null): string {
    const parts: string[] = [];

    // Column name
    parts.push(this.quoteIdentifier(col.name));

    // SQL type
    parts.push(this.compileType(col));

    // PRIMARY KEY
    if (col.isPrimary || col.name === pk) {
      parts.push('PRIMARY KEY');
    }

    // NOT NULL (required and not nullable)
    if (col.isRequired && !col.isNullable && col.name !== pk) {
      parts.push('NOT NULL');
    }

    // DEFAULT value
    if (col.defaultValue !== undefined) {
      parts.push(`DEFAULT ${this.compileDefault(col.defaultValue)}`);
    }

    // CHECK constraint for enums
    if (col.type === 'enum' && col.enumValues && col.enumValues.length > 0) {
      const values = col.enumValues.map((v) => this.quoteValue(String(v))).join(', ');
      parts.push(`CHECK (${this.quoteIdentifier(col.name)} IN (${values}))`);
    }

    return parts.join(' ');
  }

  /**
   * Map a ColumnDefinition type to the corresponding PostgreSQL type.
   *
   * @param col - The column definition.
   * @returns The SQL type string.
   */
  protected compileType(col: ColumnDefinition): string {
    switch (col.type) {
      case 'string':
        if (col.format === 'date-time') {
          return 'TIMESTAMPTZ';
        }
        return col.maxLength ? `VARCHAR(${col.maxLength})` : 'TEXT';
      case 'integer':
        return 'INTEGER';
      case 'number':
        return 'DOUBLE PRECISION';
      case 'boolean':
        return 'BOOLEAN';
      case 'array':
        return 'JSONB';
      case 'object':
        return 'JSONB';
      case 'enum':
        // Enum stored as VARCHAR; CHECK constraint added separately
        if (col.maxLength) {
          return `VARCHAR(${col.maxLength})`;
        }
        return 'VARCHAR(255)';
      default:
        return 'TEXT';
    }
  }

  /**
   * Compile a default value into a SQL literal.
   *
   * @param value - The default value.
   * @returns A SQL literal string.
   */
  protected compileDefault(value: any): string {
    if (value === null) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return this.quoteValue(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    // Objects / arrays → JSON string
    return this.quoteValue(JSON.stringify(value));
  }

  /**
   * Quote a SQL identifier (table or column name) with double quotes.
   *
   * @param name - The identifier to quote.
   * @returns The quoted identifier.
   */
  protected quoteIdentifier(name: string): string {
    return `"${name.replace(/"/g, '""')}"`;
  }

  /**
   * Quote a SQL string value with single quotes, escaping internal quotes.
   *
   * @param value - The string value.
   * @returns The quoted string.
   */
  protected quoteValue(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }
}
