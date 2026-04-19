/**
 * @fileoverview Configuration interface for the DynamicDomainResolver.
 *
 * @module @stackra-inc/react-multitenancy
 * @category Interfaces
 */

/**
 * Configuration for DynamicDomainResolver
 */
export interface DynamicDomainResolverConfig {
  /**
   * API endpoint to call for tenant resolution
   *
   * @example "https://api.example.com/tenants/resolve"
   */
  apiUrl: string;

  /**
   * Cache TTL in seconds
   *
   * @default 300 (5 minutes)
   */
  cacheTTL?: number;

  /**
   * Query parameter name for domain
   *
   * @default "domain"
   */
  domainParam?: string;

  /**
   * Custom headers to include in API request
   */
  headers?: Record<string, string>;

  /**
   * Response path to tenant ID
   * Use dot notation for nested properties
   *
   * @default "tenantId"
   * @example "data.tenant.id"
   */
  responsePath?: string;

  /**
   * Optional cache service instance from @stackra-inc/ts-cache
   * If not provided, uses in-memory Map cache
   */
  cacheService?: any;
}
