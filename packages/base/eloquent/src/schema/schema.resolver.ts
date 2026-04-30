/**
 * @file schema.resolver.ts
 * @description Reads decorator metadata from {@link MetadataStorage} and
 * produces a valid RxDB `RxJsonSchema`. This is the decorator-based
 * equivalent of compiling a Blueprint via {@link RxDBSchemaGrammar}.
 *
 * The resolver:
 * 1. Reads all `@Column()`, `@PrimaryKey()`, `@Index()`, `@Final()`,
 *    `@Default()`, `@Ref()` property metadata.
 * 2. Reads `@Timestamps()` and `@SoftDeletes()` class metadata to
 *    auto-add timestamp / deleted_at columns.
 * 3. Produces a valid `RxJsonSchema` with `version`, `primaryKey`, `type`,
 *    `properties`, `required`, and `indexes`.
 *
 * The output is structurally equivalent to `RxDBSchemaGrammar.compile()`
 * for the same column definitions.
 *
 * @example
 * ```ts
 * const resolver = new SchemaResolver();
 * const schema = resolver.resolve(User);
 * // schema is a valid RxJsonSchema
 * ```
 */

import type { RxJsonSchema } from 'rxdb';
import { MetadataStorage } from '@/metadata/metadata.storage';
import type { ColumnMetadata, ColumnOptions } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// SchemaResolver
// ---------------------------------------------------------------------------

/**
 * Resolves a Model class decorated with `@Column()`, `@PrimaryKey()`, etc.
 * into a valid `RxJsonSchema` by reading metadata from {@link MetadataStorage}.
 *
 * Also supports decompilation (RxJsonSchema → column metadata map) for
 * round-trip testing.
 *
 * @example
 * ```ts
 * const resolver = new SchemaResolver();
 * const schema = resolver.resolve(User, 0);
 * ```
 */
export class SchemaResolver {
  /** The MetadataStorage instance to read from. */
  private readonly metadataStorage: MetadataStorage;

