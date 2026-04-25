/**
 * Constants Barrel Export
 *
 * Centralized entry point for all configuration constants, pattern
 * definitions, and DI tokens used across the i18n plugin.
 *
 * - {@link DEFAULT_PLUGIN_OPTIONS} — Default Vite plugin configuration values
 * - {@link DEFAULT_I18NEXT_CONFIG} — Default i18next initialization configuration
 * - {@link TRANSLATION_FILE_PATTERNS} — Glob patterns for discovering translation files
 * - {@link TRANSLATION_FILE_EXTENSIONS} — Supported file extension constants
 * - {@link FILE_NAME_PATTERNS} — Regex patterns for parsing translation file names
 * - {@link I18N_CONFIG}, {@link I18NEXT_SERVICE}, {@link LOCALE_RESOLVER_CHAIN} — Core DI tokens
 * - Resolver DI tokens — Individual resolver injection tokens
 *
 * @module constants
 */

export { DEFAULT_PLUGIN_OPTIONS, DEFAULT_I18NEXT_CONFIG } from './default-config.constant';
export {
  TRANSLATION_FILE_PATTERNS,
  TRANSLATION_FILE_EXTENSIONS,
  FILE_NAME_PATTERNS,
} from './file-patterns.constant';
export {
  I18N_CONFIG,
  I18N_SERVICE,
  I18NEXT_SERVICE,
  LOCALE_RESOLVER_CHAIN,
  URL_PATH_LOCALE_RESOLVER,
  QUERY_PARAM_LOCALE_RESOLVER,
  STORAGE_LOCALE_RESOLVER,
  NAVIGATOR_LOCALE_RESOLVER,
  ACCEPT_LANGUAGE_LOCALE_RESOLVER,
} from './tokens.constant';
