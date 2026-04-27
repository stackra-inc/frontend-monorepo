/**
 * Types Barrel Export
 *
 * Centralized entry point for all type definitions used across the i18n plugin.
 *
 * - {@link LanguageCode} — Branded type for ISO 639-1 language codes
 * - {@link I18nextOptions} — Comprehensive i18next initialization options
 * - {@link TranslationKey} — Branded type for dot-notation translation keys
 * - {@link TranslationNamespace} — Branded type for namespace identifiers
 * - {@link ResourceType} — Union type for translation values (string, object, array)
 * - {@link ResourceObject} — Nested key-value map of translation resources
 *
 * @module types
 */

export type { LanguageCode } from "./language-code.type";
export { createLanguageCode } from "./language-code.type";
export type { I18nextOptions } from "./i18next-options.type";
export type { TranslationKey } from "./translation-key.type";
export { createTranslationKey } from "./translation-key.type";
export { createNamespace } from "./translation-namespace.type";
export type { TranslationNamespace } from "./translation-namespace.type";
export type { ResourceType, ResourceObject } from "./resource-type.type";
