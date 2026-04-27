/**
 * @fileoverview PageBuilderContext — React context for the page builder.
 *
 * Provides the PageBuilderManager instance, selected node state,
 * builder mode state, and page tree state to the component tree.
 * Consumed by all page builder hooks and components.
 *
 * @module @stackra/react-page-builder
 * @category Contexts
 */

"use client";

import { createContext, useContext } from "react";
import type { PageBuilderManager } from "@/services/page-builder-manager.service";
import type { ComponentNode } from "@/interfaces/component-node.interface";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { BuilderMode } from "@/enums/builder-mode.enum";

/**
 * Shape of the page builder context value.
 *
 * Contains the DI-resolved PageBuilderManager, reactive state for the
 * page tree, selected node, and builder mode, plus their setters.
 */
export interface PageBuilderContextValue {
  /** The DI-resolved PageBuilderManager instance */
  manager: PageBuilderManager;

  /** The current page tree state */
  pageTree: PageTree;

  /** Update the page tree state */
  setPageTree: (tree: PageTree) => void;

  /** The currently selected component node, or null if none */
  selectedNode: ComponentNode | null;

  /** Set the currently selected node */
  setSelectedNode: (node: ComponentNode | null) => void;

  /** The current builder mode (edit or preview) */
  builderMode: BuilderMode;

  /** Set the builder mode */
  setBuilderMode: (mode: BuilderMode) => void;
}

/**
 * React context for the page builder.
 *
 * Initialized to `null` — must be provided by `PageBuilderProvider`.
 */
export const PageBuilderContext = createContext<PageBuilderContextValue | null>(null);

/**
 * Hook to consume the PageBuilderContext with a null check.
 *
 * @returns The current {@link PageBuilderContextValue}
 * @throws {Error} If used outside of a `<PageBuilderProvider>`
 */
export function usePageBuilderContext(): PageBuilderContextValue {
  const ctx = useContext(PageBuilderContext);
  if (!ctx) {
    throw new Error("usePageBuilderContext must be used inside <PageBuilderProvider>");
  }
  return ctx;
}
