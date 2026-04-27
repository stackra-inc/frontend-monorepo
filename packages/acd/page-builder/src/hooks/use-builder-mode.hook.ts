/**
 * @fileoverview useBuilderMode Hook
 *
 * Toggle between edit and preview mode in the page builder.
 *
 * @module @stackra/react-page-builder
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { mode, setMode } = useBuilderMode();
 * setMode(BuilderMode.PREVIEW);
 * ```
 */

"use client";

import { usePageBuilderContext } from "@/contexts/page-builder.context";
import type { BuilderMode } from "@/enums/builder-mode.enum";

/**
 * Return type for the {@link useBuilderMode} hook.
 */
export interface UseBuilderModeReturn {
  /** The current builder mode */
  mode: BuilderMode;
  /** Set the builder mode */
  setMode: (mode: BuilderMode) => void;
}

/**
 * Hook to toggle between edit and preview mode.
 *
 * @returns The current mode and a setter function
 * @throws {Error} If used outside of a `<PageBuilderProvider>`
 */
export function useBuilderMode(): UseBuilderModeReturn {
  const { builderMode, setBuilderMode } = usePageBuilderContext();
  return { mode: builderMode, setMode: setBuilderMode };
}
