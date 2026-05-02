/**
 * Breadcrumb Example Route
 *
 * Demonstrates breadcrumb navigation with parent relationships.
 *
 * @module pages/demos/breadcrumb-example
 */

import { Route } from "@stackra/react-router";
import BreadcrumbExample from "@/components/pages/demos/features/breadcrumb-example.component";

@Route({
  path: "/demos/features/breadcrumb",
  label: "Breadcrumb Demo",
  parent: "/demos",
  hideInMenu: true,
})
export class BreadcrumbExampleRoute {
  render() {
    return <BreadcrumbExample />;
  }
}
