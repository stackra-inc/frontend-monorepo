/**
 * @fileoverview Multitenancy configuration interface for auth provider wrapping.
 *
 * @module @stackra-inc/react-multitenancy
 * @category Interfaces
 */

import type { BaseKey } from '@refinedev/core';

/**
 * Multitenancy Configuration Interface
 *
 * Defines how tenant information is managed and injected.
 */
export interface MultitenancyConfig {
  /**
   * HTTP header name for tenant ID
   *
   * @default "X-Tenant-ID"
   */
  tenantIdKey?: string;

  /**
   * Function to get current tenant ID
   */
  getTenantId: () => BaseKey | undefined | null | Promise<BaseKey | undefined | null>;

  /**
   * Function to set current tenant ID
   */
  setTenantId?: (tenantId: string) => void;

  /**
   * Callback when tenant changes
   */
  onTenantChange?: (
    tenantId: string,
    previousTenantId: BaseKey | undefined | null | Promise<BaseKey | undefined | null>
  ) => void;

  /**
   * Whether to include tenant ID in storage keys
   * @default true
   */
  tenantAwareStorage?: boolean;

  /**
   * Extract tenant ID from login response
   */
  extractTenantFromResponse?: (response: any) => string | null;

  /**
   * Whether to require tenant ID for authentication
   * @default false
   */
  requireTenant?: boolean;

  /**
   * Custom error message when tenant is required but not set
   * @default "Tenant ID is required"
   */
  tenantRequiredMessage?: string;
}
