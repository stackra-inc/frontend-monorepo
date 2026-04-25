/**
 * @fileoverview ResolverName type — built-in and custom resolver names.
 *
 * @module types/resolver-name
 */

/**
 * Built-in resolver names that map to registered resolver providers.
 */
export type BuiltInResolver =
  | 'domain'
  | 'subdomain'
  | 'router'
  | 'header'
  | 'query'
  | 'server-domain'
  | 'dynamic-domain';

/**
 * Resolver name — built-in or custom string.
 *
 * Provides autocomplete for built-in names while accepting any string
 * for custom resolvers.
 */
export type ResolverName = BuiltInResolver | (string & {});
