/**
 * i18n Service
 *
 * The main `@Injectable()` service that consumers interact with.
 * Orchestrates translation, locale resolution, language switching,
 * and resource management via the i18next singleton.
 *
 * Injected via the `I18N_SERVICE` token after configuring
 * `I18nModule.forRoot()`.
 *
 * ## Architecture
 *
 * ```
 * I18nService
 *   ├── wraps I18nProvider (i18next instance)
 *   ├── uses LOCALE_RESOLVER_CHAIN for locale detection
 *   ├── reads I18N_CONFIG for languages, defaults, storage
 *   └── exposes t(), __(), trans(), changeLocale(), resolveLocale()
 * ```
 *
 * @module services/i18n
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
 *   notifySuccess(key: string): void {
 *     showToast(this.i18n.t(key));
 *   }
 * }
 * ```
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { Str } from "@stackra/ts-support";

import { I18N_CONFIG, I18NEXT_SERVICE, LOCALE_RESOLVER_CHAIN } from "@/constants";
import type { II18nextService } from "@/interfaces/i18next-service.interface";
import type { I18nModuleOptions } from "@/interfaces/i18n-module-options.interface";
import type { II18nService } from "@/interfaces/i18n-service.interface";

/**
 * Well-known RTL language codes.
 *
 * Used by {@link I18nService.isRTL} to determine text direction.
 *
 * @internal
 */
const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "yi", "ku", "ug"]);

/**
 * i18n Service
 *
 * The primary service for all i18n operations. Wraps the
 * {@link I18nProvider} with additional features: locale resolution
 * via the resolver chain, RTL detection, and event subscription.
 *
 * Registered in the DI container via `I18N_SERVICE` token.
 */
@Injectable()
export class I18nService implements II18nService {
  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  /**
   * @param provider - The i18n provider wrapping the i18next instance
   * @param config - The merged module configuration
   * @param resolveLocaleChain - The composed locale resolver chain function
   */
  constructor(
    @Inject(I18NEXT_SERVICE) private readonly i18nextService: II18nextService,
    @Inject(I18N_CONFIG) private readonly config: I18nModuleOptions,
    @Inject(LOCALE_RESOLVER_CHAIN)
    private readonly resolveLocaleChain: () => Promise<string | undefined>,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | Translation
  |--------------------------------------------------------------------------
  */

  /**
   * Translate a key with optional interpolation.
   *
   * Delegates to the underlying {@link I18nProvider.translate} method.
   * Always returns a string — falls back to the raw key if not found.
   *
   * @param key - Translation key (e.g. `'auth.login'`)
   * @param options - Optional i18next options (interpolation, namespace, etc.)
   * @returns Translated string
   *
   * @example
   * ```typescript
   * i18n.t('greeting');                   // "Hello"
   * i18n.t('welcome', { name: 'John' }); // "Welcome, John!"
   * ```
   */
  t(key: string, options?: Record<string, any>): string {
    return this.i18nextService.translate(key, options);
  }

  /**
   * Simple translation function (alias for {@link t}).
   *
   * @param key - Translation key
   * @returns Translated string
   *
   * @example
   * ```typescript
   * i18n.__('greeting'); // "Hello"
   * ```
   */
  __(key: string): string {
    return this.i18nextService.translate(key);
  }

  /**
   * Translation function (alias for {@link t}).
   *
   * @param key - Translation key
   * @param options - Optional i18next options
   * @returns Translated string
   *
   * @example
   * ```typescript
   * i18n.trans('page.title'); // "My Page"
   * ```
   */
  trans(key: string, options?: Record<string, any>): string {
    return this.i18nextService.translate(key, options);
  }

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
  getLocale(): string {
    return this.i18nextService.getLocale();
  }

  /**
   * Change the active locale.
   *
   * Delegates to the provider which switches i18next language and
   * optionally persists to storage.
   *
   * @param language - ISO 639-1 language code
   * @param options - Optional config (e.g. `{ persist: false }`)
   * @returns Resolves when the language change is complete
   *
   * @example
   * ```typescript
   * await i18n.changeLocale('ar');
   * ```
   */
  async changeLocale(language: string, options?: Record<string, any>): Promise<void> {
    await this.i18nextService.changeLocale(language, options);
  }

  /**
   * Get all supported language codes.
   *
   * Returns the languages configured in `I18nModule.forRoot()`.
   *
   * @returns Array of language codes
   *
   * @example
   * ```typescript
   * const languages = i18n.getLanguages(); // ['en', 'ar', 'es']
   * ```
   */
  getLanguages(): string[] {
    return this.config.languages ?? [this.config.defaultLanguage ?? "en"];
  }

  /**
   * Check if the current locale is a right-to-left language.
   *
   * Checks against a well-known set of RTL language codes
   * (Arabic, Hebrew, Farsi, Urdu, etc.).
   *
   * @returns `true` if the current locale is RTL
   *
   * @example
   * ```typescript
   * if (i18n.isRTL()) {
   *   document.dir = 'rtl';
   * }
   * ```
   */
  isRTL(): boolean {
    // Extract the base language code (e.g. 'ar' from 'ar-EG')
    const baseLang = Str.lower(this.getLocale().split("-")[0] ?? "");
    return RTL_LANGUAGES.has(baseLang);
  }

  /*
  |--------------------------------------------------------------------------
  | Locale Resolution
  |--------------------------------------------------------------------------
  */

  /**
   * Resolve the locale using the configured resolver chain.
   *
   * Executes all resolvers in priority order. Falls back to the
   * configured `defaultLanguage` if no resolver returns a value.
   *
   * @returns Resolved locale code (never `undefined`)
   *
   * @example
   * ```typescript
   * const locale = await i18n.resolveLocale(); // "ar"
   * await i18n.changeLocale(locale);
   * ```
   */
  async resolveLocale(): Promise<string> {
    const resolved = await this.resolveLocaleChain();
    return resolved ?? this.config.defaultLanguage ?? "en";
  }

  /*
  |--------------------------------------------------------------------------
  | Resources
  |--------------------------------------------------------------------------
  */

  /**
   * Add translation resources at runtime.
   *
   * @param language - Language code
   * @param namespace - Target namespace
   * @param resources - Key-value translation pairs
   *
   * @example
   * ```typescript
   * i18n.addResources('en', 'auth', { login: 'Login' });
   * ```
   */
  addResources(language: string, namespace: string, resources: Record<string, any>): void {
    this.i18nextService.addResources?.(language, namespace, resources);
  }

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
   * });
   * ```
   */
  onLanguageChanged(callback: (language: string) => void): void {
    this.i18nextService.onLanguageChanged?.(callback);
  }
}
