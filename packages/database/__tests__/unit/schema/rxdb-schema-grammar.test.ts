/**
 * @file rxdb-schema-grammar.test.ts
 * @description Unit tests for the RxDBSchemaGrammar class.
 *
 * Verifies that RxDBSchemaGrammar correctly compiles a Blueprint into a valid
 * RxJsonSchema and supports round-trip decompilation.
 */

import { describe, it, expect } from 'vitest';
import { RxDBSchemaGrammar } from '@/schema/grammars/rxdb-schema.grammar';
import { Blueprint } from '@/schema/blueprint';

describe('RxDBSchemaGrammar', () => {
  const grammar = new RxDBSchemaGrammar();

  // -------------------------------------------------------------------------
  // compile()
  // -------------------------------------------------------------------------

  it('compile() produces a valid RxJsonSchema with version, primaryKey, type, properties, required, indexes', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.string('name', 255).required();
    bp.integer('age');
    bp.index('name');

    const schema = grammar.compile(bp);

    expect(schema.version).toBe(0);
    expect(schema.primaryKey).toBe('id');
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.properties.id).toBeDefined();
    expect(schema.properties.name).toBeDefined();
    expect(schema.properties.age).toBeDefined();
    expect(schema.required).toContain('name');
    expect(schema.indexes).toContain('name');
  });

  it('string column with maxLength produces property with maxLength', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.string('email', 255);

    const schema = grammar.compile(bp);

    expect(schema.properties.email!.type).toBe('string');
    expect(schema.properties.email!.maxLength).toBe(255);
  });

  it('integer column produces property with type="integer"', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.integer('age');

    const schema = grammar.compile(bp);

    expect(schema.properties.age!.type).toBe('integer');
  });

  it('enum column produces property with type="string" and enum array', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.enum('status', ['active', 'inactive']);

    const schema = grammar.compile(bp);

    expect(schema.properties.status!.type).toBe('string');
    expect(schema.properties.status!.enum).toEqual(['active', 'inactive']);
  });

  it('index appears in indexes array', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.string('email', 255);
    bp.index('email');

    const schema = grammar.compile(bp);

    expect(schema.indexes).toContain('email');
  });

  it('ref produces property with ref field', () => {
    const bp = new Blueprint('posts');
    bp.string('id', 100).primary();
    bp.string('author_id', 100).ref('users');

    const schema = grammar.compile(bp);

    expect(schema.properties.author_id!.ref).toBe('users');
  });

  it('final produces property with final=true', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.string('slug', 100).final();

    const schema = grammar.compile(bp);

    expect(schema.properties.slug!.final).toBe(true);
  });

  it('default produces property with default value', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.string('status').default('active');

    const schema = grammar.compile(bp);

    expect(schema.properties.status!.default).toBe('active');
  });

  it('timestamps() adds created_at and updated_at in properties', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.timestamps();

    const schema = grammar.compile(bp);

    expect(schema.properties.created_at!).toBeDefined();
    expect(schema.properties.created_at!.format).toBe('date-time');
    expect(schema.properties.updated_at!).toBeDefined();
    expect(schema.properties.updated_at!.format).toBe('date-time');
  });

  it('softDeletes() adds deleted_at in properties', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.softDeletes();

    const schema = grammar.compile(bp);

    expect(schema.properties.deleted_at!).toBeDefined();
    expect(schema.properties.deleted_at!.format).toBe('date-time');
  });

  // -------------------------------------------------------------------------
  // decompile() round-trip
  // -------------------------------------------------------------------------

  it('decompile() round-trip: compile then decompile produces equivalent Blueprint', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100).primary();
    bp.string('name', 255);
    bp.integer('age');
    bp.index('name');

    const schema = grammar.compile(bp);
    const decompiled = grammar.decompile(schema);

    const colNames = decompiled.getColumns().map((c) => c.name);
    expect(colNames).toContain('id');
    expect(colNames).toContain('name');
    expect(colNames).toContain('age');

    expect(decompiled.getPrimaryKey()).toBe('id');
    expect(decompiled.getIndexes()).toContain('name');

    const nameCol = decompiled.getColumns().find((c) => c.name === 'name');
    expect(nameCol!.type).toBe('string');
    expect(nameCol!.maxLength).toBe(255);

    const ageCol = decompiled.getColumns().find((c) => c.name === 'age');
    expect(ageCol!.type).toBe('integer');
  });
});
