import { TenantMode } from '@/enums';
import type { MultiTenancyOptions } from '@/interfaces/multitenancy-options.interface';

/**
 * Header-based configuration preset
 *
 * @description
 * Header-based tenant identification with header and router resolvers.
 * Best for API-first applications where tenant is passed via HTTP headers.
 *
 * @example
 * ```typescript
 * import { defineConfig, headerPreset } from "@stackra-inc/react-multitenancy/config";
 *
 * const config = defineConfig({
 *   ...headerPreset,
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 */
export const headerPreset: Partial<MultiTenancyOptions> = {
  mode: TenantMode.HEADER,
  tenantField: 'tenant_id',
  headerName: 'X-Tenant-ID',
  queryParam: 'tenant_id',
  resolvers: ['header', 'router'],
};
