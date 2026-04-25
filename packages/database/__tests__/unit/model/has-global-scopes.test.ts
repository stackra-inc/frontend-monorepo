/**
 * @file has-global-scopes.test.ts
 * @description Unit tests for the HasGlobalScopes mixin. Verifies scope registration,
 * removal, retrieval, application to a query builder, and @GlobalScope decorator integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HasGlobalScopes } from '@/model/concerns/has-global-scopes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';
import type { Scope } from '@/scopes/scope';

const TestClass = HasGlobalScopes(class Base {});

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

describe('HasGlobalScopes', () => {
  // -------------------------------------------------------------------------
  // registerGlobalScope / getGlobalScopes
  // -------------------------------------------------------------------------

  describe('registerGlobalScope()', () => {
    it('registered scope appears in getGlobalScopes()', () => {
      const instance = new TestClass();
      const scope: Scope = { apply: (qb: any) => qb };

      instance.registerGlobalScope('active', scope);

      const scopes = instance.getGlobalScopes();
      expect(scopes.has('active')).toBe(true);
      expect(scopes.get('active')).toBe(scope);
    });
  });

  // -------------------------------------------------------------------------
  // removeGlobalScope
  // -------------------------------------------------------------------------

  describe('removeGlobalScope()', () => {
    it('removed scope no longer appears in getGlobalScopes()', () => {
      const instance = new TestClass();
      const scope: Scope = { apply: (qb: any) => qb };

      instance.registerGlobalScope('active', scope);
      expect(instance.getGlobalScopes().has('active')).toBe(true);

      instance.removeGlobalScope('active');
      expect(instance.getGlobalScopes().has('active')).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // applyGlobalScopes
  // -------------------------------------------------------------------------

  describe('applyGlobalScopes()', () => {
    it('calls each scope apply method with the query builder', () => {
      const instance = new TestClass();
      const applyFn1 = vi.fn((qb: any) => ({ ...qb, scope1: true }));
      const applyFn2 = vi.fn((qb: any) => ({ ...qb, scope2: true }));

      instance.registerGlobalScope('scope1', { apply: applyFn1 });
      instance.registerGlobalScope('scope2', { apply: applyFn2 });

      const mockQb = { where: vi.fn() };
      const result = instance.applyGlobalScopes(mockQb);

      expect(applyFn1).toHaveBeenCalledTimes(1);
      expect(applyFn2).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('scope1', true);
      expect(result).toHaveProperty('scope2', true);
    });

    it('supports plain function scopes', () => {
      const instance = new TestClass();
      const scopeFn = vi.fn((qb: any) => ({ ...qb, filtered: true }));

      instance.registerGlobalScope('filter', scopeFn);

      const mockQb = {};
      const result = instance.applyGlobalScopes(mockQb);

      expect(scopeFn).toHaveBeenCalledWith(mockQb);
      expect(result).toHaveProperty('filtered', true);
    });
  });

  // -------------------------------------------------------------------------
  // @GlobalScope decorator methods
  // -------------------------------------------------------------------------

  describe('@GlobalScope decorator methods', () => {
    it('auto-registered from metadata on first access', () => {
      class ScopedModel extends HasGlobalScopes(class Base {}) {
        scopeActive(qb: any) {
          return { ...qb, active: true };
        }
      }

      // Register scope metadata manually (simulating @GlobalScope('active') decorator)
      const storage = MetadataStorage.getInstance();
      storage.registerScope(ScopedModel, {
        methodName: 'scopeActive',
        type: 'global',
        name: 'active',
      });

      const instance = new ScopedModel();
      const scopes = instance.getGlobalScopes();

      expect(scopes.has('active')).toBe(true);

      // Apply the scope and verify it calls the method
      const result = instance.applyGlobalScopes({});
      expect(result).toHaveProperty('active', true);
    });
  });
});
