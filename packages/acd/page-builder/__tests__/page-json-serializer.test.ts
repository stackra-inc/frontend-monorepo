/**
 * @fileoverview Unit tests for PageJsonSerializer.
 *
 * Tests unknown type placeholder handling and version mismatch errors.
 *
 * @module @stackra/react-page-builder
 * @category Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PageJsonSerializer } from "@/services/page-json-serializer.service";
import { ComponentRegistry } from "@/registries/component.registry";
import type { PageJson } from "@/interfaces/page-json.interface";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { PageMetadata } from "@/interfaces/page-metadata.interface";

/** Creates a registry with a few known types. */
function createTestRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();
  registry.register("container", {
    type: "container",
    displayName: "Container",
    icon: "box",
    category: "Layout",
    defaultProps: { maxWidth: 1200 },
    propertySchema: [],
    allowedChildren: ["*"],
    maxChildren: -1,
  });
  registry.register("heading", {
    type: "heading",
    displayName: "Heading",
    icon: "heading",
    category: "Content",
    defaultProps: { text: "Heading" },
    propertySchema: [],
    allowedChildren: [],
    maxChildren: 0,
  });
  return registry;
}

describe("PageJsonSerializer — Unit Tests", () => {
  let serializer: PageJsonSerializer;
  let registry: ComponentRegistry;

  beforeEach(() => {
    serializer = new PageJsonSerializer();
    registry = createTestRegistry();
  });

  /*
  |--------------------------------------------------------------------------
  | Unknown type placeholder (Req 6.4)
  |--------------------------------------------------------------------------
  */

  it("replaces unknown component types with 'unknown' placeholder during deserialization", () => {
    const json: PageJson = {
      version: "1.0.0",
      metadata: {
        title: "Test",
        description: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      tree: {
        id: "root",
        type: "container",
        props: {},
        styles: {},
        children: [
          {
            id: "child-1",
            type: "custom-chart",
            props: { data: [1, 2, 3] },
            styles: { color: "red" },
            children: [],
          },
        ],
      },
    };

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const tree = serializer.deserialize(json, registry);

    // The unknown type should be replaced with "unknown"
    expect(tree.root.children[0].type).toBe("unknown");

    // Original props and styles should be preserved
    expect(tree.root.children[0].props).toEqual({ data: [1, 2, 3] });
    expect(tree.root.children[0].styles).toEqual({ color: "red" });

    // A warning should have been logged
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("custom-chart"));

    warnSpy.mockRestore();
  });

  it("preserves children of unknown type nodes", () => {
    const json: PageJson = {
      version: "1.0.0",
      metadata: {
        title: "Test",
        description: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      tree: {
        id: "root",
        type: "container",
        props: {},
        styles: {},
        children: [
          {
            id: "unknown-parent",
            type: "fancy-layout",
            props: {},
            styles: {},
            children: [
              {
                id: "known-child",
                type: "heading",
                props: { text: "Hello" },
                styles: {},
                children: [],
              },
            ],
          },
        ],
      },
    };

    vi.spyOn(console, "warn").mockImplementation(() => {});

    const tree = serializer.deserialize(json, registry);

    // Parent should be unknown, child should be preserved as heading
    expect(tree.root.children[0].type).toBe("unknown");
    expect(tree.root.children[0].children[0].type).toBe("heading");
    expect(tree.root.children[0].children[0].props).toEqual({ text: "Hello" });

    vi.restoreAllMocks();
  });

  /*
  |--------------------------------------------------------------------------
  | Version mismatch error (Req 12.6)
  |--------------------------------------------------------------------------
  */

  it("throws an error when schema version does not match", () => {
    const json: PageJson = {
      version: "2.0.0",
      metadata: {
        title: "Test",
        description: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      tree: {
        id: "root",
        type: "container",
        props: {},
        styles: {},
        children: [],
      },
    };

    expect(() => serializer.deserialize(json, registry)).toThrow(/version mismatch/i);
  });

  it("includes expected and received versions in the error message", () => {
    const json: PageJson = {
      version: "99.0.0",
      metadata: {
        title: "Test",
        description: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      tree: {
        id: "root",
        type: "container",
        props: {},
        styles: {},
        children: [],
      },
    };

    expect(() => serializer.deserialize(json, registry)).toThrow("1.0.0");
    expect(() => serializer.deserialize(json, registry)).toThrow("99.0.0");
  });

  /*
  |--------------------------------------------------------------------------
  | Serialization basics
  |--------------------------------------------------------------------------
  */

  it("serialize produces correct version and metadata", () => {
    const tree: PageTree = {
      root: {
        id: "root",
        type: "container",
        props: {},
        styles: {},
        children: [],
      },
    };
    const metadata: PageMetadata = {
      title: "My Page",
      description: "A test page",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T12:00:00.000Z",
    };

    const json = serializer.serialize(tree, metadata);

    expect(json.version).toBe("1.0.0");
    expect(json.metadata.title).toBe("My Page");
    expect(json.metadata.description).toBe("A test page");
    expect(json.tree.id).toBe("root");
    expect(json.tree.type).toBe("container");
  });

  it("prettyPrint delegates to the utility and returns a string", () => {
    const json: PageJson = {
      version: "1.0.0",
      metadata: {
        title: "Test",
        description: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      tree: {
        id: "root",
        type: "container",
        props: {},
        styles: {},
        children: [],
      },
    };

    const result = serializer.prettyPrint(json);
    expect(typeof result).toBe("string");
    expect(result).toContain('"version"');
    expect(result).toContain('"metadata"');
    expect(result).toContain('"tree"');
  });
});
