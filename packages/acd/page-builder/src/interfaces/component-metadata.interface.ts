/**
 * @fileoverview ComponentMetadata interface — the descriptor object for a
 * registered page builder component.
 *
 * Each entry in the ComponentRegistry stores a ComponentMetadata keyed by
 * its `type` string. The Palette reads these to display available components,
 * the Canvas uses them to create new ComponentNodes, and the PropertyEditor
 * reads the `propertySchema` to render dynamic forms.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

import type { PropertySchemaField } from "./property-schema-field.interface";

/**
 * Metadata descriptor for a registered page builder component.
 *
 * Stored in the ComponentRegistry and used throughout the page builder
 * to drive palette display, node creation, property editing, and
 * drag-and-drop validation.
 */
export interface ComponentMetadata {
  /** Unique type identifier, e.g. "heading", "row", "custom-chart" */
  type: string;

  /** Human-readable name shown in the Palette */
  displayName: string;

  /** Icon identifier (HeroUI icon name or URL) */
  icon: string;

  /** Category for grouping in the Palette, e.g. "Layout", "Content" */
  category: string;

  /** Default prop values applied when a new instance is created */
  defaultProps: Record<string, unknown>;

  /**
   * Declarative schema describing editable properties.
   * The PropertyEditor maps each field to a HeroUI v3 form control.
   */
  propertySchema: PropertySchemaField[];

  /**
   * Component types allowed as children.
   * - Empty array `[]` means no children allowed (leaf component).
   * - `["*"]` means any registered component type is allowed.
   * - Specific types like `["column"]` restrict to those types only.
   */
  allowedChildren: string[];

  /**
   * Maximum number of children this component can hold.
   * - `-1` means unlimited children.
   * - `0` means no children (leaf component).
   * - Any positive number caps the child count.
   */
  maxChildren: number;
}
