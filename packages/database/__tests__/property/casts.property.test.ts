/**
 * @file casts.property.test.ts
 * @description Property-based tests for attribute casting using fast-check.
 * Verifies date cast round-trip and JSON cast round-trip properties
 * for the HasAttributes concern.
 */

import fc from 'fast-check';
import { HasAttributes } from '@/model/concerns/has-attributes.concern';

describe('Attribute cast property tests', () => {
  // Feature: rxdb-eloquent, Property 13: Date cast round-trip
  it('Property 13: date cast round-trip preserves getTime() to millisecond precision', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
        (inputDate) => {
          class Base {}
          const ModelClass = HasAttributes(Base);
          (ModelClass as any).casts = { created_at: 'date' };

          const instance = new ModelClass();

          // Set the date attribute (mutator stores as ISO string)
          instance.setAttribute('created_at', inputDate);

          // Get the date attribute (accessor parses back to Date)
          const retrieved = instance.getAttribute('created_at');

          expect(retrieved).toBeInstanceOf(Date);
          expect(retrieved.getTime()).toBe(inputDate.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: rxdb-eloquent, Property 14: JSON cast round-trip
  it('Property 14: json cast round-trip produces a deeply equal object', () => {
    // Use non-string JSON-serializable values since the json cast stores
    // strings as-is (passthrough) and only JSON.stringify's non-strings.
    const jsonValueArb = fc.oneof(
      fc.dictionary(fc.string(), fc.jsonValue()),
      fc.array(fc.jsonValue()),
      fc.integer(),
      fc.boolean(),
      fc.constant(null)
    );

    fc.assert(
      fc.property(jsonValueArb, (inputObj) => {
        class Base {}
        const ModelClass = HasAttributes(Base);
        (ModelClass as any).casts = { settings: 'json' };

        const instance = new ModelClass();

        // Set the json attribute (mutator stores as JSON string)
        instance.setAttribute('settings', inputObj);

        // Get the json attribute (accessor parses back to object)
        const retrieved = instance.getAttribute('settings');

        expect(retrieved).toEqual(inputObj);
      }),
      { numRuns: 100 }
    );
  });
});
