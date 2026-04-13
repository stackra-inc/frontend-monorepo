/**
 * @file timestamps.property.test.ts
 * @description Property-based tests for automatic timestamp management using fast-check.
 * Verifies that touchTimestamps sets CREATED_AT on insert and UPDATED_AT on update
 * with valid ISO strings.
 */

import fc from 'fast-check';
import { HasTimestamps } from '@/model/concerns/has-timestamps.concern';
import { HasAttributes } from '@/model/concerns/has-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

// Feature: rxdb-eloquent, Property 17: Timestamps auto-management

/**
 * Build a model class with HasTimestamps + HasAttributes mixed in,
 * and register timestamps metadata.
 */
function createTimestampModel() {
  class Base {}
  const WithAttributes = HasAttributes(Base);
  const WithTimestamps = HasTimestamps(WithAttributes);

  class TestModel extends WithTimestamps {}

  const storage = MetadataStorage.getInstance();
  storage.registerClassMetadata(TestModel, 'timestamps', true);

  return TestModel;
}

describe('Timestamps property tests', () => {
  afterEach(() => {
    MetadataStorage.getInstance().clear();
  });

  it('Property 17: Timestamps auto-management — touchTimestamps sets valid ISO strings', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (id) => {
        const TestModel = createTimestampModel();
        const instance = new TestModel();
        instance.setAttribute('id', id);

        // Touch as new record (insert)
        instance.touchTimestamps(true);

        const createdAt = instance.getAttribute('created_at');
        const updatedAtAfterCreate = instance.getAttribute('updated_at');

        // Both should be valid ISO strings
        expect(typeof createdAt).toBe('string');
        expect(new Date(createdAt).toISOString()).toBe(createdAt);
        expect(typeof updatedAtAfterCreate).toBe('string');
        expect(new Date(updatedAtAfterCreate).toISOString()).toBe(updatedAtAfterCreate);

        // Touch as existing record (update)
        instance.touchTimestamps(false);

        const createdAtAfterUpdate = instance.getAttribute('created_at');
        const updatedAtAfterUpdate = instance.getAttribute('updated_at');

        // created_at should remain unchanged
        expect(createdAtAfterUpdate).toBe(createdAt);

        // updated_at should be a valid ISO string >= previous
        expect(typeof updatedAtAfterUpdate).toBe('string');
        expect(new Date(updatedAtAfterUpdate).toISOString()).toBe(updatedAtAfterUpdate);
        expect(new Date(updatedAtAfterUpdate).getTime()).toBeGreaterThanOrEqual(
          new Date(updatedAtAfterCreate).getTime()
        );
      }),
      { numRuns: 100 }
    );
  });
});
