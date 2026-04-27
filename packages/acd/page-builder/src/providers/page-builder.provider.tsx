/**
 * @fileoverview PageBuilderProvider — React provider for the page builder context.
 *
 * Resolves the PageBuilderManager from the DI container and provides it
 * along with reactive state for the page tree, selected node, and builder
 * mode to the component tree via {@link PageBuilderContext}.
 *
 * @module @stackra/react-page-builder
 * @category Providers
 */

"use client";

import React, { useState, useMemo } from "react";
import { useInject } from "@stackra/ts-container";
import { PageBuilderContext } from "@/contexts/page-builder.context";
import type { PageBuilderContextValue } from "@/contexts/page-builder.context";
import { PageBuilderManager } from "@/services/page-builder-manager.service";
import type { ComponentNode } from "@/interfaces/component-node.interface";
import type { PageTree } from "@/interfaces/page-tree.interface";
import { BuilderMode } from "@/enums/builder-mode.enum";

/**
 * Props for the {@link PageBuilderProvider} component.
 */
export interface PageBuilderProviderProps {
  /** Child components that will have access to the page builder context */
  children: React.ReactNode;
}

/**
 * Provider component for the page builder context.
 *
 * Resolves the `PageBuilderManager` from the DI container and manages
 * reactive state for the page tree, selected node, and builder mode.
 * All page builder hooks and components must be rendered within this provider.
 *
 * @example
 * ```tsx
 * <PageBuilderProvider>
 *   <PageBuilder pageId="page-1" />
 * </PageBuilderProvider>
 * ```
 */
export function PageBuilderProvider({ children }: PageBuilderProviderProps) {
  const manager = useInject<PageBuilderManager>(PageBuilderManager);

  const [pageTree, setPageTree] = useState<PageTree>(() => manager.getTree());
  const [selectedNode, setSelectedNode] = useState<ComponentNode | null>(null);
  const [builderMode, setBuilderMode] = useState<BuilderMode>(BuilderMode.EDIT);

  const value = useMemo<PageBuilderContextValue>(
    () => ({
      manager,
      pageTree,
      setPageTree,
      selectedNode,
      setSelectedNode,
      builderMode,
      setBuilderMode,
    }),
    [manager, pageTree, selectedNode, builderMode],
  );

  return <PageBuilderContext.Provider value={value}>{children}</PageBuilderContext.Provider>;
}
