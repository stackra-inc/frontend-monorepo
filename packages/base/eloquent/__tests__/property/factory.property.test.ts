/**
 * @file factory.property.test.ts
 * @description Property-based tests for Factory count and state overrides using fast-check.
 * Verifies that factory.count(n).make() returns exactly n instances and
 * factory.state(overrides).make() applies the overridden attributes.
 */

import fc from 'fast-check';
import { Factory } from '@/factory/factory';

// Feature: rxdb-eloquent, Property 23: Factory count and state overrides

/**
 * A simple model class for factory testing.
 */
class SimpleModel {
  attributes: Record<string, any>;

  constructor(attrs: Record<string, any>) {
    this.attributes = { ...attrs };
  }
}

/**
 * A concrete factory for SimpleModel.
 */
class SimpleFactory extends Factory<SimpleModel> {
  protected model = SimpleModel;

  definition(): Record<string, any> {
    return {
      id: 'default-id',
      name: 'default-name',
      age: 25,
    };
  }
}

const keyArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,9}$/);
const valueArb = fc.oneof(fc.integer(), fc.string(), fc.boolean());

describe('Factory property tests', () => {
  it('Property 23: Factory count and state overrides — count(n) returns n instances, state applies overrides', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.uniqueArray(keyArb, { minLength: 1, maxLength: 5 }),
        fc.array(valueArb, { minLength: 1, maxLength: 5 }),
        (n, overrideKeys, overrideValues) => {
          // Test count(n).make() returns exactly n instances
          const factory1 = new SimpleFactory();
          const result = factory1.count(n).make();

          if (n === 1) {
            // Single instance returned directly
            expect(result).toBeInstanceOf(SimpleModel);
          } else {
            // Array of n instances
            expect(Array.isArray(result)).toBe(true);
            expect((result as SimpleModel[]).length).toBe(n);
            for (const item of result as SimpleModel[]) {
              expect(item).toBeInstanceOf(SimpleModel);
            }
          }

          // Test state(overrides).make() applies overridden attributes
          const overrides: Record<string, any> = {};
          for (let i = 0; i < overrideKeys.length; i++) {
            overrides[overrideKeys[i]!] = overrideValues[i % overrideValues.length];
          }

          const factory2 = new SimpleFactory();
          const overridden = factory2.state(overrides).make() as SimpleModel;

          // Overridden keys should have the override values
          for (const key of overrideKeys) {
            expect(overridden.attributes[key]).toBe(overrides[key]);
          }

          // Default keys not in overrides should still have defaults
          if (!overrideKeys.includes('id')) {
            expect(overridden.attributes['id']).toBe('default-id');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
