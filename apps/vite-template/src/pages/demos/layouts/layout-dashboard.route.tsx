/**
 * Dashboard Layout Demo Route
 *
 * Demonstrates using a custom dashboard layout with sidebar navigation.
 *
 * @module pages/demos/layout-dashboard
 */

import { Route } from "@stackra/react-router";
import DashboardLayout from "@/layouts/dashboard";
import LayoutDashboardDemo from "@/components/pages/demos/layouts/layout-dashboard.component";

@Route({
  path: "/demos/layouts/dashboard",
  layout: DashboardLayout,
  label: "Dashboard Layout",
  parent: "/demos",
  variant: "admin",
  hideInMenu: true,
})
export class LayoutDashboardDemoRoute {
  render() {
    return <LayoutDashboardDemo />;
  }
}
