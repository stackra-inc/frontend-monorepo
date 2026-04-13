/**
 * @file scopes.property.test.ts
 * @description Property-based tests for global scope application and removal using fast-check.
 * Verifies that registered global scopes are applied and can be individually removed.
 */

import fc from 'fast-check';
import { HasGlobalScopes } from '@/model/concerns/has-global-scopes.concern';
import { MetadataStorage } from '@/metadata/metadata.storage';

// Feature: rxdb-eloquent, Property 20: Global scope application and removal

const scopeNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{1,12}$/);

describe('Scopes property tests', () => {
  afterEach(() => {
    MetadataStorage.getInstance().clear();
  });

  it('Property 20: Global scope application and removal — scopes are called and removable', () => {
    fc.assert(
      fc.property(fc.uniqueArray(scopeNameArb, { minLength: 1, maxLength: 8 }), (scopeNames) => {
        class Base {}
        const WithScopes = HasGlobalScopes(Base);
        class TestModel extends WithScopes {}
        const instance = new TestModel();

        // Track which scopes were called
        const called: Set<string> = new Set();

        // Register N global scopes
        for (const name of scopeNames) {
          instance.registerGlobalScope(name, (qb: any) => {
            called.add(name);
            return qb;
          });
        }

        // Apply all scopes
        const mockQb = {};
        instance.applyGlobalScopes(mockQb);

        // All scopes should have been called
        for (const name of scopeNames) {
          expect(called.has(name)).toBe(true);
        }

        // Pick the first scope to remove
        const removedName = scopeNames[0]!;
        instance.removeGlobalScope(removedName);

        // Reset tracking
        called.clear();

        // Apply scopes again
        instance.applyGlobalScopes(mockQb);

        // Removed scope should NOT have been called
        expect(called.has(removedName!)).toBe(false);

        // All other scopes should still be called
        for (const name of scopeNames.slice(1)) {
          expect(called.has(name)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
