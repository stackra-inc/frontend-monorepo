/**
 * Configuration Validation Utility
 *
 * Validates and normalizes user-provided plugin options, merging them
 * with sensible defaults. Ensures required fields are present and
 * internally consistent before the plugin starts scanning files.
 *
 * @module utils/validate-config
 */

import { DEFAULT_PLUGIN_OPTIONS } from "@/constants";
import type { I18nPluginOptions } from "@/interfaces";

/**
 * Validate and normalize plugin options.
 *
 * Merges user options with {@link DEFAULT_PLUGIN_OPTIONS}, coerces scalar
 * values to arrays where needed, and enforces invariants such as
 * `defaultLanguage ∈ languages`.
 *
 * @param userOptions - Partial user-provided plugin options
 * @returns Fully resolved and validated options object
 * @throws {Error} If `useHttpBackend` is enabled without a `backendUrl`
 *
 * @example
 * ```typescript
 * const config = validateConfig({ languages: ['en', 'ar'] });
 * // config.defaultLanguage === 'en'
 * // config.languages === ['en', 'ar']
 * ```
 */
export function validateConfig(
  userOptions?: Partial<I18nPluginOptions>,
): Required<I18nPluginOptions> {
  const config = { ...DEFAULT_PLUGIN_OPTIONS };

  if (userOptions) {
    Object.assign(config, userOptions);
  }

  // ── Languages ────────────────────────────────────────────────────────

  if (!Array.isArray(config.languages)) {
    config.languages = config.languages ? [String(config.languages)] : ["en"];
  }

  if (config.languages.length === 0) {
    console.warn('[i18n] No languages configured, defaulting to ["en"]');
    config.languages = ["en"];
  }

  // ── Include / Exclude patterns ───────────────────────────────────────

  if (!config.include) {
    config.include = DEFAULT_PLUGIN_OPTIONS.include;
  }
  if (!Array.isArray(config.include)) {
    config.include = [config.include];
  }

  if (!config.exclude) {
    config.exclude = DEFAULT_PLUGIN_OPTIONS.exclude;
  }
  if (!Array.isArray(config.exclude)) {
    config.exclude = [config.exclude];
  }

  // ── Default language must be in the languages list ───────────────────

  if (!config.defaultLanguage) {
    config.defaultLanguage = config.languages[0] || "en";
  }

  if (!config.languages.includes(config.defaultLanguage)) {
    config.languages.push(config.defaultLanguage);
  }

  // ── HTTP backend requires a URL ──────────────────────────────────────

  if (config.useHttpBackend && !config.backendUrl) {
    throw new Error("[i18n] HTTP backend enabled but no backendUrl provided");
  }

  // ── Remaining defaults ───────────────────────────────────────────────

  if (!config.defaultNamespace) {
    config.defaultNamespace = "translation";
  }

  if (!config.typeOutputDir) {
    config.typeOutputDir = ".stackra-inc/react-i18n/types";
  }

  if (!config.resourcesPath) {
    config.resourcesPath = process.cwd();
  }

  return config as Required<I18nPluginOptions>;
}
