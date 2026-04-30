/**
 * @file soft-deletes.test.ts
 * @description Unit tests for the SoftDeletes mixin. Verifies trashed() detection,
 * performSoftDelete() setting deleted_at, and restore() clearing deleted_at.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SoftDeletes } from '@/model/concerns/soft-deletes.concern';
import { HasAttributes } from '@/model/concerns/has-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

const TestClass = SoftDeletes(HasAttributes(class Base {}));

let storage: MetadataStorage;

beforeEach(() => {
  storage = MetadataStorage.getInstance();
  storage.clear();
  // Register softDeletes metadata manually for TestClass
  storage.registerClassMetadata(TestClass, 'softDeletes', true);
});

describe('SoftDeletes', () => {
  // -------------------------------------------------------------------------
  // trashed()
  // -------------------------------------------------------------------------

  describe('trashed()', () => {
    it('returns false when deleted_at is null', () => {
      const instance = new TestClass();
      instance.setAttribute('deleted_at', null);

      expect(instance.trashed()).toBe(false);
    });

    it('returns false when deleted_at is undefined', () => {
      const instance = new TestClass();
      // deleted_at not set at all
      expect(instance.trashed()).toBe(false);
    });

    it('returns true when deleted_at is set to a timestamp', () => {
      const instance = new TestClass();
      instance.setAttribute('deleted_at', new Date().toISOString());

      expect(instance.trashed()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // performSoftDelete()
  // -------------------------------------------------------------------------

  describe('performSoftDelete()', () => {
    it('sets deleted_at to an ISO string', async () => {
      const instance = new TestClass();
      expect(instance.trashed()).toBe(false);

      await instance.performSoftDelete();

      const deletedAt = instance.getAttribute('deleted_at');
      expect(deletedAt).toBeDefined();
      expect(typeof deletedAt).toBe('string');
      expect(new Date(deletedAt).toISOString()).toBe(deletedAt);
      expect(instance.trashed()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // restore()
  // -------------------------------------------------------------------------

  describe('restore()', () => {
    it('sets deleted_at to null', async () => {
      const instance = new TestClass();
      instance.setAttribute('deleted_at', new Date().toISOString());
      expect(instance.trashed()).toBe(true);

      await instance.restore();

      expect(instance.getAttribute('deleted_at')).toBeNull();
      expect(instance.trashed()).toBe(false);
    });
  });
});
