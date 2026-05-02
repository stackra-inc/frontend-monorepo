/**
 * @fileoverview Route for nested routes demo.
 */

import { Route } from "@stackra/react-router";
import { NestedRoutesDemo } from "@/components/pages/demos/router/nested-routes-demo.component";

@Route({
  path: "/demos/router/nested-routes",
  label: "Nested Routes",
  variant: "main",
  parent: "/demos",
  order: 32,
})
export class NestedRoutesDemoRoute {
  render() {
    return <NestedRoutesDemo />;
  }
}
