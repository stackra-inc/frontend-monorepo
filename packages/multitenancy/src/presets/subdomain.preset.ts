import { TenantMode } from '@/enums';
import type { MultiTenancyOptions } from '@/interfaces/multitenancy-options.interface';

/**
 * Subdomain-based configuration preset
 *
 * @description
 * Subdomain-based SaaS configuration where tenant is resolved from subdomain.
 * Tenant data comes from API via fetchTenants.
 * Best for multi-tenant SaaS applications with subdomain per tenant.
 *
 * @example
 * ```typescript
 * import { defineConfig, subdomainPreset } from "@abdokouta/react-multitenancy/config";
 *
 * const config = defineConfig({
 *   ...subdomainPreset,
 *   baseDomain: "myapp.com",
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 */
export const subdomainPreset: Partial<MultiTenancyOptions> = {
  mode: TenantMode.HEADER,
  headerName: 'X-Tenant-ID',
  resolvers: ['subdomain', 'router'],
  baseDomain: 'example.com',
};
