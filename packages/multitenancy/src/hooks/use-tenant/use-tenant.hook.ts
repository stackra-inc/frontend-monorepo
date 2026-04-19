/**
 * useTenant Hook
 *
 * Provides access to tenant state and operations.
 *
 * @example
 * ```tsx
 * import { useTenant } from "@stackra/react-multitenancy";
 *
 * const MyComponent = () => {
 *   const { tenant, tenants, setTenant, isLoading, error } = useTenant();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>Current Tenant: {tenant?.name}</h1>
 *       <select onChange={(e) => setTenant(e.target.value)}>
 *         {tenants.map(t => (
 *           <option key={t.id} value={t.id}>{t.name}</option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * };
 * ```
 */

import { useMultiTenancyContext } from '@/contexts';
import type { Tenant } from '@/types';
import type { UseTenantReturn } from '@/interfaces/use-tenant-return.interface';

/**
 * Hook to access tenant state and operations.
 *
 * @description
 * This hook provides access to the current tenant, available tenants,
 * and a function to switch tenants. It's a convenience wrapper around
 * useMultiTenancyContext with safe defaults.
 *
 * @returns Tenant state and operations
 *
 * @example
 * ```tsx
 * const { tenant, tenants, setTenant } = useTenant();
 *
 * return (
 *   <div>
 *     <h1>{tenant?.name}</h1>
 *     <button onClick={() => setTenant("tenant-123")}>
 *       Switch Tenant
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // With loading and error states
 * const { tenant, isLoading, error } = useTenant();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Alert>{error.message}</Alert>;
 * if (!tenant) return <NoTenantSelected />;
 *
 * return <Dashboard tenant={tenant} />;
 * ```
 *
 * @example
 * ```tsx
 * // Tenant selector component
 * const TenantSelector = () => {
 *   const { tenant, tenants, setTenant, isLoading } = useTenant();
 *
 *   return (
 *     <select
 *       value={tenant?.id}
 *       onChange={(e) => setTenant(e.target.value)}
 *       disabled={isLoading}
 *     >
 *       {tenants.map(t => (
 *         <option key={t.id} value={t.id}>{t.name}</option>
 *       ))}
 *     </select>
 *   );
 * };
 * ```
 */
export const useTenant = (): UseTenantReturn => {
  try {
    const context = useMultiTenancyContext();

    return {
      tenant: context.currentTenant,
      tenants: context.tenants,
      setTenant: context.setTenant,
      isLoading: context.isLoading,
      error: context.error,
    };
  } catch (error) {
    // Return safe defaults when used outside MultiTenancyProvider
    console.warn('[useTenant] Used outside MultiTenancyProvider, returning safe defaults');

    return {
      tenant: undefined,
      tenants: [],
      setTenant: async () => {
        throw new Error('useTenant must be used within MultiTenancyProvider');
      },
      isLoading: false,
      error: null,
    };
  }
};
