/**
 * @file column.definition.ts
 * @description Represents a single column in a schema Blueprint. Each column
 * carries its name, JSON Schema type, constraints (maxLength, min, max, etc.),
 * and flags (primary, required, final, nullable). Modifier methods return
 * `this` so callers can chain fluently:
 *
 * ```ts
 * blueprint.string('id', 100).primary().required();
 * ```
 *
 * ColumnDefinition is the atomic building block consumed by Grammar classes
 * when compiling a Blueprint into an RxJsonSchema or SQL DDL statement.
 */

// ---------------------------------------------------------------------------
// Supported column type literal union
// ---------------------------------------------------------------------------

/**
 * The set of column types supported by the Blueprint / Grammar system.
 * Maps 1-to-1 with JSON Schema primitive types plus the `enum` shorthand.
 */
export type ColumnType = 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object' | 'enum';

// ---------------------------------------------------------------------------
// ColumnDefinition class
// ---------------------------------------------------------------------------

/**
 * Describes a single column within a {@link Blueprint}.
 *
 * Instances are created by Blueprint column methods (`string()`, `integer()`,
 * etc.) and can be further configured via chainable modifier methods.
 *
 * @example
 * ```ts
 * const col = new ColumnDefinition('email', 'string');
 * col.primary().required().default('user@example.com');
 * ```
 */
export class ColumnDefinition {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /** The column / property name. */
  readonly name: string;

  /** The JSON Schema type of this column. */
  readonly type: ColumnType;

  /** Maximum string length (applies to `type: 'string'`). */
  maxLength?: number;

  /** Minimum numeric value (applies to `type: 'integer'` or `type: 'number'`). */
  minimum?: number;

  /** Maximum numeric value (applies to `type: 'integer'` or `type: 'number'`). */
  maximum?: number;

  /** Numeric multiple-of constraint (applies to `type: 'integer'` or `type: 'number'`). */
  multipleOf?: number;

  /** Allowed values when `type` is `'enum'`. */
  enumValues?: any[];

  /** Item schema when `type` is `'array'`. */
  items?: object;

  /** Whether this column is the primary key of the collection. */
  isPrimary: boolean = false;

  /** Whether this column is required (non-optional) in the schema. */
  isRequired: boolean = true;

  /** Whether this column is immutable after document creation. */
  isFinal: boolean = false;

  /** Default value for this column. */
  defaultValue?: any;

  /**
   * RxDB `ref` collection name for population / relations.
   * Stored as a private backing field; the public accessor is `refValue`.
   */
  private _ref?: string;

  /** JSON Schema `format` string, e.g. `'date-time'`. */
  format?: string;

  /** Whether this column accepts `null` values. */
  isNullable: boolean = false;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new ColumnDefinition.
   *
   * @param name - The column / property name.
   * @param type - The JSON Schema type.
   *
   * @example
   * ```ts
   * const col = new ColumnDefinition('age', 'integer');
   * ```
   */
  constructor(name: string, type: ColumnType) {
    this.name = name;
    this.type = type;
  }

  // -------------------------------------------------------------------------
  // Chainable Modifiers
  // -------------------------------------------------------------------------

  /**
   * Mark this column as the primary key.
   *
   * @returns `this` for chaining.
   *
   * @example
   * ```ts
   * blueprint.string('id', 100).primary();
   * ```
   */
  primary(): this {
    this.isPrimary = true;
    return this;
  }

  /**
   * Mark this column as required (non-optional).
   * Columns are required by default; call this to be explicit.
   *
   * @returns `this` for chaining.
   */
  required(): this {
    this.isRequired = true;
    return this;
  }

  /**
   * Set a default value for this column.
   *
   * @param value - The default value.
   * @returns `this` for chaining.
   *
   * @example
   * ```ts
   * blueprint.string('status').default('active');
   * ```
   */
  default(value: any): this {
    this.defaultValue = value;
    return this;
  }

  /**
   * Mark this column as immutable after document creation (RxDB `final`).
   *
   * @returns `this` for chaining.
   */
  final(): this {
    this.isFinal = true;
    return this;
  }

  /**
   * Set the RxDB `ref` collection name for population / relations.
   *
   * @param collectionName - The referenced collection name.
   * @returns `this` for chaining.
   *
   * @example
   * ```ts
   * blueprint.string('author_id', 100).ref('users');
   * ```
   */
  ref(collectionName: string): this {
    this._ref = collectionName;
    return this;
  }

  /**
   * Mark this column as nullable (accepts `null` values).
   * Also sets `isRequired` to `false`.
   *
   * @returns `this` for chaining.
   */
  nullable(): this {
    this.isNullable = true;
    this.isRequired = false;
    return this;
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /**
   * Get the `ref` collection name, if set.
   *
   * @returns The referenced collection name, or `undefined`.
   */
  get refValue(): string | undefined {
    return this._ref;
  }
}
