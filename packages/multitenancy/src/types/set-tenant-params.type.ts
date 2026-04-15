import type { Tenant } from './tenant.type';

/**
 * Parameters for setting/switching the current tenant.
 *
 * @description
 * Used when switching between tenants. The provider's setTenant method
 * receives these parameters and handles the tenant switch logic.
 *
 * @example
 * ```typescript
 * const params: SetTenantParams = {
 *   tenant: { id: "tenant-456", name: "Globex Inc" },
 *   redirectTo: "/dashboard",
 *   preserveState: true
 * };
 *
 * await provider.setTenant(params);
 * ```
 *
 * @property {Tenant} tenant - The tenant to switch to
 *
 * @public
 */
export type SetTenantParams = {
  /**
   * The tenant object to switch to.
   * Must be one of the tenants from the tenants list.
   *
   * @example
   * ```typescript
   * tenant: { id: "tenant-456", name: "Globex Inc" }
   * ```
   */
  tenant: Tenant;

  /**
   * Additional parameters for the tenant switch operation.
   * Use this to pass custom options like redirect URLs, state preservation, etc.
   *
   * @example
   * ```typescript
   * {
   *   tenant: { id: "tenant-456", name: "Globex Inc" },
   *   redirectTo: "/dashboard",
   *   preserveState: true,
   *   reason: "user-initiated"
   * }
   * ```
   */
  [key: string]: any;
};
