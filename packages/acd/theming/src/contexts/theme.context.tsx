/**
 * @fileoverview ThemeContext
 *
 * Provides current theme id, color mode, and server-driven design tokens
 * to the component tree. This is the shared context consumed by both
 * `WebThemeProvider` (web) and `NativeThemeProvider` (mobile). The actual
 * application of tokens to DOM or Uniwind happens in the platform-specific
 * providers, not here.
 *
 * @module @stackra/react-theming
 * @category Contexts
 */

'use client';

import { createContext, useContext } from 'react';
import type { ColorMode } from '@/types/theme.types';
import type { ThemeConfig } from '@/interfaces/theme-config.interface';
import type { ServerTokenState } from '@/interfaces/server-token-state.interface';
import type { DesignTokens } from '@/interfaces/design-tokens.interface';

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
  /** Server-driven token state from SettingsSyncService */
  serverTokens: ServerTokenState;
  /** Update server-driven tokens (called when SettingsSyncService receives new tokens) */
  setServerTokens: (tokens: DesignTokens) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside <ThemeProvider>');
  return ctx;
}
