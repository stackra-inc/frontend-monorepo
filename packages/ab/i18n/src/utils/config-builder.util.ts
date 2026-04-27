/**
 * Config Builder Utility
 *
 * Builds a complete i18next configuration from a {@link FileMap} of
 * discovered translation files. Loads and parses each file, merges
 * the results with default and user-provided options, and returns a
 * ready-to-use {@link I18nextConfig}.
 *
 * @module utils/config-builder
 */

import { extname } from "path";
import { readFileSync } from "fs";
import { Str } from "@stackra/ts-support";

import { mergeDeep } from "./merge-deep.util";
import { DEFAULT_I18NEXT_CONFIG } from "@/constants/default-config.constant";
import type { FileMap, I18nextConfig, I18nPluginOptions, TranslationResources } from "@/interfaces";

/**
 * Build a complete i18next configuration from a file map.
 *
 * Iterates over every language/namespace entry in `fileMap`, loads the
 * corresponding translation file, and assembles the `resources` object.
 * The result is merged with {@link DEFAULT_I18NEXT_CONFIG} and any
 * user-supplied `i18nextOptions`.
 *
 * @param fileMap - Map of discovered translation files organized by language → namespace → path
 * @param options - Plugin options containing language, namespace, and backend preferences
 * @returns Complete {@link I18nextConfig} ready for `i18next.init()`
 * @throws {Error} If any translation file cannot be read or parsed
 *
 * @example
 * ```typescript
 * const fileMap = { en: { translation: '/path/to/en.json' } };
 * const config = await buildI18nextConfig(fileMap, pluginOptions);
 * i18next.init(config);
 * ```
 */
export async function buildI18nextConfig(
  fileMap: FileMap,
  options: I18nPluginOptions,
): Promise<I18nextConfig> {
  const config: I18nextConfig = JSON.parse(JSON.stringify(DEFAULT_I18NEXT_CONFIG));
  const resources: TranslationResources = {};

  // ── Apply plugin options to config ───────────────────────────────────

  if (options.defaultLanguage) {
    config.lng = options.defaultLanguage;
    config.fallbackLng = options.defaultLanguage;
  }

  if (options.languages && options.languages.length > 0) {
    config.preload = options.languages;
  }

  if (options.defaultNamespace) {
    config.defaultNS = options.defaultNamespace;
    config.ns = [options.defaultNamespace];
  }

  if (options.debug !== undefined) {
    config.debug = options.debug;
  }

  // ── Load translation files into resources ────────────────────────────

  for (const languageCode in fileMap) {
    if (Object.prototype.hasOwnProperty.call(fileMap, languageCode)) {
      resources[languageCode] = {};
      const namespaceFiles = fileMap[languageCode];

      for (const namespace in namespaceFiles) {
        if (Object.prototype.hasOwnProperty.call(namespaceFiles, namespace)) {
          const filePath = namespaceFiles[namespace];

          try {
            const translations = await loadTranslationFile(filePath || "");
            resources[languageCode][namespace] = translations;

            if (options.debug) {
              console.log(`[i18n] Loaded ${languageCode}:${namespace} from ${filePath}`);
            }
          } catch (error: Error | any) {
            console.error(`[i18n] Error loading translation file ${filePath}:`, error);
            throw error;
          }
        }
      }
    }
  }

  config.resources = resources;

  // ── Collect all unique namespaces ────────────────────────────────────

  const allNamespaces = new Set<string>();
  for (const language in resources) {
    for (const namespace in resources[language]) {
      allNamespaces.add(namespace);
    }
  }
  config.ns = Array.from(allNamespaces);

  if (config.react) {
    config.react.useSuspense = true;
  }

  // ── Merge user-provided i18next overrides ────────────────────────────

  if (options.i18nextOptions) {
    mergeDeep(config, options.i18nextOptions);
  }

  // ── HTTP backend ─────────────────────────────────────────────────────

  if (options.useHttpBackend && options.backendUrl) {
    config.backend = {
      loadPath: options.backendUrl + "/locales/{{lng}}/{{ns}}.json",
    };
  }

  // ── Browser language detector ────────────────────────────────────────

  if (options.useBrowserLanguageDetector) {
    config.detection = {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    };
  }

  if (options.debug) {
    console.log("[i18n] Final config:", JSON.stringify(config, null, 2));
  }

  return config;
}

/**
 * Load and parse a single translation file.
 *
 * Supports `.json` (parsed via `JSON.parse`), `.js`, and `.ts` files
 * (loaded via dynamic `import()`). For JS/TS files the default export
 * is expected to be the translations object.
 *
 * @param filePath - Absolute path to the translation file
 * @returns Parsed translation key-value object
 * @throws {Error} If the file cannot be read, parsed, or has an unsupported extension
 *
 * @internal
 */
async function loadTranslationFile(filePath: string): Promise<Record<string, any>> {
  const ext = Str.lower(extname(filePath));

  try {
    if (ext === ".json") {
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }

    if (ext === ".js" || ext === ".ts") {
      try {
        const module = await import(`file://${filePath}`);
        return module.default || module;
      } catch (importError) {
        // Fallback: some JS/TS files may contain JSON-compatible content
        const content = readFileSync(filePath, "utf-8");
        return JSON.parse(content);
      }
    }

    throw new Error(`Unsupported translation file format: ${ext}`);
  } catch (error: Error | any) {
    throw new Error(
      `Failed to load translation file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
