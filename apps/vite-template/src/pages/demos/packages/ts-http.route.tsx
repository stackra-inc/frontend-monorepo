/**
 * HTTP Client Demo Route
 *
 * @module pages/demos/ts-http
 */

import { Route } from "@stackra/react-router";

import TsHttpDemo from "@/components/pages/demos/packages/ts-http.component";

@Route({
  path: "/demos/packages/ts-http",
  label: "HTTP Client",
  variant: "main",
  parent: "/demos",
  order: 44,
})
export class TsHttpDemoRoute {
  render() {
    return <TsHttpDemo />;
  }
}
