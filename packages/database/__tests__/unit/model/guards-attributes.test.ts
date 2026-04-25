/**
 * @file guards-attributes.test.ts
 * @description Unit tests for the GuardsAttributes mixin.
 *
 * Verifies mass assignment protection via fillable/guarded sets, including
 * static property fallback, wildcard support, totallyGuarded, and
 * decorator-based @Fillable metadata.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GuardsAttributes } from '@/model/concerns/guards-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

describe('GuardsAttributes', () => {
  // -------------------------------------------------------------------------
  // Static fillable / guarded
  // -------------------------------------------------------------------------

  it('with fillable=["name","email"]: isFillable("name")=true, isFillable("role")=false', () => {
    const TestClass = GuardsAttributes(
      class Base {
        static fillable: string[] = ['name', 'email'];
      }
    );
    const instance = new TestClass();

    expect(instance.isFillable('name')).toBe(true);
    expect(instance.isFillable('email')).toBe(true);
    expect(instance.isFillable('role')).toBe(false);
  });

  it('with guarded=["password"]: isGuarded("password")=true, isGuarded("name")=false', () => {
    const TestClass = GuardsAttributes(
      class Base {
        static guarded: string[] = ['password'];
      }
    );
    const instance = new TestClass();

    expect(instance.isGuarded('password')).toBe(true);
    expect(instance.isGuarded('name')).toBe(false);
  });

  it('fillableFromArray filters to only fillable keys', () => {
    const TestClass = GuardsAttributes(
      class Base {
        static fillable: string[] = ['name', 'email'];
      }
    );
    const instance = new TestClass();

    const result = instance.fillableFromArray({
      name: 'Alice',
      email: 'alice@test.com',
      role: 'admin',
    });

    expect(result).toEqual({ name: 'Alice', email: 'alice@test.com' });
    expect(result).not.toHaveProperty('role');
  });

  it('fillable=["*"] allows all keys', () => {
    const TestClass = GuardsAttributes(
      class Base {
        static fillable: string[] = ['*'];
      }
    );
    const instance = new TestClass();

    expect(instance.isFillable('anything')).toBe(true);
    expect(instance.isFillable('name')).toBe(true);
  });

  it('guarded=["*"] guards all keys', () => {
    const TestClass = GuardsAttributes(
      class Base {
        static guarded: string[] = ['*'];
      }
    );
    const instance = new TestClass();

    expect(instance.isGuarded('anything')).toBe(true);
    expect(instance.isFillable('anything')).toBe(false);
  });

  it('both empty → totallyGuarded()=true', () => {
    const TestClass = GuardsAttributes(class Base {});
    const instance = new TestClass();

    expect(instance.totallyGuarded()).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Decorator-based @Fillable
  // -------------------------------------------------------------------------

  it('decorator-based: @Fillable on "name" → isFillable("name")=true', () => {
    const TestClass = GuardsAttributes(class Base {});

    // Simulate @Fillable() decorator registration
    const storage = MetadataStorage.getInstance();
    storage.registerColumn(TestClass, 'name', { type: 'string' });
    storage.registerColumnFlag(TestClass, 'name', 'isFillable', true);

    const instance = new TestClass();

    expect(instance.isFillable('name')).toBe(true);
  });
});
