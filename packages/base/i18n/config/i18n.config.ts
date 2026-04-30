/**
 * i18n Configuration
 *
 * Default configuration for the `@stackra/react-i18n` package.
 * Pass this to `I18nModule.forRoot()` or override individual values.
 *
 * ## Environment Variables
 *
 * | Variable                    | Description                        | Default              |
 * |-----------------------------|------------------------------------|----------------------|
 * | `VITE_DEFAULT_LOCALE`       | Default / fallback language code   | `'en'`               |
 * | `VITE_I18N_LANGUAGES`       | Comma-separated supported locales  | `'en'`               |
 * | `VITE_I18N_RESOLVERS`       | Comma-separated resolver chain     | `'storage,navigator'`|
 * | `VITE_I18N_QUERY_PARAM`     | Query parameter name for locale    | `'lang'`             |
 * | `VITE_I18N_STORAGE_KEY`     | localStorage key for locale        | `'i18nextLng'`       |
 * | `VITE_I18N_REQUEST_HEADER`  | Outgoing request locale header     | `'Accept-Language'`  |
 * | `VITE_I18N_RESPONSE_HEADER` | Incoming response locale header    | `'content-language'` |
 * | `VITE_I18N_SYNC_RESPONSE`   | Sync locale from API responses     | `true`               |
 * | `VITE_I18N_PERSIST_LOCALE`  | Persist response locale to storage | `true`               |
 * | `VITE_I18N_DEBUG`           | Enable debug logging               | `false`              |
 *
 * @module config/i18n
 *
 * @example
 * ```typescript
 * import i18nConfig from '@stackra/react-i18n';
 *
 * // Use as-is
 * I18nModule.forRoot(i18nConfig);
 *
 * // Or override specific values
 * I18nModule.forRoot({
 *   ...i18nConfig,
 *   languages: ['en', 'ar', 'es', 'fr'],
 * });
 * ```
 */

import type { I18nModuleOptions } from '@stackra/react-i81n';

/**
 * Default i18n configuration.
 *
 * Provides sensible defaults for most applications. Override individual
 * properties as needed when passing to `I18nModule.forRoot()`.
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
  defaultLanguage: env('VITE_DEFAULT_LOCALE', 'en'),

  /*
  |--------------------------------------------------------------------------
  | Supported Languages
  |--------------------------------------------------------------------------
  |
  | All language codes your application supports.
  | Used by resolvers to validate detected locales.
  |
  */
  languages: env('VITE_I18N_LANGUAGES', 'en')
    .split(',')
    .map((l: string) => l.trim()),

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
  resolvers: env('VITE_I18N_RESOLVERS', 'storage,navigator')
    .split(',')
    .map((r: string) => r.trim()),

  /*
  |--------------------------------------------------------------------------
  | Resolver Options
  |--------------------------------------------------------------------------
  */

  /** Query parameter name for the `query-param` resolver. */
  queryParam: env('VITE_I18N_QUERY_PARAM', 'lang'),

  /** localStorage key for persisting the selected locale. */
  storageKey: env('VITE_I18N_STORAGE_KEY', 'i18nextLng'),

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
  requestHeader: env('VITE_I18N_REQUEST_HEADER', 'Accept-Language'),

  /** Header read from API responses. */
  responseHeader: env('VITE_I18N_RESPONSE_HEADER', 'content-language'),

  /** Sync locale from API response headers back to the provider. */
  syncFromResponse: env('VITE_I18N_SYNC_RESPONSE', true),

  /** Persist response locale to storage for the accept-language resolver. */
  persistResponseLocale: env('VITE_I18N_PERSIST_LOCALE', true),

  /*
  |--------------------------------------------------------------------------
  | Debug
  |--------------------------------------------------------------------------
  |
  | When true, logs missing translation keys and resolver chain
  | activity to the console. Disable in production.
  |
  */
  debug: env('VITE_I18N_DEBUG', false),
};

export default i18nConfig;
