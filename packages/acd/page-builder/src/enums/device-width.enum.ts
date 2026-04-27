/**
 * @fileoverview DeviceWidth enum — viewport width presets for the
 * preview mode device selector.
 *
 * Values represent CSS pixel widths for common device categories.
 * Used by the Toolbar's device-width selector and the PreviewRenderer
 * to constrain the preview viewport.
 *
 * @module @stackra/react-page-builder
 * @category Enums
 */

/**
 * Viewport width presets for preview mode (in CSS pixels).
 */
export enum DeviceWidth {
  /** Desktop viewport width */
  DESKTOP = 1280,

  /** Tablet viewport width */
  TABLET = 768,

  /** Mobile viewport width */
  MOBILE = 375,
}
