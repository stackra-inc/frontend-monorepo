/**
 * @fileoverview Props for the base Kbd component from HeroUI
 *
 * @module types/KbdProps
 */

import type { KbdVariant } from '@/types';

/**
 * Props for the base Kbd component from HeroUI.
 *
 * @category Props
 * @public
 */
export interface KbdProps {
  /**
   * Content to display inside the keyboard key.
   */
  children?: React.ReactNode;

  /**
   * Visual variant of the keyboard key.
   *
   * @defaultValue "default"
   */
  variant?: KbdVariant;

  /**
   * Additional CSS classes to apply.
   */
  className?: string;
}
