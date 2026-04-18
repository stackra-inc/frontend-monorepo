/**
 * File Map Interface
 *
 * Defines the structure returned by the file scanner after discovering
 * translation files on disk. Maps language codes to their namespaced
 * file paths.
 *
 * @module interfaces/file-map
 */

import { LanguageFiles } from './language-files.interface';

/**
 * Represents the mapping of discovered translation files
 * Used by FileScanner to organize translation files by language and namespace
 *
 * @example
 * ```typescript
 * const fileMap: FileMap = {
 *   en: {
 *     translation: '/app/src/i18n/en.json',
 *     common: '/app/src/i18n/common/en.json',
 *     auth: '/app/src/features/auth/i18n/en.json',
 *   },
 *   ar: {
 *     translation: '/app/src/i18n/ar.json',
 *     common: '/app/src/i18n/common/ar.json',
 *     auth: '/app/src/features/auth/i18n/ar.json',
 *   }
 * };
 * ```
 */
export interface FileMap {
  /**
   * Map of language codes to their namespaced file paths
   * Each language contains one or more namespaces with their corresponding file paths
   *
   * @example
   * ```typescript
   * {
   *   'en': {
   *     'translation': '/path/to/en.json',
   *     'common': '/path/to/common/en.json'
   *   },
   *   'ar': {
   *     'translation': '/path/to/ar.json',
   *     'common': '/path/to/common/ar.json'
   *   }
   * }
   * ```
   */
  [languageCode: string]: LanguageFiles;
}
