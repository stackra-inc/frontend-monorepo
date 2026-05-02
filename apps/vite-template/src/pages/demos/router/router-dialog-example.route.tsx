/**
 * Router Dialog Example Route
 *
 * Demonstrates dialog/modal rendering mode with @stackra/react-router.
 * Opens as a centered modal overlay.
 *
 * @module pages/demos/router-dialog-example
 */

import { Route } from "@stackra/react-router";

import RouterDialogExample from "@/components/pages/demos/router/router-dialog-example.component";

@Route({
  path: "/demos/router/dialog",
  mode: "dialog",
  dialogOptions: {
    size: "md",
    isDismissable: true,
    showCloseButton: true,
  },
})
export class RouterDialogExampleRoute {
  render() {
    return <RouterDialogExample />;
  }
}
