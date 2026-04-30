/**
 * @file blueprint.ts
 * @description Intermediate representation of a collection's column and index
 * definitions. The Blueprint collects column definitions via a fluent API
 * (`string()`, `integer()`, `timestamps()`, etc.) and exposes them to Grammar
 * classes for compilation into RxJsonSchema or SQL DDL.
 *
 * Inspired by Laravel's `Illuminate\Database\Schema\Blueprint`.
 *
 * @example
 * ```ts
 * const bp = new Blueprint('users');
 * bp.string('id', 100).primary();
 * bp.string('name', 255);
 * bp.integer('age');
 * bp.timestamps();
 * bp.index('age');
 *
 * const columns = bp.getColumns();   // ColumnDefinition[]
 * const indexes = bp.getIndexes();   // (string | string[])[]
 * const pk      = bp.getPrimaryKey(); // 'id'
 * ```
 */

import { ColumnDefinition } from './column.definition';
import type { ColumnType } from './column.definition';

// ---------------------------------------------------------------------------
// Blueprint class
// ---------------------------------------------------------------------------

/**
 * Collects column and index definitions for a single collection / table.
 *
 * Grammar classes read the accumulated state via {@link getColumns},
 * {@link getIndexes}, and {@link getPrimaryKey} to produce the target
 * schema format.
 */
export class Blueprint {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /** The collection / table name this blueprint describes. */
  readonly collectionName: string;

  /** Accumulated column definitions in insertion order. */
  private columns: ColumnDefinition[] = [];

  /** Accumulated index definitions (single field name or composite array). */
  private indexes: (string | string[])[] = [];

  /** Explicitly set primary key field name (may also be set via ColumnDefinition.primary()). */
  private primaryKeyField: string | null = null;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new Blueprint for the given collection name.
   *
   * @param collectionName - The collection / table name.
   *
   * @example
   * ```ts
   * const bp = new Blueprint('posts');
   * ```
   */
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // -------------------------------------------------------------------------
  // Column Definition Methods
  // -------------------------------------------------------------------------

  /**
   * Add a string column.
   *
   * @param name      - Column name.
   * @param maxLength - Optional maximum string length.
   * @returns The new {@link ColumnDefinition} for chaining.
   *
   * @example
   * ```ts
   * bp.string('email', 255).required();
   * ```
   */
  string(name: string, maxLength?: number): ColumnDefinition {
    const col = this.addColumn(name, 'string');
    if (maxLength !== undefined) {
      col.maxLength = maxLength;
    }
    return col;
  }

  /**
   * Add an integer column.
   *
   * @param name - Column name.
   * @returns The new {@link ColumnDefinition} for chaining.
   */
  integer(name: string): ColumnDefinition {
    return this.addColumn(name, 'integer');
  }

  /**
   * Add a floating-point number column.
   *
   * @param name - Column name.
   * @returns The new {@link ColumnDefinition} for chaining.
   */
  number(name: string): ColumnDefinition {
    return this.addColumn(name, 'number');
  }

  /**
   * Add a boolean column.
   *
   * @param name - Column name.
   * @returns The new {@link ColumnDefinition} for chaining.
   */
  boolean(name: string): ColumnDefinition {
    return this.addColumn(name, 'boolean');
  }

  /**
   * Add an array column.
   *
   * @param name       - Column name.
   * @param itemSchema - Optional JSON Schema for array items.
   * @returns The new {@link ColumnDefinition} for chaining.
   *
   * @example
   * ```ts
   * bp.array('tags', { type: 'string' });
   * ```
   */
  array(name: string, itemSchema?: object): ColumnDefinition {
    const col = this.addColumn(name, 'array');
    if (itemSchema !== undefined) {
      col.items = itemSchema;
    }
    return col;
  }

  /**
   * Add an object column.
   *
   * @param name - Column name.
   * @returns The new {@link ColumnDefinition} for chaining.
   */
  object(name: string): ColumnDefinition {
    return this.addColumn(name, 'object');
  }

  /**
   * Add an enum column with a fixed set of allowed values.
   *
   * @param name   - Column name.
   * @param values - The allowed enum values.
   * @returns The new {@link ColumnDefinition} for chaining.
   *
   * @example
   * ```ts
   * bp.enum('status', ['active', 'inactive', 'banned']);
   * ```
   */
  enum(name: string, values: any[]): ColumnDefinition {
    const col = this.addColumn(name, 'enum');
    col.enumValues = values;
    return col;
  }

