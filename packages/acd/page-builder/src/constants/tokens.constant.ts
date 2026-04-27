/**
 * @fileoverview DI Tokens for @stackra/react-page-builder
 *
 * All Symbol.for() injection tokens used by the page builder module.
 * Every token is defined here — never inline — following the @stackra
 * convention of centralized token definitions.
 *
 * |--------------------------------------------------------------------------
 * | Injection tokens and metadata keys.
 * |--------------------------------------------------------------------------
 *
 * @module @stackra/react-page-builder
 * @category Constants
 */

/** Injection token for the PageBuilderConfig configuration object. */
export const PAGE_BUILDER_CONFIG = Symbol.for("PAGE_BUILDER_CONFIG");

/** Injection token for the PageBuilderManager singleton. */
export const PAGE_BUILDER_MANAGER = Symbol.for("PAGE_BUILDER_MANAGER");

/** Injection token for the ComponentRegistry singleton. */
export const PAGE_BUILDER_COMPONENT_REGISTRY = Symbol.for("PAGE_BUILDER_COMPONENT_REGISTRY");

/** Injection token for the TemplateRegistry singleton. */
export const PAGE_BUILDER_TEMPLATE_REGISTRY = Symbol.for("PAGE_BUILDER_TEMPLATE_REGISTRY");

/** Injection token for the HistoryManager singleton. */
export const PAGE_BUILDER_HISTORY_MANAGER = Symbol.for("PAGE_BUILDER_HISTORY_MANAGER");

/** Injection token for the PageJsonSerializer singleton. */
export const PAGE_BUILDER_SERIALIZER = Symbol.for("PAGE_BUILDER_SERIALIZER");

/**
 * Internal token used to pass component metadata arrays from `forFeature()`
 * into a factory provider that registers them on the ComponentRegistry.
 * @internal
 */
export const PAGE_BUILDER_FEATURE_COMPONENTS = Symbol.for("PAGE_BUILDER_FEATURE_COMPONENTS");

/**
 * Internal token used to pass template arrays from `forFeature()`
 * into a factory provider that registers them on the TemplateRegistry.
 * @internal
 */
export const PAGE_BUILDER_FEATURE_TEMPLATES = Symbol.for("PAGE_BUILDER_FEATURE_TEMPLATES");
