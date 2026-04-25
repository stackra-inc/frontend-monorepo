/**
 * @fileoverview Props for the Kbd.Content component
 *
 * Used to display the main content of a keyboard key.
 *
 * @module types/KbdContentProps
 */

/**
 * Props for the Kbd.Content component.
 * Used to display the main content of a keyboard key.
 *
 * @category Props
 * @public
 */
export interface KbdContentProps {
  /**
   * The text content to display inside the key.
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes to apply.
   */
  className?: string;
}
