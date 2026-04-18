/**
 * Locale Resolver Priority Enum
 *
 * Determines the order in which locale resolvers are tried.
 * Lower numeric values run first. The first resolver that returns
 * a non-`undefined` value wins.
 *
 * Mirrors the {@link ResolverPriority} pattern from `@stackra/react-multitenancy`.
 *
 * @module enums/locale-resolver-priority
 *
 * @example
 * ```typescript
 * import { LocaleResolverPriority } from '@stackra/react-i18n';
 *
 * class CustomResolver implements LocaleResolver {
 *   name = 'custom';
 *   priority = LocaleResolverPriority.HIGHEST;
 *   resolve() { return 'en'; }
 * }
 * ```
 */
export enum LocaleResolverPriority {
  /**
   * Highest priority — tried first.
   *
   * Use for resolvers that should always take precedence.
   *
   * @example URL path segment (`/ar/products` → `'ar'`)
   *
   * @remarks Priority value: 1
   */
  HIGHEST = 1,

  /**
   * High priority — tried second.
   *
   * Use for important resolvers checked early in the chain.
   *
   * @example Query parameter (`?lang=ar` → `'ar'`)
   *
   * @remarks Priority value: 2
   */
  HIGH = 2,

  /**
   * Normal priority — tried third (default).
   *
   * Use for standard resolvers.
   *
   * @example Cookie or localStorage (`i18nextLng=ar`)
   *
   * @remarks Priority value: 3
   */
  NORMAL = 3,

  /**
   * Low priority — tried fourth.
   *
   * Use for fallback resolvers.
   *
   * @example HTTP response header (`Content-Language: ar`)
   *
   * @remarks Priority value: 4
   */
  LOW = 4,

  /**
   * Lowest priority — tried last.
   *
   * Use for last-resort resolvers.
   *
   * @example Browser `navigator.language`
   *
   * @remarks Priority value: 5
   */
  LOWEST = 5,
}
