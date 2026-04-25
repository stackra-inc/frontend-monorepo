/**
 * @fileoverview Props for the RefineKbd component
 *
 * Main component for displaying keyboard shortcuts in a refine application.
 *
 * @module types/RefineKbdProps
 */

import type { KeyValue } from '@/types';
import type { KbdVariant } from '@/types';

/**
 * Props for the RefineKbd component.
 * This is the main component for displaying keyboard shortcuts in a refine application.
 *
 * @category Props
 * @public
 */
export interface RefineKbdProps {
  /**
   * Array of keyboard keys to display.
   * Can include modifier keys, navigation keys, and regular keys.
   *
   * @example
   * ```tsx
   * <RefineKbd keys={["command", "K"]} />
   * <RefineKbd keys={["ctrl", "shift", "P"]} />
   * ```
   */
  keys: (KeyValue | string)[];

  /**
   * Visual variant of the keyboard key display.
   *
   * @defaultValue "default"
   */
  variant?: KbdVariant;

  /**
   * Custom separator to display between keys.
   *
   * @defaultValue "+"
   */
  separator?: React.ReactNode;

  /**
   * Additional CSS classes to apply to the container.
   */
  className?: string;
}
