/**
 * @fileoverview Return type interface for the useTheme hook.
 *
 * @module @stackra-inc/react-theming
 * @category Interfaces
 */

import type { ThemeConfig } from '@/interfaces/theme-config.interface';

/**
 * Return type for the {@link useTheme} hook.
 *
 * Provides access to the current theme, a setter, and the full theme list.
 */
export interface UseThemeReturn {
  /** Currently active theme id. */
  theme: string;
  /** Set the active theme by id. */
  setTheme: (id: string) => void;
  /** All registered themes. */
  themes: ThemeConfig[];
}
