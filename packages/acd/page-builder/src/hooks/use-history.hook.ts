/**
 * @fileoverview useHistory Hook
 *
 * Provides undo/redo controls from the HistoryManager via context.
 *
 * @module @stackra/react-page-builder
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { undo, redo, canUndo, canRedo } = useHistory();
 * <Button disabled={!canUndo} onPress={undo}>Undo</Button>
 * ```
 */

"use client";

import { useCallback } from "react";
import { useInject } from "@stackra/ts-container";
import { usePageBuilderContext } from "@/contexts/page-builder.context";
import { PAGE_BUILDER_HISTORY_MANAGER } from "@/constants/tokens.constant";
import type { HistoryManager } from "@/services/history-manager.service";

/**
 * Return type for the {@link useHistory} hook.
 */
export interface UseHistoryReturn {
  /** Undo the last operation, restoring the previous page tree state */
  undo: () => void;
  /** Redo the last undone operation */
  redo: () => void;
  /** Whether an undo operation is available */
  canUndo: boolean;
  /** Whether a redo operation is available */
  canRedo: boolean;
}

/**
 * Hook providing undo/redo controls for the page builder.
 *
 * Resolves the HistoryManager from DI and wraps its undo/redo methods
 * to automatically update the page tree state in context.
 *
 * @returns Undo/redo functions and availability flags
 * @throws {Error} If used outside of a `<PageBuilderProvider>`
 */
export function useHistory(): UseHistoryReturn {
  const { manager, setPageTree } = usePageBuilderContext();
  const historyManager = useInject<HistoryManager>(PAGE_BUILDER_HISTORY_MANAGER);

  const undo = useCallback(() => {
    const previousTree = historyManager.undo();
    if (previousTree) {
      manager.setTree(previousTree);
      setPageTree(previousTree);
    }
  }, [historyManager, manager, setPageTree]);

  const redo = useCallback(() => {
    const nextTree = historyManager.redo();
    if (nextTree) {
      manager.setTree(nextTree);
      setPageTree(nextTree);
    }
  }, [historyManager, manager, setPageTree]);

  return {
    undo,
    redo,
    canUndo: historyManager.canUndo(),
    canRedo: historyManager.canRedo(),
  };
}
