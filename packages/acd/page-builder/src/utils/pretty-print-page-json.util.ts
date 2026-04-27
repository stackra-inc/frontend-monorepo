/**
 * @fileoverview Pretty-printer for Page_JSON with canonical key ordering.
 *
 * Produces a human-readable JSON string with:
 * - 2-space indentation
 * - Canonical key order for ComponentNode: id, type, props, styles, children
 * - Canonical key order for root document: version, metadata, tree
 * - Canonical key order for PageMetadata: title, description, createdAt, updatedAt
 *
 * The output is deterministic — identical inputs always produce identical
 * strings. Parsing the output with `JSON.parse()` produces an object
 * deeply equal to the original input (round-trip property).
 *
 * @module @stackra/react-page-builder
 * @category Utils
 */

import type { PageJson } from "../interfaces/page-json.interface";
import type { ComponentNode } from "../interfaces/component-node.interface";
import type { PageMetadata } from "../interfaces/page-metadata.interface";

/** Canonical key order for the root PageJson document */
const PAGE_JSON_KEY_ORDER = ["version", "metadata", "tree"] as const;

/** Canonical key order for PageMetadata */
const METADATA_KEY_ORDER = ["title", "description", "createdAt", "updatedAt"] as const;

/** Canonical key order for ComponentNode objects */
const NODE_KEY_ORDER = ["id", "type", "props", "styles", "children"] as const;

/**
 * Order the keys of a ComponentNode in canonical order.
 *
 * @param node - The component node to reorder
 * @returns A new object with keys in canonical order
 */
function orderNodeKeys(node: ComponentNode): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};

  for (const key of NODE_KEY_ORDER) {
    if (key === "children") {
      ordered[key] = node.children.map((child) => orderNodeKeys(child));
    } else {
      ordered[key] = node[key];
    }
  }

  return ordered;
}

/**
 * Order the keys of a PageMetadata object in canonical order.
 *
 * @param metadata - The metadata to reorder
 * @returns A new object with keys in canonical order
 */
function orderMetadataKeys(metadata: PageMetadata): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};

  for (const key of METADATA_KEY_ORDER) {
    ordered[key] = metadata[key];
  }

  return ordered;
}

/**
 * Pretty-print a PageJson object to a formatted JSON string.
 *
 * Enforces canonical key ordering and 2-space indentation for
 * human-readable, deterministic output. The output can be parsed
 * back with `JSON.parse()` to produce an object deeply equal to
 * the original input.
 *
 * Key ordering:
 * - Root document: version, metadata, tree
 * - Metadata: title, description, createdAt, updatedAt
 * - ComponentNode: id, type, props, styles, children
 *
 * @param pageJson - The PageJson object to format
 * @returns A formatted JSON string with 2-space indentation
 */
export function prettyPrintPageJson(pageJson: PageJson): string {
  const ordered: Record<string, unknown> = {};

  for (const key of PAGE_JSON_KEY_ORDER) {
    if (key === "metadata") {
      ordered[key] = orderMetadataKeys(pageJson.metadata);
    } else if (key === "tree") {
      ordered[key] = orderNodeKeys(pageJson.tree);
    } else {
      ordered[key] = pageJson[key];
    }
  }

  return JSON.stringify(ordered, null, 2);
}
