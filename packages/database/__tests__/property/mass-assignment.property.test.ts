/**
 * @file mass-assignment.property.test.ts
 * @description Property-based tests for mass assignment filtering using fast-check.
 * Verifies that fillableFromArray returns only keys present in the fillable set
 * for any arbitrary input attributes and fillable configuration.
 */

import fc from 'fast-check';
import { GuardsAttributes } from '@/model/concerns/guards-attributes.concern';

// Feature: rxdb-eloquent, Property 12: Mass assignment filtering

const keyArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,9}$/);
const valueArb = fc.oneof(fc.integer(), fc.string(), fc.boolean());

describe('Mass assignment property tests', () => {
  it('Property 12: fillableFromArray returns only keys in the fillable set', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(keyArb, { minLength: 1, maxLength: 10 }),
        fc.uniqueArray(keyArb, { minLength: 1, maxLength: 10 }),
        fc.array(valueArb, { minLength: 1, maxLength: 10 }),
        (fillableKeys, inputKeys, values) => {
          // Create a model class with the given fillable set
          class Base {}
          const ModelClass = GuardsAttributes(Base);
          (ModelClass as any).fillable = fillableKeys;

          const instance = new ModelClass();

          // Build input attributes from inputKeys
          const input: Record<string, any> = {};
          for (let i = 0; i < inputKeys.length; i++) {
            input[inputKeys[i]!] = values[i % values.length];
          }

          const result = instance.fillableFromArray(input);
          const resultKeys = Object.keys(result);

          // Every key in result must be in fillable
          const fillableSet = new Set(fillableKeys);
          for (const key of resultKeys) {
            expect(fillableSet.has(key)).toBe(true);
          }

          // Every key in result must also be in input
          const inputKeySet = new Set(inputKeys);
          for (const key of resultKeys) {
            expect(inputKeySet.has(key)).toBe(true);
          }

          // Every key that is both fillable AND in input must be in result
          for (const key of inputKeys) {
            if (fillableSet.has(key)) {
              expect(result[key]).toBe(input[key]);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
