/**
 * @fileoverview Shortcut priority type
 *
 * Higher priority shortcuts override lower priority ones.
 *
 * @module interfaces/ShortcutPriority
 */

/**
 * Shortcut priority
 * Higher priority shortcuts override lower priority ones
 */
export type ShortcutPriority = 'low' | 'normal' | 'high' | 'critical';
