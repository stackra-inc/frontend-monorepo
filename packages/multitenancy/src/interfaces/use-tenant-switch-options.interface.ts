/**
 * @fileoverview Options interface for the useTenantSwitch hook.
 *
 * @module @stackra/react-multitenancy
 * @category Interfaces
 */

/**
 * Options for useTenantSwitch hook
 */
export interface UseTenantSwitchOptions {
  /**
   * Path to navigate to after switching tenant.
   * Use :tenantId placeholder to inject the tenant ID.
   *
   * @example "/dashboard/:tenantId"
   * @example "/:tenantId/products"
   */
  to?: string;

  /**
   * Callback function called after successful tenant switch
   *
   * @param tenantId - ID of the tenant that was switched to
   */
  onSuccess?: (tenantId: string) => void;

  /**
   * Callback function called if tenant switch fails
   *
   * @param error - Error that occurred during switch
   */
  onError?: (error: Error) => void;
}
