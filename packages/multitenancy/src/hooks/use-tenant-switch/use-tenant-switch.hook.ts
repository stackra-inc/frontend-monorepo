/**
 * useTenantSwitch Hook
 *
 * Provides tenant switching functionality with optional navigation.
 *
 * @example
 * ```tsx
 * import { useTenantSwitch } from "@abdokouta/react-multitenancy";
 *
 * const TenantSwitcher = () => {
 *   const { switchTenant, isSwitching } = useTenantSwitch({
 *     to: "/dashboard/:tenantId"
 *   });
 *
 *   return (
 *     <button
 *       onClick={() => switchTenant("tenant-123")}
 *       disabled={isSwitching}
 *     >
 *       Switch Tenant
 *     </button>
 *   );
 * };
 * ```
 */

import { useGo } from '@refinedev/core';
import { useState } from 'react';
import { useTenant } from '@/hooks/use-tenant';

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

/**
 * Hook to switch tenants with optional navigation.
 *
 * @description
 * This hook provides a convenient way to switch tenants and optionally
 * navigate to a different route. It handles the tenant switching logic
 * and provides loading/error states.
 *
 * @param options - Configuration options
 * @returns Tenant switching function and state
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { switchTenant } = useTenantSwitch();
 *
 * <button onClick={() => switchTenant("tenant-123")}>
 *   Switch Tenant
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * // With navigation
 * const { switchTenant, isSwitching } = useTenantSwitch({
 *   to: "/dashboard/:tenantId"
 * });
 *
 * <button
 *   onClick={() => switchTenant("tenant-123")}
 *   disabled={isSwitching}
 * >
 *   {isSwitching ? "Switching..." : "Switch Tenant"}
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * // With callbacks
 * const { switchTenant } = useTenantSwitch({
 *   to: "/dashboard/:tenantId",
 *   onSuccess: (tenantId) => {
 *     console.log("Switched to tenant:", tenantId);
 *     toast.success("Tenant switched successfully");
 *   },
 *   onError: (error) => {
 *     console.error("Failed to switch tenant:", error);
 *     toast.error(error.message);
 *   }
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Tenant selector with navigation
 * const TenantSelector = () => {
 *   const { tenant, tenants } = useTenant();
 *   const { switchTenant, isSwitching } = useTenantSwitch({
 *     to: "/:tenantId/dashboard"
 *   });
 *
 *   return (
 *     <select
 *       value={tenant?.id}
 *       onChange={(e) => switchTenant(e.target.value)}
 *       disabled={isSwitching}
 *     >
 *       {tenants.map(t => (
 *         <option key={t.id} value={t.id}>{t.name}</option>
 *       ))}
 *     </select>
 *   );
 * };
 * ```
 */
export const useTenantSwitch = (options: UseTenantSwitchOptions = {}): UseTenantSwitchReturn => {
  const { to, onSuccess, onError } = options;
  const { tenants, setTenant } = useTenant();
  const go = useGo();

  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  /**
   * Switch to a different tenant
   */
  const switchTenant = async (tenantId: string): Promise<void> => {
    try {
      setIsSwitching(true);
      setError(undefined);

      // Find tenant
      const tenant = tenants.find((t) => t.id === tenantId);

      if (!tenant) {
        throw new Error(`Tenant with ID "${tenantId}" not found`);
      }

      // Switch tenant
      await setTenant(tenantId);

      // Navigate if path provided
      if (to) {
        const path = to.replace(':tenantId', String(tenantId));
        go({
          to: path,
          type: 'replace',
        });
      }

      // Call success callback
      onSuccess?.(tenantId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[useTenantSwitch] Switch error:', error);

      // Call error callback
      onError?.(error);

      throw error;
    } finally {
      setIsSwitching(false);
    }
  };

  return {
    switchTenant,
    isSwitching,
    error,
  };
};
