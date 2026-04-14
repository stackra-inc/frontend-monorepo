/**
 * @fileoverview Keyboard shortcut context type
 *
 * Defines where a shortcut is active.
 *
 * @module interfaces/ShortcutContext
 */

/**
 * Keyboard shortcut context
 * Defines where the shortcut is active
 */
export type ShortcutContext =
  | 'global' // Active everywhere
  | 'editor' // Active in editor/input contexts
  | 'list' // Active in list/table contexts
  | 'modal' // Active in modal/dialog contexts
  | 'form' // Active in form contexts
  | 'custom'; // Custom context
