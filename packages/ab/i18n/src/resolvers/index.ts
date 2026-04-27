/**
 * Locale Resolvers Barrel Export
 *
 * Centralized entry point for the locale resolver system.
 *
 * Built-in resolvers (in default priority order):
 *
 * | Priority | Resolver | Source |
 * |----------|----------|--------|
 * | 1 (HIGHEST) | {@link UrlPathLocaleResolver} | URL path segment (`/ar/products`) |
 * | 2 (HIGH) | {@link QueryParamLocaleResolver} | Query parameter (`?lang=ar`) |
 * | 3 (NORMAL) | {@link StorageLocaleResolver} | localStorage / sessionStorage |
 * | 4 (LOW) | {@link AcceptLanguageLocaleResolver} | Stored HTTP response header |
 * | 5 (LOWEST) | {@link NavigatorLocaleResolver} | Browser `navigator.language` |
 *
 * @module resolvers
 */

// ── Interface ──────────────────────────────────────────────────────────────

export type { ILocaleResolver } from "./locale-resolver.interface";

// ── Built-in Resolvers ─────────────────────────────────────────────────────

export { UrlPathLocaleResolver } from "./url-path.resolver";
export type { UrlPathLocaleResolverOptions } from "./url-path.resolver";

export { QueryParamLocaleResolver } from "./query-param.resolver";
export type { QueryParamLocaleResolverOptions } from "./query-param.resolver";

export { StorageLocaleResolver } from "./storage.resolver";
export type { StorageLocaleResolverOptions } from "./storage.resolver";

export { NavigatorLocaleResolver } from "./navigator.resolver";
export type { NavigatorLocaleResolverOptions } from "./navigator.resolver";

export { AcceptLanguageLocaleResolver } from "./accept-language.resolver";
export type { AcceptLanguageLocaleResolverOptions } from "./accept-language.resolver";
