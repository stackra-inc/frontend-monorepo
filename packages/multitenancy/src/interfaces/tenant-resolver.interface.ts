import type { BaseKey } from '@refinedev/core';

/**
 * Interface that all tenant resolvers must implement.
 *
 * @description
 * A tenant resolver is responsible for extracting the tenant ID from a specific source
 * (e.g., domain, URL path, query parameter, header, etc.). Multiple resolvers can be
 * configured and are tried in priority order until one returns a tenant ID.
 *
 * Resolvers support both synchronous and asynchronous resolution, allowing for
 * API calls, database lookups, or simple string parsing.
 *
 * @example
 * ```typescript
 * import { TenantResolver, ResolverPriority } from "@stackra/react-multitenancy";
 *
 * // Synchronous resolver
 * class SubdomainResolver implements TenantResolver {
 *   name = "subdomain";
 *   priority = ResolverPriority.HIGH;
 *
 *   resolve(): string | undefined {
 *     const hostname = window.location.hostname;
 *     const parts = hostname.split('.');
 *     return parts.length > 2 ? parts[0] : undefined;
 *   }
 * }
 *
 * // Asynchronous resolver
 * class ApiDomainResolver implements TenantResolver {
 *   name = "api-domain";
 *   priority = ResolverPriority.HIGHEST;
 *
 *   async resolve(): Promise<string | undefined> {
 *     const domain = window.location.hostname;
 *     const response = await fetch(`/api/tenants/by-domain?domain=${domain}`);
 *     const data = await response.json();
 *     return data.tenantId;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Custom resolver with caching using @stackra/ts-cache
 * import { TTLCache } from "@stackra/ts-cache";
 *
 * class CachedDomainResolver implements TenantResolver {
 *   name = "cached-domain";
 *   priority = ResolverPriority.HIGHEST;
 *   private cache = new TTLCache<string>({ ttl: 300000 }); // 5 minutes
 *
 *   async resolve(): Promise<string | undefined> {
 *     const domain = window.location.hostname;
 *
 *     // Check cache first
 *     const cached = this.cache.get(domain);
 *     if (cached) {
 *       return cached;
 *     }
 *
 *     // Fetch from API
 *     const tenantId = await this.fetchFromApi(domain);
 *     if (tenantId) {
 *       this.cache.set(domain, tenantId);
 *     }
 *
 *     return tenantId;
 *   }
 *
 *   private async fetchFromApi(domain: string): Promise<string | undefined> {
 *     // API call implementation
 *   }
 * }
 * ```
 *
 * @public
 */
export interface TenantResolver {
  /**
   * Unique identifier for this resolver.
   *
   * @description
   * Used for logging, debugging, and configuration. Should be descriptive
   * and unique across all resolvers in the system.
   *
   * @example "subdomain", "router", "header", "query", "domain"
   */
  name: string;

  /**
   * Priority level for this resolver (lower number = higher priority).
   *
   * @description
   * When multiple resolvers are configured, they are tried in ascending priority order.
   * The first resolver that returns a non-undefined value wins. Use the ResolverPriority
   * enum for standard priority levels, or provide a custom number for fine-grained control.
   *
   * @example
   * ```typescript
   * // Using enum
   * priority = ResolverPriority.HIGHEST; // 1
   * priority = ResolverPriority.HIGH;    // 2
   * priority = ResolverPriority.NORMAL;  // 3
   *
   * // Custom priority (between HIGH and NORMAL)
   * priority = 2.5;
   * ```
   *
   * @remarks
   * - Priority 1 (HIGHEST): Server-injected, custom domains
   * - Priority 2 (HIGH): Subdomains, API lookups
   * - Priority 3 (NORMAL): Router params, query params
   * - Priority 4 (LOW): Headers, localStorage
   * - Priority 5 (LOWEST): Fallback resolvers
   */
  priority: number;

  /**
   * Resolves the tenant ID from the source.
   *
   * @description
   * This method is called by the resolver chain to extract the tenant ID.
   * It can be synchronous (return value directly) or asynchronous (return Promise).
   *
   * Return `undefined` when the tenant cannot be resolved from this source.
   * The resolver chain will then try the next resolver in priority order.
   *
   * If an error occurs, you can either:
   * - Return `undefined` to continue to the next resolver
   * - Throw an error to stop the chain (error will be logged and chain continues)
   *
   * @returns The tenant ID if found, or undefined if not found
   *
   * @example
   * ```typescript
   * // Synchronous resolution
   * resolve(): string | undefined {
   *   const params = new URLSearchParams(window.location.search);
   *   return params.get('tenant_id') || undefined;
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Asynchronous resolution
   * async resolve(): Promise<string | undefined> {
   *   try {
   *     const response = await fetch('/api/current-tenant');
   *     const data = await response.json();
   *     return data.tenantId;
   *   } catch (error) {
   *     console.error('Failed to resolve tenant:', error);
   *     return undefined; // Continue to next resolver
   *   }
   * }
   * ```
   *
   * @remarks
   * - Return `undefined` (not `null`) for consistency
   * - Handle errors gracefully to avoid breaking the resolver chain
   * - Consider caching results for performance
   * - Ensure SSR-safe (check for `window` availability)
   */
  resolve(): BaseKey | undefined | Promise<BaseKey | undefined>;
}
