/**
 * Accept-Language Header Locale Resolver
 *
 * Reads the locale from an HTTP response header (typically `Content-Language`
 * or a custom header). This resolver is designed for API-driven locale
 * detection where the server communicates the active locale via response headers.
 *
 * Unlike other resolvers that read from the browser environment, this one
 * reads from a stored header value that was captured by the
 * {@link LocaleMiddleware} during the last HTTP response.
 *
 * SSR-safe: returns `undefined` when storage is not available.
 *
 * @module resolvers/accept-language
 *
 * @example
 * ```typescript
 * import { AcceptLanguageLocaleResolver } from '@stackra/react-i18n';
 *
 * // Default header name ('Content-Language')
 * const resolver = new AcceptLanguageLocaleResolver();
 *
 * // Custom header name
 * const resolver = new AcceptLanguageLocaleResolver({
 *   headerName: 'X-Locale',
 * });
 * ```
 *
 * @remarks
 * - Priority: LOW (4)
 * - Performance: ~0ms (localStorage read)
 * - SSR-safe: returns `undefined` when storage is not available
 * - Storage key format: `i18n-header-{headerName}`
 * - Designed to work with {@link LocaleMiddleware}
 */

import { LocaleResolverPriority } from '@/enums';
import type { ILocaleResolver } from './locale-resolver.interface';

/**
 * Configuration options for {@link AcceptLanguageLocaleResolver}.
 */
export interface AcceptLanguageLocaleResolverOptions {
  /**
   * Name of the HTTP response header that carries the locale.
   *
   * The resolver reads the stored value from localStorage using the key
   * `i18n-header-{headerName}`.
   *
   * @default 'Content-Language'
   */
  headerName?: string;

  /**
   * Storage implementation to use.
   *
   * @default localStorage
   */
  storage?: Storage;
}

/**
 * Resolver that reads locale from a stored HTTP response header value.
 *
 * The {@link LocaleMiddleware} captures the response header and stores
 * it in localStorage. This resolver reads that stored value.
 *
 * @example
 * ```typescript
 * const resolver = new AcceptLanguageLocaleResolver({ headerName: 'X-Locale' });
 * // localStorage.getItem('i18n-header-X-Locale') === 'ar' → 'ar'
 * ```
 */
export class AcceptLanguageLocaleResolver implements ILocaleResolver {
  /** @inheritdoc */
  public readonly name = 'accept-language';

  /** @inheritdoc */
  public readonly priority = LocaleResolverPriority.LOW;

  /**
   * localStorage key derived from the header name.
   *
   * @internal
   */
  private readonly storageKey: string;

  /**
   * Storage implementation.
   *
   * @internal
   */
  private readonly storage: Storage | undefined;

  /**
   * Create a new accept-language locale resolver.
   *
   * @param options - Optional configuration for header name and storage
   */
  constructor(options?: AcceptLanguageLocaleResolverOptions) {
    const headerName = options?.headerName ?? 'Content-Language';
    this.storageKey = `i18n-header-${headerName}`;
    this.storage =
      options?.storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  }

  /**
   * Resolve locale from the stored HTTP response header value.
   *
   * @returns Locale code from the stored header, or `undefined` if not found
   */
  public resolve(): string | undefined {
    if (!this.storage) {
      return undefined;
    }

    try {
      const value = this.storage.getItem(this.storageKey);
      return value || undefined;
    } catch (error) {
      console.warn('[i18n] Failed to read locale header from storage:', error);
      return undefined;
    }
  }
}
