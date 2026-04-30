/**
 * Global Translation Function Declarations
 *
 * These functions are injected into globalThis by {@link setupGlobalI18n}
 * and are available globally without imports.
 *
 * @module @types/globals
 */

/**
 * Global function declarations
 * These functions are injected into globalThis using setupGlobalI18n function
 */
declare global {
  /**
   * Simple translation function (alias for t)
   * @param key - The translation key
   * @returns The translated string
   */
  function __(key: TranslationKey): string;

  /**
   * Main translation function
   * @param key - The translation key
   * @param options - Optional i18next options
   * @returns The translated string
   */
  function t(key: TranslationKey, options?: Record<string, any>): string;

  /**
   * Translation function (alias for t)
   * @param key - The translation key
   * @param options - Optional i18next options
   * @returns The translated string
   */
  function trans(key: TranslationKey, options?: Record<string, any>): string;
}

export {};
