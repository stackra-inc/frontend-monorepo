import type { Tenant } from './tenant.type';

/**
 * Response type for fetching tenants from the backend.
 *
 * @description
 * This type defines the expected response structure when fetching
 * the list of available tenants. The backend API should return data
 * in this format.
 *
 * @example
 * ```typescript
 * // Backend API response
 * const response: TenantResponse = {
 *   tenants: [
 *     { id: "tenant-123", name: "Acme Corp" },
 *     { id: "tenant-456", name: "Globex Inc" }
 *   ],
 *   defaultTenant: { id: "tenant-123", name: "Acme Corp" }
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Usage in provider
 * const multiTenancyProvider = createMultiTenancyProvider({
 *   fetchTenants: async (): Promise<TenantResponse> => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 *
 * @property {Tenant[]} tenants - Array of all available tenants
 * @property {Tenant} defaultTenant - Default tenant to use if none is selected
 *
 * @public
 */
export type TenantResponse = {
  /**
   * Array of all available tenants that the current user has access to.
   *
   * @remarks
   * The backend should filter this list based on the authenticated user's
   * permissions. Not all users should see all tenants.
   *
   * @example
   * ```typescript
   * tenants: [
   *   { id: "tenant-123", name: "Acme Corp", slug: "acme" },
   *   { id: "tenant-456", name: "Globex Inc", slug: "globex" }
   * ]
   * ```
   */
  tenants: Tenant[];

  /**
   * Default tenant to use when no tenant is explicitly selected.
   *
   * @remarks
   * This is typically:
   * - The first tenant in the list
   * - The user's primary organization
   * - The tenant from the current domain
   *
   * @example
   * ```typescript
   * defaultTenant: { id: "tenant-123", name: "Acme Corp" }
   * ```
   */
  defaultTenant: Tenant;
};
