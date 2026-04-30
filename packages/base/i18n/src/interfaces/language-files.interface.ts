/**
 * Language Files Interface
 *
 * Maps namespace names to their absolute file paths for a single language.
 *
 * @module interfaces/language-files
 */

/**
 * Represents all namespace files for a specific language
 *
 * @example
 * ```typescript
 * const enFiles: LanguageFiles = {
 *   'translation': '/app/src/i18n/en.json',
 *   'common': '/app/src/i18n/common/en.json',
 *   'auth': '/app/src/features/auth/i18n/en.json',
 * };
 * ```
 */
export interface LanguageFiles {
  /**
   * Map of namespace names to their absolute file paths
   * Default namespace is typically 'translation'
   *
   * @example
   * ```typescript
   * {
   *   'translation': '/absolute/path/to/en.json',
   *   'common': '/absolute/path/to/common/en.json',
   *   'auth': '/absolute/path/to/auth/en.json'
   * }
   * ```
   */
  [namespace: string]: string;
}
