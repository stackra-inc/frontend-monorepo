/**
 * @fileoverview UndoableQueue context, reducer, and provider.
 *
 * Manages the queue of undoable mutations. Each entry has a countdown
 * timer — when it reaches zero, the mutation executes. If the user
 * clicks "Undo" before that, `cancelMutation()` is called and the
 * entry is removed.
 *
 * The provider also renders an invisible `<UndoableQueueRunner />`
 * component for each active entry that drives the countdown and
 * fires progress notifications.
 *
 * @module @stackra-inc/react-refine
 * @category Contexts
 */

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import {
  UndoableActionType,
  type IUndoableQueue,
  type UndoableAction,
} from '@/interfaces/undoable-queue.interface';

// ─── Context ───────────────────────────────────────────────────────

interface IUndoableQueueContext {
  notifications: IUndoableQueue[];
  notificationDispatch: React.Dispatch<UndoableAction>;
}

const UndoableQueueContext = createContext<IUndoableQueueContext>({
  notifications: [],
  notificationDispatch: () => {},
});

// ─── Reducer ───────────────────────────────────────────────────────

function undoableQueueReducer(state: IUndoableQueue[], action: UndoableAction): IUndoableQueue[] {
  switch (action.type) {
    case UndoableActionType.ADD: {
      const filtered = state.filter(
        (n) => !(n.id === action.payload.id && n.resource === action.payload.resource)
      );
      return [...filtered, { ...action.payload, isRunning: true }];
    }

    case UndoableActionType.REMOVE:
      return state.filter(
        (n) => !(n.id === action.payload.id && n.resource === action.payload.resource)
      );

    case UndoableActionType.DECREASE_SECOND:
      return state.map((n) => {
        if (n.id === action.payload.id && n.resource === action.payload.resource) {
          return { ...n, seconds: action.payload.seconds - 1000 };
        }
        return n;
      });

    default:
      return state;
  }
}

// ─── Runner Component ──────────────────────────────────────────────

/**
 * Invisible component that drives the countdown for a single
 * undoable mutation entry. Fires progress notifications and
 * executes the mutation when the timer reaches zero.
 *
 * @internal
 */
function UndoableQueueRunner({ notification }: { notification: IUndoableQueue }) {
  const { notificationDispatch } = useContext(UndoableQueueContext);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    if (!notification.isRunning) return;

    if (notification.seconds <= 0) {
      notification.doMutation();
      return;
    }

    if (timeoutId) clearTimeout(timeoutId);

    const id = setTimeout(() => {
      notificationDispatch({
        type: UndoableActionType.DECREASE_SECOND,
        payload: {
          id: notification.id,
          resource: notification.resource,
          seconds: notification.seconds,
        },
      });
    }, 1000);

    setTimeoutId(id);

    return () => clearTimeout(id);
  }, [notification]);

  return null;
}

// ─── Provider ──────────────────────────────────────────────────────

/**
 * Provider for the undoable mutation queue.
 *
 * Wrap your app (or the Refine provider tree) with this to enable
 * `mutationMode: "undoable"` in data hooks.
 */
export function UndoableQueueProvider({ children }: { children: React.ReactNode }) {
  const [notifications, notificationDispatch] = useReducer(undoableQueueReducer, []);

  return (
    <UndoableQueueContext.Provider value={{ notifications, notificationDispatch }}>
      {children}
      {typeof window !== 'undefined' &&
        notifications.map((n) => (
          <UndoableQueueRunner key={`${n.id}-${n.resource}-queue`} notification={n} />
        ))}
    </UndoableQueueContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────

/**
 * Access the undoable queue context.
 *
 * Used internally by mutation hooks to enqueue undoable operations
 * and by the `UndoableQueueRunner` to drive countdowns.
 *
 * @returns The current notifications array and dispatch function.
 */
export function useCancelNotification(): IUndoableQueueContext {
  return useContext(UndoableQueueContext);
}
