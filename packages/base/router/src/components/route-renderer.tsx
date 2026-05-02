/**
 * @fileoverview RouteRenderer — renders all registered routes with
 * guard execution, page/drawer/dialog modes, error boundaries,
 * and Suspense loading states.
 *
 * Reads routes from the `RouteRegistry` via `RouteFacade` and renders
 * them inside `<Routes>`. Each route is wrapped with:
 * - Guard execution (resolves guards from DI, runs `canActivate()`)
 * - Per-route error boundary (Remix-style, falls back to global)
 * - Per-route Suspense boundary (falls back to global loading)
 * - Optional layout wrapper
 *
 * Drawer and dialog routes are rendered as overlays on top of page routes.
 *
 * @module @stackra/react-router
 * @category Components
 *
 * @example
 * ```tsx
 * import { RouteRenderer } from '@stackra/react-router';
 * import { Drawer, Modal } from '@heroui/react';
 *
 * function App() {
 *   return (
 *     <RouteRenderer
 *       fallbackError={GlobalErrorPage}
 *       fallbackLoading={<Spinner size="lg" />}
 *       renderDrawer={(route, content) => (
 *         <Drawer isOpen size={route.drawerOptions?.size ?? 'md'}>
 *           {content}
 *         </Drawer>
 *       )}
 *       renderDialog={(route, content) => (
 *         <Modal isOpen size={route.dialogOptions?.size ?? 'md'}>
 *           {content}
 *         </Modal>
 *       )}
 *     />
 *   );
 * }
 * ```
 */

import { Suspense, useEffect, type ComponentType, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { RouteFacade } from '@/facades/route.facade';
import { RouteErrorBoundary } from './route-error-boundary';
import { GuardedRoute } from './guarded-route';
import { CacheWrapper } from '@/cache/cache-wrapper.component';
import { MetaManager } from '@/meta/meta-manager.component';
import { TransitionWrapper } from '@/transitions/transition-wrapper.component';
import type { RouteDefinition } from '@/interfaces/route-definition.interface';
import type { RouteErrorProps } from '@/interfaces/route-metadata.interface';

/**
 * Props for the `<RouteRenderer>` component.
 */
export interface RouteRendererProps {
  /**
   * Global fallback error component used when a route doesn't define
   * its own `errorComponent`.
   */
  fallbackError?: ComponentType<RouteErrorProps>;

  /**
   * Global loading fallback shown while lazy routes load or guards resolve.
   * Used when a route doesn't define its own `loadingComponent`.
   */
  fallbackLoading?: ReactNode;

  /**
   * Render function for drawer-mode routes.
   * Receives the route definition and rendered content.
   * Implement this with your UI library's drawer component.
   */
  renderDrawer?: (route: RouteDefinition, content: ReactNode) => ReactNode;

  /**
   * Render function for dialog-mode routes.
   * Receives the route definition and rendered content.
   * Implement this with your UI library's modal component.
   */
  renderDialog?: (route: RouteDefinition, content: ReactNode) => ReactNode;
}

/**
 * Default loading fallback.
 */
function DefaultLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      Loading...
    </div>
  );
}

/**
 * Wraps a route's component with guards, error boundary, Suspense, and optional cache.
 *
 * Execution order:
 * 1. Guards run (`canActivate()` for each guard in order)
 * 2. If all guards pass → error boundary wraps the component
 * 3. Suspense handles lazy loading within the error boundary
 * 4. CacheWrapper preserves component state if `keepAlive` is enabled
 * 5. Component renders
 *
 * @param route - The route definition
 * @param fallbackError - Global error fallback component
 * @param fallbackLoading - Global loading fallback
 * @returns The wrapped route content
 */
