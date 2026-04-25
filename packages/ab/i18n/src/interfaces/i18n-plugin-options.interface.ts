/**
 * i18n Plugin Options Interface
 *
 * Configuration options accepted by the Vite plugin factory function.
 * Combines plugin-specific settings (file scanning, HMR, type generation)
 * with pass-through i18next configuration.
 *
 * @module interfaces/i18n-plugin-options
 */

import type { I18nextOptions } from '@/types';

/**
 * Configuration options for the @stackra/react-i18n Vite plugin
 * Combines plugin-specific settings with i18next configuration options
 *
 * @example
 * ```typescript
 * const options: I18nPluginOptions = {
 *   defaultLanguage: 'en',
 *   languages: ['en', 'ar', 'es'],
 *   resourcesPath: 'src',
 *   typeGeneration: true,
 * };
 * ```
 */
export interface I18nPluginOptions {
  /**
   * Default language to use if no language is detected
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * List of supported language codes (e.g., 'en', 'ar', 'es')
   * Used for filtering discovered translation files
   * @default []
   */
  languages?: string[];

  /**
   * Root directory path to search for translation files
   * Can be absolute or relative to project root
   * @default process.cwd()
   */
  resourcesPath?: string;

  /**
   * Glob patterns to include when searching for translation files
   * Supports glob wildcards and arrays of patterns
   */
  include?: string | string[];

  /**
   * Glob patterns to exclude when searching for translation files
   */
  exclude?: string | string[];

  /**
   * Whether to enable HMR (Hot Module Replacement) for translation files
   * Useful during development for instant translation updates
   * @default true in dev, false in production
   */
  enableHMR?: boolean;

  /**
   * Whether to generate TypeScript definition files (.d.ts)
   * Provides type-safe translation key autocompletion
   * @default true
   */
  typeGeneration?: boolean;

  /**
   * Output directory for generated type definition files
   * @default '.stackra-inc/react-i18n/types'
   */
  typeOutputDir?: string;

  /**
   * Enable debug logging for the plugin
   * @default false
   */
  debug?: boolean;

  /**
   * Namespace configuration for translations
   * Allows organizing translations into logical groups
   * @default 'translation'
   */
  defaultNamespace?: string;

  /**
   * Whether to enable HTTP backend for loading translations
   * Allows loading translations from server/CDN dynamically
   * @default false
   */
  useHttpBackend?: boolean;

  /**
   * Backend URL for loading translations (if useHttpBackend is true)
   * @example 'https://api.example.com/translations'
   */
  backendUrl?: string;

  /**
   * Whether to use browser language detector
   * Auto-detects user's preferred language from browser/localStorage
   * @default true
   */
  useBrowserLanguageDetector?: boolean;

  /**
   * Additional i18next configuration options
   * These are merged with the generated configuration
   * Allows for full customization of i18next behavior
   */
  i18nextOptions?: Partial<I18nextOptions> | undefined;
}
