/**
 * @fileoverview Property-based tests for HistoryManager.
 *
 * Validates the three correctness properties from the design document:
 * - Property 11: Undo/redo round-trip
 * - Property 12: New operation after undo clears redo stack
 * - Property 13: History stack depth limit
 *
 * Uses fast-check for property-based testing with arbitrary
 * PageTree generators.
 *
 * @module @stackra/react-page-builder
 * @category Tests
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { HistoryManager } from "@/services/history-manager.service";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { ComponentNode } from "@/interfaces/component-node.interface";
import type { PageBuilderConfig } from "@/interfaces/page-builder-config.interface";

// ─── Generators ──────────────────────────────────────────────────────────────

/**
 * Generates a valid ComponentNode with a random ID, type, and no children.
 */
function arbitraryComponentNode(): fc.Arbitrary<ComponentNode> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constantFrom("container", "heading", "text", "row", "column"),
    props: fc.constant({} as Record<string, unknown>),
    styles: fc.constant({} as Record<string, unknown>),
    children: fc.constant([] as ComponentNode[]),
  });
}

/**
 * Generates a valid PageTree with a root node.
 */
function arbitraryPageTree(): fc.Arbitrary<PageTree> {
  return arbitraryComponentNode().map((node) => ({ root: node }));
}

/**
 * Creates a HistoryManager with the given max depth.
 */
function createHistoryManager(maxDepth: number): HistoryManager {
  const config: PageBuilderConfig = {
    apiBaseUrl: "/api",
    maxHistoryDepth: maxDepth,
  };
  return new HistoryManager(config);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("HistoryManager — Property-Based Tests", () => {
  /*
  |--------------------------------------------------------------------------
  | Property 11: Undo/redo round-trip
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 11: Undo/redo round-trip
  |
  | For any sequence of page tree mutations, undoing the last operation
  | restores the tree to its state before that operation, and immediately
  | redoing restores the tree to the state after the operation. The tree
  | state after undo-then-redo is structurally equivalent to the tree
  | state before the undo.
  |
  | **Validates: Requirements 7.2, 7.3**
  |
  */

  it("Property 11: undo restores previous state, redo restores post-operation state", () => {
    fc.assert(
      fc.property(arbitraryPageTree(), arbitraryPageTree(), (tree1, tree2) => {
        const history = createHistoryManager(50);

        // Push two snapshots (simulating two states)
        history.pushSnapshot(tree1);
        history.pushSnapshot(tree2);

        // Undo should restore tree2 (the last pushed snapshot)
        const undone = history.undo();
        expect(undone).not.toBeNull();
        expect(undone!.root.id).toBe(tree2.root.id);
        expect(undone!.root.type).toBe(tree2.root.type);

        // Redo should restore tree2 back
        const redone = history.redo();
        expect(redone).not.toBeNull();
        expect(redone!.root.id).toBe(tree2.root.id);
        expect(redone!.root.type).toBe(tree2.root.type);
      }),
      { numRuns: 100 },
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Property 12: New operation after undo clears redo stack
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 12: New operation after undo clears redo stack
  |
  | For any HistoryManager state where at least one undo has been performed
  | (making the redo stack non-empty), performing a new push operation
  | clears the redo stack entirely, making canRedo() return false.
  |
  | **Validates: Requirements 7.4**
  |
  */

  it("Property 12: push after undo makes canRedo() return false", () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPageTree(), { minLength: 2, maxLength: 10 }),
        arbitraryPageTree(),
        (trees, newTree) => {
          const history = createHistoryManager(50);

          // Push all trees
          for (const tree of trees) {
            history.pushSnapshot(tree);
          }

          // Undo at least once — redo stack should be non-empty
          history.undo();
          expect(history.canRedo()).toBe(true);

          // Push a new snapshot — redo stack should be cleared
          history.pushSnapshot(newTree);
          expect(history.canRedo()).toBe(false);
          expect(history.getRedoStackSize()).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Property 13: History stack depth limit
  |--------------------------------------------------------------------------
  |
  | Feature: react-page-builder, Property 13: History stack depth limit
  |
  | For any configured maximum depth N and for any sequence of M push
  | operations where M > N, the undo stack size never exceeds N. The
  | oldest snapshots are discarded first.
  |
  | **Validates: Requirements 7.7**
  |
  */

  it("Property 13: undo stack never exceeds configured max depth N", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.array(arbitraryPageTree(), { minLength: 1, maxLength: 50 }),
        (maxDepth, trees) => {
          const history = createHistoryManager(maxDepth);

          for (const tree of trees) {
            history.pushSnapshot(tree);

            // After every push, the undo stack size must not exceed maxDepth
            expect(history.getUndoStackSize()).toBeLessThanOrEqual(maxDepth);
          }

          // Final check: stack size is min(trees.length, maxDepth)
          expect(history.getUndoStackSize()).toBe(Math.min(trees.length, maxDepth));
        },
      ),
      { numRuns: 100 },
    );
  });
});
