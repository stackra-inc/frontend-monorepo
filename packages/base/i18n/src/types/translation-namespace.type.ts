/**
 * Translation Namespace Type
 *
 * Branded string type for namespace identifiers, preventing accidental
 * use of arbitrary strings where a namespace name is expected.
 *
 * @module types/translation-namespace
 */

/**
 * Translation namespace type
 * Represents logical grouping/organizational unit for translation keys
 * Namespaces allow organizing translations into separate files and modules
 *
 * @example
 * ```typescript
 * const ns: TranslationNamespace = 'translation';
 * const ns: TranslationNamespace = 'common';
 * const ns: TranslationNamespace = 'auth';
 * const ns: TranslationNamespace = 'dashboard';
 * ```
 */
export type TranslationNamespace = string & { readonly __brand: 'TranslationNamespace' };

/**
 * Helper function to create a branded TranslationNamespace type
 * Ensures type safety when working with namespace names
 *
 * @param name - The namespace name
 * @returns The namespace branded as TranslationNamespace type
 *
 * @example
 * ```typescript
 * const commonNs = createNamespace('common');
 * const authNs = createNamespace('auth');
 * ```
 */
export const createNamespace = (name: string): TranslationNamespace => {
  return name as TranslationNamespace;
};
