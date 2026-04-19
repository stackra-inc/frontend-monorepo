/**
 * @fileoverview useTheme Hook
 *
 * Access and control the active named theme.
 *
 * @module @stackra/react-theming
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { theme, setTheme, themes } = useTheme();
 * ```
 */

'use client';

import { useThemeContext } from '@/contexts/theme.context';
import type { UseThemeReturn } from '@/interfaces/use-theme-return.interface';

export type { UseThemeReturn } from '@/interfaces/use-theme-return.interface';

export function useTheme(): UseThemeReturn {
  const { theme, setTheme, themes } = useThemeContext();
  return { theme, setTheme, themes };
}
