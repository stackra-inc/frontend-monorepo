/**
 * @file query-builder.test.ts
 * @description Unit tests for the QueryBuilder class.
 *
 * Verifies that QueryBuilder correctly accumulates query state via its
 * fluent, immutable API: where, orWhere, orderBy, limit, skip, soft delete
 * scopes, global scope removal, and eager loading.
 */

import { describe, it, expect } from 'vitest';
import { QueryBuilder } from '@/query/query.builder';

describe('QueryBuilder', () => {
  // -------------------------------------------------------------------------
  // where()
  // -------------------------------------------------------------------------

  it('where("age", 18) creates a where clause with operator "=" and value 18', () => {
    const qb = new QueryBuilder().where('age', 18);
    const state = qb.getState();

    expect(state.wheres).toHaveLength(1);
    expect(state.wheres[0]!.field).toBe('age');
    expect(state.wheres[0]!.operator).toBe('=');
    expect(state.wheres[0]!.value).toBe(18);
    expect(state.wheres[0]!.boolean).toBe('and');
  });

  it('where("age", ">", 18) creates a where clause with operator ">" and value 18', () => {
    const qb = new QueryBuilder().where('age', '>', 18);
    const state = qb.getState();

    expect(state.wheres).toHaveLength(1);
    expect(state.wheres[0]!.field).toBe('age');
    expect(state.wheres[0]!.operator).toBe('>');
    expect(state.wheres[0]!.value).toBe(18);
  });

  // -------------------------------------------------------------------------
  // orWhere()
  // -------------------------------------------------------------------------

  it('orWhere("role", "=", "admin") creates a where clause with boolean="or"', () => {
    const qb = new QueryBuilder().orWhere('role', '=', 'admin');
    const state = qb.getState();

    expect(state.wheres).toHaveLength(1);
    expect(state.wheres[0]!.field).toBe('role');
    expect(state.wheres[0]!.operator).toBe('=');
    expect(state.wheres[0]!.value).toBe('admin');
    expect(state.wheres[0]!.boolean).toBe('or');
  });

  // -------------------------------------------------------------------------
  // orderBy()
  // -------------------------------------------------------------------------

  it('orderBy("name") creates an order with direction="asc"', () => {
    const qb = new QueryBuilder().orderBy('name');
    const state = qb.getState();

    expect(state.orders).toHaveLength(1);
    expect(state.orders[0]!.field).toBe('name');
    expect(state.orders[0]!.direction).toBe('asc');
  });

  it('orderBy("age", "desc") creates an order with direction="desc"', () => {
    const qb = new QueryBuilder().orderBy('age', 'desc');
    const state = qb.getState();

    expect(state.orders).toHaveLength(1);
    expect(state.orders[0]!.field).toBe('age');
    expect(state.orders[0]!.direction).toBe('desc');
  });

  // -------------------------------------------------------------------------
  // limit() / skip()
  // -------------------------------------------------------------------------

  it('limit(10) sets limitValue=10', () => {
    const qb = new QueryBuilder().limit(10);
    expect(qb.getState().limitValue).toBe(10);
  });

  it('skip(5) sets skipValue=5', () => {
    const qb = new QueryBuilder().skip(5);
    expect(qb.getState().skipValue).toBe(5);
  });

  // -------------------------------------------------------------------------
  // Immutability
  // -------------------------------------------------------------------------

  it('original QueryBuilder is unchanged after chain call', () => {
    const original = new QueryBuilder();
    const chained = original.where('age', '>', 18);

    expect(original.getState().wheres).toHaveLength(0);
    expect(chained.getState().wheres).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // Soft delete scopes
  // -------------------------------------------------------------------------

  it('withTrashed() sets withTrashedFlag=true', () => {
    const qb = new QueryBuilder().withTrashed();
    expect(qb.getState().withTrashedFlag).toBe(true);
  });

  it('onlyTrashed() sets onlyTrashedFlag=true', () => {
    const qb = new QueryBuilder().onlyTrashed();
    expect(qb.getState().onlyTrashedFlag).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Global scope removal
  // -------------------------------------------------------------------------

  it('withoutGlobalScope("active") adds "active" to withoutGlobalScopeNames', () => {
    const qb = new QueryBuilder().withoutGlobalScope('active');
    expect(qb.getState().withoutGlobalScopeNames).toContain('active');
  });

  it('withoutGlobalScopes() sets withoutGlobalScopeNames to ["*"]', () => {
    const qb = new QueryBuilder().withoutGlobalScopes();
    expect(qb.getState().withoutGlobalScopeNames).toEqual(['*']);
  });

  // -------------------------------------------------------------------------
  // Eager loading
  // -------------------------------------------------------------------------

  it('with("posts", "profile") sets eagerLoads=["posts", "profile"]', () => {
    const qb = new QueryBuilder().with('posts', 'profile');
    expect(qb.getState().eagerLoads).toEqual(['posts', 'profile']);
  });

  // -------------------------------------------------------------------------
  // Complex chain
  // -------------------------------------------------------------------------

  it('complex chain produces correct state', () => {
    const qb = new QueryBuilder()
      .where('age', '>', 18)
      .where('active', true)
      .orderBy('name')
      .limit(10)
      .skip(5);

    const state = qb.getState();

    expect(state.wheres).toHaveLength(2);
    expect(state.wheres[0]!.field).toBe('age');
    expect(state.wheres[0]!.operator).toBe('>');
    expect(state.wheres[0]!.value).toBe(18);
    expect(state.wheres[1]!.field).toBe('active');
    expect(state.wheres[1]!.operator).toBe('=');
    expect(state.wheres[1]!.value).toBe(true);
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0]!.field).toBe('name');
    expect(state.orders[0]!.direction).toBe('asc');
    expect(state.limitValue).toBe(10);
    expect(state.skipValue).toBe(5);
  });
});
