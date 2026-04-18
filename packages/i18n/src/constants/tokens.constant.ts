/**
 * DI Tokens for @stackra/react-i18n
 *
 * Symbols used as service identifiers for dependency injection.
 * Follows the same pattern as `@stackra/ts-http` and
 * `@stackra/react-multitenancy`.
 *
 * Core:
 *   `I18N_CONFIG` — the merged i18n module configuration
 *   `I18NEXT_SERVICE` — the framework-agnostic i18n provider instance
 *   `LOCALE_RESOLVER_CHAIN` — the composed locale resolver chain function
 *
 * Resolvers:
 *   `URL_PATH_LOCALE_RESOLVER`, `QUERY_PARAM_LOCALE_RESOLVER`,
 *   `STORAGE_LOCALE_RESOLVER`, `NAVIGATOR_LOCALE_RESOLVER`,
 *   `ACCEPT_LANGUAGE_LOCALE_RESOLVER`
 *
 * @module constants/tokens
 *
 * @example
 * ```typescript
 * import { Inject } from '@stackra/ts-container';
 * import { I18NEXT_SERVICE, I18N_CONFIG } from '@stackra/react-i18n';
 *
 * @Injectable()
 * class MyService {
 *   constructor(
 *     @Inject(I18NEXT_SERVICE) private i18n: I18nProvider,
 *     @Inject(I18N_CONFIG) private config: I18nModuleOptions,
 *   ) {}
 * }
 * ```
 */

// ── Service Token ──────────────────────────────────────────────────────────

/**
 * Injection token for the {@link I18nService}.
 *
 * Resolves to the main `@Injectable()` i18n service that provides
 * translation, locale management, resolution, and event subscription.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class NotificationService {
 *   constructor(@Inject(I18N_SERVICE) private i18n: II18nService) {
 *     const text = this.i18n.t('notification.success');
 *   }
 * }
 * ```
 */
export const I18N_SERVICE = Symbol.for('I18N_SERVICE');

// ── Core Tokens ────────────────────────────────────────────────────────────

/**
 * Injection token for the i18n module configuration.
 *
 * Resolves to the merged {@link I18nModuleOptions} provided via
 * `I18nModule.forRoot()`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class LocaleService {
 *   constructor(@Inject(I18N_CONFIG) private config: I18nModuleOptions) {}
 * }
 * ```
 */
export const I18N_CONFIG = Symbol.for('I18N_CONFIG');

/**
 * Injection token for the i18n provider instance.
 *
 * Resolves to the {@link I18nProvider} created by the module.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class TranslationService {
 *   constructor(@Inject(I18NEXT_SERVICE) private i18n: I18nProvider) {
 *     const text = this.i18n.translate('greeting');
 *   }
 * }
 * ```
 */
export const I18NEXT_SERVICE = Symbol.for('I18NEXT_SERVICE');

/**
 * Injection token for the composed locale resolver chain.
 *
 * Resolves to an async function `() => Promise<string | undefined>`
 * that executes all configured resolvers in priority order.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class LocaleDetector {
 *   constructor(@Inject(LOCALE_RESOLVER_CHAIN) private resolveLocale: () => Promise<string | undefined>) {}
 *
 *   async detect(): Promise<string> {
 *     return (await this.resolveLocale()) ?? 'en';
 *   }
 * }
 * ```
 */
export const LOCALE_RESOLVER_CHAIN = Symbol.for('LOCALE_RESOLVER_CHAIN');

// ── Resolver Tokens ────────────────────────────────────────────────────────

/** Injection token for the {@link UrlPathLocaleResolver}. */
export const URL_PATH_LOCALE_RESOLVER = Symbol.for('URL_PATH_LOCALE_RESOLVER');

/** Injection token for the {@link QueryParamLocaleResolver}. */
export const QUERY_PARAM_LOCALE_RESOLVER = Symbol.for('QUERY_PARAM_LOCALE_RESOLVER');

/** Injection token for the {@link StorageLocaleResolver}. */
export const STORAGE_LOCALE_RESOLVER = Symbol.for('STORAGE_LOCALE_RESOLVER');

/** Injection token for the {@link NavigatorLocaleResolver}. */
export const NAVIGATOR_LOCALE_RESOLVER = Symbol.for('NAVIGATOR_LOCALE_RESOLVER');

/** Injection token for the {@link AcceptLanguageLocaleResolver}. */
export const ACCEPT_LANGUAGE_LOCALE_RESOLVER = Symbol.for('ACCEPT_LANGUAGE_LOCALE_RESOLVER');
