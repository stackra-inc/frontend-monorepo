/**
 * Virtual Module Ambient Type Definitions
 *
 * Provides type information for the `virtual:@stackra/react-i18n` module
 * so that IDE autocomplete and type checking work for consumers importing
 * from the virtual module.
 *
 * @module @types/virtual-module
 */

import type i18next from "i18next";

/**
 * Augment Vite's module resolution
 * Define the virtual:@stackra/react-i18n module
 */
declare module "virtual:@stackra/react-i18n" {
  /**
   * Simple translation function - alias for t
   * Translates a key without parameters
   *
   * @param key - The translation key to look up
   * @returns The translated string
   *
   * @example
   * ```typescript
   * import { __ } from 'virtual:@stackra/react-i18n';
   * const greeting = __('greeting');
   * ```
   */
  export function __(key: string): string;

  /**
   * Main translation function with options
   * Translates a key with optional interpolation values
   *
   * @param key - The translation key to look up
   * @param options - Optional i18next translation options
   * @returns The translated string
   *
   * @example
   * ```typescript
   * import { t } from 'virtual:@stackra/react-i18n';
   * const greeting = t('greeting.welcome', { name: 'John' });
   * ```
   */
  export function t(key: string, options?: Record<string, any>): string;

  /**
   * Alias for t function
   * Translates a key with optional parameters
   *
   * @param key - The translation key to look up
   * @param options - Optional i18next translation options
   * @returns The translated string
   *
   * @example
   * ```typescript
   * import { trans } from 'virtual:@stackra/react-i18n';
   * const message = trans('message', { name: 'John' });
   * ```
   */
  export function trans(key: string, options?: Record<string, any>): string;

  /**
   * The initialized i18next instance
   * Provides full access to i18next API for advanced usage
   *
   * @example
   * ```typescript
   * import { i18n } from 'virtual:@stackra/react-i18n';
   * await i18n.changeLanguage('ar');
   * const lang = i18n.language;
   * ```
   */
  export const i18n: typeof i18next;

  /**
   * Change the current language/locale
   *
   * @param language - The language code to switch to
   * @returns Promise that resolves when the language has been changed
   *
   * @example
   * ```typescript
   * import { changeLanguage } from 'virtual:@stackra/react-i18n';
   * await changeLanguage('ar');
   * ```
   */
  export function changeLanguage(language: string): Promise<string>;

  /**
   * Get the currently active language/locale code
   *
   * @returns The current language code
   *
   * @example
   * ```typescript
   * import { getLanguage } from 'virtual:@stackra/react-i18n';
   * const currentLang = getLanguage();
   * ```
   */
  export function getLanguage(): string;

  /**
   * Get all available languages
   *
   * @returns Array of supported language codes
   *
   * @example
   * ```typescript
   * import { getLanguages } from 'virtual:@stackra/react-i18n';
   * const languages = getLanguages(); // ['en', 'ar', 'es']
   * ```
   */
  export function getLanguages(): string[];

  /**
   * Add translation resources at runtime
   * Useful for dynamically loading namespaces or language packs
   *
   * @param language - The language code to add resources for
   * @param namespace - The namespace name
   * @param resources - The translation key-value pairs to add
   *
   * @example
   * ```typescript
   * import { addResources } from 'virtual:@stackra/react-i18n';
   * addResources('en', 'auth', {
   *   'login': 'Login',
   *   'logout': 'Logout'
   * });
   * ```
   */
  export function addResources(
    language: string,
    namespace: string,
    resources: Record<string, any>,
  ): void;
}
