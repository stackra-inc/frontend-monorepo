/**
 * @fileoverview PropertySchemaField interface — describes a single editable
 * property field in a component's property schema.
 *
 * Each field maps to a specific form control in the PropertyEditor:
 * text → Input, number → NumberInput, color → color picker,
 * select → Select dropdown, boolean → Switch, textarea → Textarea.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

import type { FieldType } from "../enums/field-type.enum";

/**
 * Validation constraints for a property schema field.
 * Applied by the PropertyEditor to prevent invalid values
 * from being written to the Page_Tree.
 */
export interface PropertySchemaFieldValidation {
  /** Whether the field is required (cannot be empty/undefined) */
  required?: boolean;
  /** Minimum numeric value (for number fields) */
  min?: number;
  /** Maximum numeric value (for number fields) */
  max?: number;
  /** Minimum string length (for text/textarea fields) */
  minLength?: number;
  /** Maximum string length (for text/textarea fields) */
  maxLength?: number;
  /** Regex pattern the value must match (for text fields) */
  pattern?: string;
}

/**
 * A single option entry for select-type fields.
 */
export interface PropertySchemaFieldOption {
  /** Human-readable label displayed in the dropdown */
  label: string;
  /** Machine-readable value stored in the component props */
  value: string;
}

/**
 * Describes a single editable property in a component's property schema.
 *
 * The PropertyEditor reads this descriptor to render the appropriate
 * form control, apply validation, and map user input back to the
 * component's props in the Page_Tree.
 */
export interface PropertySchemaField {
  /** Machine-readable key matching the prop name on the ComponentNode */
  key: string;
  /** Human-readable label displayed next to the form control */
  label: string;
  /** Field type determining which form control to render */
  type: FieldType;
  /** Default value applied when a new component instance is created */
  defaultValue?: unknown;
  /** Options for select-type fields */
  options?: PropertySchemaFieldOption[];
  /** Validation constraints for the field value */
  validation?: PropertySchemaFieldValidation;
}
