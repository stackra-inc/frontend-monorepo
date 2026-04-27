/**
 * @fileoverview FieldType enum — the supported property field types
 * that the PropertyEditor can render.
 *
 * Each value maps to a specific HeroUI v3 form control:
 * - TEXT → Input
 * - NUMBER → NumberInput
 * - COLOR → color picker
 * - SELECT → Select dropdown
 * - BOOLEAN → Switch toggle
 * - TEXTAREA → Textarea
 *
 * @module @stackra/react-page-builder
 * @category Enums
 */

/**
 * Supported property field types for the PropertyEditor.
 *
 * Determines which form control is rendered for each field
 * in a component's property schema.
 */
export enum FieldType {
  /** Single-line text input */
  TEXT = "text",

  /** Numeric input with optional min/max constraints */
  NUMBER = "number",

  /** Color picker control */
  COLOR = "color",

  /** Dropdown select with predefined options */
  SELECT = "select",

  /** Boolean toggle switch */
  BOOLEAN = "boolean",

  /** Multi-line text area */
  TEXTAREA = "textarea",
}
