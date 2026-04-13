/**
 * @file decorator-metadata.property.test.ts
 * @description Property-based tests for decorator metadata accumulation using fast-check.
 * Verifies that MetadataStorage stores exactly the flags registered for each property.
 */

import fc from 'fast-check';
import { MetadataStorage } from '@/metadata/metadata.storage';

// Feature: rxdb-eloquent, Property 25: Decorator metadata accumulation

const propertyNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,9}$/);

interface FlagSet {
  isFillable: boolean;
  isGuarded: boolean;
  isHidden: boolean;
  isVisible: boolean;
  isIndex: boolean;
  isFinal: boolean;
}

const flagSetArb: fc.Arbitrary<FlagSet> = fc.record({
  isFillable: fc.boolean(),
  isGuarded: fc.boolean(),
  isHidden: fc.boolean(),
  isVisible: fc.boolean(),
  isIndex: fc.boolean(),
  isFinal: fc.boolean(),
});

describe('Decorator metadata property tests', () => {
  afterEach(() => {
    MetadataStorage.getInstance().clear();
  });

  it('Property 25: Decorator metadata accumulation — MetadataStorage stores exactly the registered flags', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.tuple(propertyNameArb, flagSetArb), {
          minLength: 1,
          maxLength: 10,
          selector: (t) => t[0],
        }),
        (entries) => {
          const storage = MetadataStorage.getInstance();
          storage.clear();

          // Create a unique class for this test run
          class TestModel {}

          // Register each property with its flags
          for (const [propName, flags] of entries) {
            storage.registerColumn(TestModel, propName, { type: 'string' });

            if (flags.isFillable) {
              storage.registerColumnFlag(TestModel, propName, 'isFillable', true);
            }
            if (flags.isGuarded) {
              storage.registerColumnFlag(TestModel, propName, 'isGuarded', true);
            }
            if (flags.isHidden) {
              storage.registerColumnFlag(TestModel, propName, 'isHidden', true);
            }
            if (flags.isVisible) {
              storage.registerColumnFlag(TestModel, propName, 'isVisible', true);
            }
            if (flags.isIndex) {
              storage.registerColumnFlag(TestModel, propName, 'isIndex', true);
            }
            if (flags.isFinal) {
              storage.registerColumnFlag(TestModel, propName, 'isFinal', true);
            }
          }

          // Verify stored metadata matches exactly
          const columns = storage.getColumns(TestModel);

          expect(columns.size).toBe(entries.length);

          for (const [propName, flags] of entries) {
            const col = columns.get(propName);
            expect(col).toBeDefined();
            expect(col!.isFillable).toBe(flags.isFillable);
            expect(col!.isGuarded).toBe(flags.isGuarded);
            expect(col!.isHidden).toBe(flags.isHidden);
            expect(col!.isVisible).toBe(flags.isVisible);
            expect(col!.isIndex).toBe(flags.isIndex);
            expect(col!.isFinal).toBe(flags.isFinal);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
