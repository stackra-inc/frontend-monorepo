/**
 * Multitenancy Wrapper for Authentication Provider
 *
 * This higher-order function wraps any auth provider to add multitenancy support.
 * It follows Refine's composition pattern for extending functionality without duplication.
 *
 * Features:
 * - Automatic tenant header injection
 * - Tenant-aware token storage
 * - Tenant switching support
 * - Flexible tenant resolution
 * - Works with any auth provider
 *
 * @example
 * ```tsx
 * import { withMultitenancy } from "@stackra/react-multitenancy";
 *
 * const authProvider = withMultitenancy(baseAuthProvider, {
 *   tenantIdKey: "X-Tenant-ID",
 *   getTenantId: () => localStorage.getItem("tenantId"),
 *   onTenantChange: (tenantId) => {
 *     localStorage.setItem("tenantId", tenantId);
 *   },
 * });
 * ```
 */

import type { AuthProvider, BaseKey } from '@refinedev/core';
import type { MultitenancyConfig } from '@/interfaces/multitenancy-config.interface';

/**
 * Tenant-aware storage wrapper
 *
 * Wraps localStorage to add tenant-specific keys
 */
class TenantAwareStorage {
  private getTenantId: () => BaseKey | undefined | null | Promise<BaseKey | undefined | null>;
  private tenantAware: boolean;

  constructor(
    getTenantId: () => BaseKey | undefined | null | Promise<BaseKey | undefined | null>,
    tenantAware: boolean
  ) {
    this.getTenantId = getTenantId;
    this.tenantAware = tenantAware;
  }

