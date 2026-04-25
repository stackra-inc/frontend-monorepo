/**
 * @file blueprint.test.ts
 * @description Unit tests for the Blueprint class.
 *
 * Verifies that Blueprint correctly creates ColumnDefinitions via its fluent API,
 * manages indexes and primary keys, and supports convenience methods like
 * timestamps(), softDeletes(), and id().
 */

import { describe, it, expect } from 'vitest';
import { Blueprint } from '@/schema/blueprint';

describe('Blueprint', () => {
  // -------------------------------------------------------------------------
  // Column type methods
  // -------------------------------------------------------------------------

  it('string() creates a ColumnDefinition with type="string" and maxLength', () => {
    const bp = new Blueprint('users');
    const col = bp.string('name', 100);

    expect(col.name).toBe('name');
    expect(col.type).toBe('string');
    expect(col.maxLength).toBe(100);
  });

  it('integer() creates a ColumnDefinition with type="integer"', () => {
    const bp = new Blueprint('users');
    const col = bp.integer('age');

    expect(col.name).toBe('age');
    expect(col.type).toBe('integer');
  });

  it('number() creates a ColumnDefinition with type="number"', () => {
    const bp = new Blueprint('users');
    const col = bp.number('score');

    expect(col.name).toBe('score');
    expect(col.type).toBe('number');
  });

  it('boolean() creates a ColumnDefinition with type="boolean"', () => {
    const bp = new Blueprint('users');
    const col = bp.boolean('active');

    expect(col.name).toBe('active');
    expect(col.type).toBe('boolean');
  });

  it('array() creates a ColumnDefinition with type="array" and items', () => {
    const bp = new Blueprint('users');
    const col = bp.array('tags', { type: 'string' });

    expect(col.name).toBe('tags');
    expect(col.type).toBe('array');
    expect(col.items).toEqual({ type: 'string' });
  });

  it('object() creates a ColumnDefinition with type="object"', () => {
    const bp = new Blueprint('users');
    const col = bp.object('meta');

    expect(col.name).toBe('meta');
    expect(col.type).toBe('object');
  });

  it('enum() creates a ColumnDefinition with type="enum" and enumValues', () => {
    const bp = new Blueprint('users');
    const col = bp.enum('status', ['a', 'b']);

    expect(col.name).toBe('status');
    expect(col.type).toBe('enum');
    expect(col.enumValues).toEqual(['a', 'b']);
  });

  it('json() creates a ColumnDefinition with type="object" (json maps to object)', () => {
    const bp = new Blueprint('users');
    const col = bp.json('settings');

    expect(col.name).toBe('settings');
    expect(col.type).toBe('object');
  });

  // -------------------------------------------------------------------------
  // Convenience methods
  // -------------------------------------------------------------------------

  it('id() creates a string primary key "id" with maxLength=100', () => {
    const bp = new Blueprint('users');
    const col = bp.id();

    expect(col.name).toBe('id');
    expect(col.type).toBe('string');
    expect(col.maxLength).toBe(100);
    expect(col.isPrimary).toBe(true);
  });

  it('timestamps() adds created_at and updated_at with format="date-time"', () => {
    const bp = new Blueprint('users');
    bp.timestamps();

    const columns = bp.getColumns();
    const createdAt = columns.find((c) => c.name === 'created_at');
    const updatedAt = columns.find((c) => c.name === 'updated_at');

    expect(createdAt).toBeDefined();
    expect(createdAt!.type).toBe('string');
    expect(createdAt!.format).toBe('date-time');

    expect(updatedAt).toBeDefined();
    expect(updatedAt!.type).toBe('string');
    expect(updatedAt!.format).toBe('date-time');
  });

  it('softDeletes() adds a nullable deleted_at with format="date-time"', () => {
    const bp = new Blueprint('users');
    bp.softDeletes();

    const columns = bp.getColumns();
    const deletedAt = columns.find((c) => c.name === 'deleted_at');

    expect(deletedAt).toBeDefined();
    expect(deletedAt!.type).toBe('string');
    expect(deletedAt!.format).toBe('date-time');
    expect(deletedAt!.isNullable).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Structural methods
  // -------------------------------------------------------------------------

  it('primary() sets the primary key field name', () => {
    const bp = new Blueprint('users');
    bp.string('id', 100);
    bp.primary('id');

    expect(bp.getPrimaryKey()).toBe('id');
  });

  it('index() adds a single-field index', () => {
    const bp = new Blueprint('users');
    bp.index('email');

    expect(bp.getIndexes()).toEqual(['email']);
  });

  it('index() adds a compound index', () => {
    const bp = new Blueprint('users');
    bp.index(['last_name', 'first_name']);

    expect(bp.getIndexes()).toEqual([['last_name', 'first_name']]);
  });

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  it('getColumns() returns all columns', () => {
    const bp = new Blueprint('users');
    bp.string('name', 100);
    bp.integer('age');

    expect(bp.getColumns()).toHaveLength(2);
  });

  it('getIndexes() returns all indexes', () => {
    const bp = new Blueprint('users');
    bp.index('email');
    bp.index(['a', 'b']);

    expect(bp.getIndexes()).toEqual(['email', ['a', 'b']]);
  });

  it('getPrimaryKey() returns the primary key field name', () => {
    const bp = new Blueprint('users');
    bp.string('uid', 50).primary();

    expect(bp.getPrimaryKey()).toBe('uid');
  });

  // -------------------------------------------------------------------------
  // Modifier chaining
  // -------------------------------------------------------------------------

  it('string().primary().required().final() sets all flags via chaining', () => {
    const bp = new Blueprint('users');
    const col = bp.string('name').primary().required().final();

    expect(col.isPrimary).toBe(true);
    expect(col.isRequired).toBe(true);
    expect(col.isFinal).toBe(true);
  });
});
