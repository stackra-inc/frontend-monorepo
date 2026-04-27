/**
 * Query Parameter Locale Resolver
 *
 * Extracts the locale from a URL query parameter.
 * For example, `?lang=ar` → `'ar'`, `?locale=en-US` → `'en-US'`.
 *
 * The parameter name is configurable (default: `'lang'`).
 *
 * SSR-safe: returns `undefined` when `window` is not available.
 *
 * @module resolvers/query-param
 *
 * @example
 * ```typescript
 * import { QueryParamLocaleResolver } from '@stackra/react-i18n';
 *
 * // Default parameter name ('lang')
 * const resolver = new QueryParamLocaleResolver();
 *
 * // Custom parameter name
 * const resolver = new QueryParamLocaleResolver({ paramName: 'locale' });
 *
 * // URL: /products?lang=ar
 * resolver.resolve(); // 'ar'
 *
 * // URL: /products (no query param)
 * resolver.resolve(); // undefined
 * ```
 *
 * @remarks
 * - Priority: HIGH (2)
 * - Performance: ~0ms (URLSearchParams parsing)
 * - SSR-safe: returns `undefined` when `window` is not available
 */

import { LocaleResolverPriority } from "@/enums";
import type { ILocaleResolver } from "./locale-resolver.interface";

/**
 * Configuration options for {@link QueryParamLocaleResolver}.
 */
export interface QueryParamLocaleResolverOptions {
  /**
   * Name of the query parameter to read the locale from.
   *
   * @default 'lang'
   *
   * @example `'lang'`, `'locale'`, `'lng'`, `'language'`
   */
  paramName?: string;
}

/**
 * Resolver that extracts locale from a URL query parameter.
 *
 * @example
 * ```typescript
 * const resolver = new QueryParamLocaleResolver({ paramName: 'locale' });
 * // URL: /products?locale=ar → 'ar'
 * // URL: /products           → undefined
 * ```
 */
export class QueryParamLocaleResolver implements ILocaleResolver {
  /** @inheritdoc */
  public readonly name = "query-param";

  /** @inheritdoc */
  public readonly priority = LocaleResolverPriority.HIGH;

  /**
   * Query parameter name to extract locale from.
   *
   * @internal
   */
  private readonly paramName: string;

  /**
   * Create a new query parameter locale resolver.
   *
   * @param options - Optional configuration for the parameter name
   */
  constructor(options?: QueryParamLocaleResolverOptions) {
    this.paramName = options?.paramName ?? "lang";
  }

  /**
   * Resolve locale from the URL query parameter.
   *
   * @returns Locale code from the query string, or `undefined` if not found or SSR
   */
  public resolve(): string | undefined {
    // SSR guard
    if (typeof window === "undefined") {
      return undefined;
    }

    const params = new URLSearchParams(window.location.search);
    const value = params.get(this.paramName);

    // Return value or undefined (not null)
    return value || undefined;
  }
}
