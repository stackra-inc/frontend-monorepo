/**
 * @file sql-query-grammar.test.ts
 * @description Unit tests for the SqlQueryGrammar class.
 *
 * Verifies that SqlQueryGrammar correctly compiles QueryBuilderState into
 * SQL SELECT statement strings with proper WHERE, ORDER BY, LIMIT, and OFFSET.
 */

import { describe, it, expect } from 'vitest';
import { SqlQueryGrammar } from '@/query/grammars/sql-query.grammar';
import { QueryBuilder } from '@/query/query.builder';

describe('SqlQueryGrammar', () => {
  const grammar = new SqlQueryGrammar();
  const table = 'users';

  it('.where("age", ">", 18) → SQL contains WHERE "age" > 18', () => {
    const state = new QueryBuilder().where('age', '>', 18).getState();
    const sql = grammar.compile(state, table);

    expect(sql).toContain('WHERE "age" > 18');
  });

  it('.where("name", "Alice") → SQL contains WHERE "name" = \'Alice\'', () => {
    const state = new QueryBuilder().where('name', 'Alice').getState();
    const sql = grammar.compile(state, table);

    expect(sql).toContain(`WHERE "name" = 'Alice'`);
  });

  it('.where("status", "in", ["a","b"]) → SQL contains IN (\'a\', \'b\')', () => {
    const state = new QueryBuilder().where('status', 'in', ['a', 'b']).getState();
    const sql = grammar.compile(state, table);

    expect(sql).toContain(`IN ('a', 'b')`);
  });

  it('.orWhere(...) → SQL contains OR', () => {
    const state = new QueryBuilder().where('age', '>', 18).orWhere('role', '=', 'admin').getState();
    const sql = grammar.compile(state, table);

    expect(sql).toContain('OR');
  });

  it('.orderBy("name", "asc") → SQL contains ORDER BY "name" ASC', () => {
    const state = new QueryBuilder().orderBy('name', 'asc').getState();
    const sql = grammar.compile(state, table);

    expect(sql).toContain('ORDER BY "name" ASC');
  });

  it('.limit(10).skip(5) → SQL contains LIMIT 10 OFFSET 5', () => {
    const state = new QueryBuilder().limit(10).skip(5).getState();
    const sql = grammar.compile(state, table);

    expect(sql).toContain('LIMIT 10');
    expect(sql).toContain('OFFSET 5');
  });

  it('SQL starts with SELECT * FROM "tableName"', () => {
    const state = new QueryBuilder().getState();
    const sql = grammar.compile(state, table);

    expect(sql).toMatch(/^SELECT \* FROM "users"/);
  });
});
