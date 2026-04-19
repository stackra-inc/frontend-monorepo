import type { IMultiTenancyProvider } from '@/interfaces/multi-tenancy-provider.interface';
import type { Tenant } from '@/types';

/**
 * Context interface for multi-tenancy state management.
 *
 * @description
 * The IMultiTenancyContext interface defines the shape of the multi-tenancy
 * context that is provided to all components in the application. It contains
 * the current tenant state, available tenants, loading state, and error state.
 *
 * This context is created by the MultiTenancyContextProvider and consumed
 * via the useMultiTenancyContext hook or useTenant hook.
 *
 * @example
 * ```typescript
 * import { useMultiTenancyContext } from "@stackra-inc/react-multitenancy";
 *
 * const MyComponent = () => {
 *   const context = useMultiTenancyContext();
 *
 *   if (context.isLoading) {
 *     return <div>Loading tenants...</div>;
 *   }
 *
 *   if (context.error) {
 *     return <div>Error: {context.error.message}</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Current Tenant: {context.currentTenant?.name}</h1>
 *       <p>Available Tenants: {context.tenants.length}</p>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Using with useTenant hook (recommended)
 * import { useTenant } from "@stackra-inc/react-multitenancy";
 *
 * const TenantInfo = () => {
 *   const { tenant, tenants, isLoading, error } = useTenant();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h2>{tenant?.name}</h2>
 *       <select>
 *         {tenants.map(t => (
 *           <option key={t.id} value={t.id}>{t.name}</option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Creating the context provider
 * import { MultiTenancyContextProvider } from "@stackra-inc/react-multitenancy";
 *
 * const App = () => {
 *   const multiTenancyProvider = createMultiTenancyProvider({
 *     config: tenantConfig,
 *     fetchTenants: async () => {
 *       const response = await fetch("/api/tenants");
 *       return await response.json();
 *     }
 *   });
 *
 *   return (
 *     <MultiTenancyContextProvider provider={multiTenancyProvider}>
 *       <YourApp />
 *     </MultiTenancyContextProvider>
 *   );
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Conditional rendering based on tenant state
 * const ProtectedContent = () => {
 *   const { currentTenant, isLoading, error } = useMultiTenancyContext();
 *
 *   if (isLoading) {
 *     return <Spinner />;
 *   }
 *
 *   if (error) {
 *     return <ErrorBoundary error={error} />;
 *   }
 *
 *   if (!currentTenant) {
 *     return <NoTenantSelected />;
 *   }
 *
 *   return <Dashboard tenant={currentTenant} />;
 * };
 * ```
 *
 * @public
 */
export interface IMultiTenancyContext {
  /**
   * The multi-tenancy provider instance.
   *
   * @description
   * The provider instance that manages tenant resolution and operations.
   * This is typically created using the createMultiTenancyProvider factory
   * and passed to the MultiTenancyContextProvider.
   *
   * This property may be undefined if the context is accessed outside of
   * the MultiTenancyContextProvider or before initialization is complete.
   *
   * @example
   * ```typescript
   * const context = useMultiTenancyContext();
   *
   * // Access provider methods directly
   * if (context.provider) {
   *   const tenantId = await context.provider.getTenantId();
   *   console.log("Current tenant ID:", tenantId);
   * }
   * ```
   *
   * @remarks
   * - Usually you don't need to access the provider directly
   * - Use the useTenant hook for common operations
   * - The provider is available after context initialization
   */
  provider?: IMultiTenancyProvider;

  /**
   * Array of all available tenants.
   *
   * @description
   * The complete list of tenants that the current user has access to.
   * This list is fetched from the backend during context initialization
   * using the provider's getTenants method.
   *
   * The array is empty during loading or if the fetch fails.
   *
   * @example
   * ```typescript
   * const { tenants } = useTenant();
   *
   * return (
   *   <select>
   *     {tenants.map(tenant => (
   *       <option key={tenant.id} value={tenant.id}>
   *         {tenant.name}
   *       </option>
   *     ))}
   *   </select>
   * );
   * ```
   *
   * @example
   * ```typescript
   * // Filter tenants by custom property
   * const { tenants } = useTenant();
   * const activeTenants = tenants.filter(t => t.status === "active");
   * ```
   *
   * @example
   * ```typescript
   * // Find specific tenant
   * const { tenants } = useTenant();
   * const tenant = tenants.find(t => t.slug === "acme");
   * ```
   *
   * @remarks
   * - This array is populated after the initial fetch completes
   * - The array is empty during loading (check isLoading)
   * - The array may be empty if the user has no tenant access
   * - Tenants are filtered by the backend based on user permissions
   */
  tenants: Tenant[];

  /**
   * Currently active tenant (alias for currentTenant).
   *
   * @deprecated Use currentTenant instead
   */
  tenant: Tenant | undefined;

