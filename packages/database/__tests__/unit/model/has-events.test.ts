/**
 * @file has-events.test.ts
 * @description Unit tests for the HasEvents mixin. Verifies fireEvent behavior,
 * hook registration, cancellation via returning false, observer method invocation,
 * and @BeforeCreate decorator integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HasEvents } from '@/model/concerns/has-events.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { Observer } from '@/model/observer';

const TestClass = HasEvents(class Base {});

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

describe('HasEvents', () => {
  // -------------------------------------------------------------------------
  // fireEvent — no cancellation
  // -------------------------------------------------------------------------

  describe('fireEvent()', () => {
    it('returns true when no hooks cancel the event', () => {
      const instance = new TestClass();
      const result = instance.fireEvent('creating');

      expect(result).toBe(true);
    });

    it('returns false when a hook returns false (cancellation)', () => {
      const instance = new TestClass();
      instance.registerHook('creating', () => false);

      const result = instance.fireEvent('creating');

      expect(result).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // registerHook
  // -------------------------------------------------------------------------

  describe('registerHook()', () => {
    it('registered callback is called on fireEvent', () => {
      const instance = new TestClass();
      const callback = vi.fn();

      instance.registerHook('created', callback);
      instance.fireEvent('created');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(instance);
    });

    it('multiple hooks are called in registration order', () => {
      const instance = new TestClass();
      const order: number[] = [];

      instance.registerHook('created', () => {
        order.push(1);
      });
      instance.registerHook('created', () => {
        order.push(2);
      });
      instance.fireEvent('created');

      expect(order).toEqual([1, 2]);
    });
  });

  // -------------------------------------------------------------------------
  // Observer methods
  // -------------------------------------------------------------------------

  describe('observer methods', () => {
    it('observer methods are called on fireEvent', () => {
      const creatingFn = vi.fn();
      const createdFn = vi.fn();

      class TestObserver extends Observer {
        creating(model: any): void {
          creatingFn(model);
        }
        created(model: any): void {
          createdFn(model);
        }
      }

      const storage = MetadataStorage.getInstance();
      storage.registerClassMetadata(TestClass, 'observers', [TestObserver]);

      const instance = new TestClass();
      // Reset observer cache so new metadata is picked up
      instance._observers = null;

      instance.fireEvent('creating');
      instance.fireEvent('created');

      expect(creatingFn).toHaveBeenCalledTimes(1);
      expect(createdFn).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // @BeforeCreate decorator method
  // -------------------------------------------------------------------------

  describe('@BeforeCreate decorator method', () => {
    it('decorated method is called on fireEvent("creating")', () => {
      const hookFn = vi.fn();

      class DecoratedModel extends HasEvents(class Base {}) {
        onBeforeCreate() {
          hookFn();
        }
      }

      // Register hook metadata manually (simulating @BeforeCreate decorator)
      const storage = MetadataStorage.getInstance();
      storage.registerHook(DecoratedModel, {
        methodName: 'onBeforeCreate',
        event: 'beforeCreate',
      });

      const instance = new DecoratedModel();
      instance.fireEvent('creating');

      expect(hookFn).toHaveBeenCalledTimes(1);
    });

    it('decorated method returning false cancels the event', () => {
      class CancellingModel extends HasEvents(class Base {}) {
        onBeforeCreate() {
          return false;
        }
      }

      const storage = MetadataStorage.getInstance();
      storage.registerHook(CancellingModel, {
        methodName: 'onBeforeCreate',
        event: 'beforeCreate',
      });

      const instance = new CancellingModel();
      const result = instance.fireEvent('creating');

      expect(result).toBe(false);
    });
  });
});
