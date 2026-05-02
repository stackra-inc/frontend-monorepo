/**
 * DI Container Demo Route
 *
 * @module pages/demos/ts-container
 */

import { Route } from "@stackra/react-router";

import TsContainerDemo from "@/components/pages/demos/packages/ts-container.component";

@Route({
  path: "/demos/packages/ts-container",
  label: "DI Container",
  variant: "main",
  parent: "/demos",
  order: 42,
})
export class TsContainerDemoRoute {
  render() {
    return <TsContainerDemo />;
  }
}
