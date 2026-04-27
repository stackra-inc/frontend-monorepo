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

/**
 * Internal token used to pass theme configs from `forFeature()` into
 * a factory provider that registers them on the DI-managed registry.
 * @internal
 */
export const THEME_FEATURE_CONFIGS = Symbol.for('THEME_FEATURE_CONFIGS');

/**
 * Internal token used to pass customizer panels from `registerCustomizer(s)()`
 * into a factory provider that registers them on the DI-managed registry.
 * @internal
 */
export const CUSTOMIZER_FEATURE_PANELS = Symbol.for('CUSTOMIZER_FEATURE_PANELS');
