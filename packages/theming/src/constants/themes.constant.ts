/**
 * Built-in Themes
 *
 * |--------------------------------------------------------------------------
 * | Default theme palette shipped with @stackra-inc/react-theming.
 * |--------------------------------------------------------------------------
 * |
 * | These are registered automatically by ThemeModule.forRoot()
 * | unless overridden by the user's config.
 * |
 * | Each theme defines an id, display label, and preview swatch color.
 * | CSS variable overrides are defined in globals.css using
 * | [data-theme="id"] selectors — not in these config objects.
 * |
 * @module @stackra-inc/react-theming
 */

import type { ThemeConfig } from '@/interfaces/theme-config.interface';

/** Default indigo theme. */
export const THEME_DEFAULT: ThemeConfig = {
  id: 'default',
  label: 'Default',
  color: '#6366f1',
};

/** Netflix-inspired red theme. */
export const THEME_NETFLIX: ThemeConfig = {
  id: 'netflix',
  label: 'Netflix',
  color: '#e50914',
};

/** Ocean blue theme. */
export const THEME_OCEAN: ThemeConfig = {
  id: 'ocean',
  label: 'Ocean',
  color: '#0ea5e9',
};

/** Rose pink theme. */
export const THEME_ROSE: ThemeConfig = {
  id: 'rose',
  label: 'Rose',
  color: '#f43f5e',
};

/** Forest green theme. */
export const THEME_FOREST: ThemeConfig = {
  id: 'forest',
  label: 'Forest',
  color: '#22c55e',
};

/** Amber/gold theme. */
export const THEME_AMBER: ThemeConfig = {
  id: 'amber',
  label: 'Amber',
  color: '#f59e0b',
};

/** Violet purple theme. */
export const THEME_VIOLET: ThemeConfig = {
  id: 'violet',
  label: 'Violet',
  color: '#8b5cf6',
};

/**
 * All built-in themes in display order.
 *
 * Used by ThemeModule.forRoot() to seed the ThemeRegistry.
 */
export const BUILT_IN_THEMES: ThemeConfig[] = [
  THEME_DEFAULT,
  THEME_NETFLIX,
  THEME_OCEAN,
  THEME_ROSE,
  THEME_FOREST,
  THEME_AMBER,
  THEME_VIOLET,
];
