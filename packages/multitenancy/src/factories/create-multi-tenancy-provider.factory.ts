/**
 * Multi-Tenancy Provider Factory
 *
 * Creates a multi-tenancy provider instance with configured resolvers.
 *
 * @example
 * ```typescript
 * import { createMultiTenancyProvider } from "@stackra-inc/react-multitenancy";
 *
 * const provider = createMultiTenancyProvider({
 *   config: {
 *     mode: TenantMode.HEADER,
 *     resolvers: ["router", "header"],
 *     headerName: "X-Tenant-ID"
 *   },
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 */

import type { BaseKey } from '@refinedev/core';
import type { TenantConfig } from '@/interfaces/tenant-config.interface';
import type { IMultiTenancyProvider } from '@/interfaces/multi-tenancy-provider.interface';
import type { TenantResolver } from '@/interfaces/tenant-resolver.interface';
import type { GetTenantParams, SetTenantParams, Tenant, TenantResponse } from '@/types';
import type { CreateMultiTenancyProviderOptions } from '@/interfaces/create-multi-tenancy-provider-options.interface';
import { createResolverChain } from '@/utils';
import {
  DomainResolver,
  DynamicDomainResolver,
  HeaderResolver,
  QueryResolver,
  RouterResolver,
  ServerDomainResolver,
  SubdomainResolver,
} from '@/resolvers';

/**
 * Creates a multi-tenancy provider instance.
 *
 * @description
 * This factory function creates a MultiTenancyProvider implementation
 * with the configured resolvers and tenant fetching logic.
 *
 * @param options - Configuration options
 * @returns IMultiTenancyProvider instance
 *
 * @throws Error if configuration is invalid
 * @throws Error if no valid resolvers are configured
 *
 * @example
 * ```typescript
 * // Basic usage
 * const provider = createMultiTenancyProvider({
 *   config: {
 *     mode: TenantMode.HEADER,
 *     resolvers: ["router", "header"],
 *     headerName: "X-Tenant-ID"
 *   },
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With custom resolvers
 * const provider = createMultiTenancyProvider({
 *   config: {
 *     mode: TenantMode.HEADER,
 *     resolvers: ["custom", "router"],
 *   },
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   },
 *   customResolvers: {
 *     "custom": new MyCustomResolver()
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With dynamic domain resolution
 * const provider = createMultiTenancyProvider({
 *   config: {
 *     mode: TenantMode.HEADER,
 *     resolvers: ["dynamic-domain", "router"],
 *   },
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   },
 *   dynamicDomainApiUrl: "/api/tenants/resolve",
 *   dynamicDomainCacheTTL: 600 // 10 minutes
 * });
 * ```
 */
export const createMultiTenancyProvider = (
  options: CreateMultiTenancyProviderOptions
): IMultiTenancyProvider => {
  const {
    config,
    fetchTenants,
    fetchTenant,
    customResolvers = {},
    dynamicDomainApiUrl,
    dynamicDomainCacheTTL,
  } = options;

  // Validate configuration
  if (!config) {
    throw new Error('[createMultiTenancyProvider] Configuration is required');
  }

  if (!config.resolvers || config.resolvers.length === 0) {
    throw new Error('[createMultiTenancyProvider] At least one resolver must be configured');
  }

  if (!fetchTenants) {
    throw new Error('[createMultiTenancyProvider] fetchTenants function is required');
  }

  // Create resolver map with built-in resolvers
  const resolverMap: Record<string, TenantResolver> = {
    domain: new DomainResolver(config),
    subdomain: new SubdomainResolver(config),
    router: new RouterResolver(config),
    header: new HeaderResolver(config),
    query: new QueryResolver(config),
    'server-domain': new ServerDomainResolver(),
    ...customResolvers,
  };

  // Add dynamic domain resolver if configured
  if (config.resolvers.includes('dynamic-domain')) {
    if (!dynamicDomainApiUrl) {
      throw new Error(
        '[createMultiTenancyProvider] dynamicDomainApiUrl is required when using dynamic-domain resolver'
      );
    }

    resolverMap['dynamic-domain'] = new DynamicDomainResolver({
      apiUrl: dynamicDomainApiUrl,
      cacheTTL: dynamicDomainCacheTTL,
    });
  }

  // Get configured resolvers
  const resolvers: TenantResolver[] = [];

  for (const resolverName of config.resolvers) {
    const resolver = resolverMap[resolverName];

    if (!resolver) {
      console.warn(`[createMultiTenancyProvider] Resolver "${resolverName}" not found, skipping`);
      continue;
    }

    resolvers.push(resolver);
  }

  if (resolvers.length === 0) {
    throw new Error('[createMultiTenancyProvider] No valid resolvers found in configuration');
  }

  // Create resolver chain
  const resolverChain = createResolverChain(resolvers);

  /**
   * Get current tenant ID using resolver chain
   */
  const getTenantId = async (): Promise<BaseKey | undefined> => {
    const result = await resolverChain();

    // Use fallback if no tenant resolved
    if (!result && config.fallback) {
      return config.fallback;
    }

    return result;
  };

  /**
   * Set current tenant
   */
  const setTenant = async (params: SetTenantParams): Promise<void> => {
    const { tenantId } = params;

    // Determine primary resolver type
    const primaryResolver = config.resolvers[0];

    switch (primaryResolver) {
      case 'subdomain': {
        // Subdomain-based: Navigate to new subdomain
        const tenant = params.tenant;
        const subdomain = tenant?.subdomain || tenantId;

        if (config.baseDomain) {
          const newUrl = `${window.location.protocol}//${subdomain}.${config.baseDomain}${window.location.pathname}`;
          window.location.href = newUrl;
        } else {
          console.warn('[setTenant] baseDomain not configured, cannot switch subdomain');
        }
        break;
      }

      case 'header': {
        // Header-based: Update localStorage and reload
        const headerName = config.headerName || 'X-Tenant-ID';
        const storageKey = `tenant-header-${headerName}`;

        localStorage.setItem(storageKey, String(tenantId));
        window.location.reload();
        break;
      }

      case 'domain': {
        // Domain-based: Redirect to custom domain if available
        const tenant = params.tenant;
        const customDomain = tenant?.customDomain;

        if (customDomain) {
          const newUrl = `${window.location.protocol}//${customDomain}${window.location.pathname}`;
          window.location.href = newUrl;
        } else {
          console.warn('[setTenant] No custom domain configured for tenant, cannot switch');
        }
        break;
      }

      case 'router':
      case 'query':
      default: {
        // Router/Query-based: Handled by useTenantSwitch hook
        // Just update state, navigation is handled externally
        console.log(`[setTenant] Switched to tenant: ${tenantId}`);
        break;
      }
    }
  };

  /**
   * Fetch all tenants
   */
  const getTenants = async (): Promise<TenantResponse> => {
    try {
      return await fetchTenants();
    } catch (error) {
      console.error('[getTenants] Error fetching tenants:', error);
      throw error;
    }
  };

  /**
   * Fetch specific tenant (optional)
   */
  const getTenant = fetchTenant
    ? async (params: GetTenantParams): Promise<Tenant> => {
        try {
          return await fetchTenant(params);
        } catch (error) {
          console.error('[getTenant] Error fetching tenant:', error);
          throw error;
        }
      }
    : undefined;

  // Return provider implementation
  return {
    getTenantId,
    setTenant,
    getTenants,
    getTenant,
  };
};
