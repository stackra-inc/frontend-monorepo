/**
 * @fileoverview Domain configuration interface for a specific tenant.
 *
 * @module @stackra/react-multitenancy
 * @category Interfaces
 */

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
