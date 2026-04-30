/**
 * i18next Service
 *
 * Low-level service that owns the i18next singleton lifecycle:
 * plugin registration, initialization, and instance access.
 * Implements the {@link II18nextService} interface.
 *
 * The higher-level {@link I18nService} wraps this service and adds
 * resolver chain integration, RTL detection, and event subscription.
 *
 * ## Architecture
 *
 * ```
 * I18nextService
 *   ├── constructor(config) → calls initializeI18next()
 *   ├── translate(), changeLocale(), getLocale()
 *   ├── getLanguages(), addResources(), onLanguageChanged()
 *   └── static getInstance(), static isInitialized()
 * ```
 *
 * @module services/i18next
 *
 * @example
 * ```typescript
 * import { I18nextService } from '@stackra/react-i18n';
 *
 * const i18nextService = new I18nextService({
 *   lng: 'en',
 *   resources: { en: { translation: { greeting: 'Hello' } } },
 * });
 *
 * i18nextService.translate('greeting');     // "Hello"
 * await i18nextService.changeLocale('ar');
 * i18nextService.getLocale();               // "ar"
 * ```
 */

import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import type { II18nextService } from '@/interfaces/i18next-service.interface';
import type { I18nextConfig } from '@/interfaces/i18next-config.interface';

/**
 * Low-level i18next wrapper service.
 *
 * Wraps the i18next singleton and exposes a clean API for translation,
 * locale management, resource injection, and event subscription.
 *
 * Registered in the DI container via the `I18NEXT_SERVICE` token by
 * `I18nModule.forRoot()`.
 */
export class I18nextService implements II18nextService {
  /*
  |--------------------------------------------------------------------------
  | Static — Instance Access
  |--------------------------------------------------------------------------
  */

  /**
   * Get the current i18next singleton.
   *
   * Returns the module-level i18next instance regardless of whether it
   * has been initialized. Check {@link isInitialized} first if timing
   * is uncertain.
   *
   * @returns The i18next instance
   *
   * @example
   * ```typescript
   * const instance = I18nextService.getInstance();
   * const lang = instance.language;
   * ```
   */
  static getInstance(): typeof i18next {
    return i18next;
  }

  /**
   * Check whether i18next has been initialized and is ready for use.
   *
   * @returns `true` if `i18next.init()` has completed successfully
   *
   * @example
   * ```typescript
   * if (I18nextService.isInitialized()) {
   *   const text = service.translate('greeting');
   * }
   * ```
   */
  static isInitialized(): boolean {
    return i18next.isInitialized;
  }

  /*
  |--------------------------------------------------------------------------
  | Instance
  |--------------------------------------------------------------------------
  */

  /**
   * The initialized i18next instance.
   *
   * @internal
   */
  private readonly i18n: typeof i18next;

  /**
   * The configuration used to initialize this service.
   *
   * @internal
   */
  private readonly config: I18nextConfig;

  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  /**
   * Create a new i18next service and initialize i18next.
   *
   * Registers optional plugins (HTTP backend, browser language detector)
   * and calls `i18next.init()`. Guards against double-initialization
   * since i18next is a module-level singleton.
   *
   * @param config - Complete i18next configuration
   *
   * @example
   * ```typescript
   * const service = new I18nextService({
   *   lng: 'en',
   *   fallbackLng: 'en',
   *   resources: { en: { translation: { hi: 'Hello' } } },
   * });
   * ```
   */
  constructor(config: I18nextConfig) {
    this.config = config;
    this.i18n = this.initializeI18next(config);
  }

  /*
  |--------------------------------------------------------------------------
  | Translation
  |--------------------------------------------------------------------------
  */

