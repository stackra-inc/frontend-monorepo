/**
 * DI Tokens for @stackra/react-multitenancy
 *
 * |--------------------------------------------------------------------------
 * | Injection tokens for the MultiTenancyModule DI integration.
 * |--------------------------------------------------------------------------
 * |
 * | Core:
 * |   MULTITENANCY_CONFIG — the merged config object
 * |
 * | Resolvers:
 * |   DOMAIN_RESOLVER, SUBDOMAIN_RESOLVER, ROUTER_RESOLVER,
 * |   HEADER_RESOLVER, QUERY_RESOLVER, SERVER_DOMAIN_RESOLVER,
 * |   DYNAMIC_DOMAIN_RESOLVER
 * |
 * @module constants/tokens
 */

/*
|--------------------------------------------------------------------------
| Core Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the MultiTenancyModule configuration. */
export const MULTITENANCY_CONFIG = Symbol.for('MULTITENANCY_CONFIG');

/**
 * @deprecated Use MULTITENANCY_CONFIG instead.
 */
export const MULTITENANCY_OPTIONS = MULTITENANCY_CONFIG;

/** Injection token for the resolved tenant resolvers array. */
export const TENANT_RESOLVERS = Symbol.for('TENANT_RESOLVERS');

/*
|--------------------------------------------------------------------------
| Resolver Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the DomainResolver. */
export const DOMAIN_RESOLVER = Symbol.for('DOMAIN_RESOLVER');

/** Injection token for the SubdomainResolver. */
export const SUBDOMAIN_RESOLVER = Symbol.for('SUBDOMAIN_RESOLVER');

/** Injection token for the RouterResolver. */
export const ROUTER_RESOLVER = Symbol.for('ROUTER_RESOLVER');

/** Injection token for the HeaderResolver. */
export const HEADER_RESOLVER = Symbol.for('HEADER_RESOLVER');

/** Injection token for the QueryResolver. */
export const QUERY_RESOLVER = Symbol.for('QUERY_RESOLVER');

/** Injection token for the ServerDomainResolver. */
export const SERVER_DOMAIN_RESOLVER = Symbol.for('SERVER_DOMAIN_RESOLVER');

/** Injection token for the DynamicDomainResolver. */
export const DYNAMIC_DOMAIN_RESOLVER = Symbol.for('DYNAMIC_DOMAIN_RESOLVER');
