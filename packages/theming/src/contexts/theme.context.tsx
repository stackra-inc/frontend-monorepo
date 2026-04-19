/**
 * @fileoverview ThemeContext
 *
 * Provides current theme id and color mode to the component tree.
 *
 * @module @stackra-inc/react-theming
 * @category Contexts
 */

'use client';

import { createContext, useContext } from 'react';
import type { ColorMode, ThemeConfig } from '@/types/theme.types';

export interface ThemeContextValue {
  /** Currently active theme id */
  theme: string;
  /** Set the active theme by id */
  setTheme: (id: string) => void;
  /** Current color mode */
  mode: ColorMode;
  /** Set the color mode */
  setMode: (mode: ColorMode) => void;
  /** Resolved mode — never "system", always "light" or "dark" */
  resolvedMode: 'light' | 'dark';
  /** All registered themes */
  themes: ThemeConfig[];
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside <ThemeProvider>');
  return ctx;
}
