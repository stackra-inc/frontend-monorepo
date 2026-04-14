/**
 * @fileoverview Keyboard shortcut visibility context
 *
 * Controls whether shortcut hints (⌘K, ⌘N, etc.) are visible
 * throughout the application. The provider wraps the app, and
 * the `<ShortcutHint>` component reads from this context to
 * conditionally render.
 *
 * @module contexts/kbd-visibility
 */

import { createContext } from 'react';

/**
 * Context value for keyboard shortcut visibility.
 */
export interface KbdVisibilityContextValue {
  /** Whether shortcut hints are currently visible */
  visible: boolean;
  /** Toggle visibility on/off */
  toggle: () => void;
  /** Explicitly set visibility */
  setVisible: (visible: boolean) => void;
}

/**
 * React context for shortcut hint visibility.
 * Default: visible = true (hints shown by default).
 */
export const KbdVisibilityContext = createContext<KbdVisibilityContextValue>({
  visible: true,
  toggle: () => {},
  setVisible: () => {},
});
