import { TenantMode } from '@/enums';
import type { MultiTenancyOptions } from '@/interfaces/multitenancy-options.interface';

/**
 * Domain-based configuration preset
 *
 * @description
 * Custom domains with subdomain fallback and dynamic domain resolution.
 * Domain mappings come from API via dynamic-domain resolver.
 * Best for enterprise SaaS with custom domain support.
 *
 * @example
 * ```typescript
 * import { defineConfig, domainPreset } from "@stackra/react-multitenancy/config";
 *
 * const config = defineConfig({
 *   ...domainPreset,
 *   baseDomain: "myapp.com",
 *   dynamicDomainApiUrl: "/api/tenants/resolve",
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 */
export const domainPreset: Partial<MultiTenancyOptions> = {
  mode: TenantMode.HEADER,
  headerName: 'X-Tenant-ID',
  resolvers: ['dynamic-domain', 'subdomain', 'router'],
  baseDomain: 'example.com',
  dynamicDomainApiUrl: '/api/tenants/resolve',
};
