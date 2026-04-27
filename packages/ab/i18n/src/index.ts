/**
 * @stackra/react-i18n — Comprehensive i18n System with i18next
 *
 * Full-fledged internationalization package providing:
 * - DI module (`I18nModule.forRoot()`) with `@stackra/ts-container`
 * - Services (`I18nextService` for i18next, `I18nService` for high-level API)
 * - React context (`<I18nProvider>`) and hooks (`useLocale`, `useTranslation`, `useChangeLocale`)
 * - Locale resolver chain (URL path, query param, storage, navigator, HTTP header)
 * - HTTP middleware (`LocaleMiddleware`) for `@stackra/ts-http` pipeline
 * - Vite plugin (`i18nPlugin`) for build-time translation scanning
 *
 * @module @stackra/react-i18n
 */

// ============================================================================
// Module
// ============================================================================

export { I18nModule } from "./i18n.module";

// ============================================================================
// Services
// ============================================================================

export { I18nextService } from "./services/i18next.service";
export { I18nService } from "./services/i18n.service";

// ============================================================================
// Contexts
// ============================================================================
// Contexts
// ============================================================================

export { I18nContext, useI18nContext } from "./contexts";

// ============================================================================
// Providers (React)
// ============================================================================

export { I18nProvider } from "./providers";
export type { I18nProviderProps } from "./providers";

// ============================================================================
// Hooks
// ============================================================================

export { useLocale, useTranslation, useChangeLocale } from "./hooks";

export type {
  UseLocaleReturn,
  UseTranslationReturn,
  UseChangeLocaleOptions,
  UseChangeLocaleReturn,
} from "./hooks";

// ============================================================================
// Interfaces
// ============================================================================

export type {
  II18nextService,
  II18nService,
  II18nContext,
  FileMap,
  LanguageFiles,
  I18nextConfig,
  I18nPluginOptions,
  I18nModuleOptions,
  NamespaceResources,
  TranslationResources,
  HttpContext,
  HttpResponse,
  IHttpMiddleware,
  HttpNextFunction,
} from "./interfaces";

export type { ILocaleResolver } from "./resolvers/locale-resolver.interface";

// ============================================================================
// Types
// ============================================================================

export type {
  LanguageCode,
  ResourceType,
  I18nextOptions,
  TranslationKey,
  ResourceObject,
  TranslationNamespace,
} from "./types";

export { createLanguageCode, createNamespace, createTranslationKey } from "./types";

// ============================================================================
// Enums
// ============================================================================

export { LocaleResolverPriority } from "./enums";

// ============================================================================
// Constants & DI Tokens
// ============================================================================

export {
  FILE_NAME_PATTERNS,
  DEFAULT_PLUGIN_OPTIONS,
  DEFAULT_I18NEXT_CONFIG,
  TRANSLATION_FILE_PATTERNS,
  TRANSLATION_FILE_EXTENSIONS,
  I18N_CONFIG,
  I18N_SERVICE,
  I18NEXT_SERVICE,
  LOCALE_RESOLVER_CHAIN,
  URL_PATH_LOCALE_RESOLVER,
  QUERY_PARAM_LOCALE_RESOLVER,
  STORAGE_LOCALE_RESOLVER,
  NAVIGATOR_LOCALE_RESOLVER,
  ACCEPT_LANGUAGE_LOCALE_RESOLVER,
} from "./constants";

// ============================================================================
// Standalone Utilities (non-DI)
// ============================================================================

export {
  __,
  t,
  trans,
  changeLanguage,
  getLanguage,
  getLanguages,
  addResources,
  setupGlobalI18n,
  teardownGlobalI18n,
  mergeDeep,
  deepClone,
  scanTranslationFiles,
  buildI18nextConfig,
  resolvePath,
  normalizePaths,
  validateConfig,
  generateVirtualModule,
  generateTypeDefinitions,
  createLocaleResolverChain,
} from "./utils";

// ============================================================================
// Resolvers
// ============================================================================

export {
  UrlPathLocaleResolver,
  QueryParamLocaleResolver,
  StorageLocaleResolver,
  NavigatorLocaleResolver,
  AcceptLanguageLocaleResolver,
} from "./resolvers/index";

export type {
  UrlPathLocaleResolverOptions,
  QueryParamLocaleResolverOptions,
  StorageLocaleResolverOptions,
  NavigatorLocaleResolverOptions,
  AcceptLanguageLocaleResolverOptions,
} from "./resolvers/index";

// ============================================================================
// Middleware
// ============================================================================

export { LocaleMiddleware } from "./middleware";

// ============================================================================
// Adapters
// ============================================================================

export { i18nPlugin } from "./adapters";
