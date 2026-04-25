/**
 * @file query-grammar.property.test.ts
 * @description Property-based tests for MangoQueryGrammar compilation using fast-check.
 * Verifies that for any valid QueryBuilder state with AND where clauses,
 * the compiled Mango query has the correct $operator for each clause.
 */

import fc from 'fast-check';
import { MangoQueryGrammar } from '@/query/grammars/mango-query.grammar';
import { QueryBuilder } from '@/query/query.builder';

// Feature: rxdb-eloquent, Property 10: MangoQueryGrammar compilation

const OPERATOR_MAP: Record<string, string> = {
  '=': '$eq',
  '!=': '$ne',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
};

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

describe('MangoQueryGrammar property tests', () => {
  it('Property 10: compiled Mango query has correct $operator for each AND where clause', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.tuple(fieldArb, operatorArb, valueArb), {
          minLength: 1,
          maxLength: 10,
          selector: ([field]) => field,
        }),
        (clauses) => {
          let qb = new QueryBuilder();
          for (const [field, op, val] of clauses) {
            qb = qb.where(field, op, val);
          }

          const grammar = new MangoQueryGrammar();
          const mango = grammar.compile(qb.getState());

          // Each field should have the correct Mango operator in the selector
          for (const [field, op, val] of clauses) {
            const mangoOp = OPERATOR_MAP[op]!;
            expect(mango.selector[field]).toBeDefined();
            expect(mango.selector[field][mangoOp]).toEqual(val);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
