/**
 * File Pattern Constants
 *
 * Glob patterns, file extensions, and regex patterns used by the
 * file scanner to discover and classify translation files.
 *
 * @module constants/file-patterns
 */

/**
 * Glob patterns for discovering translation files.
 *
 * Used by {@link scanTranslationFiles} to locate JSON, JS, and TS
 * translation modules on disk.
 *
 * @example
 * ```typescript
 * import { TRANSLATION_FILE_PATTERNS } from '@stackra/react-i18n';
 *
 * const files = await glob(TRANSLATION_FILE_PATTERNS.include, {
 *   ignore: TRANSLATION_FILE_PATTERNS.exclude,
 * });
 * ```
 */
export const TRANSLATION_FILE_PATTERNS = {
  /** Include patterns targeting `*i18n/**` directories. */
  include: ["**/i18n/**/*.{json,js,ts}"] as const,

  /** Exclude patterns for common build artifacts and dependency directories. */
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/out/**",
  ] as const,
};

/**
 * Supported file extension constants.
 *
 * Used to identify and route translation files to the correct parser.
 */
export const TRANSLATION_FILE_EXTENSIONS = {
  /** `.json` — most common format for translation files. */
  JSON: ".json",

  /** `.js` — JavaScript modules exporting translation objects. */
  JAVASCRIPT: ".js",

  /** `.ts` — TypeScript modules exporting typed translation objects. */
  TYPESCRIPT: ".ts",

  /** `.tsx` — TypeScript JSX files (rarely used for translations). */
  TSX: ".tsx",

  /** `.jsx` — JavaScript JSX files (rarely used for translations). */
  JSX: ".jsx",
} as const;

/**
 * Regex patterns for parsing translation file names.
 *
 * Extracts language codes and namespaces from filenames such as
 * `common.en.json` or `auth-ar.ts`.
 */
export const FILE_NAME_PATTERNS = {
  /**
   * Matches ISO 639-1 language codes, optionally with a region suffix.
   *
   * @example `'en'`, `'en-US'`, `'zh-CN'`
   */
  languageCode: /^([a-z]{2}(?:-[A-Z]{2})?)/,

  /**
   * Extracts the namespace prefix before the language code or extension.
   *
   * @example `'common.en.json'` → `'common'`
   */
  namespace: /^([a-z-]+)(?:\.\|_)?/i,

  /** Matches supported translation file extensions. */
  extension: /\.(json|js|ts|tsx|jsx)$/i,
} as const;
