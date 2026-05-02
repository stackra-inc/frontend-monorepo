/**
 * Router Guards Example Route
 *
 * Demonstrates route guards (middleware) with @stackra/react-router.
 * This route requires authentication to access.
 *
 * @module pages/demos/router-guards-example
 */

import { Route } from "@stackra/react-router";
import { AuthGuard } from "@/guards";

import RouterGuardsExample from "@/components/pages/demos/router/router-guards-example.component";

@Route({
  path: "/demos/router/guards",
  guards: [AuthGuard],
  label: "Guards Demo",
  parent: "/demos",
  hideInMenu: true,
})
export class RouterGuardsExampleRoute {
  render() {
    return <RouterGuardsExample />;
  }
}