  /**
   * Translate a key with optional interpolation parameters.
   *
   * Falls back to `defaultMessage` (or the raw key) when the
   * translation is missing or empty.
   *
   * @param key - Translation key to look up
   * @param options - Optional interpolation values or i18next options
   * @param defaultMessage - Fallback message if translation is not found
   * @returns Translated string
   *
   * @example
   * ```typescript
   * service.translate('greeting');                      // "Hello"
   * service.translate('welcome', { name: 'John' });     // "Welcome, John!"
   * service.translate('missing', {}, 'Fallback');        // "Fallback"
   * ```
   */
  translate(key: string, options?: Record<string, any>, defaultMessage?: string): string {
    try {
      const result = options ? this.i18n.t(key, options) : this.i18n.t(key);
      // Normalize to string — i18next can return objects with returnObjects: true
      return String(result || defaultMessage || key);
    } catch (error: Error | any) {
      console.error(`[i18n] Translation error for key "${key}":`, error);
      return defaultMessage || key;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Locale Management
  |--------------------------------------------------------------------------
  */

  /**
   * Change the active language.
   *
   * Optionally persists the selection to `localStorage` (enabled by
   * default; disable with `options.persist = false`).
   *
   * @param language - Language code to switch to
   * @param options - Optional configuration (e.g. `{ persist: false }`)
   * @returns Resolves when the language change is complete
   * @throws {Error} Re-throws if `i18next.changeLanguage` fails
   *
   * @example
   * ```typescript
   * await service.changeLocale('ar');
   * await service.changeLocale('en', { persist: false });
   * ```
   */
  async changeLocale(language: string, options?: Record<string, any>): Promise<void> {
    try {
      await this.i18n.changeLanguage(language);

      // Persist to localStorage unless explicitly disabled
      if (options?.persist !== false && typeof localStorage !== 'undefined') {
        localStorage.setItem('i18nextLng', language);
      }
    } catch (error: Error | any) {
      console.error(`[i18n] Error changing language to "${language}":`, error);
      throw error;
    }
  }

  /**
   * Get the currently active language code.
   *
   * @returns Current language code (e.g. `'en'`), defaults to `'en'` if unset
   *
   * @example
   * ```typescript
   * service.getLocale(); // "en"
   * ```
   */
  getLocale(): string {
    return this.i18n.language || 'en';
  }

  /**
   * Get all available languages.
   *
   * @returns Array of language codes
   *
   * @example
   * ```typescript
   * service.getLanguages(); // ['en', 'ar', 'es']
   * ```
   */
  getLanguages(): string[] {
    return (this.config.preload as string[]) || [this.config.lng || 'en'];
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
   * @param namespace - Namespace name
   * @param resources - Translation key-value pairs to add
   *
   * @example
   * ```typescript
   * service.addResources('en', 'auth', { login: 'Login', logout: 'Logout' });
   * ```
   */
  addResources(language: string, namespace: string, resources: Record<string, any>): void {
    try {
      this.i18n.addResources(language, namespace, resources);
    } catch (error: Error | any) {
      console.error(`[i18n] Error adding resources for ${language}:${namespace}:`, error);
    }
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
   * @param language - Optional language filter
   *
   * @example
   * ```typescript
   * service.onLanguageChanged((lang) => {
   *   document.documentElement.lang = lang;
   * });
   * ```
   */
  onLanguageChanged(callback: (language: string) => void, language?: string): void {
    this.i18n.on('languageChanged', (lng: string) => {
      if (!language || lng === language) {
        callback(lng);
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — i18next Initialization
  |--------------------------------------------------------------------------
  |
  | This is the ONLY place in the codebase where i18next.use() and
  | i18next.init() should be called. All other modules delegate here.
  |
  */

  /**
   * Initialize the i18next singleton.
   *
   * @param config - Complete i18next configuration
   * @returns The initialized i18next instance
   *
   * @internal
   */
  private initializeI18next(config: I18nextConfig): typeof i18next {
    if (i18next.isInitialized) {
      return i18next;
    }

    if (config.backend) {
      i18next.use(HttpBackend);
    }

    if (config.detection) {
      i18next.use(LanguageDetector);
    }

    i18next.init(config, (err: Error | null) => {
      if (err) {
        console.error('[i18n] Initialization error:', err);
      }
    });

    return i18next;
  }
}
