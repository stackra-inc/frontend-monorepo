import { TenantMode } from '@/enums';
import type { TenantConfig } from '@/interfaces';

/**
 * Default configuration for multi-tenancy.
 *
 * @description
 * Provides sensible defaults for quick start with minimal configuration.
 * These defaults can be overridden by providing a custom configuration.
 *
 * Default settings:
 * - Mode: FILTER (adds tenant as query filter)
 * - Tenant field: "tenant_id"
 * - Header name: "X-Tenant-ID"
 * - Query parameter: "tenant_id"
 * - Resolvers: ["router"] (simplest for beginners)
 *
 * @example
 * ```typescript
 * import { DEFAULT_TENANT_CONFIG } from "@abdokouta/react-multitenancy";
 *
 * // Use defaults
 * const config = { ...DEFAULT_TENANT_CONFIG };
 *
 * // Override specific properties
 * const customConfig = {
 *   ...DEFAULT_TENANT_CONFIG,
 *   mode: TenantMode.HEADER,
 *   resolvers: ["subdomain", "router"],
 * };
 * ```
 *
 * @public
 */
export const DEFAULT_TENANT_CONFIG: Partial<TenantConfig> = {
  mode: TenantMode.FILTER,
  tenantField: 'tenant_id',
  headerName: 'X-Tenant-ID',
  queryParam: 'tenant_id',
  resolvers: ['router'],
};
