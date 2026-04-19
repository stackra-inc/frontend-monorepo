import type { BaseKey } from '@refinedev/core';
import type { GetTenantParams, SetTenantParams, Tenant, TenantResponse } from '@/types';

/**
 * Main provider interface for managing tenant state and operations.
 *
 * @description
 * The IMultiTenancyProvider is the core interface that manages tenant resolution,
 * switching, and data fetching. It uses a resolver chain to determine the current
 * tenant and provides methods to switch tenants and fetch tenant data.
 *
 * Implementations of this interface are typically created using the
 * `createMultiTenancyProvider` factory function, which handles resolver
 * instantiation and configuration.
 *
 * @example
 * ```typescript
 * import { createMultiTenancyProvider } from "@stackra/react-multitenancy";
 *
 * const multiTenancyProvider = createMultiTenancyProvider({
 *   config: {
 *     mode: TenantMode.HEADER,
 *     resolvers: ["router", "header"],
 *     headerName: "X-Tenant-ID",
 *     fallback: "default-tenant"
 *   },
 *   fetchTenants: async () => {
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using the provider in your application
 * const App = () => {
 *   return (
 *     <Refine
 *       multiTenancyProvider={multiTenancyProvider}
 *       // ... other props
 *     >
 *       <MultiTenancyProvider provider={multiTenancyProvider}>
 *         {/* Your app components *\/}
 *       </MultiTenancyProvider>
 *     </Refine>
 *   );
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Custom implementation
 * const customProvider: IMultiTenancyProvider = {
 *   getTenantId: async () => {
 *     // Custom logic to resolve tenant ID
 *     const tenantId = await myCustomResolver();
 *     return tenantId;
 *   },
 *
 *   setTenant: async ({ tenant }) => {
 *     // Custom logic to switch tenant
 *     localStorage.setItem("current-tenant", tenant.id);
 *     window.location.reload();
 *   },
 *
 *   getTenants: async () => {
 *     // Fetch tenants from your API
 *     const response = await fetch("/api/tenants");
 *     return await response.json();
 *   },
 *
 *   getTenant: async ({ id }) => {
 *     // Fetch specific tenant
 *     const response = await fetch(`/api/tenants/${id}`);
 *     return await response.json();
 *   }
 * };
 * ```
 *
 * @public
 */
export interface IMultiTenancyProvider {
  /**
   * Get the current tenant ID using the configured resolver chain.
   *
   * @description
   * This method executes the resolver chain in priority order until a resolver
   * returns a tenant ID. If no resolver succeeds, it returns the configured
   * fallback tenant ID or undefined.
   *
   * The method supports both synchronous and asynchronous resolution, so it
   * can return the tenant ID directly or as a Promise.
   *
   * @returns The current tenant ID, or undefined if no tenant is resolved
   *
   * @example
   * ```typescript
   * // Synchronous usage
   * const tenantId = provider.getTenantId();
   * console.log("Current tenant:", tenantId);
   * ```
   *
   * @example
   * ```typescript
   * // Asynchronous usage
   * const tenantId = await provider.getTenantId();
   * if (tenantId) {
   *   console.log("Resolved tenant:", tenantId);
   * } else {
   *   console.log("No tenant resolved, using default");
   * }
   * ```
   *
   * @remarks
   * - The resolver chain stops at the first successful resolver
   * - If all resolvers fail, the fallback tenant ID is returned
   * - This method is called automatically by the MultiTenancyContextProvider
   * - Performance depends on the resolver types (domain: ~0ms, API: ~50-100ms)
   */
  getTenantId: () => BaseKey | undefined | Promise<BaseKey | undefined>;

  /**
   * Set the current tenant and trigger necessary side effects.
   *
   * @description
   * This method switches the current tenant to the specified tenant. The behavior
   * depends on the primary resolver type:
   *
   * - **Subdomain-based**: Navigates to the new subdomain (full page reload)
   * - **Header-based**: Updates localStorage and reloads the page
   * - **Router-based**: Uses SPA navigation (handled by useTenantSwitch hook)
   * - **Domain-based**: May redirect to the tenant's custom domain
   *
   * @param params - Parameters containing the tenant to switch to
   * @returns void or Promise<void> depending on the implementation
   *
   * @example
   * ```typescript
   * // Switch to a different tenant
   * await provider.setTenant({
   *   tenant: { id: "tenant-456", name: "Globex Inc" }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Switch with custom parameters
   * await provider.setTenant({
   *   tenant: { id: "tenant-456", name: "Globex Inc" },
   *   redirectTo: "/dashboard",
   *   preserveState: true
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Using with useTenant hook
   * const { setTenant, tenants } = useTenant();
   *
   * const handleTenantChange = async (tenantId: string) => {
   *   const tenant = tenants.find(t => t.id === tenantId);
   *   if (tenant) {
   *     await setTenant(tenant);
   *   }
   * };
   * ```
   *
   * @remarks
   * - This method may cause a full page reload or navigation
   * - Unsaved changes may be lost during tenant switching
   * - The tenant must exist in the tenants list
   * - Consider showing a confirmation dialog before switching
   */
  setTenant: (params: SetTenantParams) => void | Promise<void>;

