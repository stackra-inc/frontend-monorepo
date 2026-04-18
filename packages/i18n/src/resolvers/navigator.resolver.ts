/**
 * Navigator Locale Resolver
 *
 * Reads the user's preferred locale from the browser's `navigator.language`
 * or `navigator.languages` API. This is the browser's built-in language
 * preference, typically set in the OS or browser settings.
 *
 * Can optionally filter against a list of supported languages, returning
 * the first match from the user's preference list.
 *
 * SSR-safe: returns `undefined` when `navigator` is not available.
 *
 * @module resolvers/navigator
 *
 * @example
 * ```typescript
 * import { NavigatorLocaleResolver } from '@stackra/react-i18n';
 *
 * // Accept any browser language
 * const resolver = new NavigatorLocaleResolver();
 *
 * // Only accept configured languages
 * const resolver = new NavigatorLocaleResolver({
 *   supportedLanguages: ['en', 'ar', 'es'],
 * });
 *
 * // navigator.language === 'ar-EG'
 * resolver.resolve(); // 'ar' (when supportedLanguages includes 'ar')
 * ```
 *
 * @remarks
 * - Priority: LOWEST (5)
 * - Performance: ~0ms (navigator API read)
 * - SSR-safe: returns `undefined` when `navigator` is not available
 * - Supports both `navigator.language` and `navigator.languages`
 * - Performs prefix matching (e.g. `'ar-EG'` matches `'ar'`)
 */

import { LocaleResolverPriority } from '@/enums';
import { Str } from '@stackra/ts-support';
import type { ILocaleResolver } from './locale-resolver.interface';

/**
 * Configuration options for {@link NavigatorLocaleResolver}.
 */
export interface NavigatorLocaleResolverOptions {
  /**
   * List of supported language codes.
   *
   * When provided, the resolver performs prefix matching against the
   * browser's language preferences and returns the first match.
   * When omitted, returns `navigator.language` as-is.
   *
   * @default undefined (return navigator.language directly)
   *
   * @example `['en', 'ar', 'es', 'fr']`
   */
  supportedLanguages?: string[];
}

/**
 * Resolver that reads locale from the browser's navigator API.
 *
 * @example
 * ```typescript
 * const resolver = new NavigatorLocaleResolver({
 *   supportedLanguages: ['en', 'ar'],
 * });
 * // navigator.languages === ['ar-EG', 'en-US', 'en']
 * // → 'ar' (first prefix match)
 * ```
 */
export class NavigatorLocaleResolver implements ILocaleResolver {
  /** @inheritdoc */
  public readonly name = 'navigator';

  /** @inheritdoc */
  public readonly priority = LocaleResolverPriority.LOWEST;

  /**
   * Supported language codes (lowercase).
   *
   * @internal
   */
  private readonly supportedLanguages: string[] | undefined;

  /**
   * Create a new navigator locale resolver.
   *
   * @param options - Optional configuration for supported languages
   */
  constructor(options?: NavigatorLocaleResolverOptions) {
    this.supportedLanguages = options?.supportedLanguages?.map((l) => Str.lower(l));
  }

  /**
   * Resolve locale from the browser's navigator API.
   *
   * When `supportedLanguages` is configured, iterates through
   * `navigator.languages` and returns the first prefix match.
   * Otherwise returns `navigator.language` directly.
   *
   * @returns Locale code from the browser, or `undefined` if SSR or no match
   */
  public resolve(): string | undefined {
    // SSR guard
    if (typeof navigator === 'undefined') {
      return undefined;
    }

    // If no supported languages filter, return the primary language directly
    if (!this.supportedLanguages) {
      return navigator.language || undefined;
    }

    // Get the full preference list (navigator.languages) or fall back to single value
    const browserLanguages: readonly string[] =
      navigator.languages?.length > 0 ? navigator.languages : [navigator.language];

    // Find the first browser language that matches a supported language (prefix match)
    for (const browserLang of browserLanguages) {
      const normalized = Str.lower(browserLang);

      for (const supported of this.supportedLanguages) {
        // Exact match (e.g. 'ar' === 'ar') or prefix match (e.g. 'ar-eg' starts with 'ar')
        if (normalized === supported || Str.startsWith(normalized, supported + '-')) {
          return supported;
        }
      }
    }

    return undefined;
  }
}
