/**
 * Standalone Translation Helpers & Global Registration
 *
 * Provides convenience translation functions (`__`, `t`, `trans`) and
 * language management functions (`changeLanguage`, `getLanguage`, etc.)
 * that work without DI. These are used by:
 * - The Vite virtual module (generated string code)
 * - Consumers who don't use the DI container
 * - Test utilities
 *
 * All translation functions use {@link safeTranslate} internally to
 * guarantee a `string` return type regardless of i18next configuration.
 *
 * For DI-based usage, prefer injecting `I18N_SERVICE` instead.
 *
 * @module utils/global-setup
 */

import i18next, { TFunction } from "i18next";

import type { I18nextConfig } from "@/interfaces";

// ── Safe Translation Wrapper ───────────────────────────────────────────────

/**
 * Wrap `i18next.t` to guarantee a `string` return value.
 *
 * i18next's `TFunction` can return non-string types (objects, arrays)
 * in certain configurations (e.g. `returnObjects: true`). This wrapper
 * normalizes the result via `String()` so callers always get a string.
 *
 * @param fn - Bound `i18next.t` function
 * @param key - Translation key
 * @param options - Optional interpolation / i18next options
 * @returns Translated string
 *
 * @internal
 */
const safeTranslate = (fn: TFunction, key: string, options?: Record<string, any>): string => {
  const result = options ? fn(key, options) : fn(key);
  return typeof result === "string" ? result : String(result);
};

// ── Translation Functions ──────────────────────────────────────────────────

/**
 * Simple translation function.
 *
 * Shorthand alias inspired by PHP/Laravel's `__()` helper.
 * Always returns a `string`, converting non-string results via {@link safeTranslate}.
 *
 * @param key - Translation key to look up (e.g. `'greeting'`)
 * @returns Translated string, or the raw key if no translation is found
 *
 * @example
 * ```typescript
 * __('greeting'); // "Hello"
 * __('auth.login'); // "Login"
 * ```
 */
export const __ = (key: string): string => safeTranslate(i18next.t.bind(i18next), key);

/**
 * Main translation function with optional interpolation.
 *
 * Supports all i18next options: interpolation, pluralization,
 * namespace overrides, context, etc.
 *
 * @param key - Translation key to look up (e.g. `'greeting.welcome'`)
 * @param options - Optional i18next options (interpolation values, namespace, etc.)
 * @returns Translated string, or the raw key if no translation is found
 *
 * @example
 * ```typescript
 * t('greeting.welcome', { name: 'John' }); // "Welcome, John!"
 * t('errors.notFound');                     // "Not found"
 * t('items', { count: 5 });                 // "5 items" (pluralization)
 * ```
 */
export const t = (key: string, options?: Record<string, any>): string =>
  safeTranslate(i18next.t.bind(i18next), key, options);

/**
 * Alias for {@link t}.
 *
 * Provided for codebases that prefer the `trans()` naming convention
 * common in other i18n libraries (e.g. Laravel, Symfony).
 *
 * @param key - Translation key to look up
 * @param options - Optional i18next options
 * @returns Translated string, or the raw key if no translation is found
 *
 * @example
 * ```typescript
 * trans('page.title'); // "My Page"
 * ```
 */
export const trans = (key: string, options?: Record<string, any>): string => t(key, options);

// Re-export the i18next instance for advanced usage
export { i18next };

// ── Language Management ────────────────────────────────────────────────────

/**
 * Change the active language.
 *
 * Delegates to `i18next.changeLanguage()` which triggers the
 * `languageChanged` event and reloads resources if needed.
 *
 * @param language - ISO 639-1 language code to switch to
 * @returns Resolves when the language change is complete
 *
 * @example
 * ```typescript
 * await changeLanguage('ar');
 * console.log(getLanguage()); // "ar"
 * ```
 */
export const changeLanguage = async (language: string): Promise<void> => {
  await i18next.changeLanguage(language);
};

