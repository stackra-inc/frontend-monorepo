/**
 * @fileoverview usePageTree Hook
 *
 * Subscribe to page tree state changes from context.
 *
 * @module @stackra/react-page-builder
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { pageTree, setPageTree } = usePageTree();
 * console.log(pageTree.root.children.length);
 * ```
 */

"use client";

import { usePageBuilderContext } from "@/contexts/page-builder.context";
import type { PageTree } from "@/interfaces/page-tree.interface";

/**
 * Return type for the {@link usePageTree} hook.
 */
export interface UsePageTreeReturn {
  /** The current page tree state */
  pageTree: PageTree;
  /** Update the page tree state */
  setPageTree: (tree: PageTree) => void;
}

/**
 * Hook to subscribe to page tree state changes.
 *
 * @returns The current page tree and a setter function
 * @throws {Error} If used outside of a `<PageBuilderProvider>`
 */
export function usePageTree(): UsePageTreeReturn {
  const { pageTree, setPageTree } = usePageBuilderContext();
  return { pageTree, setPageTree };
}
