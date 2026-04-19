/**
 * @fileoverview Return type interface for the useTenantSwitch hook.
 *
 * @module @stackra-inc/react-multitenancy
 * @category Interfaces
 */

/**
 * Return type for useTenantSwitch hook
 */
export interface UseTenantSwitchReturn {
  /**
   * Function to switch to a different tenant
   *
   * @param tenantId - ID of the tenant to switch to
   * @throws Error if tenant not found
   */
  switchTenant: (tenantId: string) => Promise<void>;

  /**
   * Loading state during tenant switch
   */
  isSwitching: boolean;

  /**
   * Error state if switch fails
   */
  error: Error | undefined;
}
