/**
 * @fileoverview Pure tree manipulation functions for the page builder.
 *
 * All functions in this module are pure — they return new tree references
 * without mutating the input. This is critical for the HistoryManager's
 * immutable snapshot strategy and for React's referential equality checks.
 *
 * Functions:
 * - `findNode` — locate a node by ID in the tree
 * - `findParent` — locate the parent of a node by ID
 * - `insertNode` — add a new child at a specific position
 * - `moveNode` — relocate a node to a different parent/position
 * - `removeNode` — delete a node and all its descendants
 * - `duplicateNode` — deep-copy a node with fresh IDs
 * - `updateNodeProps` — merge new props into a specific node
 * - `updateNodeStyles` — merge new styles into a specific node
 * - `countNodes` — count total nodes in a subtree
 * - `validateDrop` — check allowedChildren and maxChildren constraints
 *
 * @module @stackra/react-page-builder
 * @category Utils
 */

import type { ComponentNode } from "../interfaces/component-node.interface";
import type { ComponentMetadata } from "../interfaces/component-metadata.interface";
import { generateId } from "./generate-id.util";

/**
 * Find a node by ID in a component tree.
 *
 * Performs a depth-first search through the tree starting from the
 * given root node.
 *
 * @param root - The root node to search from
 * @param nodeId - The ID of the node to find
 * @returns The matching node, or `null` if not found
 */
