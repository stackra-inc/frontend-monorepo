/**
 * Route Matching Demo Route
 *
 * Interactive demonstration of route matching utilities.
 *
 * @module pages/demos/route-matching-demo
 */

import { Route } from "@stackra/react-router";
import RouteMatchingDemo from "@/components/pages/demos/router/route-matching-demo.component";

@Route({
  path: "/demos/router/route-matching",
  label: "Route Matching",
  parent: "/demos",
  hideInMenu: true,
})
export class RouteMatchingDemoRoute {
  render() {
    return <RouteMatchingDemo />;
  }
}
