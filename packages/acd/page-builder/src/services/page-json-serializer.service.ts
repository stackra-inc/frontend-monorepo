/**
 * @fileoverview PageJsonSerializer — serializes and deserializes PageTree
 * to/from the PageJson format.
 *
 * Enforces deterministic key ordering so identical trees produce identical
 * JSON strings. Handles unknown component types during deserialization by
 * replacing them with placeholder nodes. Validates schema version during
 * deserialization.
 *
 * Key ordering:
 * - Root document: `version`, `metadata`, `tree`
 * - ComponentNode: `id`, `type`, `props`, `styles`, `children`
 *
 * @module @stackra/react-page-builder
 * @category Services
 */

import { Injectable } from "@stackra/ts-container";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { PageMetadata } from "@/interfaces/page-metadata.interface";
import type { PageJson } from "@/interfaces/page-json.interface";
import type { ComponentNode } from "@/interfaces/component-node.interface";
import type { ComponentRegistry } from "@/registries/component.registry";
import { prettyPrintPageJson } from "@/utils/pretty-print-page-json.util";

/** The current schema version used for serialization. */
const CURRENT_SCHEMA_VERSION = "1.0.0";

/**
 * Serializes and deserializes page trees to/from the PageJson format.
 *
 * The serializer enforces deterministic key ordering so that identical
 * trees always produce identical JSON strings (byte-for-byte). During
 * deserialization, unknown component types are replaced with placeholder
 * nodes and a warning is logged.
 *
 * @example
 * ```typescript
 * const serializer = new PageJsonSerializer();
 *
 * // Serialize
 * const json = serializer.serialize(pageTree, metadata);
 *
 * // Deserialize
 * const tree = serializer.deserialize(json, componentRegistry);
 *
 * // Pretty-print
 * const formatted = serializer.prettyPrint(json);
 * ```
 */
@Injectable()
export class PageJsonSerializer {
  /*
  |--------------------------------------------------------------------------
  | serialize
  |--------------------------------------------------------------------------
  |
  | Converts a PageTree and PageMetadata into a PageJson object with
  | deterministic key ordering. The tree field contains the root
  | ComponentNode (not the PageTree wrapper).
  |
  */

  /**
   * Serialize a page tree and metadata into a PageJson document.
   *
   * Produces a PageJson with deterministic key ordering:
   * - Root: `version`, `metadata`, `tree`
   * - Nodes: `id`, `type`, `props`, `styles`, `children`
   *
   * @param tree - The page tree to serialize
   * @param metadata - The page metadata to include
   * @returns A {@link PageJson} document with deterministic key ordering
   */
  public serialize(tree: PageTree, metadata: PageMetadata): PageJson {
    return {
      version: CURRENT_SCHEMA_VERSION,
      metadata: {
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      },
      tree: this.serializeNode(tree.root),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | deserialize
  |--------------------------------------------------------------------------
  |
  | Converts a PageJson document back into a PageTree. Validates the
  | schema version and replaces unknown component types with placeholder
  | nodes. Preserves original props, styles, and children for unknown types.
  |
  */

  /**
   * Deserialize a PageJson document into a PageTree.
   *
   * Validates the schema version and replaces unknown component types
   * with placeholder nodes (type `"unknown"`). Original props, styles,
   * and children are preserved on placeholder nodes.
   *
   * @param json - The PageJson document to deserialize
   * @param registry - The ComponentRegistry to validate component types against
   * @returns A {@link PageTree} reconstructed from the JSON
   * @throws {Error} If the schema version does not match the current version
   */
  public deserialize(json: PageJson, registry: ComponentRegistry): PageTree {
    // Validate schema version
    if (json.version !== CURRENT_SCHEMA_VERSION) {
      throw new Error(
        `Version mismatch: expected "${CURRENT_SCHEMA_VERSION}", received "${json.version}"`,
      );
    }

    return {
      root: this.deserializeNode(json.tree, registry),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | prettyPrint
  |--------------------------------------------------------------------------
  |
  | Delegates to the prettyPrintPageJson utility function for formatted
  | output with canonical key ordering and 2-space indentation.
  |
  */

  /**
   * Pretty-print a PageJson document to a formatted JSON string.
   *
   * Delegates to the `prettyPrintPageJson` utility for canonical key
   * ordering and 2-space indentation.
   *
   * @param json - The PageJson document to format
   * @returns A formatted JSON string
   */
  public prettyPrint(json: PageJson): string {
    return prettyPrintPageJson(json);
  }

  /*
  |--------------------------------------------------------------------------
  | Private helpers
  |--------------------------------------------------------------------------
  */

  /**
   * Serialize a single ComponentNode with deterministic key ordering.
   *
   * @param node - The node to serialize
   * @returns A ComponentNode with keys in canonical order
   */
  private serializeNode(node: ComponentNode): ComponentNode {
    return {
      id: node.id,
      type: node.type,
      props: { ...node.props },
      styles: { ...node.styles },
      children: node.children.map((child) => this.serializeNode(child)),
    };
  }

  /**
   * Deserialize a single ComponentNode, replacing unknown types with
   * placeholder nodes.
   *
   * @param node - The serialized node data
   * @param registry - The ComponentRegistry to validate types against
   * @returns A deserialized ComponentNode
   */
  private deserializeNode(node: ComponentNode, registry: ComponentRegistry): ComponentNode {
    let type = node.type;

    // Replace unknown types with placeholder
    if (!registry.isRegistered(type)) {
      console.warn(
        `[PageJsonSerializer] Unknown component type "${type}" — rendering as placeholder`,
      );
      type = "unknown";
    }

    return {
      id: node.id,
      type,
      props: { ...node.props },
      styles: { ...node.styles },
      children: node.children.map((child) => this.deserializeNode(child, registry)),
    };
  }
}
