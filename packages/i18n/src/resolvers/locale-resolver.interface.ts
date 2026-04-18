/**
 * Locale Resolver Interface
 *
 * Contract that all locale resolvers must implement. A locale resolver
 * is responsible for extracting the current locale/language code from
 * a specific source (URL path, query parameter, localStorage, browser
 * navigator, HTTP header, etc.).
 *
 * Multiple resolvers can be configured and are tried in priority order
 * (ascending — lower number = higher priority) until one returns a
 * non-`undefined` value.
 *
 * Mirrors the `TenantResolver` pattern from `@stackra/react-multitenancy`.
 *
 * @module resolvers/locale-resolver
 *
 * @example
 * ```typescript
 * import type { ILocaleResolver } from '@stackra/react-i18n';
 * import { LocaleResolverPriority } from '@stackra/react-i18n';
 *
 * class CookieLocaleResolver implements ILocaleResolver {
 *   name = 'cookie';
 *   priority = LocaleResolverPriority.NORMAL;
 *
 *   resolve(): string | undefined {
 *     const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
 *     return match?.[1] || undefined;
 *   }
 * }
 * ```
 */
export interface ILocaleResolver {
  /**
   * Unique identifier for this resolver.
   *
   * Used for logging, debugging, and configuration.
   *
   * @example `'url-path'`, `'query-param'`, `'storage'`, `'navigator'`
   */
  name: string;

  /**
   * Priority level for this resolver (lower number = higher priority).
   *
   * When multiple resolvers are configured, they are tried in ascending
   * priority order. The first resolver that returns a non-`undefined`
   * value wins.
   *
   * @remarks
   * - Priority 1 (HIGHEST): URL path segments
   * - Priority 2 (HIGH): Query parameters
   * - Priority 3 (NORMAL): localStorage, cookies
   * - Priority 4 (LOW): HTTP response headers
   * - Priority 5 (LOWEST): Browser navigator, fallback
   */
  priority: number;

  /**
   * Resolve the locale from this source.
   *
   * Can be synchronous or asynchronous. Return `undefined` when the
   * locale cannot be resolved — the chain will try the next resolver.
   *
   * @returns The locale code if found, or `undefined`
   */
  resolve(): string | undefined | Promise<string | undefined>;
}
