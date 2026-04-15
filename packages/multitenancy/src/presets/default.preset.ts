import { TenantMode } from '@/enums';
import type { MultiTenancyOptions } from '@/interfaces/multitenancy-options.interface';

/**
 * Default configuration preset
 *
 * @description
 * Simple filter-based configuration with router resolver.
 * Best for applications where tenant context is managed through routing.
 *
 * @example
 * ```typescript
 * import { defineConfig, defaultPreset } from "@abdokouta/react-multitenancy/config";
 *
 * const config = defineConfig({
 *   ...defaultPreset,
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 */
export const defaultPreset: Partial<MultiTenancyOptions> = {
  mode: TenantMode.FILTER,
  tenantField: 'tenant_id',
  headerName: 'X-Tenant-ID',
  queryParam: 'tenant_id',
  resolvers: ['router'],
};
