/**
 * React Router Demo Route
 *
 * Demonstrates all @stackra/react-router features:
 * - Page routes with layouts
 * - Drawer routes
 * - Dialog/modal routes
 * - Route guards
 * - Error boundaries
 * - Loading states
 * - Resource-based routing
 *
 * @module pages/demos/react-router
 */

import { Route } from "@stackra/react-router";

import ReactRouterDemoPage from "@/components/pages/demos/router/react-router.component";

@Route({
  path: "/demos/router/react-router",
  label: "React Router",
  variant: "main",
  parent: "/demos",
  order: 31,
})
export class ReactRouterDemoRoute {
  render() {
    return <ReactRouterDemoPage />;
  }
}
