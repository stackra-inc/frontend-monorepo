/**
 * WithTenant Component
 *
 * Higher-order component that handles tenant loading and error states.
 *
 * @example
 * ```tsx
 * import { WithTenant } from "@stackra/react-multitenancy";
 *
 * const App = () => (
 *   <WithTenant>
 *     <Dashboard />
 *   </WithTenant>
 * );
 * ```
 */

import React from 'react';
import { useTenant } from '@/hooks';

/**
 * Props for WithTenant component
 */
export interface WithTenantProps {
  /**
   * Child components to render when tenant is loaded
   */
  children: React.ReactNode;

  /**
   * Component to render when tenant is loading
   *
   * @default <div>Loading tenant...</div>
   */
  loadingComponent?: React.ReactNode;

  /**
   * Component to render when error occurs or no tenant is found
   *
   * @default <div>No tenant selected</div>
   */
  fallback?: React.ReactNode;
}

/**
 * Higher-order component that handles tenant loading and error states.
 *
 * @description
 * This component wraps your application and automatically handles:
 * - Loading state while tenant data is being fetched
 * - Error state if tenant fetching fails
 * - No tenant state if no tenant is resolved
 *
 * Use this component to ensure your application only renders when
 * a valid tenant is available.
 *
 * @param props - Component props
 * @returns Rendered component based on tenant state
 *
 * @example
 * ```tsx
 * // Basic usage
 * <WithTenant>
 *   <Dashboard />
 * </WithTenant>
 * ```
 *
 * @example
 * ```tsx
 * // With custom loading component
 * <WithTenant loadingComponent={<Spinner />}>
 *   <Dashboard />
 * </WithTenant>
 * ```
 *
 * @example
 * ```tsx
 * // With custom fallback
 * <WithTenant
 *   fallback={
 *     <div>
 *       <h1>No Tenant Selected</h1>
 *       <p>Please select a tenant to continue</p>
 *     </div>
 *   }
 * >
 *   <Dashboard />
 * </WithTenant>
 * ```
 *
 * @example
 * ```tsx
 * // With custom loading and error handling
 * <WithTenant
 *   loadingComponent={
 *     <div className="loading">
 *       <Spinner />
 *       <p>Loading tenant data...</p>
 *     </div>
 *   }
 *   fallback={
 *     <ErrorBoundary>
 *       <TenantSelector />
 *     </ErrorBoundary>
 *   }
 * >
 *   <Dashboard />
 * </WithTenant>
 * ```
 *
 * @example
 * ```tsx
 * // Wrapping entire app
 * const App = () => (
 *   <Refine
 *     multiTenancyProvider={multiTenancyProvider}
 *     // ... other props
 *   >
 *     <MultiTenancyProvider provider={multiTenancyProvider}>
 *       <WithTenant>
 *         <RouterProvider />
 *       </WithTenant>
 *     </MultiTenancyProvider>
 *   </Refine>
 * );
 * ```
 */
export const WithTenant: React.FC<WithTenantProps> = ({
  children,
  loadingComponent = <div>Loading tenant...</div>,
  fallback = <div>No tenant selected</div>,
}) => {
  const { tenant, isLoading, error } = useTenant();

  // Show loading component while loading
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // Show fallback if error or no tenant
  if (error || !tenant) {
    return <>{fallback}</>;
  }

  // Render children when tenant is loaded
  return <>{children}</>;
};

export default WithTenant;
