/**
 * Multi-Tenancy Context
 *
 * Provides tenant information throughout the React component tree.
 *
 * @example
 * ```tsx
 * import { MultiTenancyProvider } from "@stackra-inc/react-multitenancy";
 *
 * <MultiTenancyProvider provider={multiTenancyProvider}>
 *   <App />
 * </MultiTenancyProvider>
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { IMultiTenancyContext } from '@/interfaces/multi-tenancy-context.interface';
import type { IMultiTenancyProvider } from '@/interfaces/multi-tenancy-provider.interface';
import type { Tenant } from '@/types/tenant.type';

/**
 * Multi-Tenancy Context
 */
export const MultiTenancyContext = createContext<IMultiTenancyContext | undefined>(undefined);

/**
 * Props for MultiTenancyProvider
 */
export interface MultiTenancyProviderProps {
  /**
   * Multi-tenancy provider instance
   */
  provider: IMultiTenancyProvider;

  /**
   * Child components
   */
  children: React.ReactNode;

  /**
   * Default tenant to use if no tenant is resolved
   */
  defaultTenant?: Tenant;
}

/**
 * Multi-Tenancy Context Provider
 *
 * Initializes tenant state and provides it to child components.
 */
export const MultiTenancyProvider: React.FC<MultiTenancyProviderProps> = ({
  provider,
  children,
  defaultTenant,
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | undefined>(defaultTenant);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  /**
   * Initialize tenant state on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        // Fetch all tenants
        const response = await provider.getTenants();
        setTenants(response.tenants);

        // Get current tenant ID
        const tenantId = await provider.getTenantId();

        if (tenantId) {
          // Find matching tenant
          const tenant = response.tenants.find((t) => t.id === tenantId);

          if (tenant) {
            setCurrentTenant(tenant);
          } else if (defaultTenant) {
            setCurrentTenant(defaultTenant);
          } else {
            throw new Error(`Tenant with ID "${tenantId}" not found`);
          }
        } else if (defaultTenant) {
          setCurrentTenant(defaultTenant);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('[MultiTenancyProvider] Initialization error:', error);

        // Use default tenant on error if available
        if (defaultTenant) {
          setCurrentTenant(defaultTenant);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [provider, defaultTenant]);

  /**
   * Set current tenant
   */
  const setTenant = useCallback(
    async (tenantId: string): Promise<void> => {
      try {
        setError(undefined);

        // Find tenant
        const tenant = tenants.find((t) => t.id === tenantId);

        if (!tenant) {
          throw new Error(`Tenant with ID "${tenantId}" not found`);
        }

        // Update provider
        await provider.setTenant({ tenantId, tenant });

        // Update state
        setCurrentTenant(tenant);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('[MultiTenancyProvider] Set tenant error:', error);
        throw error;
      }
    },
    [tenants, provider]
  );

  /**
   * Memoize context value
   */
  const value = useMemo<IMultiTenancyContext>(
    () => ({
      tenant: currentTenant,
      currentTenant,
      tenants,
      setTenant,
      isLoading,
      error: error || null,
    }),
    [currentTenant, tenants, setTenant, isLoading, error]
  );

  return <MultiTenancyContext.Provider value={value}>{children}</MultiTenancyContext.Provider>;
};

/**
 * Hook to access multi-tenancy context
 *
 * @throws Error if used outside MultiTenancyProvider
 *
 * @example
 * ```tsx
 * const { tenant, tenants, setTenant } = useMultiTenancyContext();
 * ```
 */
export const useMultiTenancyContext = (): IMultiTenancyContext => {
  const context = useContext(MultiTenancyContext);

  if (!context) {
    throw new Error('useMultiTenancyContext must be used within MultiTenancyProvider');
  }

  return context;
};

export default MultiTenancyProvider;