  /**
   * Currently active tenant.
   *
   * @description
   * The tenant that is currently selected/active in the application.
   * This is resolved using the configured resolver chain during context
   * initialization.
   *
   * The value is undefined during loading, if no tenant is resolved,
   * or if tenant resolution fails.
   *
   * @example
   * ```typescript
   * const { currentTenant } = useTenant();
   *
   * if (currentTenant) {
   *   return <h1>Welcome to {currentTenant.name}</h1>;
   * }
   *
   * return <h1>No tenant selected</h1>;
   * ```
   *
   * @example
   * ```typescript
   * // Access custom tenant properties
   * const { currentTenant } = useTenant();
   *
   * const theme = currentTenant?.settings?.theme || "light";
   * const features = currentTenant?.features || [];
   * ```
   *
   * @example
   * ```typescript
   * // Use in data fetching
   * const { currentTenant } = useTenant();
   * const { data } = useList({
   *   resource: "products",
   *   filters: [
   *     { field: "tenant_id", operator: "eq", value: currentTenant?.id }
   *   ]
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Conditional rendering based on tenant
   * const { currentTenant } = useTenant();
   *
   * return (
   *   <div>
   *     <Logo src={currentTenant?.logo} />
   *     <h1>{currentTenant?.name}</h1>
   *     {currentTenant?.features?.includes("analytics") && (
   *       <AnalyticsDashboard />
   *     )}
   *   </div>
   * );
   * ```
   *
   * @remarks
   * - This value is undefined during loading (check isLoading)
   * - This value may be undefined if no tenant is resolved
   * - The tenant is resolved using the configured resolver chain
   * - If no resolver succeeds, the defaultTenant is used
   * - Always check for undefined before accessing properties
   */
  currentTenant: Tenant | undefined;

  /**
   * Function to switch to a different tenant.
   *
   * @param tenantId - ID of the tenant to switch to
   * @returns Promise that resolves when tenant is switched
   *
   * @throws Error if tenant not found
   *
   * @example
   * ```typescript
   * const { setTenant } = useTenant();
   *
   * await setTenant("tenant-123");
   * ```
   */
  setTenant: (tenantId: string) => Promise<void>;

  /**
   * Loading state during initialization.
   *
   * @description
   * Indicates whether the context is currently loading tenant data.
   * This is true during the initial fetch of tenants and tenant resolution.
   *
   * Use this to show loading indicators while tenant data is being fetched.
   *
   * @example
   * ```typescript
   * const { isLoading, currentTenant } = useTenant();
   *
   * if (isLoading) {
   *   return <Spinner />;
   * }
   *
   * return <Dashboard tenant={currentTenant} />;
   * ```
   *
   * @example
   * ```typescript
   * // Show skeleton while loading
   * const { isLoading, tenants } = useTenant();
   *
   * if (isLoading) {
   *   return <TenantSelectorSkeleton />;
   * }
   *
   * return <TenantSelector tenants={tenants} />;
   * ```
   *
   * @example
   * ```typescript
   * // Disable interactions while loading
   * const { isLoading, setTenant } = useTenant();
   *
   * return (
   *   <button
   *     onClick={() => setTenant(newTenant)}
   *     disabled={isLoading}
   *   >
   *     {isLoading ? "Switching..." : "Switch Tenant"}
   *   </button>
   * );
   * ```
   *
   * @remarks
   * - This is true only during initial context initialization
   * - This does not track loading state for setTenant operations
   * - Use this to prevent rendering before tenant data is available
   * - Consider using the WithTenant component for automatic loading handling
   */
  isLoading: boolean;

  /**
   * Error state if initialization fails.
   *
   * @description
   * Contains the error object if tenant fetching or resolution fails.
   * This is null during loading and when no error has occurred.
   *
   * Use this to display error messages or fallback UI when tenant
   * initialization fails.
   *
   * @example
   * ```typescript
   * const { error, isLoading } = useTenant();
   *
   * if (isLoading) {
   *   return <Spinner />;
   * }
   *
   * if (error) {
   *   return (
   *     <Alert severity="error">
   *       Failed to load tenants: {error.message}
   *     </Alert>
   *   );
   * }
   *
   * return <Dashboard />;
   * ```
   *
   * @example
   * ```typescript
   * // Retry on error
   * const { error } = useTenant();
   *
   * if (error) {
   *   return (
   *     <div>
   *       <p>Error: {error.message}</p>
   *       <button onClick={() => window.location.reload()}>
   *         Retry
   *       </button>
   *     </div>
   *   );
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Log error for monitoring
   * const { error } = useTenant();
   *
   * useEffect(() => {
   *   if (error) {
   *     console.error("Tenant initialization failed:", error);
   *     // Send to error tracking service
   *     errorTracker.captureException(error);
   *   }
   * }, [error]);
   * ```
   *
   * @example
   * ```typescript
   * // Fallback to default behavior on error
   * const { error, currentTenant } = useTenant();
   *
   * if (error) {
   *   console.warn("Using fallback tenant due to error:", error);
   *   return <Dashboard tenant={fallbackTenant} />;
   * }
   *
   * return <Dashboard tenant={currentTenant} />;
   * ```
   *
   * @remarks
   * - This is null when no error has occurred
   * - This is null during loading (check isLoading first)
   * - Errors are logged to console automatically
   * - Consider implementing error boundaries for better error handling
   * - The error may contain sensitive information, sanitize before displaying
   */
  error: Error | null;
}