  /**
   * Fetch all available tenants from the backend.
   *
   * @description
   * This method retrieves the list of all tenants that the current user has
   * access to, along with a default tenant to use when no tenant is explicitly
   * selected.
   *
   * The backend should filter the tenant list based on the authenticated user's
   * permissions. Not all users should see all tenants.
   *
   * @returns Promise resolving to TenantResponse with tenants array and defaultTenant
   *
   * @example
   * ```typescript
   * // Fetch tenants
   * const { tenants, defaultTenant } = await provider.getTenants();
   *
   * console.log("Available tenants:", tenants);
   * console.log("Default tenant:", defaultTenant);
   * ```
   *
   * @example
   * ```typescript
   * // Implementation with error handling
   * const fetchTenants = async (): Promise<TenantResponse> => {
   *   try {
   *     const response = await fetch("/api/tenants", {
   *       headers: {
   *         Authorization: `Bearer ${token}`
   *       }
   *     });
   *
   *     if (!response.ok) {
   *       throw new Error("Failed to fetch tenants");
   *     }
   *
   *     return await response.json();
   *   } catch (error) {
   *     console.error("Error fetching tenants:", error);
   *     // Return fallback data
   *     return {
   *       tenants: [],
   *       defaultTenant: { id: "default", name: "Default Tenant" }
   *     };
   *   }
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Backend API endpoint example
   * // GET /api/tenants
   * {
   *   "tenants": [
   *     { "id": "tenant-123", "name": "Acme Corp", "slug": "acme" },
   *     { "id": "tenant-456", "name": "Globex Inc", "slug": "globex" }
   *   ],
   *   "defaultTenant": { "id": "tenant-123", "name": "Acme Corp" }
   * }
   * ```
   *
   * @remarks
   * - This method is called once during MultiTenancyContextProvider initialization
   * - The result is cached in the context state
   * - Consider implementing pagination for large tenant lists
   * - The backend should enforce proper authorization
   */
  getTenants: () => Promise<TenantResponse>;

  /**
   * Fetch a specific tenant by ID (optional).
   *
   * @description
   * This optional method fetches detailed information about a single tenant.
   * Use this when you need more information than what's available in the
   * tenants list (e.g., settings, features, users, etc.).
   *
   * @param params - Parameters containing the tenant ID to fetch
   * @returns Promise resolving to the Tenant object
   *
   * @example
   * ```typescript
   * // Fetch specific tenant
   * const tenant = await provider.getTenant?.({ id: "tenant-123" });
   * console.log("Tenant details:", tenant);
   * ```
   *
   * @example
   * ```typescript
   * // Fetch with additional parameters
   * const tenant = await provider.getTenant?.({
   *   id: "tenant-123",
   *   includeSettings: true,
   *   includeUsers: false
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Implementation example
   * const getTenant = async ({ id, ...options }: GetTenantParams): Promise<Tenant> => {
   *   const queryParams = new URLSearchParams({
   *     ...options,
   *     id: String(id)
   *   });
   *
   *   const response = await fetch(`/api/tenants/${id}?${queryParams}`);
   *   return await response.json();
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Backend API endpoint example
   * // GET /api/tenants/:id
   * {
   *   "id": "tenant-123",
   *   "name": "Acme Corp",
   *   "slug": "acme",
   *   "subdomain": "acme",
   *   "customDomain": "acme.com",
   *   "settings": {
   *     "theme": "dark",
   *     "features": ["analytics", "api-access"]
   *   },
   *   "users": [
   *     { "id": "user-1", "name": "John Doe", "role": "admin" }
   *   ]
   * }
   * ```
   *
   * @remarks
   * - This method is optional and may not be implemented by all providers
   * - Check if the method exists before calling: `provider.getTenant?.()`
   * - Use this for fetching detailed tenant information on-demand
   * - The backend should verify the user has access to the requested tenant
   */
  getTenant?: (params: GetTenantParams) => Promise<Tenant>;
}
