import type { BaseKey } from '@refinedev/core';
import type { TenantMode } from '@/enums/tenant-mode.enum';

/**
 * Extended tenant configuration interface with domain support
 * Can be loaded from JSON file
 */
export interface TenantConfig {
  /**
   * How to pass tenant ID to the API
   */
  mode: TenantMode;

  /**
   * Resolver names in priority order
   * @example ["domain", "subdomain", "router"]
   */
  resolvers: string[];

  /**
   * Fallback tenant ID if no resolver succeeds
   */
  fallback?: BaseKey;

  /**
   * Field name for tenant in filters/query
   */
  tenantField?: string;

  /**
   * Header name when mode is HEADER
   */
  headerName?: string;

  /**
   * Query parameter name when mode is QUERY
   */
  queryParam?: string;

  /**
   * Base domain for subdomain matching
   * @example "example.com"
   */
  baseDomain?: string;

  /**
   * Subdomain to tenant ID mapping
   * @example { "acme": "tenant-123", "globex": "tenant-456" }
   */
  subdomainMap?: Record<string, BaseKey>;

  /**
   * Domain to tenant ID mapping
   * Supports:
   * - Custom domains: { "acme.com": "tenant-123" }
   * - Subdomains: { "acme.example.com": "tenant-123" }
   * - Path segments: { "acme": "tenant-123" } (when pathBasedTenants is true)
   *
   * @example
   * ```json
   * {
   *   "domainMap": {
   *     "acme.com": "tenant-123",
   *     "acme.example.com": "tenant-123",
   *     "globex.io": "tenant-456",
   *     "globex.example.com": "tenant-456"
   *   }
   * }
   * ```
   */
  domainMap?: Record<string, BaseKey>;

  /**
   * Enable path-based tenant resolution
   * When true, resolves tenant from URL path: example.com/acme
   * @default false
   */
  pathBasedTenants?: boolean;

  /**
   * Custom domain configuration per tenant
   * Maps tenant ID to their custom domain settings
   *
   * @example
   * ```json
   * {
   *   "tenantDomains": {
   *     "tenant-123": {
   *       "customDomain": "acme.com",
   *       "subdomain": "acme",
   *       "allowedDomains": ["acme.com", "acme.example.com"]
   *     }
   *   }
   * }
   * ```
   */
  tenantDomains?: Record<string, TenantDomainConfig>;

  /**
   * Additional configuration
   */
  [key: string]: any;
}

/**
 * Domain configuration for a specific tenant
 */
export interface TenantDomainConfig {
  /**
   * Custom domain for this tenant
   * @example "acme.com"
   */
  customDomain?: string;

  /**
   * Subdomain for this tenant
   * @example "acme"
   */
  subdomain?: string;

  /**
   * List of allowed domains for this tenant
   * Used for validation and security
   * @example ["acme.com", "acme.example.com", "www.acme.com"]
   */
  allowedDomains?: string[];

  /**
   * Whether to redirect to custom domain if accessed via subdomain
   * @default false
   */
  redirectToCustomDomain?: boolean;
}
