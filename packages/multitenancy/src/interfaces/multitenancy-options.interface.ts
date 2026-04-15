import type { BaseKey } from '@refinedev/core';
import type { Tenant, TenantResponse } from '@/types';
import type { TenantMode } from '@/enums';

/**
 * Multi-Tenancy Configuration Options
 *
 * @description
 * Complete configuration interface for the multi-tenancy package.
 * All options are documented with examples and best practices.
 *
 * @example
 * ```typescript
 * const config: MultiTenancyOptions = {
 *   mode: TenantMode.HEADER,
 *   resolvers: ["subdomain", "router"],
 *   baseDomain: "example.com",
 *   headerName: "X-Tenant-ID",
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * };
 * ```
 */
export interface MultiTenancyOptions {
  /**
   * How to pass tenant ID to the backend API.
   *
   * @description
   * Determines how the tenant context is communicated between frontend and backend.
   *
   * Options:
   * - FILTER: Adds tenant_id as a filter in the request
   * - HEADER: Adds tenant ID to request headers (most common)
   * - URL: Includes tenant ID as part of the URL path
   * - QUERY: Adds tenant ID as a query string parameter
   *
   * @default TenantMode.FILTER
   *
   * @example
   * ```typescript
   * mode: TenantMode.HEADER
   * ```
   */
  mode: TenantMode;

  /**
   * Array of resolver names in priority order.
   *
   * @description
   * Resolvers are executed in order until one successfully resolves a tenant ID.
   * Built-in resolvers: "domain", "subdomain", "router", "header", "query", "server-domain", "dynamic-domain"
   *
   * @example
   * ```typescript
   * resolvers: ["subdomain", "router"]
   * ```
   */
  resolvers: string[];

  /**
   * Function to fetch all tenants from the backend.
   *
   * @description
   * Required function that retrieves the list of tenants the user has access to.
   * Should return both tenants array and a default tenant.
   * Tenant data is fetched dynamically from your API.
   *
   * @example
   * ```typescript
   * fetchTenants: async () => {
   *   const response = await fetch("/api/tenants");
   *   return await response.json();
   * }
   * ```
   */
  fetchTenants: () => Promise<TenantResponse>;

  /**
   * Fallback tenant ID if no resolver succeeds.
   *
   * @description
   * Used when all resolvers fail to identify a tenant.
   * Useful for development or default tenant scenarios.
   *
   * @default undefined
   *
   * @example
   * ```typescript
   * fallback: "default-tenant"
   * ```
   */
  fallback?: BaseKey;

  /**
   * Field name for tenant in filters/query.
   *
   * @description
   * Used when mode is FILTER to add tenant filter to data provider methods.
   *
   * @default "tenant_id"
   *
   * @example
   * ```typescript
   * tenantField: "organization_id"
   * ```
   */
  tenantField?: string;

  /**
   * Header name when mode is HEADER.
   *
   * @description
   * The HTTP header name used to pass tenant ID to the backend.
   *
   * @default "X-Tenant-ID"
   *
   * @example
   * ```typescript
   * headerName: "X-Organization-ID"
   * ```
   */
  headerName?: string;

  /**
   * Query parameter name when mode is QUERY.
   *
   * @description
   * The query string parameter name used to pass tenant ID.
   *
   * @default "tenant_id"
   *
   * @example
   * ```typescript
   * queryParam: "org_id"
   * ```
   */
  queryParam?: string;

  /**
   * Base domain for subdomain matching.
   *
   * @description
   * Required when using subdomain resolver.
   * Used to extract subdomain from hostname.
   *
   * @example
   * ```typescript
   * baseDomain: "example.com"
   * // Matches: acme.example.com -> "acme"
   * ```
   */
  baseDomain?: string;

  /**
   * Enable path-based tenant resolution.
   *
   * @description
   * When true, resolves tenant from URL path: example.com/acme
   * Used by domain resolver.
   *
   * @default false
   *
   * @example
   * ```typescript
   * pathBasedTenants: true
   * // Matches: example.com/acme -> "acme"
   * ```
   */
  pathBasedTenants?: boolean;

  /**
   * API endpoint for dynamic domain resolution.
   *
   * @description
   * Only used if "dynamic-domain" resolver is configured.
   * The endpoint should accept domain as query parameter and return tenant ID.
   *
   * @example
   * ```typescript
   * dynamicDomainApiUrl: "/api/tenants/resolve"
   * ```
   */
  dynamicDomainApiUrl?: string;

  /**
   * Cache TTL for dynamic domain resolver (in seconds).
   *
   * @description
   * How long to cache domain-to-tenant mappings.
   *
   * @default 300 (5 minutes)
   *
   * @example
   * ```typescript
   * dynamicDomainCacheTTL: 600 // 10 minutes
   * ```
   */
  dynamicDomainCacheTTL?: number;

  /**
   * Optional function to fetch a specific tenant by ID.
   *
   * @description
   * Used to fetch detailed information about a single tenant.
   *
   * @example
   * ```typescript
   * fetchTenant: async ({ id }) => {
   *   const response = await fetch(`/api/tenants/${id}`);
   *   return await response.json();
   * }
   * ```
   */
  fetchTenant?: (params: { id: BaseKey }) => Promise<Tenant>;

  /**
   * Whether to enable logging for multi-tenancy operations.
   *
   * @description
   * Enables console logging for debugging tenant resolution and switching.
   *
   * @default false
   *
   * @example
   * ```typescript
   * logging: true
   * ```
   */
  logging?: boolean;

  /**
   * Whether to throw an error when tenant resolution fails.
   *
   * @description
   * When true, throws an error if no tenant is resolved.
   * When false, uses fallback or returns undefined.
   *
   * @default false
   *
   * @example
   * ```typescript
   * throwOnMissingTenant: true
   * ```
   */
  throwOnMissingTenant?: boolean;

  /**
   * Whether to disable automatic tenant context injection.
   *
   * @description
   * When true, disables automatic injection of tenant context into data provider.
   * Useful if you want to handle tenant context manually.
   *
   * @default false
   *
   * @example
   * ```typescript
   * disableAutoInjection: true
   * ```
   */
  disableAutoInjection?: boolean;

  /**
   * Default tenant to use when no tenant is resolved.
   *
   * @description
   * Provides a default tenant object instead of just an ID.
   * Used by MultiTenancyProvider for initialization.
   *
   * @example
   * ```typescript
   * defaultTenant: {
   *   id: "default",
   *   name: "Default Organization"
   * }
   * ```
   */
  defaultTenant?: Tenant;
}
