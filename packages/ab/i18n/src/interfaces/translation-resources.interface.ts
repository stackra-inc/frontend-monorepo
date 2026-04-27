/**
 * Translation Resources Interface
 *
 * Top-level structure mapping language codes to their namespace resources.
 * This is the shape of the `resources` property in i18next configuration.
 *
 * @module interfaces/translation-resources
 */

import { NamespaceResources } from "./namespace-resources.interface";

/**
 * Represents the structure of translation resources in i18next format
 * Maps language codes to namespaces containing translation key-value pairs
 *
 * @example
 * ```typescript
 * const resources: TranslationResources = {
 *   en: {
 *     translation: {
 *       'greeting': 'Hello',
 *       'auth.login': 'Login',
 *       'auth.password': 'Password',
 *     }
 *   },
 *   ar: {
 *     translation: {
 *       'greeting': 'مرحبا',
 *       'auth.login': 'تسجيل دخول',
 *       'auth.password': 'كلمة المرور',
 *     }
 *   }
 * };
 * ```
 */
export interface TranslationResources {
  /**
   * Map of language codes to their namespace resources
   * Each language code maps to one or more namespaces
   *
   * @example
   * ```typescript
   * {
   *   'en': { translation: { ... }, common: { ... } },
   *   'ar': { translation: { ... }, common: { ... } }
   * }
   * ```
   */
  [languageCode: string]: NamespaceResources;
}
