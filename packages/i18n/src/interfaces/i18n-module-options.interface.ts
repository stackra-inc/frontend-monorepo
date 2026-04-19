/**
 * i18n Module Options Interface
 *
 * Configuration options accepted by `I18nModule.forRoot()`.
 * Combines i18next configuration, resolver selection, and middleware
 * settings into a single options object.
 *
 * @module interfaces/i18n-module-options
 *
 * @example
 * ```typescript
 * import { I18nModule } from '@stackra/react-i18n';
 * import { TenantMode } from '@stackra/react-multitenancy';
 *
 * @Module({
 *   imports: [
 *     I18nModule.forRoot({
 *       defaultLanguage: 'en',
 *       languages: ['en', 'ar', 'es'],
 *       resolvers: ['url-path', 'storage', 'navigator'],
 *       queryParam: 'lang',
 *       storageKey: 'i18nextLng',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import type { ILocaleResolver } from '@/resolvers/locale-resolver.interface';
import type { I18nextOptions } from '@/types';

/**
 * Configuration options for `I18nModule.forRoot()`.
 *
 * Controls which locale resolvers are active, how the i18next instance
 * is configured, and how the locale middleware behaves.
 *
 * @example
 * ```typescript
 * const options: I18nModuleOptions = {
 *   defaultLanguage: 'en',
 *   languages: ['en', 'ar', 'es'],
 *   resolvers: ['url-path', 'query-param', 'storage', 'navigator'],
 *   storageKey: 'app_locale',
 *   requestHeader: 'Accept-Language',
 *   responseHeader: 'content-language',
 * };
 * ```
 */
export interface I18nModuleOptions {
  /**
   * Default language to use when no resolver returns a value.
   *
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * List of supported language codes.
   *
   * Used by resolvers (e.g. `url-path`, `navigator`) to validate
   * that a detected locale is actually supported by the application.
   *
   * @default ['en']
   *
   * @example `['en', 'ar', 'es', 'fr', 'de']`
   */
  languages?: string[];

  /**
   * Array of resolver names to activate, in priority order.
   *
   * Built-in resolvers:
   * - `'url-path'` — URL path segment (`/ar/products`)
   * - `'query-param'` — Query parameter (`?lang=ar`)
   * - `'storage'` — localStorage / sessionStorage
   * - `'accept-language'` — Stored HTTP response header
   * - `'navigator'` — Browser `navigator.language`
   *
   * @default ['storage', 'navigator']
   *
   * @example `['url-path', 'query-param', 'storage', 'navigator']`
   */
  resolvers?: string[];

  /**
   * Custom resolver instances to add to the chain.
   *
   * Keys are resolver names (used in the `resolvers` array),
   * values are {@link LocaleResolver} instances.
   *
   * @example
   * ```typescript
   * customResolvers: {
   *   'jwt': new JwtLocaleResolver(),
   *   'cookie': new CookieLocaleResolver(),
   * }
   * ```
   */
  customResolvers?: Record<string, ILocaleResolver>;

  // ── Resolver-specific options ──────────────────────────────────────

  /**
   * URL path segment index to check for locale.
   *
   * Used by the `url-path` resolver.
   *
   * @default 0 (first segment after `/`)
   */
  pathSegmentIndex?: number;

  /**
   * Query parameter name for locale detection.
   *
   * Used by the `query-param` resolver.
   *
   * @default 'lang'
   */
  queryParam?: string;

  /**
   * Storage key for persisting the locale.
   *
   * Used by the `storage` resolver and the provider's `changeLocale()`.
   *
   * @default 'i18nextLng'
   */
  storageKey?: string;

  /**
   * Custom `Storage` implementation.
   *
   * Defaults to `window.localStorage`. Pass `sessionStorage` or a
   * custom implementation for alternative persistence.
   *
   * @default localStorage
   */
  storage?: Storage;

  // ── Middleware options ────────────────────────────────────────────

  /**
   * Name of the HTTP request header to inject the locale into.
   *
   * Used by the locale middleware.
   *
   * @default 'Accept-Language'
   */
  requestHeader?: string;

  /**
   * Name of the HTTP response header to read the locale from.
   *
   * Used by the locale middleware and the `accept-language` resolver.
   *
   * @default 'content-language'
   */
  responseHeader?: string;

  /**
   * Whether the locale middleware should sync the locale from
   * API response headers back to the i18n provider.
   *
   * @default true
   */
  syncFromResponse?: boolean;

  /**
   * Whether to persist the response locale to storage for the
   * `accept-language` resolver to pick up.
   *
   * @default true
   */
  persistResponseLocale?: boolean;

  // ── i18next options ──────────────────────────────────────────────

  /**
   * Additional i18next configuration options.
   *
   * Merged with the generated configuration. Allows full customization
   * of i18next behavior (interpolation, pluralization, backends, etc.).
   */
  i18nextOptions?: Partial<I18nextOptions>;

  /**
   * Enable debug logging.
   *
   * @default false
   */
  debug?: boolean;
}
