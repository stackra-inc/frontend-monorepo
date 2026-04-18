/**
 * @fileoverview Undoable queue interfaces.
 *
 * Types for the undoable mutation queue that powers
 * `mutationMode: "undoable"` in data hooks.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Action types for the undoable queue reducer.
 */
export enum UndoableActionType {
  /** Add a new undoable mutation to the queue. */
  ADD = 'ADD',
  /** Remove a completed/cancelled mutation from the queue. */
  REMOVE = 'REMOVE',
  /** Tick down the countdown timer for a queued mutation. */
  DECREASE_SECOND = 'DECREASE_SECOND',
}

/**
 * A single entry in the undoable mutation queue.
 */
export interface IUndoableQueue {
  /** Unique identifier for the mutated record. */
  id: string | number;
  /** Resource name the mutation targets. */
  resource: string;
  /** Callback to cancel (undo) the mutation. */
  cancelMutation: () => void;
  /** Callback to execute the mutation after the countdown. */
  doMutation: () => void;
  /** Remaining time in milliseconds before auto-execution. */
  seconds: number;
  /** Whether the countdown is actively running. */
  isRunning: boolean;
  /** If true, no progress notification is shown (caller handles UI). */
  isSilent: boolean;
}

/**
 * Reducer action for the undoable queue.
 */
export type UndoableAction =
  | { type: UndoableActionType.ADD; payload: Omit<IUndoableQueue, 'isRunning'> }
  | { type: UndoableActionType.REMOVE; payload: { id: string | number; resource: string } }
  | {
      type: UndoableActionType.DECREASE_SECOND;
      payload: { id: string | number; resource: string; seconds: number };
    };
