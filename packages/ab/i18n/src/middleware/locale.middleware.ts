/**
 * Locale Middleware for HTTP Pipeline
 *
 * Integrates with the `@stackra/ts-http` middleware pipeline to:
 * 1. Inject the current locale as an `Accept-Language` header on every
 *    outgoing HTTP request.
 * 2. Optionally read the `Content-Language` (or custom) header from the
 *    API response and sync it back to the i18n provider.
 * 3. Optionally persist the response locale to storage for the
 *    {@link AcceptLanguageLocaleResolver} to pick up.
 *
 * Requests can opt out by setting `meta.skipLocale: true` in the
 * request config.
 *
 * Uses the `@HttpMiddleware()` decorator from `@stackra/ts-http`
 * for automatic discovery and registration in the middleware pipeline.
 *
 * ## Pipeline Position
 *
 * ```
 * Request → AuthMiddleware(10) → LocaleMiddleware(15) → ... → axios → Response
 *                                  ↑ injects Accept-Language
 *                                  ↓ reads Content-Language from response
 * ```
 *
 * @module middleware/locale
 *
 * @example
 * ```typescript
 * // Registered automatically via I18nModule.forRoot()
 * // Or manually:
 * import { LocaleMiddleware } from '@stackra/react-i18n';
 * import { I18N_CONFIG, I18NEXT_SERVICE } from '@stackra/react-i18n';
 *
 * @Module({
 *   providers: [LocaleMiddleware],
 * })
 * export class AppModule {}
 * ```
 */

import { Injectable, Inject } from "@stackra/ts-container";
import { HttpMiddleware } from "@stackra/ts-http";

import { I18N_CONFIG, I18NEXT_SERVICE } from "@/constants";
import type { II18nextService } from "@/interfaces/i18next-service.interface";
import type { I18nModuleOptions } from "@/interfaces/i18n-module-options.interface";
import type { HttpContext } from "@/interfaces/http-context.interface";
import type { HttpResponse } from "@/interfaces/http-response.interface";
import type { IHttpMiddleware, HttpNextFunction } from "@/interfaces/http-middleware.interface";

/**
 * Locale Middleware
 *
 * Priority 15 — runs after auth (10) but before most other middleware,
 * ensuring the locale header is present for downstream processing.
 *
 * Automatically discovered by the `HttpModule` via the `@HttpMiddleware()`
 * decorator and registered in the {@link MiddlewareRegistry}.
 */
@HttpMiddleware({ priority: 15, name: "locale" })
@Injectable()
export class LocaleMiddleware implements IHttpMiddleware {
  /*
  |--------------------------------------------------------------------------
  | Configuration
  |--------------------------------------------------------------------------
  */

  /**
   * Request header name to inject the locale into.
   *
   * @internal
   */
  private readonly requestHeader: string;

  /**
   * Response header name to read the locale from.
   *
   * @internal
   */
  private readonly responseHeader: string;

  /**
   * Whether to sync locale from response headers.
   *
   * @internal
   */
  private readonly syncFromResponse: boolean;

  /**
   * Whether to persist response locale to storage.
   *
   * @internal
   */
  private readonly persistResponseLocale: boolean;

  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  /**
   * @param provider - The i18n provider instance (injected via `I18NEXT_SERVICE`)
   * @param config - The i18n module configuration (injected via `I18N_CONFIG`)
   */
  constructor(
    @Inject(I18NEXT_SERVICE) private readonly i18nextService: II18nextService,
    @Inject(I18N_CONFIG) config: I18nModuleOptions,
  ) {
    this.requestHeader = config.requestHeader ?? "Accept-Language";
    this.responseHeader = config.responseHeader ?? "content-language";
    this.syncFromResponse = config.syncFromResponse ?? true;
    this.persistResponseLocale = config.persistResponseLocale ?? true;
  }

  /*
  |--------------------------------------------------------------------------
  | handle
  |--------------------------------------------------------------------------
  |
  | 1. Check if locale injection should be skipped (meta.skipLocale).
  | 2. Inject the current locale into the request header.
  | 3. Pass the request downstream via next().
  | 4. Optionally read the response header and sync back.
  |
  */

  /**
   * Inject locale header and optionally sync from response.
   *
   * @param context - The HTTP context flowing through the pipeline
   * @param next - The next middleware in the chain
   * @returns The HTTP response from downstream
   */
  async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
    // Allow requests to opt out of locale injection
    if (context.request.meta?.skipLocale) {
      return next(context);
    }

    // ── Inject locale into request header ────────────────────────────

    const currentLocale = this.i18nextService.getLocale();

    context.request.headers = {
      ...context.request.headers,
      [this.requestHeader]: currentLocale,
    };

    // Store locale in metadata for other middleware to read
    context.metadata.set("locale", currentLocale);

    // ── Execute downstream middleware and get response ────────────────

    const response = await next(context);

    // ── Sync locale from response header ─────────────────────────────

    if (this.syncFromResponse && response.headers) {
      const responseLocale = response.headers[this.responseHeader];

      if (responseLocale && responseLocale !== currentLocale) {
        // Sync back to the i18n provider
        await this.i18nextService.changeLocale(responseLocale);

        // Persist for the AcceptLanguageLocaleResolver to pick up
        if (this.persistResponseLocale) {
          this.persistLocaleHeader(responseLocale);
        }
      }
    }

    return response;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — persistLocaleHeader
  |--------------------------------------------------------------------------
  */

  /**
   * Persist the response locale to localStorage.
   *
   * Stores under the key `i18n-header-{headerName}` so the
   * {@link AcceptLanguageLocaleResolver} can read it.
   *
   * @param locale - The locale code to persist
   *
   * @internal
   */
  private persistLocaleHeader(locale: string): void {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      const key = `i18n-header-${this.responseHeader}`;
      localStorage.setItem(key, locale);
    } catch (error) {
      // Storage access can fail in private browsing mode
      console.warn("[i18n] Failed to persist response locale to storage:", error);
    }
  }
}
