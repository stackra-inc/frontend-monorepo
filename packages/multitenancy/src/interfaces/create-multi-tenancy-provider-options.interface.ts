/**
 * @fileoverview Options interface for creating a multi-tenancy provider.
 *
 * @module @stackra-inc/react-multitenancy
 * @category Interfaces
 */

import type { TenantConfig } from './tenant-config.interface';
import type { TenantResolver } from './tenant-resolver.interface';
import type { GetTenantParams, Tenant, TenantResponse } from '@/types';

/**
 * Options for creating a multi-tenancy provider
 */
export interface CreateMultiTenancyProviderOptions {
  /**
   * Tenant configuration
   */
  config: TenantConfig;

  /**
   * Function to fetch all tenants from the backend
   *
   * @returns Promise resolving to TenantResponse
   */
  fetchTenants: () => Promise<TenantResponse>;

  /**
   * Optional function to fetch a specific tenant by ID
   *
   * @param params - Parameters containing tenant ID
   * @returns Promise resolving to Tenant
   */
  fetchTenant?: (params: GetTenantParams) => Promise<Tenant>;

  /**
   * Custom resolvers to add to the resolver chain
   */
  customResolvers?: Record<string, TenantResolver>;

  /**
   * API endpoint for dynamic domain resolution
   * Only used if "dynamic-domain" resolver is configured
   *
   * @example "/api/tenants/resolve"
   */
  dynamicDomainApiUrl?: string;

  /**
   * Cache TTL for dynamic domain resolver (in seconds)
   * @default 300 (5 minutes)
   */
  dynamicDomainCacheTTL?: number;
}
