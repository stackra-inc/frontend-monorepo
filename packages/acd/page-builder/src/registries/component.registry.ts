/**
 * @fileoverview ComponentRegistry — stores component metadata keyed by type string.
 *
 * Extends `BaseRegistry<ComponentMetadata>` from `@stackra/ts-support` for
 * the standard registry API (`register`, `get`, `has`, `getAll`, `getKeys`,
 * `remove`, `clear`, `count`). Adds category-based querying used by the
 * Palette component and drag-and-drop validation.
 *
 * Registered via `PageBuilderModule.forRoot()` as a DI-managed singleton.
 * Built-in layout and content components are seeded during module bootstrap.
 * Custom components are added via `PageBuilderModule.forFeature()`.
 *
 * @module @stackra/react-page-builder
 * @category Registries
 */

import { Injectable } from "@stackra/ts-container";
import { BaseRegistry } from "@stackra/ts-support";
import type { ComponentMetadata } from "@/interfaces/component-metadata.interface";

/**
 * Registry for page builder component metadata.
 *
 * Stores {@link ComponentMetadata} objects keyed by their `type` string.
 * The Palette reads from this registry to display available components,
 * the Canvas uses it for drag-and-drop validation, and the PropertyEditor
 * reads `propertySchema` from registered entries.
 *
 * @example
 * ```typescript
 * const registry = new ComponentRegistry();
 * registry.register("heading", headingMetadata);
 *
 * registry.getByCategory("Content");   // → [headingMetadata, ...]
 * registry.getCategories();            // → ["Layout", "Content"]
 * registry.isRegistered("heading");    // → true
 * ```
 */
@Injectable()
export class ComponentRegistry extends BaseRegistry<ComponentMetadata> {
  /*
  |--------------------------------------------------------------------------
  | getByCategory
  |--------------------------------------------------------------------------
  |
  | Filters all registered component metadata entries by their `category`
  | field. Used by the Palette to group components under category headers.
  |
  */

  /**
   * Get all component metadata entries matching a specific category.
   *
   * @param category - The category string to filter by (exact match)
   * @returns Array of {@link ComponentMetadata} entries whose `category`
   *          field equals the given category
   */
  public getByCategory(category: string): ComponentMetadata[] {
    return this.getAll().filter((metadata) => metadata.category === category);
  }

  /*
  |--------------------------------------------------------------------------
  | getCategories
  |--------------------------------------------------------------------------
  |
  | Returns the unique set of category strings across all registered
  | components. Used by the Palette to render category group headers.
  |
  */

  /**
   * Get all unique category strings from registered components.
   *
   * @returns Array of unique category strings in insertion order
   */
  public getCategories(): string[] {
    const categories = new Set<string>();

    for (const metadata of this.getAll()) {
      categories.add(metadata.category);
    }

    return Array.from(categories);
  }

  /*
  |--------------------------------------------------------------------------
  | getComponentTypes
  |--------------------------------------------------------------------------
  |
  | Returns all registered component type keys. Convenience wrapper
  | around `getKeys()` for semantic clarity.
  |
  */

  /**
   * Get all registered component type strings.
   *
   * @returns Array of registered type keys (e.g. `["row", "column", "heading"]`)
   */
  public getComponentTypes(): string[] {
    return this.getKeys();
  }

  /*
  |--------------------------------------------------------------------------
  | isRegistered
  |--------------------------------------------------------------------------
  |
  | Checks whether a component type is registered. Delegates to the
  | inherited `has()` method from BaseRegistry.
  |
  */

  /**
   * Check whether a component type is registered in this registry.
   *
   * @param type - The component type string to check
   * @returns `true` if the type is registered, `false` otherwise
   */
  public isRegistered(type: string): boolean {
    return this.has(type);
  }
}
