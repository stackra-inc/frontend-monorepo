/**
 * @fileoverview PageTree interface — the top-level wrapper around the
 * component node hierarchy.
 *
 * A PageTree always has a single root ComponentNode (typically a Container).
 * The HistoryManager stores immutable snapshots of PageTree for undo/redo.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

import type { ComponentNode } from "./component-node.interface";

/**
 * The hierarchical data structure representing the entire page layout.
 *
 * Contains a single root ComponentNode from which all other nodes descend.
 * The root is typically a Container component.
 */
export interface PageTree {
  /** The root ComponentNode (typically a Container) */
  root: ComponentNode;
}
