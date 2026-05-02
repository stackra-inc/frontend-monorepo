/**
 * Support Utilities Demo Route
 *
 * @module pages/demos/ts-support
 */

import { Route } from "@stackra/react-router";

import TsSupportDemo from "@/components/pages/demos/packages/ts-support.component";

@Route({
  path: "/demos/packages/ts-support",
  label: "Support Utilities",
  variant: "main",
  parent: "/demos",
  order: 49,
})
export class TsSupportDemoRoute {
  render() {
    return <TsSupportDemo />;
  }
}
