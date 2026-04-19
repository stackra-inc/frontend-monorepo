/**
 * @fileoverview ThemeVars interface — full set of HeroUI CSS variable overrides for one mode.
 * @module @stackra-inc/react-theming
 * @category Interfaces
 */

/**
 * Full set of HeroUI CSS variable overrides for one mode.
 * Values are raw oklch strings e.g. "58.14% 0.2349 27.99"
 * OR plain CSS values for non-color vars like radius.
 *
 * NOTE: For built-in themes, define vars in globals.css using
 * [data-theme="id"] selectors. This type is for programmatic/runtime themes.
 */
export interface ThemeVars {
  accent?: string;
  accentForeground?: string;
  background?: string;
  foreground?: string;
  surface?: string;
  surfaceForeground?: string;
  surfaceSecondary?: string;
  surfaceSecondaryForeground?: string;
  surfaceTertiary?: string;
  surfaceTertiaryForeground?: string;
  overlay?: string;
  overlayForeground?: string;
  muted?: string;
  border?: string;
  separator?: string;
  scrollbar?: string;
  focus?: string;
  default?: string;
  defaultForeground?: string;
  fieldBackground?: string;
  fieldForeground?: string;
  fieldPlaceholder?: string;
  segment?: string;
  segmentForeground?: string;
  success?: string;
  successForeground?: string;
  warning?: string;
  warningForeground?: string;
  danger?: string;
  dangerForeground?: string;
  /** Plain CSS value e.g. "0.5rem" */
  radius?: string;
  /** Plain CSS value e.g. "0.75rem" */
  fieldRadius?: string;
}
