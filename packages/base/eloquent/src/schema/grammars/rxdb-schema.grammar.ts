/**
 * @file rxdb-schema.grammar.ts
 * @description Compiles a {@link Blueprint} into a valid RxDB `RxJsonSchema`
 * object, and supports decompilation (RxJsonSchema → Blueprint) for
 * round-trip testing.
 *
 * Type mappings:
 * | Blueprint type | RxJsonSchema property                        |
 * |---------------|----------------------------------------------|
 * | string        | `{ type: 'string', maxLength }`              |
 * | integer       | `{ type: 'integer' }`                        |
 * | number        | `{ type: 'number' }`                         |
 * | boolean       | `{ type: 'boolean' }`                        |
 * | array         | `{ type: 'array', items }`                   |
 * | object        | `{ type: 'object' }`                         |
 * | enum          | `{ type: 'string', enum: values }`           |
 *
 * Additional modifiers: `ref`, `final`, `default`, `format`, `nullable`.
 */

import type { RxJsonSchema } from 'rxdb';
import { SchemaGrammar } from './schema.grammar';
import { Blueprint } from '@/schema/blueprint';
import { type ColumnDefinition } from '@/schema/column.definition';
import type { ColumnType } from '@/schema/column.definition';

// ---------------------------------------------------------------------------
// RxDBSchemaGrammar
// ---------------------------------------------------------------------------

/**
 * Compiles a Blueprint into an RxDB-compatible `RxJsonSchema`.
 *
 * @example
 * ```ts
 * const grammar = new RxDBSchemaGrammar();
 * const bp = new Blueprint('users');
 * bp.string('id', 100).primary();
 * bp.string('name', 255);
 * bp.integer('age');
 * bp.index('age');
 *
 * const schema = grammar.compile(bp);
 * // schema.primaryKey === 'id'
 * // schema.properties.name.type === 'string'
 * ```
 */
export class RxDBSchemaGrammar extends SchemaGrammar {
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Compile a Blueprint into an `RxJsonSchema`.
   *
   * @param blueprint - The Blueprint to compile.
   * @param version   - Schema version number (defaults to `0`).
   * @returns A valid `RxJsonSchema` object.
   */
  compile(blueprint: Blueprint, version: number = 0): RxJsonSchema<any> {
    const properties: Record<string, any> = {};
    const required: string[] = this.compileRequired(blueprint);

    // Build properties map from column definitions
    for (const col of blueprint.getColumns()) {
      properties[col.name] = this.compileColumn(col);
    }

    const schema: RxJsonSchema<any> = {
      version,
      type: 'object',
      primaryKey: blueprint.getPrimaryKey() ?? 'id',
      properties,
      required,
    };

    // Add indexes if any are defined
    const indexes = this.compileIndexes(blueprint);
    if (indexes.length > 0) {
      schema.indexes = indexes;
    }

    return schema;
  }

  /**
   * Alias for {@link compile} — creates the schema for a new collection.
   *
   * @param blueprint - The Blueprint to compile.
   * @returns A valid `RxJsonSchema` object.
   */
  compileCreate(blueprint: Blueprint): RxJsonSchema<any> {
    return this.compile(blueprint);
  }

  /**
   * Compile a drop statement. For RxDB this is a no-op string since
   * collections are removed via `RxDatabase.removeCollection()`.
   *
   * @param collectionName - The collection name to drop.
   * @returns The collection name (used as an identifier for removal).
   */
  compileDrop(collectionName: string): string {
    return collectionName;
  }

