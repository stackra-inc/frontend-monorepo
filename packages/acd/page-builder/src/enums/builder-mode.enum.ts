/**
 * @fileoverview BuilderMode enum — the two operating modes of the page builder.
 *
 * In EDIT mode the full editing interface is active (Canvas, Palette,
 * PropertyEditor, drag-and-drop). In PREVIEW mode the page is rendered
 * through the SDUI renderer exactly as end users would see it.
 *
 * @module @stackra/react-page-builder
 * @category Enums
 */

/**
 * Operating mode of the page builder.
 */
export enum BuilderMode {
  /** Interactive editing mode with drag-and-drop, selection, and property editing */
  EDIT = "edit",

  /** Read-only preview mode rendering through the SDUI renderer */
  PREVIEW = "preview",
}
