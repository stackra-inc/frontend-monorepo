/**
 * URL Path Locale Resolver
 *
 * Extracts the locale from the first segment of the URL path.
 * For example, `/ar/products` → `'ar'`, `/en-US/dashboard` → `'en-US'`.
 *
 * Only matches segments that look like valid locale codes (2-letter ISO 639-1,
 * optionally with a region suffix like `en-US` or `zh-CN`).
 *
 * SSR-safe: returns `undefined` when `window` is not available.
 *
 * @module resolvers/url-path
 *
 * @example
 * ```typescript
 * import { UrlPathLocaleResolver } from '@stackra/react-i18n';
 *
 * // Without allowed languages (matches any locale-like segment)
 * const resolver = new UrlPathLocaleResolver();
 *
 * // With allowed languages (only matches configured languages)
 * const resolver = new UrlPathLocaleResolver({ languages: ['en', 'ar', 'es'] });
 *
 * // URL: /ar/products
 * resolver.resolve(); // 'ar'
 *
 * // URL: /products (no locale segment)
 * resolver.resolve(); // undefined
 * ```
 *
 * @remarks
 * - Priority: HIGHEST (1)
 * - Performance: ~0ms (string manipulation)
 * - SSR-safe: returns `undefined` when `window` is not available
 */

import { LocaleResolverPriority } from '@/enums';
import { Str } from '@stackra/ts-support';
import type { ILocaleResolver } from './locale-resolver.interface';

/**
 * Configuration options for {@link UrlPathLocaleResolver}.
 */
export interface UrlPathLocaleResolverOptions {
  /**
   * List of allowed language codes.
   *
   * When provided, only these codes are recognized as locale segments.
   * When omitted, any segment matching the ISO 639-1 pattern is accepted.
   *
   * @default undefined (accept any locale-like segment)
   */
  languages?: string[];

  /**
   * Which path segment index to check (0-based).
   *
   * @default 0 (first segment after the leading `/`)
   */
  segmentIndex?: number;
}

/**
 * Resolver that extracts locale from the URL path.
 *
 * Parses `window.location.pathname`, splits by `/`, and checks the
 * configured segment index for a valid locale code.
 *
 * @example
 * ```typescript
 * const resolver = new UrlPathLocaleResolver({ languages: ['en', 'ar'] });
 * // URL: /ar/dashboard → 'ar'
 * // URL: /dashboard    → undefined
 * ```
 */
export class UrlPathLocaleResolver implements ILocaleResolver {
  /** @inheritdoc */
  public readonly name = 'url-path';

  /** @inheritdoc */
  public readonly priority = LocaleResolverPriority.HIGHEST;

  /**
   * Allowed language codes (lowercase).
   *
   * @internal
   */
  private readonly languages: string[] | undefined;

  /**
   * Path segment index to inspect.
   *
   * @internal
   */
  private readonly segmentIndex: number;

  /**
   * Create a new URL path locale resolver.
   *
   * @param options - Optional configuration for allowed languages and segment index
   */
  constructor(options?: UrlPathLocaleResolverOptions) {
    this.languages = options?.languages?.map((l) => Str.lower(l));
    this.segmentIndex = options?.segmentIndex ?? 0;
  }

  /**
   * Resolve locale from the URL path segment.
   *
   * @returns Locale code from the URL path, or `undefined` if not found or SSR
   */
  public resolve(): string | undefined {
    // SSR guard
    if (typeof window === 'undefined') {
      return undefined;
    }

    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length <= this.segmentIndex) {
      return undefined;
    }

    const candidate = segments[this.segmentIndex]
      ? Str.lower(segments[this.segmentIndex]!)
      : undefined;

    if (!candidate) {
      return undefined;
    }

    // If allowed languages are configured, check against them
    if (this.languages) {
      return this.languages.includes(candidate) ? candidate : undefined;
    }

    // Otherwise match any ISO 639-1 code (optionally with region)
    const isLocale = /^[a-z]{2}(-[a-z]{2})?$/i.test(candidate);
    return isLocale ? candidate : undefined;
  }
}
