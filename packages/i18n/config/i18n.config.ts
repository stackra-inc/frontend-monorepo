/**
 * i18n Configuration
 *
 * Default configuration for the `@stackra/react-i18n` package.
 * Pass this to `I18nModule.forRoot()` or override individual values.
 *
 * Follows the same pattern as `logger.config.ts` and `settings.config.ts`
 * in the monorepo.
 *
 * @module config/i18n
 *
 * @example
 * ```typescript
 * import i18nConfig from '@stackra/react-i81n';
 *
 * // Use as-is
 * I18nModule.forRoot(i18nConfig);
 *
 * // Or override specific values
 * I18nModule.forRoot({
 *   ...i18nConfig,
 *   languages: ['en', 'ar', 'es', 'fr'],
 *   resolvers: ['url-path', 'storage', 'navigator'],
 * });
 * ```
 */

import type { I18nModuleOptions } from '@stackra/react-i81n';

/**
 * Default i18n configuration.
 *
 * Provides sensible defaults for most applications. Override individual
 * properties as needed when passing to `I18nModule.forRoot()`.
 *
 * ## Environment Variables
 *
 * | Variable              | Description                    | Default   |
 * |-----------------------|--------------------------------|-----------|
 * | `VITE_DEFAULT_LOCALE` | Default language code          | `'en'`    |
 * | `VITE_I18N_DEBUG`     | Enable debug logging           | `false`   |
 */
const i18nConfig: I18nModuleOptions = {
  /*
  |--------------------------------------------------------------------------
  | Default Language
  |--------------------------------------------------------------------------
  |
  | The language used when no resolver returns a value.
  | This is also the fallback language for i18next.
  |
  */
  defaultLanguage: 'en',

  /*
  |--------------------------------------------------------------------------
  | Supported Languages
  |--------------------------------------------------------------------------
  |
  | All language codes your application supports.
  | Used by resolvers to validate detected locales.
  |
  */
  languages: ['en'],

  /*
  |--------------------------------------------------------------------------
  | Locale Resolvers
  |--------------------------------------------------------------------------
  |
  | Resolvers are tried in order until one returns a locale.
  | Built-in: 'url-path', 'query-param', 'storage', 'accept-language', 'navigator'
  |
  | Default: storage (localStorage) → navigator (browser language)
  |
  */
  resolvers: ['storage', 'navigator'],

  /*
  |--------------------------------------------------------------------------
  | Resolver Options
  |--------------------------------------------------------------------------
  */

  /** Query parameter name for the `query-param` resolver. */
  queryParam: 'lang',

  /** localStorage key for persisting the selected locale. */
  storageKey: 'i18nextLng',

  /*
  |--------------------------------------------------------------------------
  | HTTP Middleware Options
  |--------------------------------------------------------------------------
  |
  | Controls how the LocaleMiddleware injects and reads locale headers
  | on HTTP requests/responses via @stackra/ts-http.
  |
  */

  /** Header injected on outgoing requests. */
  requestHeader: 'Accept-Language',

  /** Header read from API responses. */
  responseHeader: 'content-language',

  /** Sync locale from API response headers back to the provider. */
  syncFromResponse: true,

  /** Persist response locale to storage for the accept-language resolver. */
  persistResponseLocale: true,

  /*
  |--------------------------------------------------------------------------
  | Debug
  |--------------------------------------------------------------------------
  */
  debug: false,
};

export default i18nConfig;
