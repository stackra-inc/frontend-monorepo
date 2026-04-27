/**
 * @fileoverview Theme Token Mapper
 *
 * Pure utility functions for converting backend design token keys (snake_case)
 * to CSS custom property names (kebab-case) matching HeroUI v3 / HeroUI Native
 * variable names. Also provides helpers for separating light/dark tokens and
 * mapping flat token objects to CSS variable entries.
 *
 * These functions are platform-agnostic — no DOM, no React, no React Native APIs.
 * They are consumed by both `WebThemeProvider` (web) and `NativeThemeProvider`
 * (mobile) for identical token-to-variable mapping across platforms.
 *
 * @module @stackra/react-theming
 * @category Utils
 */

/**
 * Convert a snake_case token key to a CSS custom property name.
 *
 * Maps directly to HeroUI v3 / HeroUI Native variable names — NO `--theme-` prefix.
 * Underscores are replaced with hyphens and the result is prepended with `--`.
 *
 * @param token - The snake_case token key from the backend API.
 * @returns The corresponding CSS custom property name.
 *
 * @example
 * ```typescript
 * tokenToCssVar('accent');
 * // → '--accent'
 *
 * tokenToCssVar('surface_secondary');
 * // → '--surface-secondary'
 *
 * tokenToCssVar('field_background');
 * // → '--field-background'
 *
 * tokenToCssVar('radius');
 * // → '--radius'
 *
 * tokenToCssVar('font_sans');
 * // → '--font-sans'
 *
 * tokenToCssVar('surface_shadow');
 * // → '--surface-shadow'
 * ```
 */
export function tokenToCssVar(token: string): string {
  const kebab = token.replace(/_/g, '-');
  return `--${kebab}`;
}

/**
 * Separate tokens into light and dark groups.
 *
 * Tokens prefixed with `dark_` are placed into the dark group with the prefix
 * stripped. All other tokens go into the light group. Tokens with `null` or
 * `undefined` values are skipped in both groups.
 *
 * @param tokens - A flat token object from the backend API response.
 * @returns An object with `light` and `dark` groups, each containing string values.
 *
 * @example
 * ```typescript
 * separateTokensByMode({
 *   accent: 'oklch(0.62 0.19 253)',
 *   dark_background: 'oklch(0.12 0.005 285)',
 *   background: 'oklch(0.97 0 0)',
 * });
 * // → {
 * //     light: { accent: 'oklch(0.62 0.19 253)', background: 'oklch(0.97 0 0)' },
 * //     dark:  { background: 'oklch(0.12 0.005 285)' },
 * //   }
 * ```
 */
export function separateTokensByMode(tokens: Record<string, unknown>): {
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (value == null) {
      continue;
    }

    const stringValue = String(value);

    if (key.startsWith('dark_')) {
      const strippedKey = key.slice(5);
      dark[strippedKey] = stringValue;
    } else {
      light[key] = stringValue;
    }
  }

  return { light, dark };
}

/**
 * Map a flat token object to CSS variable entries.
 *
 * Returns an array of `{ variable, value }` pairs where each token key is
 * converted to a CSS custom property name via {@link tokenToCssVar} and each
 * value is converted to a string. Tokens with `null` or `undefined` values
 * are skipped.
 *
 * @param tokens - A flat token object (typically one mode from {@link separateTokensByMode}).
 * @returns An array of CSS variable entries ready for application.
 *
 * @example
 * ```typescript
 * mapTokensToVars({ accent: 'oklch(0.62 0.19 253)' });
 * // → [{ variable: '--accent', value: 'oklch(0.62 0.19 253)' }]
 *
 * mapTokensToVars({ surface_secondary: '#f4f4f5', radius: '0.5rem' });
 * // → [
 * //     { variable: '--surface-secondary', value: '#f4f4f5' },
 * //     { variable: '--radius', value: '0.5rem' },
 * //   ]
 * ```
 */
export function mapTokensToVars(
  tokens: Record<string, unknown>
): Array<{ variable: string; value: string }> {
  const entries: Array<{ variable: string; value: string }> = [];

  for (const [key, value] of Object.entries(tokens)) {
    if (value == null) {
      continue;
    }

    entries.push({
      variable: tokenToCssVar(key),
      value: String(value),
    });
  }

  return entries;
}
