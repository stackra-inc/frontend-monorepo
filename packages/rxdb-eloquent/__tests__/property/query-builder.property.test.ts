/**
 * @file query-builder.property.test.ts
 * @description Property-based tests for the QueryBuilder class using fast-check.
 * Verifies state accumulation correctness and immutability guarantees
 * for arbitrary sequences of where/orderBy/limit/skip calls.
 */

import fc from 'fast-check';
import { QueryBuilder } from '@/query/query.builder';

const operatorArb = fc.constantFrom(
  '=' as const,
  '!=' as const,
  '>' as const,
  '>=' as const,
  '<' as const,
  '<=' as const
);
const fieldArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,9}$/);
const valueArb = fc.oneof(fc.integer(), fc.string(), fc.boolean());

describe('QueryBuilder property tests', () => {
  // Feature: rxdb-eloquent, Property 8: QueryBuilder state accumulation
  it('Property 8: state contains exactly the accumulated where/orderBy/limit/skip clauses', () => {
    const whereArb = fc.tuple(fieldArb, operatorArb, valueArb);
    const orderArb = fc.tuple(fieldArb, fc.constantFrom('asc' as const, 'desc' as const));

    fc.assert(
      fc.property(
        fc.array(whereArb, { minLength: 0, maxLength: 10 }),
        fc.array(orderArb, { minLength: 0, maxLength: 5 }),
        fc.option(fc.nat({ max: 1000 }), { nil: undefined }),
        fc.option(fc.nat({ max: 1000 }), { nil: undefined }),
        (wheres, orders, limitVal, skipVal) => {
          let qb = new QueryBuilder();

          for (const [field, op, val] of wheres) {
            qb = qb.where(field, op, val);
          }
          for (const [field, dir] of orders) {
            qb = qb.orderBy(field, dir);
          }
          if (limitVal !== undefined) {
            qb = qb.limit(limitVal);
          }
          if (skipVal !== undefined) {
            qb = qb.skip(skipVal);
          }

          const state = qb.getState();

          // Where clauses match
          expect(state.wheres.length).toBe(wheres.length);
          for (let i = 0; i < wheres.length; i++) {
            expect(state.wheres[i]!.field).toBe(wheres[i]![0]);
            expect(state.wheres[i]!.operator).toBe(wheres[i]![1]);
            expect(state.wheres[i]!.value).toBe(wheres[i]![2]);
            expect(state.wheres[i]!.boolean).toBe('and');
          }

          // Order clauses match
          expect(state.orders.length).toBe(orders.length);
          for (let i = 0; i < orders.length; i++) {
            expect(state.orders[i]!.field).toBe(orders[i]![0]);
            expect(state.orders[i]!.direction).toBe(orders[i]![1]);
          }

          // Limit and skip
          expect(state.limitValue).toBe(limitVal ?? null);
          expect(state.skipValue).toBe(skipVal ?? null);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: rxdb-eloquent, Property 9: QueryBuilder immutability
  it('Property 9: chaining methods does not mutate the original QueryBuilder state', () => {
    fc.assert(
      fc.property(
        fieldArb,
        operatorArb,
        valueArb,
        fieldArb,
        fc.constantFrom('asc' as const, 'desc' as const),
        fc.nat({ max: 1000 }),
        fc.nat({ max: 1000 }),
        (wField, wOp, wVal, oField, oDir, limitVal, skipVal) => {
          const original = new QueryBuilder();
          const originalState = original.getState();

          // Apply all chain methods — each returns a new instance
          original.where(wField, wOp, wVal);
          original.orderBy(oField, oDir);
          original.limit(limitVal);
          original.skip(skipVal);

          // Original state must be unchanged
          const afterState = original.getState();
          expect(afterState.wheres).toEqual(originalState.wheres);
          expect(afterState.orders).toEqual(originalState.orders);
          expect(afterState.limitValue).toBe(originalState.limitValue);
          expect(afterState.skipValue).toBe(originalState.skipValue);
        }
      ),
      { numRuns: 100 }
    );
  });
});
