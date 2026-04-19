/**
 * @fileoverview ThemeConfig interface — a registered theme entry.
 * @module @stackra-inc/react-theming
 * @category Interfaces
 */

import type { ThemeVars } from './theme-vars.interface';

/** A registered theme entry. */
export interface ThemeConfig {
  /** Unique theme identifier */
  id: string;
  /** Display label shown in the theme switcher */
  label: string;
  /** Preview hex color shown as a swatch */
  color?: string;
  /**
   * Light mode CSS variable overrides.
   * For built-in themes prefer CSS [data-theme] selectors in globals.css.
   * For runtime/programmatic themes use these fields.
   */
  light?: ThemeVars;
  /** Dark mode CSS variable overrides. */
  dark?: ThemeVars;
}
