/**
 * @fileoverview useSelectedNode Hook
 *
 * Get and set the currently selected component node in the page builder.
 *
 * @module @stackra/react-page-builder
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { selectedNode, setSelectedNode } = useSelectedNode();
 * if (selectedNode) {
 *   console.log(`Selected: ${selectedNode.type}`);
 * }
 * ```
 */

"use client";

import { usePageBuilderContext } from "@/contexts/page-builder.context";
import type { ComponentNode } from "@/interfaces/component-node.interface";

/**
 * Return type for the {@link useSelectedNode} hook.
 */
export interface UseSelectedNodeReturn {
  /** The currently selected node, or null if none */
  selectedNode: ComponentNode | null;
  /** Set the currently selected node (pass null to deselect) */
  setSelectedNode: (node: ComponentNode | null) => void;
}

/**
 * Hook to get and set the currently selected component node.
 *
 * @returns The selected node and a setter function
 * @throws {Error} If used outside of a `<PageBuilderProvider>`
 */
export function useSelectedNode(): UseSelectedNodeReturn {
  const { selectedNode, setSelectedNode } = usePageBuilderContext();
  return { selectedNode, setSelectedNode };
}
