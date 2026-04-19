/**
 * DI Tokens for @stackra/react-theming
 *
 * |--------------------------------------------------------------------------
 * | Injection tokens and metadata keys.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra/react-theming
 */

/** Injection token for the ThemeModule configuration. */
export const THEME_CONFIG = Symbol.for('THEME_CONFIG');

/** Injection token for the ThemeRegistry singleton. */
export const THEME_REGISTRY = Symbol.for('THEME_REGISTRY');

/** Injection token for the CustomizerRegistry singleton. */
export const CUSTOMIZER_REGISTRY = Symbol.for('CUSTOMIZER_REGISTRY');
