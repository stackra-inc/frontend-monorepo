/**
 * @file serialization.property.test.ts
 * @description Property-based tests for serialization visibility using fast-check.
 * Verifies that applyVisibility respects hidden/visible rules and that
 * the result survives a JSON round-trip.
 */

import fc from 'fast-check';
import { HidesAttributes } from '@/model/concerns/hides-attributes.concern';

// Feature: rxdb-eloquent, Property 16: Serialization visibility

const keyArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,9}$/);
const valueArb = fc.oneof(fc.integer(), fc.string(), fc.boolean());

describe('Serialization visibility property tests', () => {
  it('Property 16: applyVisibility respects hidden/visible rules and JSON round-trips', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(keyArb, { minLength: 1, maxLength: 10 }),
        fc.array(valueArb, { minLength: 1, maxLength: 10 }),
        fc.uniqueArray(keyArb, { minLength: 0, maxLength: 5 }),
        fc.uniqueArray(keyArb, { minLength: 0, maxLength: 5 }),
        (attrKeys, values, hiddenKeys, visibleKeys) => {
          class Base {}
          const ModelClass = HidesAttributes(Base);
          (ModelClass as any).hidden = hiddenKeys;
          (ModelClass as any).visible = visibleKeys;

          const instance = new ModelClass();

          // Build attributes
          const attributes: Record<string, any> = {};
          for (let i = 0; i < attrKeys.length; i++) {
            attributes[attrKeys[i]!] = values[i % values.length];
          }

          const result = instance.applyVisibility(attributes);
          const resultKeys = new Set(Object.keys(result));
          const visibleSet = new Set(visibleKeys);

          // If visible is non-empty, result keys must be a subset of visible
          if (visibleKeys.length > 0) {
            for (const key of resultKeys) {
              expect(visibleSet.has(key)).toBe(true);
            }
          }

          // Hidden keys must not appear in result
          for (const key of hiddenKeys) {
            expect(resultKeys.has(key)).toBe(false);
          }

          // JSON round-trip: parse(stringify(result)) equals result
          const roundTripped = JSON.parse(JSON.stringify(result));
          expect(roundTripped).toEqual(result);
        }
      ),
      { numRuns: 100 }
    );
  });
});