  /**
   * Create a new SchemaResolver.
   *
   * @param metadataStorage - Optional MetadataStorage instance. Defaults to
   *                          the global singleton.
   */
  constructor(metadataStorage?: MetadataStorage) {
    this.metadataStorage = metadataStorage ?? MetadataStorage.getInstance();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Resolve a Model class into an `RxJsonSchema`.
   *
   * Reads all `@Column()`, `@PrimaryKey()`, `@Index()`, `@Final()`,
   * `@Default()`, `@Ref()` metadata, plus `@Timestamps()` and
   * `@SoftDeletes()` class metadata.
   *
   * @param modelClass - The Model class constructor (decorated with metadata).
   * @param version    - Schema version number (defaults to `0`).
   * @returns A valid `RxJsonSchema` object.
   *
   * @example
   * ```ts
   * const schema = resolver.resolve(User, 0);
   * // { version: 0, type: 'object', primaryKey: 'id', properties: {...}, ... }
   * ```
   */
  resolve(modelClass: Function, version: number = 0): RxJsonSchema<any> {
    // Merge columns from the full prototype chain (parent → child)
    const columns = this.metadataStorage.getMergedColumns(modelClass);
    const classMeta = this.metadataStorage.getMergedClassMetadata(modelClass);

    // Auto-add timestamp columns if @Timestamps() is present
    if (classMeta.timestamps) {
      this.ensureTimestampColumns(columns);
    }

    // Auto-add deleted_at column if @SoftDeletes() is present
    if (classMeta.softDeletes) {
      this.ensureSoftDeleteColumn(columns);
    }

    // Build the schema
    const properties: Record<string, any> = {};
    const required: string[] = [];
    const indexes: (string | string[])[] = [];
    let primaryKey: string = 'id';

    for (const [name, col] of columns) {
      // Build the JSON Schema property
      properties[name] = this.compileColumnProperty(col);

      // Track primary key
      if (col.isPrimary) {
        primaryKey = name;
      }

      // Track required fields (exclude primary key — RxDB handles it separately)
      const isRequired = col.options.required !== false;
      if (isRequired && !col.isPrimary) {
        required.push(name);
      }

      // Track indexed fields
      if (col.isIndex) {
        indexes.push(name);
      }
    }

    const schema: RxJsonSchema<any> = {
      version,
      type: 'object',
      primaryKey,
      properties,
      required,
    };

    if (indexes.length > 0) {
      schema.indexes = indexes;
    }

    return schema;
  }

  /**
   * Extract column metadata back from an `RxJsonSchema`.
   *
   * Used for round-trip testing: `resolve(Model)` → schema →
   * `decompile(schema)` → column metadata map.
   *
   * @param schema - A valid `RxJsonSchema` object.
   * @returns A map of property name → ColumnMetadata.
   *
   * @example
   * ```ts
   * const columns = resolver.decompile(schema);
   * // Map { 'id' => { propertyKey: 'id', options: { type: 'string', ... }, ... } }
   * ```
   */
  decompile(schema: RxJsonSchema<any>): Map<string, ColumnMetadata> {
    const result = new Map<string, ColumnMetadata>();
    const requiredSet = new Set<string>(schema.required ?? []);
    const primaryKey =
      typeof schema.primaryKey === 'string'
        ? schema.primaryKey
        : ((schema.primaryKey as any)?.key ?? null);
    const indexSet = new Set<string>();

    // Flatten indexes into a set of field names
    if (schema.indexes) {
      for (const idx of schema.indexes) {
        if (typeof idx === 'string') {
          indexSet.add(idx);
        } else if (Array.isArray(idx)) {
          for (const field of idx) {
            if (typeof field === 'string') {
              indexSet.add(field);
            }
          }
        }
      }
    }

    for (const [name, prop] of Object.entries(schema.properties ?? {})) {
      const p = prop as any;
      const options = this.decompileOptions(p);

      // Determine if required
      if (requiredSet.has(name) || name === primaryKey) {
        options.required = true;
      } else {
        options.required = false;
      }

      const colMeta: ColumnMetadata = {
        propertyKey: name,
        options,
        isPrimary: name === primaryKey,
        isFillable: false,
        isGuarded: false,
        isHidden: false,
        isVisible: false,
        isIndex: indexSet.has(name),
        isFinal: p.final === true,
        defaultValue: p.default,
        ref: p.ref,
        castType: undefined,
      };

      result.set(name, colMeta);
    }

    return result;
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Compile a single ColumnMetadata entry into an RxJsonSchema property object.
   *
   * @param col - The column metadata.
   * @returns A JSON Schema property descriptor.
   */
  private compileColumnProperty(col: ColumnMetadata): Record<string, any> {
    const prop: Record<string, any> = {};

    // Map type
    prop.type = this.mapType(col.options.type);

    // String-specific: maxLength
    if (col.options.type === 'string' && col.options.maxLength !== undefined) {
      prop.maxLength = col.options.maxLength;
    }

    // Numeric constraints
    if (
      (col.options.type === 'integer' || col.options.type === 'number') &&
      col.options.minimum !== undefined
    ) {
      prop.minimum = col.options.minimum;
    }
    if (
      (col.options.type === 'integer' || col.options.type === 'number') &&
      col.options.maximum !== undefined
    ) {
      prop.maximum = col.options.maximum;
    }
    if (
      (col.options.type === 'integer' || col.options.type === 'number') &&
      col.options.multipleOf !== undefined
    ) {
      prop.multipleOf = col.options.multipleOf;
    }

    // Enum values
    if (col.options.type === 'enum' && col.options.enumValues) {
      prop.enum = col.options.enumValues;
    }

    // Array items
    if (col.options.type === 'array' && col.options.items) {
      prop.items = col.options.items;
    }

    // Format (e.g. 'date-time')
    if (col.options.format) {
      prop.format = col.options.format;
    }

    // Ref (RxDB population)
    if (col.ref) {
      prop.ref = col.ref;
    }

    // Final (immutable after creation)
    if (col.isFinal) {
      prop.final = true;
    }

    // Default value
    if (col.defaultValue !== undefined) {
      prop.default = col.defaultValue;
    }

    return prop;
  }

  /**
   * Map a ColumnOptions type to the JSON Schema type string.
   *
   * @param type - The column type from ColumnOptions.
   * @returns The JSON Schema type string.
   */
  private mapType(type: string): string {
    switch (type) {
      case 'string':
        return 'string';
      case 'integer':
        return 'integer';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      case 'object':
        return 'object';
      case 'enum':
        return 'string';
      default:
        return 'string';
    }
  }

  /**
   * Ensure `created_at` and `updated_at` columns exist in the columns map.
   * Called when `@Timestamps()` class metadata is present.
   *
   * @param columns - The mutable columns map.
   */
  private ensureTimestampColumns(columns: Map<string, ColumnMetadata>): void {
    if (!columns.has('created_at')) {
      columns.set('created_at', {
        propertyKey: 'created_at',
        options: { type: 'string', maxLength: 30, format: 'date-time' },
        isPrimary: false,
        isFillable: false,
        isGuarded: false,
        isHidden: false,
        isVisible: false,
        isIndex: false,
        isFinal: false,
      });
    }

    if (!columns.has('updated_at')) {
      columns.set('updated_at', {
        propertyKey: 'updated_at',
        options: { type: 'string', maxLength: 30, format: 'date-time' },
        isPrimary: false,
        isFillable: false,
        isGuarded: false,
        isHidden: false,
        isVisible: false,
        isIndex: false,
        isFinal: false,
      });
    }
  }

  /**
   * Ensure a `deleted_at` column exists in the columns map.
   * Called when `@SoftDeletes()` class metadata is present.
   *
   * The column is nullable (required: false) with `date-time` format.
   *
   * @param columns - The mutable columns map.
   */
  private ensureSoftDeleteColumn(columns: Map<string, ColumnMetadata>): void {
    if (!columns.has('deleted_at')) {
      columns.set('deleted_at', {
        propertyKey: 'deleted_at',
        options: { type: 'string', maxLength: 30, format: 'date-time', required: false },
        isPrimary: false,
        isFillable: false,
        isGuarded: false,
        isHidden: false,
        isVisible: false,
        isIndex: false,
        isFinal: false,
      });
    }
  }

  /**
   * Decompile a JSON Schema property descriptor back into ColumnOptions.
   *
   * @param prop - The JSON Schema property.
   * @returns The corresponding ColumnOptions.
   */
  private decompileOptions(prop: any): ColumnOptions {
    const type = this.decompileType(prop);
    const options: ColumnOptions = { type };

    if (type === 'string' && prop.maxLength !== undefined) {
      options.maxLength = prop.maxLength;
    }
    if ((type === 'integer' || type === 'number') && prop.minimum !== undefined) {
      options.minimum = prop.minimum;
    }
    if ((type === 'integer' || type === 'number') && prop.maximum !== undefined) {
      options.maximum = prop.maximum;
    }
    if ((type === 'integer' || type === 'number') && prop.multipleOf !== undefined) {
      options.multipleOf = prop.multipleOf;
    }
    if (type === 'enum' && prop.enum) {
      options.enumValues = prop.enum;
    }
    if (type === 'array' && prop.items) {
      options.items = prop.items;
    }
    if (prop.format) {
      options.format = prop.format;
    }

    return options;
  }

  /**
   * Determine the ColumnOptions type from a JSON Schema property descriptor.
   *
   * @param prop - The JSON Schema property.
   * @returns The corresponding column type.
   */
  private decompileType(prop: any): ColumnOptions['type'] {
    const t = typeof prop.type === 'string' ? prop.type : 'string';

    if (t === 'string' && prop.enum) {
      return 'enum';
    }

    switch (t) {
      case 'string':
        return 'string';
      case 'integer':
        return 'integer';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      case 'object':
        return 'object';
      default:
        return 'string';
    }
  }
}