  /**
   * Add a JSON column (stored as a nested object in RxDB, JSONB in SQL).
   *
   * @param name - Column name.
   * @returns The new {@link ColumnDefinition} for chaining.
   */
  json(name: string): ColumnDefinition {
    return this.addColumn(name, 'object');
  }

  /**
   * Convenience method that creates a string primary key column named `id`
   * with a maxLength of 100.
   *
   * @returns The new {@link ColumnDefinition} for chaining.
   *
   * @example
   * ```ts
   * bp.id(); // equivalent to bp.string('id', 100).primary()
   * ```
   */
  id(): ColumnDefinition {
    return this.string('id', 100).primary();
  }

  // -------------------------------------------------------------------------
  // Structural Methods
  // -------------------------------------------------------------------------

  /**
   * Explicitly set the primary key field name.
   *
   * This is an alternative to calling `.primary()` on a ColumnDefinition.
   * If both are used, the last call wins when {@link getPrimaryKey} is read.
   *
   * @param fieldName - The column name to use as primary key.
   */
  primary(fieldName: string): void {
    this.primaryKeyField = fieldName;
    // Also mark the column definition if it exists
    const col = this.columns.find((c) => c.name === fieldName);
    if (col) {
      col.primary();
    }
  }

  /**
   * Add an index on one or more fields.
   *
   * @param fields - A single field name or an array of field names for a composite index.
   *
   * @example
   * ```ts
   * bp.index('email');
   * bp.index(['last_name', 'first_name']);
   * ```
   */
  index(fields: string | string[]): void {
    this.indexes.push(fields);
  }

  /**
   * Add a unique index on one or more fields.
   *
   * In RxDB, unique constraints are expressed as indexes. For SQL grammars
   * this may produce a `UNIQUE` constraint.
   *
   * @param fields - A single field name or an array of field names.
   */
  unique(fields: string | string[]): void {
    // Stored alongside regular indexes — grammar classes can differentiate
    // if needed. For RxDB, unique is just an index.
    this.indexes.push(fields);
  }

  // -------------------------------------------------------------------------
  // Convenience Methods
  // -------------------------------------------------------------------------

  /**
   * Add `created_at` and `updated_at` string columns with `date-time` format.
   *
   * Both columns are required by default.
   *
   * @example
   * ```ts
   * bp.timestamps();
   * ```
   */
  timestamps(): void {
    const createdAt = this.addColumn('created_at', 'string');
    createdAt.format = 'date-time';
    createdAt.maxLength = 30;

    const updatedAt = this.addColumn('updated_at', 'string');
    updatedAt.format = 'date-time';
    updatedAt.maxLength = 30;
  }

  /**
   * Add a `deleted_at` nullable string column with `date-time` format
   * for soft-delete support.
   *
   * @example
   * ```ts
   * bp.softDeletes();
   * ```
   */
  softDeletes(): void {
    const deletedAt = this.addColumn('deleted_at', 'string');
    deletedAt.format = 'date-time';
    deletedAt.maxLength = 30;
    deletedAt.nullable();
  }

  // -------------------------------------------------------------------------
  // Accessors (for Grammar classes)
  // -------------------------------------------------------------------------

  /**
   * Get all accumulated column definitions.
   *
   * @returns A shallow copy of the columns array.
   */
  getColumns(): ColumnDefinition[] {
    return [...this.columns];
  }

  /**
   * Get all accumulated index definitions.
   *
   * @returns A shallow copy of the indexes array.
   */
  getIndexes(): (string | string[])[] {
    return [...this.indexes];
  }

  /**
   * Determine the primary key field name.
   *
   * Resolution order:
   * 1. Explicitly set via {@link primary}(fieldName)
   * 2. First column with `isPrimary === true`
   * 3. `null` if no primary key is defined
   *
   * @returns The primary key field name, or `null`.
   */
  getPrimaryKey(): string | null {
    if (this.primaryKeyField) {
      return this.primaryKeyField;
    }
    const pkCol = this.columns.find((c) => c.isPrimary);
    return pkCol ? pkCol.name : null;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Create a new ColumnDefinition, add it to the internal list, and return it.
   *
   * @param name - Column name.
   * @param type - Column type.
   * @returns The newly created ColumnDefinition.
   */
  private addColumn(name: string, type: ColumnType): ColumnDefinition {
    const col = new ColumnDefinition(name, type);
    this.columns.push(col);
    return col;
  }
}
