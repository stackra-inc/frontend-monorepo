/**
 * @fileoverview PageJson interface — the serialized JSON representation
 * of a page, compatible with the @stackra/react-sdui renderer.
 *
 * The `tree` field is a ComponentNode (not a PageTree wrapper) because
 * the JSON format is a flat serialization — the PageTree wrapper is
 * only used in-memory.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

import type { ComponentNode } from "./component-node.interface";
import type { PageMetadata } from "./page-metadata.interface";

/**
 * The serialized JSON document representing a complete page.
 *
 * This is the format stored in the backend and consumed by the
 * @stackra/react-sdui renderer. The serializer enforces deterministic
 * key ordering: version → metadata → tree.
 */
export interface PageJson {
  /** Schema version string, e.g. "1.0.0" */
  version: string;

  /** Page metadata (title, description, timestamps) */
  metadata: PageMetadata;

  /** Serialized page tree (root ComponentNode) */
  tree: ComponentNode;
}
