/**
 * Demos Landing Page Route
 *
 * @module pages/demos
 */

import { Route } from "@stackra/react-router";

import DemosPage from "@/components/pages/demos/index.component";

@Route({
  path: "/demos",
  label: "Demos",
  variant: "main",
  order: 2,
})
export class DemosRoute {
  render() {
    return <DemosPage />;
  }
}
