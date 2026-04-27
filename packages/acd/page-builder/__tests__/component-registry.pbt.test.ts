/**
 * @fileoverview Property-based tests for ComponentRegistry.
 *
 * Validates the two correctness properties from the design document:
 * - Property 1: Registry register and retrieve
 * - Property 2: Registry category query correctness
 *
 * Uses fast-check for property-based testing with arbitrary
 * ComponentMetadata generators.
 *
 * @module @stackra/react-page-builder
 * @category Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { ComponentRegistry } from "@/registries/component.registry";
import type { ComponentMetadata } from "@/interfaces/component-metadata.interface";
import { FieldType } from "@/enums/field-type.enum";

// ─── Generators ──────────────────────────────────────────────────────────────

/**
 * Generates a valid ComponentMetadata with random type, displayName,
 * icon, category, defaultProps, propertySchema, allowedChildren, and maxChildren.
 */
function arbitraryComponentMetadata(): fc.Arbitrary<ComponentMetadata> {
  return fc.record({
    type: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    displayName: fc.string({ minLength: 1, maxLength: 50 }),
    icon: fc.string({ minLength: 1, maxLength: 30 }),
    category: fc.constantFrom("Layout", "Content", "Custom", "Media", "Form"),
    defaultProps: fc.constant({} as Record<string, unknown>),
    propertySchema: fc.constant([
      {
        key: "text",
        label: "Text",
        type: FieldType.TEXT,
        defaultValue: "default",
      },
    ]),
    allowedChildren: fc.constantFrom([], ["*"], ["column"]),
    maxChildren: fc.constantFrom(-1, 0, 5, 12),
  });
}

/**
 * Generates a list of ComponentMetadata entries with unique type keys.
 */
function arbitraryUniqueMetadataList(): fc.Arbitrary<ComponentMetadata[]> {
  return fc.uniqueArray(arbitraryComponentMetadata(), {
    minLength: 1,
    maxLength: 20,
    selector: (m) => m.type,
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ComponentRegistry — Property-Based Tests", () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  /*
  |--------------------------------------------------------------------------
  | Property 1: Registry register and retrieve
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 1: Registry register and retrieve
  |
  | For any valid ComponentMetadata, registering it on the ComponentRegistry
  | with its type key and then calling get(type) returns the same metadata
  | object. If a second metadata is registered with the same type key,
  | get(type) returns the second object.
  |
  | **Validates: Requirements 1.1, 1.4**
  |
  */

  it("Property 1: register and retrieve returns same object; re-register overwrites", () => {
    fc.assert(
      fc.property(arbitraryComponentMetadata(), arbitraryComponentMetadata(), (meta1, meta2) => {
        const registry = new ComponentRegistry();

        // Register first metadata
        registry.register(meta1.type, meta1);
        expect(registry.get(meta1.type)).toBe(meta1);

        // Re-register with same type key using second metadata
        const overwrite = { ...meta2, type: meta1.type };
        registry.register(meta1.type, overwrite);
        expect(registry.get(meta1.type)).toBe(overwrite);
        expect(registry.get(meta1.type)).not.toBe(meta1);
      }),
      { numRuns: 100 },
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Property 2: Registry category query correctness
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 2: Registry category query correctness
  |
  | For any set of ComponentMetadata objects registered on the ComponentRegistry:
  | - getByCategory(category) returns exactly those entries whose category
  |   field equals the given category
  | - getComponentTypes() returns exactly the set of registered type strings
  | - isRegistered(type) returns true for registered types and false for
  |   unregistered types
  |
  | **Validates: Requirements 1.5**
  |
  */

  it("Property 2: getByCategory returns exactly matching entries; getComponentTypes returns all types; isRegistered correct", () => {
    fc.assert(
      fc.property(
        arbitraryUniqueMetadataList(),
        fc.string({ minLength: 1, maxLength: 30 }),
        (metadataList, unregisteredType) => {
          const registry = new ComponentRegistry();

          // Register all metadata entries
          for (const meta of metadataList) {
            registry.register(meta.type, meta);
          }

          // Verify getByCategory returns exactly matching entries
          const categories = new Set(metadataList.map((m) => m.category));
          for (const category of categories) {
            const expected = metadataList.filter((m) => m.category === category);
            const actual = registry.getByCategory(category);
            expect(actual).toHaveLength(expected.length);
            for (const entry of expected) {
              expect(actual).toContainEqual(entry);
            }
          }

          // Verify getComponentTypes returns all registered type strings
          const registeredTypes = registry.getComponentTypes();
          expect(registeredTypes).toHaveLength(metadataList.length);
          for (const meta of metadataList) {
            expect(registeredTypes).toContain(meta.type);
          }

          // Verify isRegistered returns true for registered types
          for (const meta of metadataList) {
            expect(registry.isRegistered(meta.type)).toBe(true);
          }

          // Verify isRegistered returns false for unregistered types
          // (only if the random string doesn't collide with a registered type)
          if (!metadataList.some((m) => m.type === unregisteredType)) {
            expect(registry.isRegistered(unregisteredType)).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
