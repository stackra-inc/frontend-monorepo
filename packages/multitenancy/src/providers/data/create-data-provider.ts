/**
 * Data Provider Enhancement for Multi-Tenancy
 *
 * Wraps a base data provider to automatically inject tenant context.
 *
 * @example
 * ```typescript
 * import { createDataProvider } from "@stackra-inc/react-multitenancy";
 * import dataProviderSimpleRest from "@refinedev/simple-rest";
 *
 * const baseDataProvider = dataProviderSimpleRest("https://api.example.com");
 *
 * const dataProvider = createDataProvider({
 *   baseDataProvider,
 *   multiTenancyProvider,
 *   config: {
 *     mode: TenantMode.HEADER,
 *     headerName: "X-Tenant-ID"
 *   }
 * });
 * ```
 */

import type { DataProvider } from '@refinedev/core';
import type { IMultiTenancyProvider } from '@/interfaces/multi-tenancy-provider.interface';
import type { TenantConfig } from '@/interfaces/tenant-config.interface';
import type { CreateDataProviderOptions } from '@/interfaces/create-data-provider-options.interface';
import { TenantMode } from '@/enums';

/**
 * Creates a tenant-aware data provider.
 *
 * @description
 * This function wraps a base data provider and automatically injects
 * tenant context into all requests based on the configured mode.
 *
 * @param options - Configuration options
 * @returns Tenant-aware data provider
 *
 * @example
 * ```typescript
 * // With HEADER mode
 * const dataProvider = createDataProvider({
 *   baseDataProvider: simpleRestProvider("https://api.example.com"),
 *   multiTenancyProvider,
 *   config: {
 *     mode: TenantMode.HEADER,
 *     headerName: "X-Tenant-ID"
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With FILTER mode
 * const dataProvider = createDataProvider({
 *   baseDataProvider: simpleRestProvider("https://api.example.com"),
 *   multiTenancyProvider,
 *   config: {
 *     mode: TenantMode.FILTER,
 *     tenantField: "tenant_id"
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With URL mode
 * const dataProvider = createDataProvider({
 *   baseDataProvider: simpleRestProvider("https://api.example.com"),
 *   multiTenancyProvider,
 *   config: {
 *     mode: TenantMode.URL
 *   }
 * });
 * ```
 */
export const createDataProvider = (options: CreateDataProviderOptions): DataProvider => {
  const { baseDataProvider, multiTenancyProvider, config } = options;

  /**
   * Inject tenant context into request parameters
   */
  const injectTenantContext = <T extends Record<string, any>>(params: T): T => {
    const tenantId = multiTenancyProvider.getTenantId();

    // If no tenant, return params unchanged
    if (!tenantId) {
      return params;
    }

    const mode = config.mode;

    switch (mode) {
      case TenantMode.HEADER: {
        // Add tenant ID to headers
        const headerName = config.headerName || 'X-Tenant-ID';

        return {
          ...params,
          meta: {
            ...params.meta,
            headers: {
              ...params.meta?.headers,
              [headerName]: String(tenantId),
            },
          },
        };
      }

      case TenantMode.FILTER: {
        // Add tenant ID to filters
        const tenantField = config.tenantField || 'tenant_id';

        return {
          ...params,
          filters: [
            ...(params.filters || []),
            {
              field: tenantField,
              operator: 'eq',
              value: tenantId,
            },
          ],
        };
      }

      case TenantMode.URL: {
        // Prepend tenant ID to resource
        return {
          ...params,
          resource: `${tenantId}/${params.resource}`,
        };
      }

      case TenantMode.QUERY: {
        // Add tenant ID to query params
        const queryParam = config.queryParam || 'tenant_id';

        return {
          ...params,
          meta: {
            ...params.meta,
            query: {
              ...params.meta?.query,
              [queryParam]: String(tenantId),
            },
          },
        };
      }

      default:
        return params;
    }
  };

  // Wrap all data provider methods
  return {
    getList: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.getList(enhancedParams);
    },

    getOne: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.getOne(enhancedParams);
    },

    getMany: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.getMany
        ? baseDataProvider.getMany(enhancedParams)
        : Promise.reject(new Error('getMany not implemented'));
    },

    create: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.create(enhancedParams);
    },

    update: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.update(enhancedParams);
    },

    updateMany: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.updateMany
        ? baseDataProvider.updateMany(enhancedParams)
        : Promise.reject(new Error('updateMany not implemented'));
    },

    deleteOne: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.deleteOne(enhancedParams);
    },

    deleteMany: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.deleteMany
        ? baseDataProvider.deleteMany(enhancedParams)
        : Promise.reject(new Error('deleteMany not implemented'));
    },

    getApiUrl: () => {
      return baseDataProvider.getApiUrl();
    },

    custom: async (params) => {
      const enhancedParams = injectTenantContext(params);
      return baseDataProvider.custom
        ? baseDataProvider.custom(enhancedParams)
        : Promise.reject(new Error('custom not implemented'));
    },
  };
};
