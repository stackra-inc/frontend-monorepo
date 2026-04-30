/**
 * i18n Module
 *
 * DI module for `@stackra/react-i18n`.
 *
 * Registers:
 * - `I18N_CONFIG` — the merged module configuration
 * - `I18NEXT_SERVICE` — the framework-agnostic i18n provider
 * - `LOCALE_RESOLVER_CHAIN` — the composed resolver chain function
 * - All 5 locale resolvers via Symbol tokens
 * - `LocaleMiddleware` — HTTP middleware for locale header injection
 *
 * Follows the same pattern as `HttpModule`, `MultiTenancyModule`,
 * `CacheModule`, and `EventsModule`.
 *
 * @module i18n.module
 *
 * @example
 * ```typescript
 * import { Module } from '@stackra/ts-container';
 * import { I18nModule } from '@stackra/react-i18n';
 *
 * @Module({
 *   imports: [
 *     I18nModule.forRoot({
 *       defaultLanguage: 'en',
 *       languages: ['en', 'ar', 'es'],
 *       resolvers: ['url-path', 'storage', 'navigator'],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // With custom resolvers and middleware options:
 * @Module({
 *   imports: [
 *     I18nModule.forRoot({
 *       defaultLanguage: 'en',
 *       languages: ['en', 'ar'],
 *       resolvers: ['jwt', 'url-path', 'storage', 'navigator'],
 *       customResolvers: {
 *         jwt: new JwtLocaleResolver(),
 *       },
 *       requestHeader: 'X-Locale',
 *       responseHeader: 'X-Locale',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import type { I18nModuleOptions } from '@/interfaces/i18n-module-options.interface';
import {
  I18N_CONFIG,
  I18N_SERVICE,
  I18NEXT_SERVICE,
  LOCALE_RESOLVER_CHAIN,
  URL_PATH_LOCALE_RESOLVER,
  QUERY_PARAM_LOCALE_RESOLVER,
  STORAGE_LOCALE_RESOLVER,
  NAVIGATOR_LOCALE_RESOLVER,
  ACCEPT_LANGUAGE_LOCALE_RESOLVER,
} from '@/constants';
import {
  UrlPathLocaleResolver,
  QueryParamLocaleResolver,
  StorageLocaleResolver,
  NavigatorLocaleResolver,
  AcceptLanguageLocaleResolver,
} from '@/resolvers';
import { createLocaleResolverChain } from '@/utils/create-locale-resolver-chain.util';
import { I18nextService } from '@/services/i18next.service';
import { I18nService } from '@/services/i18n.service';
import { LocaleMiddleware } from '@/middleware/locale.middleware';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class I18nModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Configure the i18n module at the root level.
  | Registers all core services as global singletons.
  |
  */

  /**
   * Configure the i18n module at the root level.
   *
   * Merges user options with sensible defaults, creates resolver
   * factory providers, builds the resolver chain, and registers
   * the i18n provider and locale middleware.
   *
   * @param options - Partial module configuration (merged with defaults)
   * @returns A dynamic module with global providers
   *
   * @example
   * ```typescript
   * I18nModule.forRoot({
   *   defaultLanguage: 'en',
   *   languages: ['en', 'ar', 'es'],
   *   resolvers: ['url-path', 'query-param', 'storage', 'navigator'],
   * })
   * ```
   */
  static forRoot(options: Partial<I18nModuleOptions> = {}): DynamicModule {
    /*
    |--------------------------------------------------------------------------
    | Merge with defaults
    |--------------------------------------------------------------------------
    */
    const mergedConfig: I18nModuleOptions = {
      defaultLanguage: 'en',
      languages: ['en'],
      resolvers: ['storage', 'navigator'],
      queryParam: 'lang',
      storageKey: 'i18nextLng',
      requestHeader: 'Accept-Language',
      responseHeader: 'content-language',
      syncFromResponse: true,
      persistResponseLocale: true,
      debug: false,
      ...options,
    };

    /*
    |--------------------------------------------------------------------------
    | Resolver factory providers
    |--------------------------------------------------------------------------
    |
    | Each resolver is a plain class that receives config in its constructor.
    | Registered via Symbol tokens for type safety.
    | Mirrors the multitenancy module pattern.
    |
    */
    const resolverProviders = [
      {
        provide: URL_PATH_LOCALE_RESOLVER,
        useFactory: (config: I18nModuleOptions) =>
          new UrlPathLocaleResolver({
            languages: config.languages,
            segmentIndex: config.pathSegmentIndex,
          }),
        inject: [I18N_CONFIG],
      },
      {
        provide: QUERY_PARAM_LOCALE_RESOLVER,
        useFactory: (config: I18nModuleOptions) =>
          new QueryParamLocaleResolver({
            paramName: config.queryParam,
          }),
        inject: [I18N_CONFIG],
      },
      {
        provide: STORAGE_LOCALE_RESOLVER,
        useFactory: (config: I18nModuleOptions) =>
          new StorageLocaleResolver({
            storageKey: config.storageKey,
            storage: config.storage,
          }),
        inject: [I18N_CONFIG],
      },
      {
        provide: NAVIGATOR_LOCALE_RESOLVER,
        useFactory: (config: I18nModuleOptions) =>
          new NavigatorLocaleResolver({
            supportedLanguages: config.languages,
          }),
        inject: [I18N_CONFIG],
      },
      {
        provide: ACCEPT_LANGUAGE_LOCALE_RESOLVER,
        useFactory: (config: I18nModuleOptions) =>
          new AcceptLanguageLocaleResolver({
            headerName: config.responseHeader,
            storage: config.storage,
          }),
        inject: [I18N_CONFIG],
      },
    ];

    /*
    |--------------------------------------------------------------------------
    | Resolver chain factory
    |--------------------------------------------------------------------------
    |
    | Builds the resolver chain from the configured resolver names.
    | Maps names to resolver instances via their DI tokens.
    |
    */
    const resolverChainProvider = {
      provide: LOCALE_RESOLVER_CHAIN,
      useFactory: (
        config: I18nModuleOptions,
        urlPath: UrlPathLocaleResolver,
        queryParam: QueryParamLocaleResolver,
        storage: StorageLocaleResolver,
        navigator: NavigatorLocaleResolver,
        acceptLanguage: AcceptLanguageLocaleResolver
      ) => {
        // Map resolver names to instances
        const resolverMap: Record<string, any> = {
          'url-path': urlPath,
          'query-param': queryParam,
          storage: storage,
          navigator: navigator,
          'accept-language': acceptLanguage,
          // Merge custom resolvers from config
          ...(config.customResolvers ?? {}),
        };

        // Build active resolver array from configured names
        const resolverNames = config.resolvers ?? ['storage', 'navigator'];
        const activeResolvers = resolverNames.map((name) => resolverMap[name]).filter(Boolean);

        if (activeResolvers.length === 0) {
          console.warn('[i18n] No valid resolvers configured, falling back to navigator');
          activeResolvers.push(navigator);
        }

        return createLocaleResolverChain(activeResolvers);
      },
      inject: [
        I18N_CONFIG,
        URL_PATH_LOCALE_RESOLVER,
        QUERY_PARAM_LOCALE_RESOLVER,
        STORAGE_LOCALE_RESOLVER,
        NAVIGATOR_LOCALE_RESOLVER,
        ACCEPT_LANGUAGE_LOCALE_RESOLVER,
      ],
    };

    /*
    |--------------------------------------------------------------------------
    | i18n Provider factory
    |--------------------------------------------------------------------------
    |
    | Creates the I18nProvider from the merged config.
    |
    */
    const i18nProviderFactory = {
      provide: I18NEXT_SERVICE,
      useFactory: (config: I18nModuleOptions) => {
        const defaultLang = config.defaultLanguage ?? 'en';
        const languages = config.languages ?? [defaultLang];

        const i18nextConfig = {
          lng: defaultLang,
          fallbackLng: defaultLang,
          preload: languages,
          ns: ['translation'],
          defaultNS: 'translation',
          debug: config.debug ?? false,
          interpolation: { escapeValue: false },
          ...config.i18nextOptions,
        };

        return new I18nextService(i18nextConfig);
      },
      inject: [I18N_CONFIG],
    };

    return {
      module: I18nModule,
      global: true,
      providers: [
        // Configuration
        { provide: I18N_CONFIG, useValue: mergedConfig },

        // Resolvers
        ...resolverProviders,

        // Resolver chain
        resolverChainProvider,

        // Provider (low-level i18next wrapper)
        i18nProviderFactory,

        // Service (high-level @Injectable service wrapping provider + resolvers)
        { provide: I18nService, useClass: I18nService },
        { provide: I18N_SERVICE, useExisting: I18nService },

        // Middleware (auto-discovered by HttpModule via @HttpMiddleware decorator)
        LocaleMiddleware,
      ],
      exports: [
        I18N_CONFIG,
        I18N_SERVICE,
        I18NEXT_SERVICE,
        LOCALE_RESOLVER_CHAIN,
        I18nService,
        URL_PATH_LOCALE_RESOLVER,
        QUERY_PARAM_LOCALE_RESOLVER,
        STORAGE_LOCALE_RESOLVER,
        NAVIGATOR_LOCALE_RESOLVER,
        ACCEPT_LANGUAGE_LOCALE_RESOLVER,
        LocaleMiddleware,
      ],
    };
  }
}
