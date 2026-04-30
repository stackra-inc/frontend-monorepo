/**
 * File Scanner Utility
 *
 * Discovers translation files on the file system using `fast-glob` and
 * organizes them into a {@link FileMap} keyed by language code and namespace.
 *
 * @module utils/file-scanner
 */

import fg from 'fast-glob';
import { basename, extname } from 'path';
import { Str } from '@stackra/ts-support';

import type { FileMap, I18nPluginOptions } from '@/interfaces';

/**
 * Scan the file system for translation files.
 *
 * Uses the include/exclude glob patterns and `resourcesPath` from
 * `options` to discover files, then classifies each file by language
 * code and namespace based on its filename.
 *
 * @param options - Plugin options containing glob patterns, resource path, and language list
 * @returns Map of `{ [languageCode]: { [namespace]: absoluteFilePath } }`
 * @throws {Error} If the glob scan fails
 *
 * @example
 * ```typescript
 * const fileMap = await scanTranslationFiles(options);
 * // {
 * //   en: { translation: '/path/to/en.json', common: '/path/to/common/en.json' },
 * //   ar: { translation: '/path/to/ar.json', common: '/path/to/common/ar.json' }
 * // }
 * ```
 */
export async function scanTranslationFiles(options: I18nPluginOptions): Promise<FileMap> {
  const fileMap: FileMap = {};

  const includePatterns = Array.isArray(options.include)
    ? options.include
    : [options.include || '**/i18n/**/*.{json,js,ts}'];

  const excludePatterns = Array.isArray(options.exclude)
    ? options.exclude
    : [options.exclude || ''];

  const resourcePath = options.resourcesPath || process.cwd();

  try {
    const files = await fg.glob(includePatterns, {
      ignore: excludePatterns,
      cwd: resourcePath,
      absolute: true,
    });

    if (options.debug) {
      console.log(`[i18n] Found ${files.length} translation files`);
      files.forEach((f) => console.log(`  - ${f}`));
    }

    for (const filePath of files) {
      const fileName = basename(filePath);
      const ext = extname(fileName);
      const nameWithoutExt = fileName.slice(0, -ext.length);

      const languageCode = extractLanguageCode(nameWithoutExt, options.languages);

      if (!languageCode) {
        if (options.debug) {
          console.log(`[i18n] Skipping file (no language code): ${filePath}`);
        }
        continue;
      }

      const namespace =
        extractNamespace(nameWithoutExt, languageCode) || options.defaultNamespace || 'translation';

      if (!fileMap[languageCode]) {
        fileMap[languageCode] = {};
      }

      if (fileMap[languageCode][namespace]) {
        if (options.debug) {
          console.warn(`[i18n] Duplicate namespace '${namespace}' for language '${languageCode}'`);
        }
      }

      fileMap[languageCode][namespace] = filePath;
    }

    if (options.debug) {
      console.log('[i18n] Final file map:', JSON.stringify(fileMap, null, 2));
    }
  } catch (error: Error | any) {
    console.error('[i18n] Error scanning translation files:', error);
    throw error;
  }

  return fileMap;
}

/**
 * Extract a language code from a filename.
 *
 * Splits the filename by `.` and `-` delimiters and checks each segment
 * against the `supportedLanguages` list. When no list is provided, falls
 * back to a regex matching ISO 639-1 codes (optionally with region).
 *
 * @param fileName - Filename without extension (e.g. `'common.en'`, `'auth-ar'`)
 * @param supportedLanguages - Allowed language codes; when empty, any 2-letter code matches
 * @returns Matched language code in lowercase, or `undefined` if none found
 *
 * @internal
 */
function extractLanguageCode(fileName: string, supportedLanguages?: string[]): string | undefined {
  if (!supportedLanguages || supportedLanguages.length === 0) {
    // Match any ISO 639-1 code, optionally with a region suffix (e.g. en-US)
    const match = fileName.match(/([a-z]{2}(?:-[A-Z]{2})?)/i);
    return match?.[1] ? Str.lower(match[1]) : undefined;
  }

  const parts = fileName.split(/[.-]/);

  for (const part of parts) {
    const normalized = Str.lower(part);
    if (supportedLanguages.includes(normalized)) {
      return normalized;
    }
  }

  return undefined;
}

/**
 * Extract a namespace from a filename.
 *
 * The namespace is the portion of the filename that precedes the language
 * code. For example, `'common.en'` yields `'common'`; plain `'en'` yields
 * `undefined` (which callers default to `'translation'`).
 *
 * @param fileName - Filename without extension
 * @param languageCode - The already-identified language code
 * @returns Namespace string, or `undefined` if the filename has no prefix
 *
 * @internal
 */
function extractNamespace(fileName: string, languageCode: string): string | undefined {
  const languageIndex = Str.lower(fileName).indexOf(Str.lower(languageCode));

  if (languageIndex === -1) {
    return undefined;
  }

  const namespace = Str.trim(fileName.substring(0, languageIndex).replace(/[.-]+$/, ''));

  return namespace || undefined;
}
