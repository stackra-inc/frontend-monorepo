/**
 * @file supabase-schema-grammar.test.ts
 * @description Unit tests for the SupabaseSchemaGrammar. Verifies SQL DDL compilation
 * including CREATE TABLE, DROP TABLE, type mappings, modifiers (PRIMARY KEY, NOT NULL,
 * DEFAULT), enum CHECK constraints, and timestamp columns.
 */

import { describe, it, expect } from 'vitest';
import { SupabaseSchemaGrammar } from '@/schema/grammars/supabase-schema.grammar';
import { Blueprint } from '@/schema/blueprint';

describe('SupabaseSchemaGrammar', () => {
  const grammar = new SupabaseSchemaGrammar();

  // -------------------------------------------------------------------------
  // compile() — CREATE TABLE
  // -------------------------------------------------------------------------

  describe('compile()', () => {
    it('produces SQL starting with CREATE TABLE', () => {
      const bp = new Blueprint('users');
      bp.string('id', 100).primary();

      const sql = grammar.compile(bp);

      expect(sql).toMatch(/^CREATE TABLE/);
    });
  });

  // -------------------------------------------------------------------------
  // Type mappings
  // -------------------------------------------------------------------------

  describe('type mappings', () => {
    it('string column with maxLength → VARCHAR(maxLength)', () => {
      const bp = new Blueprint('test');
      bp.string('id', 50).primary();
      bp.string('name', 255);

      const sql = grammar.compile(bp);

      expect(sql).toContain('VARCHAR(255)');
    });

    it('string column without maxLength → TEXT', () => {
      const bp = new Blueprint('test');
      bp.string('id', 50).primary();
      bp.string('bio');

      const sql = grammar.compile(bp);

      expect(sql).toContain('TEXT');
    });

    it('integer column → INTEGER', () => {
      const bp = new Blueprint('test');
      bp.string('id', 50).primary();
      bp.integer('age');

      const sql = grammar.compile(bp);

      expect(sql).toContain('INTEGER');
    });

    it('number column → DOUBLE PRECISION', () => {
      const bp = new Blueprint('test');
      bp.string('id', 50).primary();
      bp.number('score');

      const sql = grammar.compile(bp);

      expect(sql).toContain('DOUBLE PRECISION');
    });

    it('boolean column → BOOLEAN', () => {
      const bp = new Blueprint('test');
      bp.string('id', 50).primary();
      bp.boolean('active');

      const sql = grammar.compile(bp);

      expect(sql).toContain('BOOLEAN');
    });

    it('object/json column → JSONB', () => {
      const bp = new Blueprint('test');
      bp.string('id', 50).primary();
      bp.json('settings');

      const sql = grammar.compile(bp);

      expect(sql).toContain('JSONB');
    });
  });

  // -------------------------------------------------------------------------
  // Modifiers
  // -------------------------------------------------------------------------

  describe('modifiers', () => {
    it('primary key column includes PRIMARY KEY', () => {
      const bp = new Blueprint('test');
      bp.string('id', 100).primary();

      const sql = grammar.compile(bp);

      expect(sql).toContain('PRIMARY KEY');
    });

    it('required column includes NOT NULL', () => {
      const bp = new Blueprint('test');
      bp.string('id', 100).primary();
      bp.string('name', 255).required();

      const sql = grammar.compile(bp);

      expect(sql).toContain('NOT NULL');
    });

    it('default value includes DEFAULT clause', () => {
      const bp = new Blueprint('test');
      bp.string('id', 100).primary();
      bp.string('status', 50).default('active');

      const sql = grammar.compile(bp);

      expect(sql).toContain("DEFAULT 'active'");
    });
  });

  // -------------------------------------------------------------------------
  // Enum → CHECK constraint
  // -------------------------------------------------------------------------

  describe('enum columns', () => {
    it('enum produces CHECK constraint with allowed values', () => {
      const bp = new Blueprint('test');
      bp.string('id', 100).primary();
      bp.enum('status', ['active', 'inactive', 'banned']);

      const sql = grammar.compile(bp);

      expect(sql).toContain('CHECK');
      expect(sql).toContain("'active'");
      expect(sql).toContain("'inactive'");
      expect(sql).toContain("'banned'");
    });
  });

  // -------------------------------------------------------------------------
  // compileDrop()
  // -------------------------------------------------------------------------

  describe('compileDrop()', () => {
    it('produces DROP TABLE IF EXISTS statement', () => {
      const sql = grammar.compileDrop('users');

      expect(sql).toContain('DROP TABLE IF EXISTS');
      expect(sql).toContain('"users"');
    });
  });

  // -------------------------------------------------------------------------
  // Timestamps → TIMESTAMPTZ
  // -------------------------------------------------------------------------

  describe('timestamps', () => {
    it('timestamp columns with date-time format produce TIMESTAMPTZ', () => {
      const bp = new Blueprint('test');
      bp.string('id', 100).primary();
      bp.timestamps();

      const sql = grammar.compile(bp);

      // timestamps() adds created_at and updated_at with format: 'date-time'
      expect(sql).toContain('TIMESTAMPTZ');
      expect(sql).toContain('"created_at"');
      expect(sql).toContain('"updated_at"');
    });
  });
});
