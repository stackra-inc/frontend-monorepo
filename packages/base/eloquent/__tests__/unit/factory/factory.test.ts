/**
 * @file factory.test.ts
 * @description Unit tests for the Factory abstract class. Verifies definition(),
 * make(), count(), and state() behavior for generating model instances.
 */

import { describe, it, expect } from 'vitest';
import { Factory } from '@/factory/factory';

// ---------------------------------------------------------------------------
// Concrete test factory
// ---------------------------------------------------------------------------

class MockModel {
  constructor(public attrs: any) {}
}

class TestFactory extends Factory {
  protected model = MockModel as any;

  definition(): Record<string, any> {
    return { id: '1', name: 'Test', age: 25 };
  }
}

describe('Factory', () => {
  // -------------------------------------------------------------------------
  // definition()
  // -------------------------------------------------------------------------

  describe('definition()', () => {
    it('returns default attributes', () => {
      const factory = new TestFactory();
      const def = factory.definition();

      expect(def).toEqual({ id: '1', name: 'Test', age: 25 });
    });
  });

  // -------------------------------------------------------------------------
  // make()
  // -------------------------------------------------------------------------

  describe('make()', () => {
    it('returns a single instance with definition attributes', () => {
      const factory = new TestFactory();
      const instance = factory.make() as MockModel;

      expect(instance).toBeInstanceOf(MockModel);
      expect(instance.attrs).toEqual({ id: '1', name: 'Test', age: 25 });
    });
  });

  // -------------------------------------------------------------------------
  // count().make()
  // -------------------------------------------------------------------------

  describe('count(n).make()', () => {
    it('returns n instances', () => {
      const factory = new TestFactory();
      const instances = factory.count(3).make() as MockModel[];

      expect(Array.isArray(instances)).toBe(true);
      expect(instances).toHaveLength(3);
      instances.forEach((inst) => {
        expect(inst).toBeInstanceOf(MockModel);
        expect(inst.attrs).toEqual({ id: '1', name: 'Test', age: 25 });
      });
    });
  });

  // -------------------------------------------------------------------------
  // state().make()
  // -------------------------------------------------------------------------

  describe('state(overrides).make()', () => {
    it('overrides the specified attribute', () => {
      const factory = new TestFactory();
      const instance = factory.state({ role: 'admin' }).make() as MockModel;

      expect(instance.attrs).toEqual({ id: '1', name: 'Test', age: 25, role: 'admin' });
    });

    it('overrides an existing attribute', () => {
      const factory = new TestFactory();
      const instance = factory.state({ name: 'Admin' }).make() as MockModel;

      expect(instance.attrs.name).toBe('Admin');
    });
  });

  // -------------------------------------------------------------------------
  // count().state().make()
  // -------------------------------------------------------------------------

  describe('count(n).state(overrides).make()', () => {
    it('returns n instances with overridden attributes', () => {
      const factory = new TestFactory();
      const instances = factory.count(2).state({ role: 'admin' }).make() as MockModel[];

      expect(Array.isArray(instances)).toBe(true);
      expect(instances).toHaveLength(2);
      instances.forEach((inst) => {
        expect(inst.attrs).toEqual({ id: '1', name: 'Test', age: 25, role: 'admin' });
      });
    });
  });
});
