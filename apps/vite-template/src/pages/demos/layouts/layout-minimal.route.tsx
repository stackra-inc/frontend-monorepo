/**
 * Minimal Layout Demo Route
 *
 * Demonstrates using a minimal layout without navigation.
 *
 * @module pages/demos/layout-minimal
 */

import { Route } from "@stackra/react-router";
import MinimalLayout from "@/layouts/minimal";
import LayoutMinimalDemo from "@/components/pages/demos/layouts/layout-minimal.component";

@Route({
  path: "/demos/layouts/minimal",
  layout: MinimalLayout,
  label: "Minimal Layout",
  variant: "main",
  parent: "/demos",
  hideInMenu: false,
})
export class LayoutMinimalDemoRoute {
  render() {
    return <LayoutMinimalDemo />;
  }
}
