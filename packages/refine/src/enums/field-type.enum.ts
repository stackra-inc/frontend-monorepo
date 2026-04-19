/**
 * @fileoverview Field type enum for SDUI and resource field definitions.
 *
 * Defines the supported field types used in {@link FieldDefinition}
 * objects for Server-Driven UI and resource schema configuration.
 *
 * @module @stackra-inc/react-refine
 * @category Enums
 */

/**
 * Enumeration of supported field types for resource fields.
 *
 * Used by SDUI page definitions and resource configurations
 * to describe the data type and rendering behavior of each field.
 */
export enum FieldType {
  /** Plain text input */
  Text = 'text',

  /** Numeric input */
  Number = 'number',

  /** Boolean toggle */
  Boolean = 'boolean',

  /** Date picker (date only) */
  Date = 'date',

  /** Date and time picker */
  Datetime = 'datetime',

  /** Dropdown select */
  Select = 'select',

  /** Relation to another resource */
  Relation = 'relation',

  /** Rich text / WYSIWYG editor */
  Richtext = 'richtext',

  /** File upload */
  File = 'file',

  /** Raw JSON editor */
  Json = 'json',

  /** Toggle switch */
  Toggle = 'toggle',

  /** Multi-line text area */
  Textarea = 'textarea',

  /** Repeatable nested fields */
  Repeater = 'repeater',
}
