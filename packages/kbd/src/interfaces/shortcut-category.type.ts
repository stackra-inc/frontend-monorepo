/**
 * @fileoverview Keyboard shortcut category type
 *
 * Used to group related shortcuts together.
 *
 * @module interfaces/ShortcutCategory
 */

/**
 * Keyboard shortcut category
 * Used to group related shortcuts together
 */
export type ShortcutCategory =
  | 'navigation'
  | 'editing'
  | 'search'
  | 'view'
  | 'file'
  | 'help'
  | 'custom';
