/**
 * @fileoverview Extended tenant configuration interface with domain support.
 *
 * @module @stackra/react-multitenancy
 * @category Interfaces
 */

import type { BaseKey } from '@refinedev/core';
import type { TenantMode } from '@/enums/tenant-mode.enum';
import type { TenantDomainConfig } from './tenant-domain-config.interface';

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
   */
  subdomainMap?: Record<string, BaseKey>;

  /**
   * Domain to tenant ID mapping
   */
  domainMap?: Record<string, BaseKey>;

  /**
   * Enable path-based tenant resolution
   * @default false
   */
  pathBasedTenants?: boolean;

  /**
   * Custom domain configuration per tenant
   */
  tenantDomains?: Record<string, TenantDomainConfig>;

  /**
   * Additional configuration
   */
  [key: string]: any;
}
