/**
 * Config Demo Route
 *
 * @module pages/demos/ts-config
 */

import { Route } from "@stackra/react-router";

import TsConfigDemo from "@/components/pages/demos/packages/ts-config.component";

@Route({
  path: "/demos/packages/ts-config",
  label: "Config",
  variant: "main",
  parent: "/demos",
  order: 41,
})
export class TsConfigDemoRoute {
  render() {
    return <TsConfigDemo />;
  }
}
