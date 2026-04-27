/**
 * @fileoverview WebThemeProvider — applies server-driven design tokens to the DOM.
 *
 * Wraps children and consumes the shared `ThemeContext` from `@stackra/react-theming`.
 * On mount and whenever `serverTokens` change, this provider:
 *
 * 1. Merges server tokens with locally registered themes from `ThemeModule.forFeature()`,
 *    where server tokens take precedence over local configuration.
 * 2. Separates tokens into light and dark groups via `separateTokensByMode()`.
 * 3. Applies light tokens to `:root` (`document.documentElement`) via `style.setProperty()`.
 * 4. Applies dark tokens under a `<style>` tag with `.dark, [data-theme="dark"]` selector.
 *
 * OKLCH color values are applied directly — no conversion is needed because
 * HeroUI v3 natively supports OKLCH in its CSS variable system.
 *
 * Falls back to optional `fallbackTokens` (HeroUI v3 defaults) when the
 * Settings API is unreachable and `serverTokens.tokens` is `null`.
 *
 * Uses `useLayoutEffect` to ensure tokens are applied before the browser paints,
 * preventing a flash of unstyled content (FOUC) on initial load and theme changes.
 *
 * @module web-theme/providers
 */

'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useThemeContext, separateTokensByMode, mapTokensToVars } from '@stackra/react-theming';

// ─── Props ─────────────────────────────────────────────────────────

/**
 * Props for the {@link WebThemeProvider} component.
 */
export interface WebThemeProviderProps {
  /** Child components that inherit the applied design tokens. */
  children: ReactNode;

  /**
   * Optional fallback tokens to use when server tokens are not available.
   *
   * These are typically the HeroUI v3 default values, ensuring the UI
   * renders correctly even if the Settings API is unreachable on first load.
   * Server tokens always take precedence once they arrive.
   */
  fallbackTokens?: Record<string, string>;
}

// ─── Component ─────────────────────────────────────────────────────

/**
 * Applies server-driven design tokens to the DOM as CSS custom properties.
 *
 * This provider is the web-specific counterpart to `NativeThemeProvider` (mobile).
 * Both consume the same `ThemeContext` from `@stackra/react-theming` and use
 * identical token-to-variable mapping, but apply tokens through different
 * platform APIs (DOM vs Uniwind).
 *
 * @example
 * ```tsx
 * import { WebThemeProvider } from '@repo/ui';
 * import { ThemeProvider } from '@stackra/react-theming';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <WebThemeProvider fallbackTokens={heroUiDefaults}>
 *         <Layout />
 *       </WebThemeProvider>
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function WebThemeProvider({ children, fallbackTokens }: WebThemeProviderProps) {
  const { serverTokens } = useThemeContext();

  /**
   * Ref to the injected `<style>` element for dark mode tokens.
   * Identified by `data-stackra-theme="dark"` for easy debugging and cleanup.
   */
  const darkStyleRef = useRef<HTMLStyleElement | null>(null);

  useLayoutEffect(() => {
    // ── Resolve tokens: server → fallback → empty ──────────────────
    const tokens = serverTokens.tokens ?? fallbackTokens ?? {};
    if (Object.keys(tokens).length === 0) return;

    // ── Separate light and dark mode tokens ────────────────────────
    const { light, dark } = separateTokensByMode(tokens);

    // ── Apply light tokens to :root (document.documentElement) ─────
    const lightVars = mapTokensToVars(light);
    for (const { variable, value } of lightVars) {
      document.documentElement.style.setProperty(variable, value);
    }

    // ── Apply dark tokens via a <style> tag with .dark selector ────
    const darkVars = mapTokensToVars(dark);
    if (darkVars.length > 0) {
      const darkCss = darkVars.map(({ variable, value }) => `${variable}: ${value};`).join('\n  ');
      const styleContent = `.dark, [data-theme="dark"] {\n  ${darkCss}\n}`;

      if (!darkStyleRef.current) {
        darkStyleRef.current = document.createElement('style');
        darkStyleRef.current.setAttribute('data-stackra-theme', 'dark');
        document.head.appendChild(darkStyleRef.current);
      }
      darkStyleRef.current.textContent = styleContent;
    }

    // ── Cleanup: remove dark style tag and inline styles on unmount ─
    return () => {
      if (darkStyleRef.current) {
        darkStyleRef.current.remove();
        darkStyleRef.current = null;
      }
    };
  }, [serverTokens.tokens, fallbackTokens]);

  return <>{children}</>;
}