export function findNode(root: ComponentNode, nodeId: string): ComponentNode | null {
  if (root.id === nodeId) {
    return root;
  }

  for (const child of root.children) {
    const found = findNode(child, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Find the parent of a node by the child's ID.
 *
 * @param root - The root node to search from
 * @param nodeId - The ID of the child node whose parent to find
 * @returns The parent node, or `null` if the node is the root or not found
 */
export function findParent(root: ComponentNode, nodeId: string): ComponentNode | null {
  for (const child of root.children) {
    if (child.id === nodeId) {
      return root;
    }

    const found = findParent(child, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Insert a new component node as a child of the specified parent at the
 * given position.
 *
 * Creates a new ComponentNode from the provided metadata with default props
 * and inserts it at the specified index in the parent's children array.
 * Returns a new tree (does not mutate the original).
 *
 * @param root - The current root node of the tree
 * @param parentId - The ID of the parent node to insert into
 * @param position - The index at which to insert (clamped to valid range)
 * @param metadata - The ComponentMetadata for the new node
 * @returns A new root node with the insertion applied, and the new node
 */
export function insertNode(
  root: ComponentNode,
  parentId: string,
  position: number,
  metadata: ComponentMetadata,
): { root: ComponentNode; newNode: ComponentNode } {
  const newNode: ComponentNode = {
    id: generateId(),
    type: metadata.type,
    props: { ...metadata.defaultProps },
    styles: {},
    children: [],
  };

  const newRoot = insertNodeInTree(root, parentId, position, newNode);

  return { root: newRoot, newNode };
}

/**
 * Internal helper: insert an existing node into the tree at a specific position.
 */
function insertNodeInTree(
  node: ComponentNode,
  parentId: string,
  position: number,
  newChild: ComponentNode,
): ComponentNode {
  if (node.id === parentId) {
    const clampedPos = Math.max(0, Math.min(position, node.children.length));
    const newChildren = [...node.children];
    newChildren.splice(clampedPos, 0, newChild);

    return { ...node, children: newChildren };
  }

  return {
    ...node,
    children: node.children.map((child) => insertNodeInTree(child, parentId, position, newChild)),
  };
}

/**
 * Move a node from its current position to a new parent and position.
 *
 * The node and all its descendants are preserved structurally.
 * Returns a new tree (does not mutate the original).
 * The total node count remains unchanged after the move.
 *
 * @param root - The current root node of the tree
 * @param nodeId - The ID of the node to move
 * @param newParentId - The ID of the new parent node
 * @param newPosition - The index at which to insert in the new parent
 * @returns A new root node with the move applied
 */
export function moveNode(
  root: ComponentNode,
  nodeId: string,
  newParentId: string,
  newPosition: number,
): ComponentNode {
  // Find the node to move
  const nodeToMove = findNode(root, nodeId);
  if (!nodeToMove) {
    return root;
  }

  // Remove the node from its current position
  const treeWithoutNode = removeNodeFromTree(root, nodeId);
  if (!treeWithoutNode) {
    return root;
  }

  // Insert the node at the new position
  return insertNodeInTree(treeWithoutNode, newParentId, newPosition, nodeToMove);
}

/**
 * Remove a node and all its descendants from the tree.
 *
 * Returns a new tree (does not mutate the original).
 * The total node count decreases by the size of the removed subtree.
 *
 * @param root - The current root node of the tree
 * @param nodeId - The ID of the node to remove
 * @returns A new root node with the removal applied, or `null` if the root itself was removed
 */
export function removeNode(root: ComponentNode, nodeId: string): ComponentNode | null {
  // Cannot remove the root node itself via this function
  if (root.id === nodeId) {
    return null;
  }

  return removeNodeFromTree(root, nodeId);
}

/**
 * Internal helper: remove a node from the tree by ID.
 * Returns a new tree without the specified node.
 */
function removeNodeFromTree(node: ComponentNode, nodeId: string): ComponentNode {
  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== nodeId)
      .map((child) => removeNodeFromTree(child, nodeId)),
  };
}

/**
 * Duplicate a node and all its descendants, assigning fresh unique IDs
 * to every node in the copy.
 *
 * The duplicate is inserted immediately after the original in the same
 * parent's children array. Returns a new tree (does not mutate the original).
 *
 * @param root - The current root node of the tree
 * @param nodeId - The ID of the node to duplicate
 * @returns A new root node with the duplication applied, and the duplicated node
 */
export function duplicateNode(
  root: ComponentNode,
  nodeId: string,
): { root: ComponentNode; duplicatedNode: ComponentNode | null } {
  const original = findNode(root, nodeId);
  if (!original) {
    return { root, duplicatedNode: null };
  }

  const duplicate = deepCopyWithNewIds(original);
  const parent = findParent(root, nodeId);

  if (!parent) {
    // The node to duplicate is the root — cannot duplicate root
    return { root, duplicatedNode: null };
  }

  const originalIndex = parent.children.findIndex((c) => c.id === nodeId);
  const insertPosition = originalIndex + 1;

  const newRoot = insertNodeInTree(root, parent.id, insertPosition, duplicate);

  return { root: newRoot, duplicatedNode: duplicate };
}

/**
 * Create a deep copy of a node subtree with fresh unique IDs.
 *
 * Preserves type, props, styles, and child structure but assigns
 * a new UUID to every node in the copy.
 *
 * @param node - The node to deep-copy
 * @returns A structurally identical node with all-new IDs
 */
function deepCopyWithNewIds(node: ComponentNode): ComponentNode {
  return {
    id: generateId(),
    type: node.type,
    props: { ...node.props },
    styles: { ...node.styles },
    children: node.children.map((child) => deepCopyWithNewIds(child)),
  };
}

/**
 * Update the props of a specific node in the tree.
 *
 * Merges the provided props into the target node's existing props.
 * Only the specified keys are changed; all other props and all other
 * nodes remain unchanged. Returns a new tree (does not mutate the original).
 *
 * @param root - The current root node of the tree
 * @param nodeId - The ID of the node to update
 * @param props - The prop key-value pairs to merge
 * @returns A new root node with the update applied
 */
export function updateNodeProps(
  root: ComponentNode,
  nodeId: string,
  props: Record<string, unknown>,
): ComponentNode {
  if (root.id === nodeId) {
    return { ...root, props: { ...root.props, ...props } };
  }

  return {
    ...root,
    children: root.children.map((child) => updateNodeProps(child, nodeId, props)),
  };
}

/**
 * Update the styles of a specific node in the tree.
 *
 * Merges the provided styles into the target node's existing styles.
 * Returns a new tree (does not mutate the original).
 *
 * @param root - The current root node of the tree
 * @param nodeId - The ID of the node to update
 * @param styles - The style key-value pairs to merge
 * @returns A new root node with the update applied
 */
export function updateNodeStyles(
  root: ComponentNode,
  nodeId: string,
  styles: Record<string, unknown>,
): ComponentNode {
  if (root.id === nodeId) {
    return { ...root, styles: { ...root.styles, ...styles } };
  }

  return {
    ...root,
    children: root.children.map((child) => updateNodeStyles(child, nodeId, styles)),
  };
}

/**
 * Count the total number of nodes in a subtree (including the root).
 *
 * @param node - The root of the subtree to count
 * @returns The total number of nodes (1 + sum of all descendants)
 */
export function countNodes(node: ComponentNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/**
 * Validate whether a component can be dropped into a parent node.
 *
 * Checks two constraints from the parent's ComponentMetadata:
 * 1. **allowedChildren** — the child's type must be in the parent's
 *    allowedChildren list, or the list must contain the wildcard `"*"`.
 * 2. **maxChildren** — the parent's current child count must be below
 *    the maxChildren limit (or maxChildren must be `-1` for unlimited).
 *
 * @param parentMetadata - The ComponentMetadata of the target parent
 * @param childType - The type string of the component being dropped
 * @param currentChildCount - The parent's current number of children
 * @returns `true` if the drop is valid, `false` otherwise
 */
export function validateDrop(
  parentMetadata: ComponentMetadata,
  childType: string,
  currentChildCount: number,
): boolean {
  // Check allowedChildren constraint
  const isTypeAllowed =
    parentMetadata.allowedChildren.includes("*") ||
    parentMetadata.allowedChildren.includes(childType);

  if (!isTypeAllowed) {
    return false;
  }

  // Check maxChildren constraint (-1 means unlimited)
  if (parentMetadata.maxChildren !== -1 && currentChildCount >= parentMetadata.maxChildren) {
    return false;
  }

  return true;
}
