import type { BaseKey } from '@refinedev/core';

/**
 * Parameters for fetching a specific tenant by ID.
 *
 * @description
 * Used when you need to fetch detailed information about a single tenant.
 * This is optional in the MultiTenancyProvider interface.
 *
 * @example
 * ```typescript
 * const params: GetTenantParams = {
 *   id: "tenant-123",
 *   includeSettings: true,
 *   includeUsers: false
 * };
 *
 * const tenant = await provider.getTenant(params);
 * ```
 *
 * @property {BaseKey} [id] - Tenant ID to fetch
 *
 * @public
 */
export type GetTenantParams = {
  /**
   * Unique identifier of the tenant to fetch.
   *
   * @example "tenant-123" or 123
   */
  id?: BaseKey;

  /**
   * Additional parameters for the tenant fetch operation.
   * Use this to pass custom options to your backend API.
   *
   * @example
   * ```typescript
   * {
   *   id: "tenant-123",
   *   includeSettings: true,
   *   includeUsers: false,
   *   fields: ["id", "name", "settings"]
   * }
   * ```
   */
  [key: string]: any;
};
