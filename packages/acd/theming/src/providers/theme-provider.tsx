'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeContext } from '@/contexts/theme.context';
import type { ThemeContextValue } from '@/contexts/theme.context';
import { ThemeRegistry } from '@/registries/theme.registry';
import { THEME_REGISTRY } from '@/constants/tokens.constant';
import type { ColorMode } from '@/types/theme.types';
import type { DesignTokens } from '@/interfaces/design-tokens.interface';
import type { ServerTokenState } from '@/interfaces/server-token-state.interface';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  defaultMode?: ColorMode;
  /** localStorage key for the color palette. @default "theme-color" */
  storageKey?: string;
}

/**
 * Set data-theme on <html>.
 * CSS in globals.css handles all variable overrides via [data-theme="id"] selectors.
 * For simple themes (no CSS defined), we fall back to setting --accent/--focus inline.
 */
function applyThemeToDom(themeId: string, registry: ThemeRegistry) {
  const html = document.documentElement;
  const theme = registry.get(themeId);

  // Set the data-theme attribute — CSS selectors pick this up
  html.setAttribute('data-theme', themeId);

  // For themes that only have a color (no CSS defined), apply accent inline as fallback
  // Skip the "default" theme — let HeroUI's built-in accent colors apply
  if (theme && !theme.light && !theme.dark && theme.color && themeId !== 'default') {
    html.style.setProperty('--accent', theme.color);
    html.style.setProperty('--focus', theme.color);
  } else {
    // Remove any inline overrides so CSS/HeroUI takes full control
    html.style.removeProperty('--accent');
    html.style.removeProperty('--focus');
  }
}

function ThemeContextBridge({
  children,
  defaultTheme,
  storageKey,
}: {
  children: React.ReactNode;
  defaultTheme: string;
  storageKey: string;
}) {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();

  // Get registry from DI container — no module-level global
  let registry: ThemeRegistry;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useInject } = require('@stackra/ts-container');
    registry = useInject(THEME_REGISTRY) as ThemeRegistry;
  } catch {
    // Fallback: create a temporary registry if DI is not available
    // (e.g., in tests or standalone usage without the full DI container)
    registry = new ThemeRegistry();
  }

  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) ?? defaultTheme;
    }
    return defaultTheme;
  });

  // Read live from registry so runtime registrations are reflected
  const themes = registry.getThemes();

  const resolvedMode = (resolvedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  const mode = (
    nextTheme === 'dark' || nextTheme === 'light' || nextTheme === 'system' ? nextTheme : 'system'
  ) as ColorMode;

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDom(themeId, registry);
  }, [themeId, registry]);

  const setTheme = useCallback(
    (id: string) => {
      setThemeId(id);
      localStorage.setItem(storageKey, id);
      applyThemeToDom(id, registry); // immediate — don't wait for effect
    },
    [storageKey, registry]
  );

  const setMode = useCallback(
    (m: ColorMode) => {
      setNextTheme(m);
    },
    [setNextTheme]
  );

  const [serverTokenState, setServerTokenState] = useState<ServerTokenState>({
    tokens: null,
    loaded: false,
    connected: false,
  });

  const setServerTokens = useCallback((tokens: DesignTokens) => {
    setServerTokenState((prev) => ({
      ...prev,
      tokens,
      loaded: true,
    }));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themeId,
      setTheme,
      mode,
      setMode,
      resolvedMode,
      themes,
      serverTokens: serverTokenState,
      setServerTokens,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      themeId,
      setTheme,
      mode,
      setMode,
      resolvedMode,
      themes.length,
      serverTokenState,
      setServerTokens,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  defaultMode = 'system',
  storageKey = 'theme-color',
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultMode}
      storageKey="app-color-mode"
      enableSystem={defaultMode === 'system'}
      disableTransitionOnChange
    >
      <ThemeContextBridge defaultTheme={defaultTheme} storageKey={storageKey}>
        {children}
      </ThemeContextBridge>
    </NextThemesProvider>
  );
}