  /**
   * Get storage key with optional tenant prefix
   */
  private getKey(key: string): string {
    if (!this.tenantAware) {
      return key;
    }

    const tenantId = this.getTenantId();
    return tenantId ? `${key}_tenant_${tenantId}` : key;
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(this.getKey(key), value);
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    return localStorage.getItem(this.getKey(key));
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  /**
   * Clear all tenant-specific data
   */
  clearTenantData(
    tenantId: BaseKey | undefined | null | Promise<BaseKey | undefined | null>
  ): void {
    if (!this.tenantAware) return;

    const prefix = `_tenant_${tenantId}`;
    const keysToRemove: string[] = [];

    // Find all keys for this tenant
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}

/**
 * Wrap an auth provider with multitenancy support
 *
 * This higher-order function takes any auth provider and adds multitenancy
 * capabilities by intercepting auth methods and injecting tenant information.
 *
 * @param authProvider - Base auth provider to wrap
 * @param config - Multitenancy configuration
 * @returns Enhanced auth provider with multitenancy support
 *
 * @example
 * ```tsx
 * // Basic usage
 * const authProvider = withMultitenancy(baseAuthProvider, {
 *   getTenantId: () => localStorage.getItem("tenantId"),
 * });
 *
 * // Advanced usage with all options
 * const authProvider = withMultitenancy(baseAuthProvider, {
 *   tenantIdKey: "X-Organization-ID",
 *   getTenantId: () => {
 *     const subdomain = window.location.hostname.split('.')[0];
 *     return subdomain !== 'www' ? subdomain : null;
 *   },
 *   setTenantId: (tenantId) => {
 *     localStorage.setItem("tenantId", tenantId);
 *     // Update URL or redirect
 *     window.location.href = `https://${tenantId}.example.com`;
 *   },
 *   onTenantChange: (tenantId, previousTenantId) => {
 *     console.log(`Switched tenant: ${previousTenantId} -> ${tenantId}`);
 *     // Clear cached data
 *     queryClient.clear();
 *   },
 *   extractTenantFromResponse: (response) => response.user.organizationId,
 *   tenantAwareStorage: true,
 *   requireTenant: true,
 * });
 * ```
 */
export function withMultitenancy(
  authProvider: AuthProvider,
  config: MultitenancyConfig
): AuthProvider {
  const {
    // tenantIdKey is used for documentation purposes
    tenantIdKey: _tenantIdKey = 'X-Tenant-ID',
    getTenantId,
    setTenantId,
    onTenantChange,
    tenantAwareStorage = true,
    extractTenantFromResponse,
    requireTenant = false,
    tenantRequiredMessage = 'Tenant ID is required',
  } = config;

  // Create tenant-aware storage
  const storage = new TenantAwareStorage(getTenantId, tenantAwareStorage);

  /**
   * Get current tenant ID (resolves sync or async)
   */
  async function getCurrentTenantId(): Promise<string | null> {
    const result = await getTenantId();
    return result != null ? String(result) : null;
  }

  /**
   * Set tenant ID and trigger callbacks
   */
  async function updateTenantId(newTenantId: string): Promise<void> {
    const previousTenantId = await getCurrentTenantId();

    if (setTenantId) {
      setTenantId(newTenantId);
    }

    if (onTenantChange && newTenantId !== previousTenantId) {
      onTenantChange(newTenantId, previousTenantId);
    }
  }

  /**
   * Check if tenant is required and present
   */
  async function checkTenantRequirement(): Promise<boolean> {
    if (requireTenant && !(await getCurrentTenantId())) {
      return false;
    }
    return true;
  }

  // Return wrapped auth provider
  return {
    /**
     * Login with tenant support
     */
    login: async (params) => {
      // Check tenant requirement before login
      if (requireTenant && !(await getCurrentTenantId()) && !params.tenantId) {
        return {
          success: false,
          error: {
            name: 'TenantRequired',
            message: tenantRequiredMessage,
          },
        };
      }

      // Set tenant if provided in login params
      if (params.tenantId) {
        updateTenantId(params.tenantId);
      }

      // Call base login
      const result = await authProvider.login(params);

      // Extract tenant from response if configured
      if (result.success && extractTenantFromResponse) {
        const tenantId = extractTenantFromResponse(result);
        if (tenantId) {
          updateTenantId(tenantId);
        }
      }

      return result;
    },

    /**
     * Logout with tenant cleanup
     */
    logout: async (params) => {
      const tenantId = await getCurrentTenantId();

      // Call base logout
      const result = await authProvider.logout(params);

      // Clear tenant-specific data if logout successful
      if (result.success && tenantId && tenantAwareStorage) {
        storage.clearTenantData(tenantId);
      }

      return result;
    },

    /**
     * Check authentication with tenant requirement
     */
    check: async (params) => {
      // Check tenant requirement
      if (!(await checkTenantRequirement())) {
        return {
          authenticated: false,
          error: {
            name: 'TenantRequired',
            message: tenantRequiredMessage,
          },
          redirectTo: '/select-tenant',
        };
      }

      // Call base check
      return authProvider.check(params);
    },

    /**
     * Get identity (unchanged)
     */
    getIdentity: async (params) => {
      return authProvider.getIdentity?.(params);
    },

    /**
     * Get permissions (unchanged)
     */
    getPermissions: async (params) => {
      return authProvider.getPermissions?.(params);
    },

    /**
     * Error handler (unchanged)
     */
    onError: async (error) => {
      return authProvider.onError?.(error);
    },

    /**
     * Register with tenant support
     */
    register: async (params) => {
      // Set tenant if provided
      if (params.tenantId) {
        updateTenantId(params.tenantId);
      }

      // Call base register
      const result = await authProvider.register?.(params);

      // Extract tenant from response if configured
      if (result?.success && extractTenantFromResponse) {
        const tenantId = extractTenantFromResponse(result);
        if (tenantId) {
          updateTenantId(tenantId);
        }
      }

      return result ?? { success: false };
    },

    /**
     * Forgot password (unchanged)
     */
    forgotPassword: async (params) => {
      return authProvider.forgotPassword?.(params) ?? { success: false };
    },

    /**
     * Update password (unchanged)
     */
    updatePassword: async (params) => {
      return authProvider.updatePassword?.(params) ?? { success: false };
    },
  };
}

/**
 * Create a tenant switcher utility
 *
 * Provides methods to switch between tenants in a multitenancy setup.
 *
 * @param config - Multitenancy configuration
 * @returns Tenant switcher utility
 *
 * @example
 * ```tsx
 * const tenantSwitcher = createTenantSwitcher({
 *   getTenantId: () => localStorage.getItem("tenantId"),
 *   setTenantId: (id) => localStorage.setItem("tenantId", id),
 *   onTenantChange: () => window.location.reload(),
 * });
 *
 * // Switch tenant
 * tenantSwitcher.switchTenant("tenant-123");
 *
 * // Get current tenant
 * const currentTenant = tenantSwitcher.getCurrentTenant();
 * ```
 */
export function createTenantSwitcher(config: MultitenancyConfig) {
  const { getTenantId, setTenantId, onTenantChange } = config;

  return {
    /**
     * Get current tenant ID
     */
    getCurrentTenant(): BaseKey | undefined | null | Promise<BaseKey | undefined | null> {
      return getTenantId();
    },

    /**
     * Switch to a different tenant
     */
    switchTenant(tenantId: string): void {
      const previousTenantId = getTenantId();

      if (setTenantId) {
        setTenantId(tenantId);
      }

      if (onTenantChange) {
        onTenantChange(tenantId, previousTenantId);
      }
    },

    /**
     * Clear current tenant
     */
    clearTenant(): void {
      const previousTenantId = getTenantId();

      if (setTenantId) {
        setTenantId('');
      }

      if (onTenantChange) {
        onTenantChange('', previousTenantId);
      }
    },
  };
}

/**
 * Hook for using tenant information in components
 *
 * @example
 * ```tsx
 * import { useTenant } from "@stackra/react-multitenancy";
 *
 * function MyComponent() {
 *   const { tenantId, switchTenant } = useTenant();
 *
 *   return (
 *     <div>
 *       <p>Current Tenant: {tenantId}</p>
 *       <button onClick={() => switchTenant("new-tenant")}>
 *         Switch Tenant
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function createTenantContext(config: MultitenancyConfig) {
  const switcher = createTenantSwitcher(config);

  return {
    getTenantId: switcher.getCurrentTenant,
    switchTenant: switcher.switchTenant,
    clearTenant: switcher.clearTenant,
  };
}

/**
 * Export default for convenience
 */
export default withMultitenancy;
