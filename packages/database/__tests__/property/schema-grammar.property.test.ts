/**
 * @file schema-grammar.property.test.ts
 * @description Property-based tests for schema grammar compilation using fast-check.
 * Verifies round-trip compilation, RxJsonSchema validity, and SQL DDL output
 * for any valid Blueprint configuration.
 */

import fc from 'fast-check';
import { Blueprint } from '@/schema/blueprint';
import { RxDBSchemaGrammar } from '@/schema/grammars/rxdb-schema.grammar';
import { SupabaseSchemaGrammar } from '@/schema/grammars/supabase-schema.grammar';

// Feature: rxdb-eloquent, Property 5: Schema compilation round-trip
// Feature: rxdb-eloquent, Property 6: RxDBSchemaGrammar produces valid RxJsonSchema
// Feature: rxdb-eloquent, Property 7: SQL Schema Grammar produces valid CREATE TABLE

const collectionNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{2,15}$/);
const columnNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,9}$/);
const columnTypeArb = fc.constantFrom(
  'string' as const,
  'integer' as const,
  'number' as const,
  'boolean' as const
);

/**
 * Arbitrary that generates a Blueprint with a primary key and random columns.
 */
const blueprintArb = fc
  .tuple(
    collectionNameArb,
    fc.uniqueArray(
      columnNameArb.filter((n) => n !== 'id'),
      { minLength: 1, maxLength: 8 }
    ),
    fc.array(columnTypeArb, { minLength: 1, maxLength: 8 })
  )
  .map(([name, colNames, colTypes]) => {
    const bp = new Blueprint(name);
    bp.id(); // primary key

    for (let i = 0; i < colNames.length; i++) {
      const colType = colTypes[i % colTypes.length]!;
      switch (colType) {
        case 'string':
          bp.string(colNames[i]!, 255);
          break;
        case 'integer':
          bp.integer(colNames[i]!);
          break;
        case 'number':
          bp.number(colNames[i]!);
          break;
        case 'boolean':
          bp.boolean(colNames[i]!);
          break;
      }
    }

    return bp;
  });

describe('Schema grammar property tests', () => {
  it('Property 5: Schema compilation round-trip — compile then decompile produces equivalent Blueprint', () => {
    const grammar = new RxDBSchemaGrammar();

    fc.assert(
      fc.property(blueprintArb, (bp) => {
        const schema = grammar.compile(bp);
        const decompiled = grammar.decompile(schema);

        // Same primary key
        expect(decompiled.getPrimaryKey()).toBe(bp.getPrimaryKey());

        // Same number of columns
        const originalCols = bp.getColumns();
        const decompiledCols = decompiled.getColumns();
        expect(decompiledCols.length).toBe(originalCols.length);

        // Same column names (order may differ, compare as sets)
        const originalNames = new Set(originalCols.map((c) => c.name));
        const decompiledNames = new Set(decompiledCols.map((c) => c.name));
        expect(decompiledNames).toEqual(originalNames);

        // Same column types
        for (const origCol of originalCols) {
          const match = decompiledCols.find((c) => c.name === origCol.name);
          expect(match).toBeDefined();
          expect(match!.type).toBe(origCol.type);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 6: RxDBSchemaGrammar produces valid RxJsonSchema', () => {
    const grammar = new RxDBSchemaGrammar();

    fc.assert(
      fc.property(blueprintArb, (bp) => {
        const schema = grammar.compile(bp);

        // version is a number
        expect(typeof schema.version).toBe('number');

        // primaryKey is set
        expect(schema.primaryKey).toBeDefined();
        expect(schema.primaryKey).toBe(bp.getPrimaryKey());

        // type is 'object'
        expect(schema.type).toBe('object');

        // properties contains an entry for each column
        const columns = bp.getColumns();
        for (const col of columns) {
          expect(schema.properties).toHaveProperty(col.name);
          expect(schema.properties[col.name]).toHaveProperty('type');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 7: SQL Schema Grammar produces valid CREATE TABLE', () => {
    const grammar = new SupabaseSchemaGrammar();

    fc.assert(
      fc.property(blueprintArb, (bp) => {
        const ddl = grammar.compile(bp);

        // Starts with CREATE TABLE
        expect(ddl).toMatch(/^CREATE TABLE /);

        // Contains the collection name (quoted)
        expect(ddl).toContain(bp.collectionName);

        // Ends with closing paren and semicolon
        expect(ddl).toMatch(/\);$/);
      }),
      { numRuns: 100 }
    );
  });
});
