/**
 * @file events.property.test.ts
 * @description Property-based tests for lifecycle event cancellation using fast-check.
 * Verifies that a 'creating' hook returning false causes fireEvent to return false.
 */

import fc from 'fast-check';
import { HasEvents } from '@/model/concerns/has-events.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

// Feature: rxdb-eloquent, Property 21: Lifecycle event cancellation

/**
 * Build a model class with HasEvents mixed in and a 'creating' hook
 * that returns false.
 */
function createEventModel() {
  class Base {}
  const WithEvents = HasEvents(Base);

  class TestModel extends WithEvents {}

  return TestModel;
}

describe('Events property tests', () => {
  afterEach(() => {
    MetadataStorage.getInstance().clear();
  });

  it('Property 21: Lifecycle event cancellation — creating hook returning false cancels event', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (_modelName) => {
        const TestModel = createEventModel();
        const instance = new TestModel();

        // Register a 'creating' hook that always returns false
        instance.registerHook('creating', () => false);

        // fireEvent('creating') should return false
        const result = instance.fireEvent('creating');
        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
