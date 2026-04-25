/**
 * i18n Provider Interface
 *
 * Contract that all i18n provider implementations must satisfy.
 * The {@link I18nextService} class implements this interface.
 * Framework-specific adapters (React, Vue, Refine) can also
 * implement it directly.
 *
 * @module interfaces/i18n-provider
 *
 * @example
 * ```typescript
 * import type { II18nextService } from '@stackra/react-i18n';
 *
 * class CustomProvider implements II18nextService {
 *   translate(key: string) { return key; }
 *   async changeLocale(lang: string) { }
 *   getLocale() { return 'en'; }
 * }
 * ```
 */
export interface II18nextService {
  /**
   * Translate a given key with optional parameters.
   *
   * @param key - The translation key to look up (e.g., `'auth.login'`)
   * @param options - Optional interpolation values, namespace override, etc.
   * @param defaultMessage - Fallback message if translation key is not found
   * @returns The translated string or the key itself if not found
   *
   * @example
   * ```typescript
   * provider.translate('greeting')                      // 'Hello'
   * provider.translate('welcome', { name: 'John' })     // 'Welcome John'
   * provider.translate('missing.key', {}, 'Default')    // 'Default'
   * ```
   */
  translate(key: string, options?: Record<string, any>, defaultMessage?: string): string;

  /**
   * Change the current language/locale.
   *
   * @param language - The language code to switch to (e.g., `'en'`, `'ar'`)
   * @param options - Optional configuration (e.g. `{ persist: false }`)
   * @returns Promise that resolves when the language has been changed
   *
   * @example
   * ```typescript
   * await provider.changeLocale('ar');
   * await provider.changeLocale('en', { persist: true });
   * ```
   */
  changeLocale(language: string, options?: Record<string, any>): Promise<void>;

  /**
   * Get the currently active language/locale code.
   *
   * @returns The current language code (e.g., `'en'`, `'ar'`)
   *
   * @example
   * ```typescript
   * const currentLang = provider.getLocale(); // 'en'
   * ```
   */
  getLocale(): string;

  /**
   * Get all available languages.
   *
   * @returns Array of available language codes
   *
   * @example
   * ```typescript
   * provider.getLanguages(); // ['en', 'ar', 'es']
   * ```
   */
  getLanguages?(): string[];

  /**
   * Add new translation resources at runtime.
   *
   * @param language - The language code to add resources for
   * @param namespace - The namespace name
   * @param resources - The translation key-value pairs to add
   *
   * @example
   * ```typescript
   * provider.addResources('en', 'auth', { login: 'Login' });
   * ```
   */
  addResources?(language: string, namespace: string, resources: Record<string, any>): void;

  /**
   * Register a callback for language change events.
   *
   * @param callback - Function to call when language changes
   * @param language - Optional specific language to listen for
   *
   * @example
   * ```typescript
   * provider.onLanguageChanged((newLang) => {
   *   console.log(`Language changed to: ${newLang}`);
   * });
   * ```
   */
  onLanguageChanged?(callback: (language: string) => void, language?: string): void;
}
