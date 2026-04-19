/**
 * Multi-Tenancy Configuration
 *
 * Unified multi-tenancy configuration following Laravel and NestJS patterns.
 * All tenant resolution and settings are defined in a single config object.
 *
 * @module config/multitenancy
 *
 * @example
 * ```typescript
 * import multitenancyConfig from '@stackra/react-multitenancy/config';
 *
 * <MultiTenancyProvider options={multitenancyConfig}>
 *   <App />
 * </MultiTenancyProvider>
 * ```
 */

import type { BaseKey } from '@refinedev/core';
import { TenantMode } from '@/src/enums';
import type { MultiTenancyOptions } from '@/src/interfaces/multitenancy-options.interface';

/**
 * Multi-tenancy configuration
 *
 * Single unified configuration object that automatically adapts to your environment.
 * Uses environment variables for configuration, similar to Laravel's config/multitenancy.php
 *
 * Environment Variables:
 * - TENANT_MODE: How to pass tenant ID (default: 'header')
 * - TENANT_RESOLVER: Resolver strategy (default: 'subdomain')
 * - BASE_DOMAIN: Base domain for subdomain matching (default: 'localhost')
 * - TENANT_HEADER_NAME: HTTP header name (default: 'X-Tenant-ID')
 * - TENANT_FIELD: Field name for filters (default: 'tenant_id')
 * - TENANT_QUERY_PARAM: Query parameter name (default: 'tenant_id')
 * - FALLBACK_TENANT_ID: Fallback tenant ID (default: 'default')
 * - DYNAMIC_DOMAIN_API_URL: API endpoint for dynamic domain resolution
 * - DYNAMIC_DOMAIN_CACHE_TTL: Cache TTL in seconds (default: 300)
 * - NODE_ENV: Environment (development/production/test)
 */
