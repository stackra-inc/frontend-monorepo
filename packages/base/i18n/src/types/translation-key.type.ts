/**
 * Translation Key Type
 *
 * Branded string type for dot-notation translation keys, ensuring
 * type safety when referencing translations throughout the codebase.
 *
 * @module types/translation-key
 */

/**
 * Translation key type
 * Represents a unique identifier for a translation string
 * Uses dot notation for nested keys (e.g., 'auth.login.button')
 * This type is generated dynamically from discovered translation files
 *
 * @example
 * ```typescript
 * const key: TranslationKey = 'greeting';
 * const key: TranslationKey = 'auth.login';
 * const key: TranslationKey = 'common.button.save';
 * const key: TranslationKey = 'errors.validation.email';
 * ```
 */
export type TranslationKey = string & { readonly __brand: 'TranslationKey' };

/**
 * Helper function to create a branded TranslationKey type
 * Ensures type safety when working with translation keys
 *
 * @param key - The translation key string
 * @returns The key branded as TranslationKey type
 *
 * @example
 * ```typescript
 * const saveKey = createTranslationKey('common.button.save');
 * const emailErrorKey = createTranslationKey('errors.validation.email');
 * ```
 */
export const createTranslationKey = (key: string): TranslationKey => {
  return key as TranslationKey;
};
