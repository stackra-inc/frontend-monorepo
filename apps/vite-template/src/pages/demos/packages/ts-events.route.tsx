/**
 * Events Demo Route
 *
 * @module pages/demos/ts-events
 */

import { Route } from "@stackra/react-router";

import TsEventsDemo from "@/components/pages/demos/packages/ts-events.component";

@Route({
  path: "/demos/packages/ts-events",
  label: "Events",
  variant: "main",
  parent: "/demos",
  order: 43,
})
export class TsEventsDemoRoute {
  render() {
    return <TsEventsDemo />;
  }
}
