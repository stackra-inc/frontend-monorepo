/**
 * Theme Registry
 *
 * |--------------------------------------------------------------------------
 * | Registry for named themes.
 * |--------------------------------------------------------------------------
 * |
 * | Modules register themes here via ThemeModule.forRoot() or
 * | ThemeModule.registerTheme(). The ThemeProvider and ThemeSwitcher
 * | consume them.
 * |
 * | Extends BaseRegistry from @stackra/ts-support for consistent
 * | registry API (get, has, getAll, getKeys, register, clear).
 * |
 * @module @stackra/react-theming
 * @category Registries
 */

import { Injectable } from '@stackra/ts-container';
import { BaseRegistry } from '@stackra/ts-support';
import type { ThemeConfig } from '@/interfaces/theme-config.interface';

@Injectable()
export class ThemeRegistry extends BaseRegistry<ThemeConfig> {
  /*
  |--------------------------------------------------------------------------
  | getThemes
  |--------------------------------------------------------------------------
  |
  | Returns all registered themes in registration order.
  |
  */
  getThemes(): ThemeConfig[] {
    return this.getAll();
  }

  /*
  |--------------------------------------------------------------------------
  | getThemeIds
  |--------------------------------------------------------------------------
  |
  | Returns theme ids — used by next-themes `themes` prop.
  |
  */
  getThemeIds(): string[] {
    return this.getKeys();
  }
}

/** Global singleton ThemeRegistry — shared across forRoot and forFeature. */
export const themeRegistry = new ThemeRegistry();
