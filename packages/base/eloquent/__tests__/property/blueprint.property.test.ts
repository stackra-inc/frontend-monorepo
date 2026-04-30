/**
 * @file blueprint.property.test.ts
 * @description Property-based tests for the Blueprint class using fast-check.
 * Verifies that column accumulation via the fluent API produces correct
 * getColumns() output for arbitrary sequences of column definitions.
 */

import fc from 'fast-check';
import { Blueprint } from '@/schema/blueprint';

// Feature: rxdb-eloquent, Property 4: Blueprint column accumulation

const columnTypeArb = fc.constantFrom(
  'string' as const,
  'integer' as const,
  'number' as const,
  'boolean' as const,
  'object' as const
);

const columnNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,19}$/);

describe('Blueprint property tests', () => {
  it('Property 4: getColumns() returns exactly the columns defined with correct types', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.tuple(columnNameArb, columnTypeArb), {
          minLength: 1,
          maxLength: 20,
          selector: ([name]) => name,
        }),
        (pairs) => {
          const bp = new Blueprint('test_collection');

          for (const [name, type] of pairs) {
            switch (type) {
              case 'string':
                bp.string(name);
                break;
              case 'integer':
                bp.integer(name);
                break;
              case 'number':
                bp.number(name);
                break;
              case 'boolean':
                bp.boolean(name);
                break;
              case 'object':
                bp.object(name);
                break;
            }
          }

          const columns = bp.getColumns();

          // Exact count
          expect(columns.length).toBe(pairs.length);

          // Each column matches name and type in order
          for (let i = 0; i < pairs.length; i++) {
            expect(columns[i]!.name).toBe(pairs[i]![0]);
            expect(columns[i]!.type).toBe(pairs[i]![1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
