/**
 * @file has-timestamps.test.ts
 * @description Unit tests for the HasTimestamps mixin. Verifies touchTimestamps
 * behavior for new/existing records, disabled timestamps, and custom field names.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HasTimestamps } from '@/model/concerns/has-timestamps.concern';
import { HasAttributes } from '@/model/concerns/has-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

const TestClass = HasTimestamps(HasAttributes(class Base {}));

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

describe('HasTimestamps', () => {
  // -------------------------------------------------------------------------
  // touchTimestamps(true) — new record
  // -------------------------------------------------------------------------

  describe('touchTimestamps(true)', () => {
    it('sets both created_at and updated_at to ISO strings', () => {
      const storage = MetadataStorage.getInstance();
      storage.registerClassMetadata(TestClass, 'timestamps', true);

      const instance = new TestClass();
      instance.touchTimestamps(true);

      const createdAt = instance.getAttribute('created_at');
      const updatedAt = instance.getAttribute('updated_at');

      expect(createdAt).toBeDefined();
      expect(updatedAt).toBeDefined();
      expect(typeof createdAt).toBe('string');
      expect(typeof updatedAt).toBe('string');
      // Validate ISO format
      expect(new Date(createdAt).toISOString()).toBe(createdAt);
      expect(new Date(updatedAt).toISOString()).toBe(updatedAt);
    });
  });

  // -------------------------------------------------------------------------
  // touchTimestamps(false) — existing record
  // -------------------------------------------------------------------------

  describe('touchTimestamps(false)', () => {
    it('sets only updated_at, not created_at', () => {
      const storage = MetadataStorage.getInstance();
      storage.registerClassMetadata(TestClass, 'timestamps', true);

      const instance = new TestClass();
      instance.touchTimestamps(false);

      const createdAt = instance.getAttribute('created_at');
      const updatedAt = instance.getAttribute('updated_at');

      expect(createdAt).toBeUndefined();
      expect(updatedAt).toBeDefined();
      expect(typeof updatedAt).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // Timestamps disabled
  // -------------------------------------------------------------------------

  describe('when timestamps are disabled', () => {
    it('touchTimestamps does nothing', () => {
      // No timestamps metadata registered → disabled by default
      const instance = new TestClass();
      instance.touchTimestamps(true);

      expect(instance.getAttribute('created_at')).toBeUndefined();
      expect(instance.getAttribute('updated_at')).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Custom field names
  // -------------------------------------------------------------------------

  describe('custom CREATED_AT/UPDATED_AT field names', () => {
    it('respects static CREATED_AT and UPDATED_AT overrides', () => {
      class CustomTimestampClass extends HasTimestamps(HasAttributes(class Base {})) {
        static CREATED_AT = 'publishedAt';
        static UPDATED_AT = 'lastModifiedAt';
      }

      const storage = MetadataStorage.getInstance();
      storage.registerClassMetadata(CustomTimestampClass, 'timestamps', true);

      const instance = new CustomTimestampClass();
      instance.touchTimestamps(true);

      expect(instance.getAttribute('publishedAt')).toBeDefined();
      expect(instance.getAttribute('lastModifiedAt')).toBeDefined();
      // Default fields should not be set
      expect(instance.getAttribute('created_at')).toBeUndefined();
      expect(instance.getAttribute('updated_at')).toBeUndefined();
    });
  });
});