function renderRouteContent(
  route: RouteDefinition,
  fallbackError?: ComponentType<RouteErrorProps>,
  fallbackLoading?: ReactNode
): ReactNode {
  const Component = route.component;
  const LoadingComponent = route.loadingComponent;
  const loading = LoadingComponent ? <LoadingComponent /> : (fallbackLoading ?? <DefaultLoading />);

  // Wrap component with CacheWrapper if keepAlive is enabled
  const CachedComponent = route.keepAlive
    ? () => (
        <CacheWrapper path={route.path} cacheKey={route.path}>
          <Component />
        </CacheWrapper>
      )
    : Component;

  return (
    <GuardedRoute route={route} loadingFallback={loading}>
      <RouteErrorBoundary errorComponent={route.errorComponent} fallbackComponent={fallbackError}>
        <Suspense fallback={loading}>
          <CachedComponent />
        </Suspense>
      </RouteErrorBoundary>
    </GuardedRoute>
  );
}

/**
 * Renders all registered routes from the RouteRegistry.
 *
 * Supports three rendering modes:
 * - `'page'` — standard full-page render inside `<Routes>`
 * - `'drawer'` — overlay rendered via `renderDrawer` prop
 * - `'dialog'` — overlay rendered via `renderDialog` prop
 *
 * Drawer and dialog routes use background location pattern:
 * - When navigating to a drawer/dialog route, the previous page stays rendered
 * - The drawer/dialog opens as an overlay on top
 * - Closing returns to the background page
 *
 * ## Automatic Integrations
 *
 * - **CacheWrapper**: Routes with `keepAlive: true` automatically preserve state
 * - **MetaManager**: Routes with `meta` property automatically update document metadata
 */
export function RouteRenderer({
  fallbackError,
  fallbackLoading,
  renderDrawer,
  renderDialog,
}: RouteRendererProps) {
  const location = useLocation();
  const routes = RouteFacade.getRoutes();

  // Find current route for meta tags
  const currentRoute = routes.find((r) => r.path === location.pathname);

  // Update meta tags when route changes
  useEffect(() => {
    if (currentRoute?.meta) {
      // MetaManager will be rendered below and handle the updates
    }
  }, [currentRoute]);

  // Check if current location is a drawer or dialog route
  const isOverlayRoute =
    currentRoute && (currentRoute.mode === 'drawer' || currentRoute.mode === 'dialog');

  // Use background location for page routes when an overlay is active
  // This keeps the previous page rendered underneath the overlay
  const backgroundLocation =
    isOverlayRoute && location.state?.backgroundLocation
      ? location.state.backgroundLocation
      : location;

  // Separate routes by rendering mode
  const pageRoutes = routes.filter((r) => !r.mode || r.mode === 'page');
  const drawerRoutes = routes.filter((r) => r.mode === 'drawer');
  const dialogRoutes = routes.filter((r) => r.mode === 'dialog');

  return (
    <>
      {/* Meta tag manager - updates document metadata based on current route */}
      <MetaManager />

      {/* Page routes — rendered inside <Routes> using background location when overlay is active */}
      <Routes location={backgroundLocation}>
        {pageRoutes.map((route) => {
          const content = renderRouteContent(route, fallbackError, fallbackLoading);

          // Wrap with transition if configured
          const transitioned = route.transition ? (
            <TransitionWrapper
              config={route.transition}
              isActive={location.pathname === route.path}
              mode="page"
            >
              {content}
            </TransitionWrapper>
          ) : (
            content
          );

          // Wrap with layout if defined
          const element = route.layout
            ? (() => {
                const Layout = route.layout! as ComponentType<{ children: ReactNode }>;
                return <Layout>{transitioned}</Layout>;
              })()
            : transitioned;

          return <Route key={route.path} path={route.path} element={element} />;
        })}
      </Routes>

      {/* Drawer routes — rendered as overlays when path matches */}
      {renderDrawer &&
        drawerRoutes.map((route) => {
          const isActive = location.pathname === route.path;
          if (!isActive) return null;

          const content = renderRouteContent(route, fallbackError, fallbackLoading);
          return <div key={route.path}>{renderDrawer(route, content)}</div>;
        })}

      {/* Dialog routes — rendered as overlays when path matches */}
      {renderDialog &&
        dialogRoutes.map((route) => {
          const isActive = location.pathname === route.path;
          if (!isActive) return null;

          const content = renderRouteContent(route, fallbackError, fallbackLoading);
          return <div key={route.path}>{renderDialog(route, content)}</div>;
        })}
    </>
  );
}
