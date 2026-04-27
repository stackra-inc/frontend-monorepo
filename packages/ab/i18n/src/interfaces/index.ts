/**
 * Interfaces Barrel Export
 *
 * Centralized entry point for all interface definitions used across the i18n plugin.
 *
 * - {@link II18nextService} — Framework-agnostic i18next service contract
 * - {@link II18nService} — Main injectable i18n service contract
 * - {@link II18nContext} — React context value shape
 * - {@link FileMap} — Maps discovered translation files by language and namespace
 * - {@link LanguageFiles} — Namespace-to-file-path mapping for a single language
 * - {@link I18nextConfig} — Complete i18next initialization configuration
 * - {@link I18nPluginOptions} — Vite plugin configuration options
 * - {@link I18nModuleOptions} — DI module configuration options
 * - {@link NamespaceResources} — Namespace-keyed translation key-value pairs
 * - {@link TranslationResources} — Language-keyed collection of namespace resources
 * - {@link HttpContext}, {@link HttpResponse}, {@link IHttpMiddleware} — HTTP pipeline contracts
 *
 * @module interfaces
 */

export type { II18nextService } from "./i18next-service.interface";
export type { II18nService } from "./i18n-service.interface";
export type { II18nContext } from "./i18n-context.interface";
export type { FileMap } from "./file-map.interface";
export type { LanguageFiles } from "./language-files.interface";
export type { I18nextConfig } from "./i18next-config.interface";
export type { I18nPluginOptions } from "./i18n-plugin-options.interface";
export type { I18nModuleOptions } from "./i18n-module-options.interface";
export type { NamespaceResources } from "./namespace-resources.interface";
export type { TranslationResources } from "./translation-resources.interface";
export type { HttpContext } from "./http-context.interface";
export type { HttpResponse } from "./http-response.interface";
export type { IHttpMiddleware, HttpNextFunction } from "./http-middleware.interface";
