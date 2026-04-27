/**
 * Language Code Type
 *
 * Branded string type for ISO 639-1 language codes, preventing accidental
 * assignment of arbitrary strings where a language code is expected.
 *
 * @module types/language-code
 */

/**
 * Language code type
 * Represents ISO 639-1 language codes or custom language identifiers
 * Used for type-safe language selection throughout the application
 *
 * @example
 * ```typescript
 * const lang: LanguageCode = 'en'; // English
 * const lang: LanguageCode = 'ar'; // Arabic
 * const lang: LanguageCode = 'es'; // Spanish
 * const lang: LanguageCode = 'fr'; // French
 * const lang: LanguageCode = 'de'; // German
 * const lang: LanguageCode = 'zh'; // Chinese
 * ```
 */
export type LanguageCode = string & { readonly __brand: "LanguageCode" };

/**
 * Helper function to create a branded LanguageCode type
 * Ensures type safety when working with language codes
 *
 * @param code - The language code string
 * @returns The language code branded as LanguageCode type
 *
 * @example
 * ```typescript
 * const englishCode = createLanguageCode('en');
 * const arabicCode = createLanguageCode('ar');
 * ```
 */
export const createLanguageCode = (code: string): LanguageCode => {
  return code as LanguageCode;
};