  /**
   * Decompile an `RxJsonSchema` back into a Blueprint.
   *
   * Used for round-trip testing: `compile(bp)` → schema → `decompile(schema)` → bp'.
   *
   * @param schema - A valid `RxJsonSchema` object.
   * @returns A Blueprint with equivalent column and index definitions.
   */
  decompile(schema: RxJsonSchema<any>): Blueprint {
    const collectionName = (schema as any).title ?? 'unknown';
    const bp = new Blueprint(collectionName);
    const requiredSet = new Set<string>(schema.required ?? []);
    const primaryKey =
      typeof schema.primaryKey === 'string'
        ? schema.primaryKey
        : ((schema.primaryKey as any)?.key ?? null);

    // Reconstruct columns from properties
    for (const [name, prop] of Object.entries(schema.properties ?? {})) {
      const p = prop as any;
      const col = this.decompileProperty(bp, name, p);

      // Mark primary key
      if (name === primaryKey) {
        col.primary();
      }

      // Mark required
      if (requiredSet.has(name)) {
        col.required();
      } else {
        col.nullable();
      }

      // Restore modifiers
      if (p.final === true) {
        col.final();
      }
      if (p.default !== undefined) {
        col.default(p.default);
      }
      if (p.ref) {
        col.ref(p.ref);
      }
      if (p.format) {
        col.format = p.format;
      }
    }

    // Restore primary key via structural method
    if (primaryKey) {
      bp.primary(primaryKey);
    }

    // Restore indexes
    if (schema.indexes) {
      for (const idx of schema.indexes) {
        bp.index(idx as string | string[]);
      }
    }

    return bp;
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Compile a single ColumnDefinition into an RxJsonSchema property object.
   *
   * @param col - The column definition.
   * @returns A JSON Schema property descriptor.
   */
  private compileColumn(col: ColumnDefinition): Record<string, any> {
    const prop: Record<string, any> = {};

    // Handle nullable columns — RxDB uses type arrays for nullable
    if (col.isNullable) {
      prop.type = this.compileType(col);
      // For nullable, we wrap in an array with 'null' if not already
      // RxDB doesn't support type arrays in the same way as JSON Schema,
      // so we use the oneOf pattern or just allow the type
    } else {
      prop.type = this.compileType(col);
    }

    // String-specific constraints
    if (col.type === 'string' && col.maxLength !== undefined) {
      prop.maxLength = col.maxLength;
    }

    // Numeric constraints
    if ((col.type === 'integer' || col.type === 'number') && col.minimum !== undefined) {
      prop.minimum = col.minimum;
    }
    if ((col.type === 'integer' || col.type === 'number') && col.maximum !== undefined) {
      prop.maximum = col.maximum;
    }
    if ((col.type === 'integer' || col.type === 'number') && col.multipleOf !== undefined) {
      prop.multipleOf = col.multipleOf;
    }

    // Enum values
    if (col.type === 'enum' && col.enumValues) {
      prop.enum = col.enumValues;
    }

    // Array items
    if (col.type === 'array' && col.items) {
      prop.items = col.items;
    }

    // Ref (RxDB population)
    if (col.refValue) {
      prop.ref = col.refValue;
    }

    // Final (immutable after creation)
    if (col.isFinal) {
      prop.final = true;
    }

    // Default value
    if (col.defaultValue !== undefined) {
      prop.default = col.defaultValue;
    }

    // Format (e.g. 'date-time')
    if (col.format) {
      prop.format = col.format;
    }

    return prop;
  }

  /**
   * Map a ColumnDefinition type to the corresponding JSON Schema type string.
   *
   * @param col - The column definition.
   * @returns The JSON Schema type string.
   */
  private compileType(col: ColumnDefinition): string {
    switch (col.type) {
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
        // Enums are stored as strings with an `enum` constraint
        return 'string';
      default:
        return 'string';
    }
  }

  /**
   * Collect all index definitions from the Blueprint.
   *
   * @param blueprint - The Blueprint.
   * @returns An array of index definitions.
   */
  private compileIndexes(blueprint: Blueprint): (string | string[])[] {
    return blueprint.getIndexes();
  }

  /**
   * Collect all required field names from the Blueprint.
   *
   * A field is required if `isRequired` is `true` and it is not the primary key
   * (RxDB handles the primary key separately).
   *
   * @param blueprint - The Blueprint.
   * @returns An array of required field names.
   */
  private compileRequired(blueprint: Blueprint): string[] {
    const pk = blueprint.getPrimaryKey();
    const required: string[] = [];

    for (const col of blueprint.getColumns()) {
      if (col.isRequired && col.name !== pk) {
        required.push(col.name);
      }
    }

    return required;
  }

  /**
   * Decompile a single JSON Schema property back into a ColumnDefinition
   * added to the given Blueprint.
   *
   * @param bp   - The target Blueprint.
   * @param name - The property name.
   * @param prop - The JSON Schema property descriptor.
   * @returns The created ColumnDefinition.
   */
  private decompileProperty(bp: Blueprint, name: string, prop: any): ColumnDefinition {
    const type = this.decompileType(prop);

    // Use the appropriate Blueprint method based on decompiled type
    switch (type) {
      case 'string':
        if (prop.enum) {
          return bp.enum(name, prop.enum);
        }
        return bp.string(name, prop.maxLength);
      case 'integer':
        return bp.integer(name);
      case 'number':
        return bp.number(name);
      case 'boolean':
        return bp.boolean(name);
      case 'array':
        return bp.array(name, prop.items);
      case 'object':
        return bp.object(name);
      default:
        return bp.string(name);
    }
  }

  /**
   * Determine the ColumnType from a JSON Schema property descriptor.
   *
   * @param prop - The JSON Schema property.
   * @returns The corresponding ColumnType.
   */
  private decompileType(prop: any): ColumnType {
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
