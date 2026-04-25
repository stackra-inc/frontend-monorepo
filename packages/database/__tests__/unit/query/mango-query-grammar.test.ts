/**
 * @file mango-query-grammar.test.ts
 * @description Unit tests for the MangoQueryGrammar class.
 *
 * Verifies that MangoQueryGrammar correctly compiles QueryBuilderState into
 * RxDB-compatible Mango query objects with selector, sort, limit, and skip.
 */

import { describe, it, expect } from 'vitest';
import { MangoQueryGrammar } from '@/query/grammars/mango-query.grammar';
import { QueryBuilder } from '@/query/query.builder';

describe('MangoQueryGrammar', () => {
  const grammar = new MangoQueryGrammar();

  it('.where("age", ">", 18) → { selector: { age: { $gt: 18 } } }', () => {
    const state = new QueryBuilder().where('age', '>', 18).getState();
    const query = grammar.compile(state);

    expect(query.selector).toEqual({ age: { $gt: 18 } });
  });

  it('.where("name", "Alice") → { selector: { name: { $eq: "Alice" } } }', () => {
    const state = new QueryBuilder().where('name', 'Alice').getState();
    const query = grammar.compile(state);

    expect(query.selector).toEqual({ name: { $eq: 'Alice' } });
  });

  it('.where("age", ">=", 21) → { selector: { age: { $gte: 21 } } }', () => {
    const state = new QueryBuilder().where('age', '>=', 21).getState();
    const query = grammar.compile(state);

    expect(query.selector).toEqual({ age: { $gte: 21 } });
  });

  it('.where("status", "in", ["a","b"]) → { selector: { status: { $in: ["a","b"] } } }', () => {
    const state = new QueryBuilder().where('status', 'in', ['a', 'b']).getState();
    const query = grammar.compile(state);

    expect(query.selector).toEqual({ status: { $in: ['a', 'b'] } });
  });

  it('.where("age", ">", 18).orWhere("role", "=", "admin") → { selector: { $or: [...] } }', () => {
    const state = new QueryBuilder().where('age', '>', 18).orWhere('role', '=', 'admin').getState();
    const query = grammar.compile(state);

    expect(query.selector.$or).toBeDefined();
    expect(query.selector.$or).toHaveLength(2);
    expect(query.selector.$or[0]).toEqual({ age: { $gt: 18 } });
    expect(query.selector.$or[1]).toEqual({ role: { $eq: 'admin' } });
  });

  it('.orderBy("name", "asc") → { sort: [{ name: "asc" }] }', () => {
    const state = new QueryBuilder().orderBy('name', 'asc').getState();
    const query = grammar.compile(state);

    expect(query.sort).toEqual([{ name: 'asc' }]);
  });

  it('.limit(10).skip(5) → { limit: 10, skip: 5 }', () => {
    const state = new QueryBuilder().limit(10).skip(5).getState();
    const query = grammar.compile(state);

    expect(query.limit).toBe(10);
    expect(query.skip).toBe(5);
  });

  it('empty state → { selector: {} }', () => {
    const state = new QueryBuilder().getState();
    const query = grammar.compile(state);

    expect(query.selector).toEqual({});
  });

  it('multiple AND clauses on same field merge correctly', () => {
    const state = new QueryBuilder().where('age', '>', 18).where('age', '<', 65).getState();
    const query = grammar.compile(state);

    expect(query.selector.age).toEqual({ $gt: 18, $lt: 65 });
  });
});
