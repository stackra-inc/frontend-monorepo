/**
 * @fileoverview Props for the Kbd.Abbr component
 *
 * Used to display keyboard key abbreviations with proper accessibility.
 *
 * @module types/KbdAbbrProps
 */

import type { KeyValue } from '@/types';

/**
 * Props for the Kbd.Abbr component.
 * Used to display keyboard key abbreviations with proper accessibility.
 *
 * @category Props
 * @public
 */
export interface KbdAbbrProps {
  /**
   * The key value to display as an abbreviation.
   * This will automatically render the appropriate symbol.
   *
   * @example
   * ```tsx
   * <Kbd.Abbr keyValue="command" /> // Renders ⌘
   * <Kbd.Abbr keyValue="shift" />   // Renders ⇧
   * ```
   */
  keyValue?: KeyValue;

  /**
   * Title attribute for accessibility.
   * Provides the full name of the key for screen readers.
   */
  title?: string;

  /**
   * Custom content to display instead of the default symbol.
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes to apply.
   */
  className?: string;
}
