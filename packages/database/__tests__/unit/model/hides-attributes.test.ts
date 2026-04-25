/**
 * @file hides-attributes.test.ts
 * @description Unit tests for the HidesAttributes mixin.
 *
 * Verifies attribute visibility control via hidden/visible sets, including
 * static property fallback, applyVisibility filtering, makeVisible/makeHidden
 * temporary overrides, and decorator-based @Hidden metadata.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HidesAttributes } from '@/model/concerns/hides-attributes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

describe('HidesAttributes', () => {
  // -------------------------------------------------------------------------
  // Static hidden / visible
  // -------------------------------------------------------------------------

  it('with hidden=["password"]: getHidden() includes "password"', () => {
    const TestClass = HidesAttributes(
      class Base {
        static hidden: string[] = ['password'];
      }
    );
    const instance = new TestClass();

    expect(instance.getHidden()).toContain('password');
  });

  it('with visible=["name","email"]: getVisible() includes "name" and "email"', () => {
    const TestClass = HidesAttributes(
      class Base {
        static visible: string[] = ['name', 'email'];
      }
    );
    const instance = new TestClass();

    const visible = instance.getVisible();
    expect(visible).toContain('name');
    expect(visible).toContain('email');
  });

  // -------------------------------------------------------------------------
  // applyVisibility
  // -------------------------------------------------------------------------

  it('applyVisibility with hidden removes hidden keys', () => {
    const TestClass = HidesAttributes(
      class Base {
        static hidden: string[] = ['password'];
      }
    );
    const instance = new TestClass();

    const result = instance.applyVisibility({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'secret',
    });

    expect(result).toEqual({ name: 'Alice', email: 'alice@test.com' });
    expect(result).not.toHaveProperty('password');
  });

  it('applyVisibility with visible keeps only visible keys', () => {
    const TestClass = HidesAttributes(
      class Base {
        static visible: string[] = ['name', 'email'];
      }
    );
    const instance = new TestClass();

    const result = instance.applyVisibility({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'secret',
      role: 'admin',
    });

    expect(result).toEqual({ name: 'Alice', email: 'alice@test.com' });
  });

  // -------------------------------------------------------------------------
  // makeVisible / makeHidden
  // -------------------------------------------------------------------------

  it('makeVisible(["password"]) temporarily adds to visible', () => {
    const TestClass = HidesAttributes(
      class Base {
        static visible: string[] = ['name'];
      }
    );
    const instance = new TestClass();

    instance.makeVisible(['password']);

    expect(instance.getVisible()).toContain('password');
    expect(instance.getVisible()).toContain('name');
  });

  it('makeHidden(["email"]) temporarily adds to hidden', () => {
    const TestClass = HidesAttributes(class Base {});
    const instance = new TestClass();

    instance.makeHidden(['email']);

    expect(instance.getHidden()).toContain('email');
  });

  // -------------------------------------------------------------------------
  // Decorator-based @Hidden
  // -------------------------------------------------------------------------

  it('decorator-based: @Hidden on "password" → getHidden() includes "password"', () => {
    const TestClass = HidesAttributes(class Base {});

    // Simulate @Hidden() decorator registration
    const storage = MetadataStorage.getInstance();
    storage.registerColumn(TestClass, 'password', { type: 'string' });
    storage.registerColumnFlag(TestClass, 'password', 'isHidden', true);

    const instance = new TestClass();

    expect(instance.getHidden()).toContain('password');
  });
});
