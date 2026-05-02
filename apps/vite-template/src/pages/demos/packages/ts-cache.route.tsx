/**
 * Cache Demo Route
 *
 * @module pages/demos/ts-cache
 */

import { Route } from "@stackra/react-router";

import TsCacheDemo from "@/components/pages/demos/packages/ts-cache.component";

@Route({
  path: "/demos/packages/ts-cache",
  label: "Cache",
  variant: "main",
  parent: "/demos",
  order: 40,
})
export class TsCacheDemoRoute {
  render() {
    return <TsCacheDemo />;
  }
}
