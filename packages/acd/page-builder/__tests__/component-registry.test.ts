/**
 * @fileoverview Unit tests for ComponentRegistry.
 *
 * Tests built-in component registration and specific schema shapes
 * to verify the registry works correctly with real component metadata.
 *
 * @module @stackra/react-page-builder
 * @category Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ComponentRegistry } from "@/registries/component.registry";
import {
  BUILT_IN_LAYOUT_COMPONENTS,
  BUILT_IN_CONTENT_COMPONENTS,
} from "@/constants/built-in-components.constant";
import { FieldType } from "@/enums/field-type.enum";

describe("ComponentRegistry — Unit Tests", () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();

    // Seed built-in components (mimics PageBuilderModule.forRoot() behavior)
    for (const meta of BUILT_IN_LAYOUT_COMPONENTS) {
      registry.register(meta.type, meta);
    }
    for (const meta of BUILT_IN_CONTENT_COMPONENTS) {
      registry.register(meta.type, meta);
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Built-in component registration (Req 5.1, 11.1)
  |--------------------------------------------------------------------------
  */

  it("registers all built-in layout components", () => {
    const layoutTypes = ["row", "column", "section", "container", "grid"];
    for (const type of layoutTypes) {
      expect(registry.isRegistered(type)).toBe(true);
    }
  });

  it("registers all built-in content components", () => {
    const contentTypes = ["heading", "text", "image", "button", "divider", "spacer"];
    for (const type of contentTypes) {
      expect(registry.isRegistered(type)).toBe(true);
    }
  });

  it("returns correct total count of built-in components", () => {
    const expectedCount = BUILT_IN_LAYOUT_COMPONENTS.length + BUILT_IN_CONTENT_COMPONENTS.length;
    expect(registry.getComponentTypes()).toHaveLength(expectedCount);
  });

  it("returns Layout and Content categories", () => {
    const categories = registry.getCategories();
    expect(categories).toContain("Layout");
    expect(categories).toContain("Content");
  });

  it("getByCategory('Layout') returns only layout components", () => {
    const layouts = registry.getByCategory("Layout");
    expect(layouts).toHaveLength(BUILT_IN_LAYOUT_COMPONENTS.length);
    for (const meta of layouts) {
      expect(meta.category).toBe("Layout");
    }
  });

  it("getByCategory('Content') returns only content components", () => {
    const contents = registry.getByCategory("Content");
    expect(contents).toHaveLength(BUILT_IN_CONTENT_COMPONENTS.length);
    for (const meta of contents) {
      expect(meta.category).toBe("Content");
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Specific schema shapes (Req 11.2–11.6)
  |--------------------------------------------------------------------------
  */

  it("Row component has gap property with NUMBER type", () => {
    const row = registry.get("row");
    expect(row).toBeDefined();
    expect(row!.propertySchema).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "gap",
          type: FieldType.NUMBER,
        }),
      ]),
    );
  });

  it("Row component allows only column children with max 12", () => {
    const row = registry.get("row");
    expect(row!.allowedChildren).toEqual(["column"]);
    expect(row!.maxChildren).toBe(12);
  });

  it("Heading component has text, level, and textAlign properties", () => {
    const heading = registry.get("heading");
    expect(heading).toBeDefined();
    const keys = heading!.propertySchema.map((f) => f.key);
    expect(keys).toContain("text");
    expect(keys).toContain("level");
    expect(keys).toContain("textAlign");
  });

  it("Heading component is a leaf (no children allowed)", () => {
    const heading = registry.get("heading");
    expect(heading!.allowedChildren).toEqual([]);
    expect(heading!.maxChildren).toBe(0);
  });

  it("Image component has src, alt, width, height, and objectFit properties", () => {
    const image = registry.get("image");
    expect(image).toBeDefined();
    const keys = image!.propertySchema.map((f) => f.key);
    expect(keys).toContain("src");
    expect(keys).toContain("alt");
    expect(keys).toContain("width");
    expect(keys).toContain("height");
    expect(keys).toContain("objectFit");
  });

  it("Button component has label, variant, color, size, and href properties", () => {
    const button = registry.get("button");
    expect(button).toBeDefined();
    const keys = button!.propertySchema.map((f) => f.key);
    expect(keys).toContain("label");
    expect(keys).toContain("variant");
    expect(keys).toContain("color");
    expect(keys).toContain("size");
    expect(keys).toContain("href");
  });

  it("Container component allows any children with unlimited max", () => {
    const container = registry.get("container");
    expect(container!.allowedChildren).toEqual(["*"]);
    expect(container!.maxChildren).toBe(-1);
  });

  it("Grid component has columns and gap properties", () => {
    const grid = registry.get("grid");
    expect(grid).toBeDefined();
    const keys = grid!.propertySchema.map((f) => f.key);
    expect(keys).toContain("columns");
    expect(keys).toContain("gap");
  });

  /*
  |--------------------------------------------------------------------------
  | Edge cases
  |--------------------------------------------------------------------------
  */

  it("getByCategory returns empty array for unknown category", () => {
    expect(registry.getByCategory("NonExistent")).toEqual([]);
  });

  it("isRegistered returns false for unknown type", () => {
    expect(registry.isRegistered("unknown-component")).toBe(false);
  });
});
