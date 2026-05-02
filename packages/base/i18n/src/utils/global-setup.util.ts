/**
 * i18n Global Registration
 *
 * Registers translation helper functions (`__`, `t`, `trans`) as global
 * functions on `globalThis`, following the same pattern as `bootGlobals()`
 * in `@stackra/ts-support`.
 *
 * ## Usage
 *
 * ```typescript
 * import { bootI18nGlobals } from '@stackra/react-i18n';
 *
 * // After i18next is initialized (e.g. via I18nModule.forRoot())
 * bootI18nGlobals();
 *
 * // Now available globally without imports
 * t('common.greeting');
 * __('common.welcome');
 * trans('common.hello_user', { name: 'Kiro' });
 * ```
 *
 * @module utils/global-setup
 */

import i18next, { type TFunction } from 'i18next';

// ── Safe Translation Wrapper ───────────────────────────────────────────────

/**
 * Wrap `i18next.t` to guarantee a `string` return value.
 * @internal
 */
const safeTranslate = (fn: TFunction, key: string, options?: Record<string, any>): string => {
  const result = options ? fn(key, options) : fn(key);
  return typeof result === 'string' ? result : String(result);
};

// ── Translation Functions ──────────────────────────────────────────────────

/** Simple translation function (no interpolation). */
export const __ = (key: string): string => safeTranslate(i18next.t.bind(i18next), key);

/** Main translation function with optional interpolation. */
export const t = (key: string, options?: Record<string, any>): string =>
  safeTranslate(i18next.t.bind(i18next), key, options);

/** Alias for t(). */
export const trans = (key: string, options?: Record<string, any>): string => t(key, options);

// Re-export the i18next instance for advanced usage
export { i18next };

// ── Language Management ────────────────────────────────────────────────────

/** Change the active language. */
export const changeLanguage = async (language: string): Promise<void> => {
  await i18next.changeLanguage(language);
};

/** Get the currently active language code. */
export const getLanguage = (): string => i18next.language;

/** Get all loaded language codes. */
export const getLanguages = (): readonly string[] => i18next.languages ?? [];

/** Add translation resources at runtime. */
export const addResources = (
  language: string,
  namespace: string,
  resources: Record<string, any>
): void => {
  i18next.addResources(language, namespace, resources);
};

// ── Global Registration ────────────────────────────────────────────────────

/** Whether i18n globals have been installed. */
let _booted = false;

/**
 * Register i18n translation helpers as global functions on `globalThis`.
 *
 * Installs `t()`, `__()`, and `trans()` directly on `globalThis` so they
 * can be called without imports — the same pattern as `env()`, `collect()`,
 * etc. from `@stackra/ts-support`.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 *
 * @example
 * ```typescript
 * import { bootI18nGlobals } from '@stackra/react-i18n';
 *
 * bootI18nGlobals();
 *
 * // Now available globally
 * t('common.greeting');
 * __('common.welcome');
 * ```
 */
export function bootI18nGlobals(): void {
  if (_booted) return;

  const g = globalThis as any;

  g.__ = __;
  g.t = t;
  g.trans = trans;

  _booted = true;
}
