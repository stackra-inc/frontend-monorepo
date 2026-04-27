/**
 * @fileoverview HistoryManager — manages undo/redo stacks of immutable
 * PageTree snapshots.
 *
 * Each mutation to the page tree should be preceded by a `pushSnapshot()`
 * call that stores a deep-frozen copy of the current state. The manager
 * uses `structuredClone()` to create independent copies, preventing
 * accidental in-place edits from corrupting the history.
 *
 * Key behaviors:
 * - New push after undo clears the redo stack entirely
 * - Stack is capped at `config.maxHistoryDepth` (default 50)
 * - Oldest snapshots are discarded first when the cap is exceeded
 * - Undo/redo on empty stacks return `null` without side effects
 *
 * @module @stackra/react-page-builder
 * @category Services
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { PAGE_BUILDER_CONFIG } from "@/constants/tokens.constant";
import type { PageBuilderConfig } from "@/interfaces/page-builder-config.interface";
import type { PageTree } from "@/interfaces/page-tree.interface";

/** Default maximum undo stack depth when not specified in config. */
const DEFAULT_MAX_HISTORY_DEPTH = 50;

/**
 * Manages undo/redo history for the page builder.
 *
 * Stores immutable snapshots of the {@link PageTree} in two stacks:
 * - **undoStack** — previous states (push on mutation, pop on undo)
 * - **redoStack** — future states (push on undo, pop on redo, clear on new push)
 *
 * All snapshots are deep-cloned via `structuredClone()` to ensure
 * immutability. The undo stack is capped at a configurable maximum
 * depth to prevent unbounded memory growth.
 *
 * @example
 * ```typescript
 * const history = new HistoryManager({ apiBaseUrl: "/api", maxHistoryDepth: 30 });
 *
 * history.pushSnapshot(currentTree);
 * // ... user makes changes ...
 * const previous = history.undo(); // restores previous state
 * const restored = history.redo(); // restores post-change state
 * ```
 */
@Injectable()
export class HistoryManager {
  /** Stack of previous PageTree states (most recent at the end). */
  private readonly undoStack: PageTree[] = [];

  /** Stack of future PageTree states (most recent at the end). */
  private readonly redoStack: PageTree[] = [];

  /** Maximum number of snapshots to retain in the undo stack. */
  private readonly maxDepth: number;

  /**
   * Create a new HistoryManager.
   *
   * @param config - Page builder configuration providing `maxHistoryDepth`
   */
  constructor(@Inject(PAGE_BUILDER_CONFIG) private readonly config: PageBuilderConfig) {
    this.maxDepth = config.maxHistoryDepth ?? DEFAULT_MAX_HISTORY_DEPTH;
  }

  /*
  |--------------------------------------------------------------------------
  | pushSnapshot
  |--------------------------------------------------------------------------
  |
  | Stores a deep-frozen copy of the current page tree on the undo stack.
  | Clears the redo stack (any "future" states are discarded when a new
  | mutation occurs). Enforces the maximum stack depth by discarding the
  | oldest snapshot when the cap is exceeded.
  |
  */

  /**
   * Push a snapshot of the current page tree onto the undo stack.
   *
   * - Deep-clones the tree via `structuredClone()` to ensure immutability
   * - Clears the redo stack (new mutation invalidates redo history)
   * - Discards the oldest snapshot if the stack exceeds `maxHistoryDepth`
   *
   * @param tree - The current page tree state to snapshot
   */
  public pushSnapshot(tree: PageTree): void {
    // Deep-clone to prevent external mutations from affecting the snapshot
    const snapshot = structuredClone(tree);

    // New mutation invalidates any redo history
    this.redoStack.length = 0;

    // Push the snapshot onto the undo stack
    this.undoStack.push(snapshot);

    // Enforce maximum depth — discard oldest snapshots
    while (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | undo
  |--------------------------------------------------------------------------
  |
  | Pops the most recent snapshot from the undo stack and pushes it onto
  | the redo stack. Returns the restored PageTree, or null if the undo
  | stack is empty.
  |
  */

  /**
   * Undo the last operation by restoring the previous page tree state.
   *
   * Pops from the undo stack and pushes onto the redo stack.
   *
   * @returns The previous {@link PageTree} state, or `null` if nothing to undo
   */
  public undo(): PageTree | null {
    const snapshot = this.undoStack.pop();

    if (!snapshot) {
      return null;
    }

    // Push the undone snapshot onto the redo stack
    this.redoStack.push(snapshot);

    return structuredClone(snapshot);
  }

  /*
  |--------------------------------------------------------------------------
  | redo
  |--------------------------------------------------------------------------
  |
  | Pops the most recent snapshot from the redo stack and pushes it back
  | onto the undo stack. Returns the restored PageTree, or null if the
  | redo stack is empty.
  |
  */

  /**
   * Redo the last undone operation by restoring the next page tree state.
   *
   * Pops from the redo stack and pushes onto the undo stack.
   *
   * @returns The next {@link PageTree} state, or `null` if nothing to redo
   */
  public redo(): PageTree | null {
    const snapshot = this.redoStack.pop();

    if (!snapshot) {
      return null;
    }

    // Push the redone snapshot back onto the undo stack
    this.undoStack.push(snapshot);

    return structuredClone(snapshot);
  }

  /*
  |--------------------------------------------------------------------------
  | canUndo / canRedo
  |--------------------------------------------------------------------------
  */

  /**
   * Check whether an undo operation is available.
   *
   * @returns `true` if the undo stack is non-empty
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check whether a redo operation is available.
   *
   * @returns `true` if the redo stack is non-empty
   */
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /*
  |--------------------------------------------------------------------------
  | clear
  |--------------------------------------------------------------------------
  */

  /**
   * Clear both undo and redo stacks.
   *
   * Typically called when loading a new page or resetting the editor state.
   */
  public clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }

  /*
  |--------------------------------------------------------------------------
  | getUndoStackSize / getRedoStackSize
  |--------------------------------------------------------------------------
  */

  /**
   * Get the current number of snapshots in the undo stack.
   *
   * @returns The undo stack size
   */
  public getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Get the current number of snapshots in the redo stack.
   *
   * @returns The redo stack size
   */
  public getRedoStackSize(): number {
    return this.redoStack.length;
  }
}
