/**
 * @fileoverview usePageBuilder Hook
 *
 * Access the DI-managed PageBuilderManager instance from context.
 *
 * @module @stackra/react-page-builder
 * @category Hooks
 *
 * @example
 * ```tsx
 * const manager = usePageBuilder();
 * manager.insertNode("root", 0, headingMetadata);
 * ```
 */

"use client";

import { usePageBuilderContext } from "@/contexts/page-builder.context";
import type { PageBuilderManager } from "@/services/page-builder-manager.service";

/**
 * Hook to access the PageBuilderManager from context.
 *
 * @returns The DI-resolved {@link PageBuilderManager} instance
 * @throws {Error} If used outside of a `<PageBuilderProvider>`
 */
export function usePageBuilder(): PageBuilderManager {
  const { manager } = usePageBuilderContext();
  return manager;
}
