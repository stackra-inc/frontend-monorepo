/**
 * @file has-attributes.test.ts
 * @description Unit tests for the HasAttributes mixin.
 *
 * Verifies attribute get/set, dirty tracking, casting (integer, date, json,
 * boolean), and syncOriginal behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HasAttributes } from '@/model/concerns/has-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

const TestClass = HasAttributes(class Base {});

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

describe('HasAttributes', () => {
  // -------------------------------------------------------------------------
  // Basic get/set
  // -------------------------------------------------------------------------

  it('setAttribute then getAttribute returns the value', () => {
    const instance = new TestClass();
    instance.setAttribute('name', 'Alice');

    expect(instance.getAttribute('name')).toBe('Alice');
  });

  it('getAttributes() returns all attributes', () => {
    const instance = new TestClass();
    instance.setAttribute('name', 'Alice');
    instance.setAttribute('age', 30);

    const attrs = instance.getAttributes();
    expect(attrs).toEqual({ name: 'Alice', age: 30 });
  });

  // -------------------------------------------------------------------------
  // Dirty tracking
  // -------------------------------------------------------------------------

  it('isDirty("name") returns true after setAttribute', () => {
    const instance = new TestClass();
    instance.setAttribute('name', 'Alice');

    expect(instance.isDirty('name')).toBe(true);
  });

  it('isDirty() returns true if any attribute changed', () => {
    const instance = new TestClass();
    instance.setAttribute('name', 'Alice');

    expect(instance.isDirty()).toBe(true);
  });

  it('isDirty() returns false when no attributes changed', () => {
    const instance = new TestClass();

    expect(instance.isDirty()).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Casting via static casts
  // -------------------------------------------------------------------------

  it('cast "integer": setAttribute("age", "25") → getAttribute returns 25', () => {
    const CastedClass = HasAttributes(
      class Base {
        static casts: Record<string, string> = { age: 'integer' };
      }
    );
    const instance = new CastedClass();
    instance.setAttribute('age', '25');

    expect(instance.getAttribute('age')).toBe(25);
    expect(typeof instance.getAttribute('age')).toBe('number');
  });

  it('cast "date": setAttribute stores ISO string, getAttribute returns Date', () => {
    const CastedClass = HasAttributes(
      class Base {
        static casts: Record<string, string> = { d: 'date' };
      }
    );
    const instance = new CastedClass();
    const now = new Date();
    instance.setAttribute('d', now);

    // Stored as ISO string
    const raw = instance._attributes['d'];
    expect(typeof raw).toBe('string');

    // Retrieved as Date
    const retrieved = instance.getAttribute('d');
    expect(retrieved).toBeInstanceOf(Date);
    expect(retrieved.toISOString()).toBe(now.toISOString());
  });

  it('cast "json": setAttribute stores JSON string, getAttribute returns object', () => {
    const CastedClass = HasAttributes(
      class Base {
        static casts: Record<string, string> = { s: 'json' };
      }
    );
    const instance = new CastedClass();
    instance.setAttribute('s', { a: 1 });

    // Stored as JSON string
    const raw = instance._attributes['s'];
    expect(typeof raw).toBe('string');

    // Retrieved as object
    const retrieved = instance.getAttribute('s');
    expect(retrieved).toEqual({ a: 1 });
  });

  it('cast "boolean": setAttribute("b", 1) → getAttribute returns true', () => {
    const CastedClass = HasAttributes(
      class Base {
        static casts: Record<string, string> = { b: 'boolean' };
      }
    );
    const instance = new CastedClass();
    instance.setAttribute('b', 1);

    expect(instance.getAttribute('b')).toBe(true);
  });

  // -------------------------------------------------------------------------
  // syncOriginal
  // -------------------------------------------------------------------------

  it('syncOriginal() resets dirty tracking', () => {
    const instance = new TestClass();
    instance.setAttribute('name', 'Alice');
    expect(instance.isDirty('name')).toBe(true);

    instance.syncOriginal();
    expect(instance.isDirty('name')).toBe(false);
    expect(instance.isDirty()).toBe(false);
  });
});
