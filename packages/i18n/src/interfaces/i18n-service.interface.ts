/**
 * i18n Service Interface
 *
 * Contract for the main `@Injectable()` i18n service that orchestrates
 * translation, locale resolution, language switching, and resource
 * management. Injected via the `I18N_SERVICE` token.
 *
 * Mirrors the `HttpClient` service pattern from `@stackra/ts-http`
 * and the `IMultiTenancyProvider` from `@stackra/react-multitenancy`.
 *
 * @module interfaces/i18n-service
 *
 * @example
 * ```typescript
 * import { Inject, Injectable } from '@stackra/ts-container';
 * import { I18N_SERVICE } from '@stackra/react-i18n';
 * import type { II18nService } from '@stackra/react-i18n';
 *
 * @Injectable()
 * class NotificationService {
 *   constructor(@Inject(I18N_SERVICE) private i18n: II18nService) {}
 *
 *   notify(key: string): void {
 *     const message = this.i18n.t(key);
 *     showToast(message);
 *   }
 * }
 * ```
 */
export interface II18nService {
  /*
  |--------------------------------------------------------------------------
  | Translation
  |--------------------------------------------------------------------------
  */

  /**
   * Translate a key with optional interpolation.
   *
   * Primary translation method supporting all i18next options:
   * interpolation, pluralization, namespace overrides, context, etc.
   *
   * @param key - Translation key (e.g. `'auth.login'`, `'common.button.save'`)
   * @param options - Optional i18next options (interpolation values, namespace, etc.)
   * @returns Translated string, or the raw key if not found
   *
   * @example
   * ```typescript
   * i18n.t('greeting');                          // "Hello"
   * i18n.t('welcome', { name: 'John' });         // "Welcome, John!"
   * i18n.t('items', { count: 5 });                // "5 items"
   * ```
   */
  t(key: string, options?: Record<string, any>): string;

  /**
   * Simple translation function (alias for {@link t}).
   *
   * Shorthand inspired by PHP/Laravel's `__()` helper.
   *
   * @param key - Translation key to look up
   * @returns Translated string, or the raw key if not found
   *
   * @example
   * ```typescript
   * i18n.__('greeting'); // "Hello"
   * ```
   */
  __(key: string): string;

  /**
   * Translation function (alias for {@link t}).
   *
   * For codebases preferring the `trans()` naming convention.
   *
   * @param key - Translation key to look up
   * @param options - Optional i18next options
   * @returns Translated string, or the raw key if not found
   *
   * @example
   * ```typescript
   * i18n.trans('page.title'); // "My Page"
   * ```
   */
  trans(key: string, options?: Record<string, any>): string;

  /*
  |--------------------------------------------------------------------------
  | Locale Management
  |--------------------------------------------------------------------------
  */

  /**
   * Get the currently active locale code.
   *
   * @returns Current locale code (e.g. `'en'`, `'ar'`)
   *
   * @example
   * ```typescript
   * const locale = i18n.getLocale(); // "en"
   * ```
   */
  getLocale(): string;

  /**
   * Change the active locale.
   *
   * Switches i18next language, optionally persists to storage,
   * and triggers the `languageChanged` event.
   *
   * @param language - ISO 639-1 language code to switch to
   * @param options - Optional configuration (e.g. `{ persist: false }`)
   * @returns Resolves when the language change is complete
   *
   * @example
   * ```typescript
   * await i18n.changeLocale('ar');
   * await i18n.changeLocale('en', { persist: false });
   * ```
   */
  changeLocale(language: string, options?: Record<string, any>): Promise<void>;

  /**
   * Get all supported language codes.
   *
   * @returns Array of language codes configured in the module
   *
   * @example
   * ```typescript
   * const languages = i18n.getLanguages(); // ['en', 'ar', 'es']
   * ```
   */
  getLanguages(): string[];

  /**
   * Check if the current locale is a right-to-left language.
   *
   * @returns `true` if the current locale is RTL (e.g. Arabic, Hebrew)
   *
   * @example
   * ```typescript
   * if (i18n.isRTL()) {
   *   document.dir = 'rtl';
   * }
   * ```
   */
  isRTL(): boolean;

  /*
  |--------------------------------------------------------------------------
  | Locale Resolution
  |--------------------------------------------------------------------------
  */

  /**
   * Resolve the locale using the configured resolver chain.
   *
   * Executes all resolvers in priority order and returns the first
   * non-`undefined` result, or the default language as fallback.
   *
   * @returns Resolved locale code
   *
   * @example
   * ```typescript
   * const locale = await i18n.resolveLocale(); // "ar"
   * ```
   */
  resolveLocale(): Promise<string>;

  /*
  |--------------------------------------------------------------------------
  | Resources
  |--------------------------------------------------------------------------
  */

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
   * i18n.addResources('en', 'auth', { login: 'Login', logout: 'Logout' });
   * ```
   */
  addResources(language: string, namespace: string, resources: Record<string, any>): void;

  /*
  |--------------------------------------------------------------------------
  | Events
  |--------------------------------------------------------------------------
  */

  /**
   * Register a callback for language change events.
   *
   * @param callback - Function invoked with the new language code
   *
   * @example
   * ```typescript
   * i18n.onLanguageChanged((lang) => {
   *   document.documentElement.lang = lang;
   *   document.dir = lang === 'ar' ? 'rtl' : 'ltr';
   * });
   * ```
   */
  onLanguageChanged(callback: (language: string) => void): void;
}