/**
 * Get the currently active language code.
 *
 * @returns Current language code (e.g. `'en'`, `'ar'`)
 *
 * @example
 * ```typescript
 * const lang = getLanguage(); // "en"
 * ```
 */
export const getLanguage = (): string => i18next.language;

/**
 * Get all loaded language codes.
 *
 * Returns the languages array from i18next, which includes the current
 * language and all fallback languages in resolution order.
 *
 * @returns Readonly array of language codes, or an empty array if none are loaded
 *
 * @example
 * ```typescript
 * const langs = getLanguages(); // ["en", "en-US"]
 * ```
 */
export const getLanguages = (): readonly string[] => i18next.languages ?? [];

/**
 * Add translation resources at runtime.
 *
 * Useful for lazy-loading namespaces or injecting translations
 * from an API response.
 *
 * @param language - Language code to add resources for
 * @param namespace - Target namespace
 * @param resources - Key-value translation pairs
 *
 * @example
 * ```typescript
 * addResources('en', 'auth', { login: 'Login', logout: 'Logout' });
 * ```
 */
export const addResources = (
  language: string,
  namespace: string,
  resources: Record<string, any>,
): void => {
  i18next.addResources(language, namespace, resources);
};

// ── Global Registration ────────────────────────────────────────────────────

/**
 * Check whether global i18n helpers have already been registered.
 *
 * @returns `true` if `globalThis.__` and `globalThis.t` are functions
 *
 * @example
 * ```typescript
 * if (!isGlobalI18nSetup()) {
 *   await setupGlobalI18n(config);
 * }
 * ```
 */
export function isGlobalI18nSetup(): boolean {
  return (
    typeof (globalThis as any).__ === "function" && typeof (globalThis as any).t === "function"
  );
}

/**
 * Initialize i18next and register translation helpers on `globalThis`.
 *
 * Initializes i18next directly (for non-DI contexts like the Vite
 * virtual module), then registers `__`, `t`, `trans`, `getLanguage`,
 * `getLanguages`, `addResources`, and `changeLanguage` as global
 * functions. Skips registration if globals are already present.
 *
 * For DI-based usage, prefer `I18nModule.forRoot()` + `I18nService`.
 *
 * @param config - Complete i18next configuration
 * @param options - Optional setup options
 * @param options.verbose - When `true`, logs each registered helper to the console
 * @returns Resolves when i18next is initialized and globals are registered
 *
 * @example
 * ```typescript
 * await setupGlobalI18n(config, { verbose: true });
 * // globalThis.__('greeting') now works anywhere
 * ```
 */
export async function setupGlobalI18n(
  config: I18nextConfig,
  options?: { verbose?: boolean },
): Promise<void> {
  if (isGlobalI18nSetup()) {
    console.warn("[i18n] Global i18n functions already set up. Skipping.");
    return;
  }

  const verbose = options?.verbose ?? false;

  // Initialize i18next directly (non-DI path)
  if (!i18next.isInitialized) {
    await i18next.init(config);
  }

  // Register all helpers on globalThis
  const g = globalThis as any;

  g.__ = __;
  g.t = t;
  g.trans = trans;
  g.getLanguage = getLanguage;
  g.getLanguages = getLanguages;
  g.addResources = addResources;
  g.changeLanguage = changeLanguage;

  if (verbose) {
    console.debug("[i18n] Registered global translation helpers:");
    console.debug("  - __(), t(), trans()");
    console.debug("  - getLanguage(), getLanguages()");
    console.debug("  - addResources(), changeLanguage()");
  }
}

/**
 * Remove all global i18n helpers from `globalThis`.
 *
 * Useful for test teardown to avoid leaking state between test suites.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   teardownGlobalI18n();
 * });
 * ```
 */
export function teardownGlobalI18n(): void {
  const g = globalThis as any;

  delete g.__;
  delete g.t;
  delete g.trans;
  delete g.getLanguage;
  delete g.getLanguages;
  delete g.addResources;
  delete g.changeLanguage;
}
