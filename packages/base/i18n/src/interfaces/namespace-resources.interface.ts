/**
 * Namespace Resources Interface
 *
 * Represents the namespace-level structure within a single language's
 * translation resources.
 *
 * @module interfaces/namespace-resources
 */

/**
 * Represents namespaces within a language
 * Each namespace is a collection of translation keys and values
 *
 * @example
 * ```typescript
 * const namespaces: NamespaceResources = {
 *   translation: {
 *     'home.title': 'Welcome',
 *     'home.subtitle': 'Start translating',
 *   },
 *   common: {
 *     'button.save': 'Save',
 *     'button.cancel': 'Cancel',
 *   }
 * };
 * ```
 */
export interface NamespaceResources {
  /**
   * Map of namespace names to translation key-value pairs
   * Default namespace is typically 'translation'
   */
  [namespaceName: string]: {
    /**
     * Nested translation key-value pairs
     * Can be deeply nested using dot notation (e.g., 'auth.login.button')
     */
    [translationKey: string]: any;
  };
}
