/**
 * Router Drawer Example Route
 *
 * Demonstrates drawer rendering mode with @stackra/react-router.
 * Opens as a slide-in panel from the right side.
 *
 * @module pages/demos/router-drawer-example
 */

import { Route } from "@stackra/react-router";

import RouterDrawerExample from "@/components/pages/demos/router/router-drawer-example.component";

@Route({
  path: "/demos/router/drawer",
  mode: "drawer",
  drawerOptions: {
    size: "lg",
    placement: "right",
    isDismissable: true,
  },
})
export class RouterDrawerExampleRoute {
  render() {
    return <RouterDrawerExample />;
  }
}
