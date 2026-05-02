/**
 * Realtime Demo Route
 *
 * @module pages/demos/ts-realtime
 */

import { Route } from "@stackra/react-router";

import TsRealtimeDemo from "@/components/pages/demos/packages/ts-realtime.component";

@Route({
  path: "/demos/packages/ts-realtime",
  label: "Realtime",
  variant: "main",
  parent: "/demos",
  order: 47,
})
export class TsRealtimeDemoRoute {
  render() {
    return <TsRealtimeDemo />;
  }
}
