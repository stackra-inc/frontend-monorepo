/**
 * @fileoverview Property-based tests for PageJsonSerializer.
 *
 * Validates the two correctness properties from the design document:
 * - Property 9: Page_JSON serialization round-trip
 * - Property 10: Page_JSON serialization determinism
 *
 * Uses fast-check for property-based testing with arbitrary
 * PageTree and PageMetadata generators.
 *
 * @module @stackra/react-page-builder
 * @category Tests
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { PageJsonSerializer } from "@/services/page-json-serializer.service";
import { ComponentRegistry } from "@/registries/component.registry";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { PageMetadata } from "@/interfaces/page-metadata.interface";
import type { ComponentNode } from "@/interfaces/component-node.interface";

// ─── Generators ──────────────────────────────────────────────────────────────

/** Fixed set of component types that will be registered in the test registry. */
const KNOWN_TYPES = ["container", "heading", "text", "row", "column", "button"];

/**
 * Generates a valid ComponentNode tree up to a given depth.
 * Uses only known types to ensure round-trip works with the registry.
 */
function arbitraryComponentNode(maxDepth: number): fc.Arbitrary<ComponentNode> {
  if (maxDepth <= 0) {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom(...KNOWN_TYPES),
      props: fc.constant({} as Record<string, unknown>),
      styles: fc.constant({} as Record<string, unknown>),
      children: fc.constant([] as ComponentNode[]),
    });
  }

  return fc.record({
    id: fc.uuid(),
    type: fc.constantFrom(...KNOWN_TYPES),
    props: fc.constant({} as Record<string, unknown>),
    styles: fc.constant({} as Record<string, unknown>),
    children: fc.array(arbitraryComponentNode(maxDepth - 1), {
      minLength: 0,
      maxLength: 3,
    }),
  });
}

/**
 * Generates a valid PageTree with a root node.
 */
function arbitraryPageTree(): fc.Arbitrary<PageTree> {
  return arbitraryComponentNode(3).map((node) => ({ root: node }));
}

/**
 * Generates valid PageMetadata with ISO 8601 timestamps.
 */
function arbitraryPageMetadata(): fc.Arbitrary<PageMetadata> {
  return fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ maxLength: 200 }),
    createdAt: fc.constant("2024-01-15T10:30:00.000Z"),
    updatedAt: fc.constant("2024-01-15T12:00:00.000Z"),
  });
}

/**
 * Creates a ComponentRegistry with all known types registered.
 */
function createTestRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();
  for (const type of KNOWN_TYPES) {
    registry.register(type, {
      type,
      displayName: type,
      icon: type,
      category: "Test",
      defaultProps: {},
      propertySchema: [],
      allowedChildren: ["*"],
      maxChildren: -1,
    });
  }
  return registry;
}

/**
 * Deep comparison of two ComponentNode trees, checking structural equivalence.
 */
function assertNodesEqual(a: ComponentNode, b: ComponentNode): void {
  expect(a.id).toBe(b.id);
  expect(a.type).toBe(b.type);
  expect(a.props).toEqual(b.props);
  expect(a.styles).toEqual(b.styles);
  expect(a.children).toHaveLength(b.children.length);
  for (let i = 0; i < a.children.length; i++) {
    assertNodesEqual(a.children[i], b.children[i]);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("PageJsonSerializer — Property-Based Tests", () => {
  const serializer = new PageJsonSerializer();
  const registry = createTestRegistry();

  /*
  |--------------------------------------------------------------------------
  | Property 9: Page_JSON serialization round-trip
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 9: Page_JSON serialization round-trip
  |
  | For any valid PageTree and valid PageMetadata, serializing the tree
  | to PageJson and then deserializing the result back (with all component
  | types registered) produces a PageTree structurally equivalent to the
  | original — same node IDs, types, props, styles, and children ordering.
  |
  | **Validates: Requirements 6.5**
  |
  */

  it("Property 9: serialize then deserialize produces structurally equivalent PageTree", () => {
    fc.assert(
      fc.property(arbitraryPageTree(), arbitraryPageMetadata(), (tree, metadata) => {
        const json = serializer.serialize(tree, metadata);
        const restored = serializer.deserialize(json, registry);

        // Verify structural equivalence
        assertNodesEqual(tree.root, restored.root);
      }),
      { numRuns: 100 },
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Property 10: Page_JSON serialization determinism
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 10: Page_JSON serialization determinism
  |
  | For any valid PageTree, serializing it to a JSON string twice produces
  | identical strings (byte-for-byte equal).
  |
  | **Validates: Requirements 6.6**
  |
  */

  it("Property 10: serializing the same tree twice produces identical JSON strings", () => {
    fc.assert(
      fc.property(arbitraryPageTree(), arbitraryPageMetadata(), (tree, metadata) => {
        const json1 = serializer.serialize(tree, metadata);
        const json2 = serializer.serialize(tree, metadata);

        const str1 = serializer.prettyPrint(json1);
        const str2 = serializer.prettyPrint(json2);

        expect(str1).toBe(str2);
      }),
      { numRuns: 100 },
    );
  });
});
