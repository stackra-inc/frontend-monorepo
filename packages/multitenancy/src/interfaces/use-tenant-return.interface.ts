/**
 * @fileoverview Return type interface for the useTenant hook.
 *
 * @module @stackra-inc/react-multitenancy
 * @category Interfaces
 */

import type { Tenant } from '@/types';

/**
 * Return type for useTenant hook
 */
export interface UseTenantReturn {
  /**
   * Currently active tenant
   */
  tenant: Tenant | undefined;

  /**
   * Array of all available tenants
   */
  tenants: Tenant[];

  /**
   * Function to switch to a different tenant
   *
   * @param tenantId - ID of the tenant to switch to
   */
  setTenant: (tenantId: string) => Promise<void>;

  /**
   * Loading state during initialization
   */
  isLoading: boolean;

  /**
   * Error state if initialization fails
   */
  error: Error | null;
}
