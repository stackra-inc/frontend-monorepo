/**
 * @fileoverview Unit tests for HistoryManager.
 *
 * Tests empty stack edge cases and canUndo/canRedo state transitions.
 *
 * @module @stackra/react-page-builder
 * @category Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HistoryManager } from "@/services/history-manager.service";
import type { PageTree } from "@/interfaces/page-tree.interface";
import type { PageBuilderConfig } from "@/interfaces/page-builder-config.interface";

/** Helper to create a simple PageTree for testing. */
function makeTree(id: string, type = "container"): PageTree {
  return {
    root: {
      id,
      type,
      props: {},
      styles: {},
      children: [],
    },
  };
}

describe("HistoryManager — Unit Tests", () => {
  let history: HistoryManager;

  beforeEach(() => {
    const config: PageBuilderConfig = {
      apiBaseUrl: "/api",
      maxHistoryDepth: 50,
    };
    history = new HistoryManager(config);
  });

  /*
  |--------------------------------------------------------------------------
  | Empty stack edge cases (Req 7.5, 7.6)
  |--------------------------------------------------------------------------
  */

  it("undo returns null when undo stack is empty", () => {
    expect(history.undo()).toBeNull();
  });

  it("redo returns null when redo stack is empty", () => {
    expect(history.redo()).toBeNull();
  });

  it("canUndo returns false on fresh instance", () => {
    expect(history.canUndo()).toBe(false);
  });

  it("canRedo returns false on fresh instance", () => {
    expect(history.canRedo()).toBe(false);
  });

  it("getUndoStackSize returns 0 on fresh instance", () => {
    expect(history.getUndoStackSize()).toBe(0);
  });

  it("getRedoStackSize returns 0 on fresh instance", () => {
    expect(history.getRedoStackSize()).toBe(0);
  });

  /*
  |--------------------------------------------------------------------------
  | canUndo / canRedo state transitions
  |--------------------------------------------------------------------------
  */

  it("canUndo returns true after pushSnapshot", () => {
    history.pushSnapshot(makeTree("1"));
    expect(history.canUndo()).toBe(true);
  });

  it("canRedo returns true after undo", () => {
    history.pushSnapshot(makeTree("1"));
    history.undo();
    expect(history.canRedo()).toBe(true);
  });

  it("canUndo returns false after undoing all snapshots", () => {
    history.pushSnapshot(makeTree("1"));
    history.undo();
    expect(history.canUndo()).toBe(false);
  });

  it("canRedo returns false after redoing all snapshots", () => {
    history.pushSnapshot(makeTree("1"));
    history.undo();
    history.redo();
    expect(history.canRedo()).toBe(false);
  });

  /*
  |--------------------------------------------------------------------------
  | Snapshot immutability
  |--------------------------------------------------------------------------
  */

  it("undo returns a deep clone, not the original reference", () => {
    const tree = makeTree("1");
    history.pushSnapshot(tree);

    const undone = history.undo();
    expect(undone).not.toBe(tree);
    expect(undone!.root.id).toBe(tree.root.id);
  });

  it("modifying the original tree does not affect the snapshot", () => {
    const tree = makeTree("1");
    history.pushSnapshot(tree);

    // Mutate the original
    tree.root.id = "mutated";

    const undone = history.undo();
    expect(undone!.root.id).toBe("1");
  });

  /*
  |--------------------------------------------------------------------------
  | clear()
  |--------------------------------------------------------------------------
  */

  it("clear empties both stacks", () => {
    history.pushSnapshot(makeTree("1"));
    history.pushSnapshot(makeTree("2"));
    history.undo();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);

    history.clear();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
    expect(history.getUndoStackSize()).toBe(0);
    expect(history.getRedoStackSize()).toBe(0);
  });

  /*
  |--------------------------------------------------------------------------
  | Stack depth enforcement
  |--------------------------------------------------------------------------
  */

  it("enforces maxHistoryDepth by discarding oldest snapshots", () => {
    const config: PageBuilderConfig = {
      apiBaseUrl: "/api",
      maxHistoryDepth: 3,
    };
    const smallHistory = new HistoryManager(config);

    smallHistory.pushSnapshot(makeTree("1"));
    smallHistory.pushSnapshot(makeTree("2"));
    smallHistory.pushSnapshot(makeTree("3"));
    smallHistory.pushSnapshot(makeTree("4"));

    expect(smallHistory.getUndoStackSize()).toBe(3);

    // The oldest snapshot ("1") should have been discarded
    // Undoing 3 times should give us "4", "3", "2" (not "1")
    const snap3 = smallHistory.undo();
    expect(snap3!.root.id).toBe("4");

    const snap2 = smallHistory.undo();
    expect(snap2!.root.id).toBe("3");

    const snap1 = smallHistory.undo();
    expect(snap1!.root.id).toBe("2");

    // No more to undo
    expect(smallHistory.undo()).toBeNull();
  });

  /*
  |--------------------------------------------------------------------------
  | Default maxHistoryDepth
  |--------------------------------------------------------------------------
  */

  it("uses default maxHistoryDepth of 50 when not specified", () => {
    const config: PageBuilderConfig = { apiBaseUrl: "/api" };
    const defaultHistory = new HistoryManager(config);

    for (let i = 0; i < 60; i++) {
      defaultHistory.pushSnapshot(makeTree(`node-${i}`));
    }

    expect(defaultHistory.getUndoStackSize()).toBe(50);
  });
});