const multitenancyConfig: MultiTenancyOptions = {
  /*
  |--------------------------------------------------------------------------
  | Tenant Mode
  |--------------------------------------------------------------------------
  |
  | This option controls how the tenant ID is passed to the backend API.
  | Available modes: FILTER, HEADER, URL, QUERY
  |
  | - FILTER: Adds tenant_id as a filter in the request
  | - HEADER: Adds tenant ID to request headers (most common)
  | - URL: Includes tenant ID as part of the URL path
  | - QUERY: Adds tenant ID as a query string parameter
  |
  */
  mode: (import.meta.env.TENANT_MODE as TenantMode) || TenantMode.HEADER,

  /*
  |--------------------------------------------------------------------------
  | Tenant Resolvers
  |--------------------------------------------------------------------------
  |
  | Array of resolver names in priority order. Resolvers are executed in
  | order until one successfully resolves a tenant ID.
  |
  | Built-in resolvers:
  | - domain: Full domain matching
  | - subdomain: Subdomain extraction
  | - router: URL path-based resolution
  | - header: HTTP header-based resolution
  | - query: Query parameter-based resolution
  | - server-domain: Server-side domain resolution
  | - dynamic-domain: API-based domain resolution
  |
  */
  resolvers: (import.meta.env.TENANT_RESOLVER || 'subdomain,router').split(','),

  /*
  |--------------------------------------------------------------------------
  | Fetch Tenants Function
  |--------------------------------------------------------------------------
  |
  | Required function that retrieves the list of tenants the user has
  | access to. Should return both tenants array and a default tenant.
  | Tenant data is fetched dynamically from your API.
  |
  | IMPORTANT: You must implement this function for your application.
  |
  */
  fetchTenants: async () => {
    const response = await fetch(import.meta.env.TENANT_API_URL || '/api/tenants');
    if (!response.ok) {
      throw new Error(`Failed to fetch tenants: ${response.statusText}`);
    }
    return await response.json();
  },

  /*
  |--------------------------------------------------------------------------
  | Fetch Single Tenant Function
  |--------------------------------------------------------------------------
  |
  | Optional function to fetch detailed information about a single tenant.
  | Used when you need to load tenant-specific configuration or metadata.
  |
  */
  fetchTenant: async ({ id }: { id: BaseKey }) => {
    const response = await fetch(`${import.meta.env.TENANT_API_URL || '/api/tenants'}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant ${id}: ${response.statusText}`);
    }
    return await response.json();
  },

  /*
  |--------------------------------------------------------------------------
  | Base Domain
  |--------------------------------------------------------------------------
  |
  | Required when using subdomain resolver. Used to extract subdomain
  | from hostname. For example, with baseDomain "example.com":
  | - acme.example.com -> tenant: "acme"
  | - demo.example.com -> tenant: "demo"
  |
  */
  baseDomain: import.meta.env.BASE_DOMAIN || 'localhost',

  /*
  |--------------------------------------------------------------------------
  | Header Name
  |--------------------------------------------------------------------------
  |
  | The HTTP header name used to pass tenant ID to the backend when
  | mode is set to HEADER. This is the most common approach for APIs.
  |
  */
  headerName: import.meta.env.TENANT_HEADER_NAME || 'X-Tenant-ID',

  /*
  |--------------------------------------------------------------------------
  | Tenant Field Name
  |--------------------------------------------------------------------------
  |
  | Field name used when mode is FILTER to add tenant filter to data
  | provider methods. This is the column name in your database.
  |
  */
  tenantField: import.meta.env.TENANT_FIELD || 'tenant_id',

  /*
  |--------------------------------------------------------------------------
  | Query Parameter Name
  |--------------------------------------------------------------------------
  |
  | The query string parameter name used to pass tenant ID when mode
  | is set to QUERY.
  |
  */
  queryParam: import.meta.env.TENANT_QUERY_PARAM || 'tenant_id',

  /*
  |--------------------------------------------------------------------------
  | Fallback Tenant ID
  |--------------------------------------------------------------------------
  |
  | Used when all resolvers fail to identify a tenant. Useful for
  | development or default tenant scenarios.
  |
  */
  fallback: import.meta.env.FALLBACK_TENANT_ID || 'default',

  /*
  |--------------------------------------------------------------------------
  | Path-Based Tenants
  |--------------------------------------------------------------------------
  |
  | When true, resolves tenant from URL path: example.com/acme
  | Used by domain resolver.
  |
  */
  pathBasedTenants: import.meta.env.PATH_BASED_TENANTS === 'true',

  /*
  |--------------------------------------------------------------------------
  | Dynamic Domain API Configuration
  |--------------------------------------------------------------------------
  |
  | Configuration for dynamic domain resolver. Only used if
  | "dynamic-domain" resolver is configured in resolvers array.
  |
  */
  dynamicDomainApiUrl: import.meta.env.DYNAMIC_DOMAIN_API_URL,
  dynamicDomainCacheTTL: Number(import.meta.env.DYNAMIC_DOMAIN_CACHE_TTL) || 300,

  /*
  |--------------------------------------------------------------------------
  | Default Tenant
  |--------------------------------------------------------------------------
  |
  | Provides a default tenant object instead of just an ID. Used by
  | MultiTenancyProvider for initialization.
  |
  */
  defaultTenant: {
    id: import.meta.env.DEFAULT_TENANT_ID || 'default',
    name: import.meta.env.DEFAULT_TENANT_NAME || 'Default Organization',
  },

  /*
  |--------------------------------------------------------------------------
  | Logging
  |--------------------------------------------------------------------------
  |
  | Enable console logging for debugging tenant resolution and switching.
  | Automatically enabled in development mode.
  |
  */
  logging: import.meta.env.NODE_ENV === 'development',

  /*
  |--------------------------------------------------------------------------
  | Error Handling
  |--------------------------------------------------------------------------
  |
  | When true, throws an error if no tenant is resolved.
  | When false, uses fallback or returns undefined.
  |
  */
  throwOnMissingTenant: import.meta.env.THROW_ON_MISSING_TENANT === 'true',

  /*
  |--------------------------------------------------------------------------
  | Auto Injection
  |--------------------------------------------------------------------------
  |
  | When false, disables automatic injection of tenant context into data
  | provider. Useful if you want to handle tenant context manually.
  |
  */
  disableAutoInjection: import.meta.env.DISABLE_AUTO_INJECTION === 'true',
};

export default multitenancyConfig;
