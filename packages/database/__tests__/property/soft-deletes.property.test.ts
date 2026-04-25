/**
 * @file soft-deletes.property.test.ts
 * @description Property-based tests for soft delete round-trip using fast-check.
 * Verifies that performSoftDelete sets deleted_at and trashed()=true,
 * and restore clears deleted_at and trashed()=false.
 */

import fc from 'fast-check';
import { SoftDeletes } from '@/model/concerns/soft-deletes.concern';
import { HasAttributes } from '@/model/concerns/has-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

// Feature: rxdb-eloquent, Property 18: Soft delete round-trip

/**
 * Build a model class with SoftDeletes + HasAttributes mixed in,
 * and register softDeletes metadata.
 */
function createSoftDeleteModel() {
  class Base {}
  const WithAttributes = HasAttributes(Base);
  const WithSoftDeletes = SoftDeletes(WithAttributes);

  class TestModel extends WithSoftDeletes {
    // Stub save to avoid actual persistence
    async save(): Promise<void> {}
  }

  const storage = MetadataStorage.getInstance();
  storage.registerClassMetadata(TestModel, 'softDeletes', true);

  return TestModel;
}

describe('Soft deletes property tests', () => {
  afterEach(() => {
    MetadataStorage.getInstance().clear();
  });

  it('Property 18: Soft delete round-trip — performSoftDelete sets deleted_at, restore clears it', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (id, name) => {
          const TestModel = createSoftDeleteModel();
          const instance = new TestModel();
          instance.setAttribute('id', id);
          instance.setAttribute('name', name);

          // Initially not trashed
          expect(instance.trashed()).toBe(false);

          // Perform soft delete
          await instance.performSoftDelete();

          // deleted_at should be a non-null ISO string
          const deletedAt = instance.getAttribute('deleted_at');
          expect(deletedAt).not.toBeNull();
          expect(typeof deletedAt).toBe('string');
          expect(new Date(deletedAt).toISOString()).toBe(deletedAt);

          // trashed() should return true
          expect(instance.trashed()).toBe(true);

          // Restore
          await instance.restore();

          // deleted_at should be null
          expect(instance.getAttribute('deleted_at')).toBeNull();

          // trashed() should return false
          expect(instance.trashed()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
